import { addDays, daysUntil, startOfDay, statusFor, toExpiryISO } from '../utils/dateUtils';
import { DICTS, formatMoney, LANGUAGES, translate } from '../i18n';
import en from '../i18n/locales/en';
import { RECIPES, recipeText } from '../data/recipes';
import { detectTags, freezerDaysFor, INGREDIENTS, openedDaysFor, suggestedShelfLife } from '../data/ingredients';
import { matchRecipes, missingIngredients } from '../utils/recipeMatcher';
import { bestStreak, currentStreak, earnedBadges, lastMonths, periodStats, topWastedCategories } from '../utils/stats';
import { entry, makeItem, NOW } from './helpers';

beforeEach(() => jest.useFakeTimers({ now: NOW }));
afterEach(() => jest.useRealTimers());

describe('dates', () => {
    it('runs in a DST time zone (so the DST tests mean something)', () => {
        expect(new Date(2026, 9, 20).getTimezoneOffset()).not.toBe(new Date(2026, 10, 2).getTimezoneOffset());
    });

    it('counts whole calendar days, also across the DST change', () => {
        expect(daysUntil(toExpiryISO(NOW))).toBe(0);
        expect(daysUntil(toExpiryISO(addDays(NOW, 1)))).toBe(1);
        expect(daysUntil(toExpiryISO(addDays(NOW, -1)))).toBe(-1);
        expect(daysUntil(toExpiryISO(new Date(2026, 10, 1)))).toBe(26);
        // Late in the evening it is still the same day
        jest.setSystemTime(new Date(2026, 9, 6, 23, 59));
        expect(daysUntil(toExpiryISO(new Date(2026, 9, 7)))).toBe(1);
    });

    it('stores expiry at local noon so the day never shifts', () => {
        const iso = toExpiryISO(new Date(2026, 9, 6, 0, 5));
        expect(new Date(iso).getDate()).toBe(6);
        expect(new Date(iso).getHours()).toBe(12);
    });

    it('maps days to the urgency groups', () => {
        expect([-1, 0, 1, 3, 4, 7, 8].map(statusFor)).toEqual(['expired', 'today', 'soon', 'soon', 'week', 'week', 'later']);
    });

    it('startOfDay and addDays handle month ends', () => {
        expect(addDays(new Date(2026, 0, 31), 1).getMonth()).toBe(1);
        expect(startOfDay(new Date(2026, 9, 6, 15)).getHours()).toBe(0);
    });
});

describe('translations', () => {
    const keys = Object.keys(en);
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

    it.each(LANGUAGES.map((l) => l.code))('%s has every key, non-empty, with the same placeholders', (code) => {
        const dict = DICTS[code] as Record<string, string>;
        const missing = keys.filter((k) => typeof dict[k] !== 'string' || dict[k].trim() === '');
        expect(missing).toEqual([]);
        const wrong = keys.filter((k) => placeholders(dict[k]) !== placeholders((en as Record<string, string>)[k]));
        expect(wrong).toEqual([]);
    });

    it('fills placeholders, repeated ones too', () => {
        expect(translate('it', 'notifTitleLead', { name: 'Latte', n: 3 })).toBe('Latte scade tra 3 giorni');
    });

    it('formats money in every language without throwing, whole amounts without decimals', () => {
        for (const { code } of LANGUAGES) {
            expect(formatMoney(code, 3, 'EUR')).not.toMatch(/EUR$/);
            expect(formatMoney(code, 3.4, 'EUR')).toMatch(/3[.,]40/);
            expect(formatMoney(code, 540, 'JPY')).toMatch(/540/);
            expect(formatMoney(code, 4940, 'KRW')).toMatch(/4[.,\s ]?940/);
        }
        expect(formatMoney('it', 3, 'EUR')).not.toMatch(/,00/);
    });
});

