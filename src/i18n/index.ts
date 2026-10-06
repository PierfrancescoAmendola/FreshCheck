import { getLocales } from 'expo-localization';
import en, { Dict, TKey } from './locales/en';
import it from './locales/it';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import nl from './locales/nl';
import pl from './locales/pl';
import ja from './locales/ja';
import ko from './locales/ko';

export type Language = 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt' | 'nl' | 'pl' | 'ja' | 'ko';
export type { TKey };

export const DICTS: Record<Language, Dict> = { en, it, es, fr, de, pt, nl, pl, ja, ko };

export const LANGUAGES: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
];

export type Params = Record<string, string | number>;

export const translate = (lang: Language, key: TKey, params?: Params): string => {
    let s: string = DICTS[lang]?.[key] ?? en[key] ?? key;
    if (params) {
        for (const k of Object.keys(params)) {
            s = s.split(`{${k}}`).join(String(params[k]));
        }
    }
    return s;
};

const deviceLocale = () => {
    try {
        return getLocales()[0];
    } catch {
        return undefined;
    }
};

export const detectLanguage = (): Language => {
    const code = deviceLocale()?.languageCode as Language | undefined;
    return code && code in DICTS ? code : 'en';
};

export const detectCurrency = (): string => deviceLocale()?.currencyCode ?? 'EUR';

// Locale tag used for Intl formatting: prefer the device region when the
// language matches, so en-US gets month/day and en-GB day/month.
export const localeTag = (lang: Language): string => {
    const loc = deviceLocale();
    if (loc?.languageTag && loc.languageCode === lang) return loc.languageTag;
    return lang;
};

export const formatDate = (lang: Language, iso: string | Date, style: 'short' | 'medium' | 'long' = 'medium'): string => {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    const opts: Intl.DateTimeFormatOptions =
        style === 'short'
            ? { day: 'numeric', month: 'short' }
            : style === 'long'
                ? { weekday: 'long', day: 'numeric', month: 'long' }
                : { day: 'numeric', month: 'short', year: 'numeric' };
    try {
        return new Intl.DateTimeFormat(localeTag(lang), opts).format(d);
    } catch {
        return d.toLocaleDateString();
    }
};

export const formatMonth = (lang: Language, d: Date): string => {
    try {
        return new Intl.DateTimeFormat(localeTag(lang), { month: 'short' }).format(d);
    } catch {
        return String(d.getMonth() + 1);
    }
};

export const formatMoney = (lang: Language, amount: number, currency: string): string => {
    try {
        // Whole amounts drop the decimals; others keep the currency's own digits (2 for EUR, 0 for JPY).
        // Both bounds are set because some engines reject a maximum below the currency's minimum.
        const whole = amount % 1 === 0 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {};
        return new Intl.NumberFormat(localeTag(lang), { style: 'currency', currency, ...whole }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
};

export const formatTime = (lang: Language, hour: number, minute: number): string => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    try {
        return new Intl.DateTimeFormat(localeTag(lang), { hour: 'numeric', minute: '2-digit' }).format(d);
    } catch {
        return `${hour}:${String(minute).padStart(2, '0')}`;
    }
};
