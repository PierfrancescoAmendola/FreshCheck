import { FoodItem, HistoryEntry, NotificationPrefs } from '../types';
import { translate, TKey, Params } from '../i18n';
import { DEFAULT_NOTIF_PREFS } from '../utils/storage';
import { addDays, startOfDay, toExpiryISO } from '../utils/dateUtils';

export const tIt = (key: TKey, params?: Params) => translate('it', key, params);

// A fixed local moment: Tuesday 6 October 2026, 08:00 in Europe/Rome
export const NOW = new Date(2026, 9, 6, 8, 0, 0);

let seq = 0;
export const makeItem = (name: string, daysFromNow: number, extra: Partial<FoodItem> = {}, now = NOW): FoodItem => ({
    id: `i${++seq}`,
    name,
    category: 'dairy',
    locationId: 'fridge',
    expirationDate: toExpiryISO(addDays(startOfDay(now), daysFromNow)),
    createdAt: now.toISOString(),
    tags: [],
    ...extra,
});

export const prefs = (patch: Partial<NotificationPrefs> = {}): NotificationPrefs => ({ ...DEFAULT_NOTIF_PREFS, ...patch });

export const entry = (outcome: 'consumed' | 'wasted', date: Date, price = 2, extra: Partial<HistoryEntry> = {}): HistoryEntry => ({
    id: `h${++seq}`,
    name: 'x',
    category: 'dairy',
    price,
    outcome,
    date: date.toISOString(),
    ...extra,
});

export const localParts = (d: Date) => ({ y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), min: d.getMinutes() });