describe('recipes and ingredients', () => {
    it('every recipe has a full text in every app language', () => {
        for (const { code } of LANGUAGES) {
            for (const r of RECIPES) {
                const text = recipeText(r, code);
                if (code !== 'en') expect(text).not.toBe(r.text.en);
                expect(text.title.length).toBeGreaterThan(0);
                expect(text.steps.length).toBeGreaterThan(0);
                expect(text.ingredients.length).toBeGreaterThan(0);
            }
        }
    });

    it('recipe ids are unique and every recipe tag is a known ingredient', () => {
        expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length);
        const known = new Set(INGREDIENTS.map((i) => i.tag));
        const unknown = RECIPES.flatMap((r) => r.tags.filter((t) => !known.has(t)).map((t) => `${r.id}:${t}`));
        expect(unknown).toEqual([]);
    });

    it('recognises products in several languages, ignoring case and accents', () => {
        expect(detectTags('LATTE Parzialmente Scremato')).toContain('milk');
        expect(detectTags('Leche entera')).toContain('milk');
        expect(detectTags('Crème fraîche')).toContain('cream');
        expect(detectTags('牛乳')).toContain('milk');
        expect(detectTags('우유')).toContain('milk');
        expect(detectTags('Eier')).toContain('egg');
        expect(detectTags('Qualcosa di strano')).toEqual([]);
    });

    it('shelf-life helpers fall back to the category', () => {
        expect(suggestedShelfLife('Latte', 'dairy')).toBe(7);
        expect(suggestedShelfLife('Boh', 'meat')).toBe(3);
        expect(openedDaysFor(['milk'])).toBe(4);
        expect(openedDaysFor([])).toBeUndefined();
        expect(freezerDaysFor([], 'meat')).toBe(180);
    });

    it('suggests recipes that use what expires first, never expired food', () => {
        const items = [
            { ...makeItem('Uova', 0), tags: ['egg'] },
            { ...makeItem('Spinaci', 1), tags: ['spinach'] },
            { ...makeItem('Banane', -2), tags: ['banana'] },
        ];
        const matches = matchRecipes(items);
        expect(matches.length).toBeGreaterThan(0);
        expect(matches[0].usedItems.map((i) => i.name).sort()).toEqual(['Spinaci', 'Uova']);
        expect(matches.every((m) => m.usedItems.every((i) => i.name !== 'Banane'))).toBe(true);
        const scores = matches.map((m) => m.score);
        expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });

    it('missing ingredients: what you have is left out, short words never match by accident', () => {
        const lines = ['4 uova', '2 manciate di verdure', '30 g di formaggio grattugiato', 'Olio, sale, pepe', 'Basilico'];
        const have = [
            { ...makeItem('Il latte', 3), tags: ['milk'] },
            { ...makeItem('Uova bio', 2), tags: ['egg'] },
            { ...makeItem('Parmigiano', 2), tags: ['cheese'] },
        ];
        expect(missingIngredients(lines, have)).toEqual(['2 manciate di verdure', 'Olio, sale, pepe', 'Basilico']);
        expect(missingIngredients(lines, [])).toEqual(lines);
    });

    it('no recipes for an empty pantry', () => {
        expect(matchRecipes([])).toEqual([]);
    });
});

describe('impact stats and badges', () => {
    it('sums money saved and wasted and the waste rate', () => {
        const s = periodStats([entry('consumed', NOW, 2), entry('consumed', NOW, 3), entry('wasted', NOW, 1.5)]);
        expect(s).toEqual({ savedValue: 5, wastedValue: 1.5, eaten: 2, wasted: 1, wasteRate: 1 / 3 });
        expect(periodStats([]).wasteRate).toBe(0);
    });

    it('streak counts days since the last waste, or since the first activity', () => {
        expect(currentStreak([])).toBe(0);
        expect(currentStreak([entry('consumed', addDays(NOW, -4))])).toBe(5);
        expect(currentStreak([entry('consumed', addDays(NOW, -10)), entry('wasted', addDays(NOW, -3))])).toBe(3);
        expect(currentStreak([entry('wasted', NOW)])).toBe(0);
    });

    it('best streak is the longest waste-free run', () => {
        const h = [entry('consumed', addDays(NOW, -40)), entry('wasted', addDays(NOW, -20)), entry('wasted', addDays(NOW, -2))];
        expect(bestStreak(h)).toBe(20);
    });

    it('six-month history includes empty months, oldest first', () => {
        const h = [entry('consumed', new Date(2026, 7, 10), 4), entry('wasted', new Date(2026, 9, 1), 2)];
        const months = lastMonths(h, 6);
        expect(months.map((m) => m.month.getMonth())).toEqual([4, 5, 6, 7, 8, 9]);
        expect(months[3].stats.savedValue).toBe(4);
        expect(months[5].stats.wastedValue).toBe(2);
        expect(months[0].stats.eaten).toBe(0);
    });

    it('awards badges at the right thresholds', () => {
        const eaten = (n: number) => Array.from({ length: n }, (_, i) => entry('consumed', addDays(NOW, -i)));
        expect(earnedBadges([])).toEqual(new Set());
        expect(earnedBadges(eaten(1))).toEqual(new Set(['first']));
        expect([...earnedBadges(eaten(10))].sort()).toEqual(['first', 'ten', 'week']);
        // A clean September with 5 items earns "zero waste"
        const sept = Array.from({ length: 5 }, (_, i) => entry('consumed', new Date(2026, 8, 3 + i)));
        expect(earnedBadges([...sept, entry('wasted', new Date(2026, 9, 2))]).has('zero')).toBe(true);
    });

    it('top wasted categories, most first, at most three', () => {
        const h = [
            entry('wasted', NOW, 1, { category: 'meat' }),
            entry('wasted', NOW, 1, { category: 'meat' }),
            entry('wasted', NOW, 1, { category: 'fish' }),
            entry('wasted', NOW, 1, { category: 'bakery' }),
            entry('wasted', NOW, 1, { category: 'drinks' }),
            entry('consumed', NOW, 1, { category: 'dairy' }),
        ];
        const top = topWastedCategories(h);
        expect(top[0]).toEqual({ category: 'meat', count: 2 });
        expect(top).toHaveLength(3);
    });
});
