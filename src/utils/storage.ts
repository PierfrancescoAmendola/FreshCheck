import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AccentId,
    CATEGORY_IDS,
    CategoryId,
    FoodItem,
    HistoryEntry,
    NotificationPrefs,
    ShoppingItem,
    StorageLocation,
} from '../types';
import { detectTags } from '../data/ingredients';

// Keys from v1 are kept so existing users keep their data
const KEYS = {
    items: '@ecoshelf_food_items',
    theme: '@ecoshelf_theme',
    onboarding: '@ecoshelf_onboarding_seen',
    legacyNotifications: '@ecoshelf_notifications_enabled',
    language: '@fc_language',
    history: '@fc_history',
    shopping: '@fc_shopping',
    locations: '@fc_locations',
    notifPrefs: '@fc_notif_prefs',
    ocrUsed: '@fc_ocr_used',
    accent: '@fc_accent',
    currency: '@fc_currency',
    debugPro: '@fc_debug_pro',
    reviewAsked: '@fc_review_asked',
};

const readJSON = async <T,>(key: string, fallback: T): Promise<T> => {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch (e) {
        console.warn(`storage read ${key}`, e);
        return fallback;
    }
};

const writeJSON = async (key: string, value: unknown): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`storage write ${key}`, e);
    }
};

const readString = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeString = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (e) {
        console.warn(`storage write ${key}`, e);
    }
};

// ---------- Items (with v1 migration) ----------

// v1 stored Italian category labels as values
const LEGACY_CATEGORY: Record<string, CategoryId> = {
    Latticini: 'dairy',
    Carne: 'meat',
    'Frutta/Verdura': 'fruitVeg',
    Altro: 'other',
};

const migrateItem = (raw: any): FoodItem => {
    const category: CategoryId = CATEGORY_IDS.includes(raw.category)
        ? raw.category
        : LEGACY_CATEGORY[raw.category] ?? 'other';
    return {
        id: String(raw.id),
        name: String(raw.name ?? ''),
        category,
        locationId: raw.locationId ?? 'fridge',
        expirationDate: raw.expirationDate,
        createdAt: raw.createdAt ?? new Date().toISOString(),
        openedAt: raw.openedAt,
        price: typeof raw.price === 'number' ? raw.price : undefined,
        barcode: raw.barcode,
        tags: Array.isArray(raw.tags) ? raw.tags : detectTags(String(raw.name ?? '')),
        notificationIds: raw.notificationIds,
    };
};

export const loadItems = async (): Promise<FoodItem[]> => {
    const raw = await readJSON<any[]>(KEYS.items, []);
    return Array.isArray(raw) ? raw.filter((r) => r && r.expirationDate).map(migrateItem) : [];
};
export const saveItems = (items: FoodItem[]) => writeJSON(KEYS.items, items);

// ---------- History / shopping / locations ----------

export const loadHistory = () => readJSON<HistoryEntry[]>(KEYS.history, []);
export const saveHistory = (h: HistoryEntry[]) => writeJSON(KEYS.history, h);

export const loadShopping = () => readJSON<ShoppingItem[]>(KEYS.shopping, []);
export const saveShopping = (s: ShoppingItem[]) => writeJSON(KEYS.shopping, s);

export const DEFAULT_LOCATIONS: StorageLocation[] = [
    { id: 'fridge', builtIn: 'fridge' },
    { id: 'freezer', builtIn: 'freezer' },
    { id: 'pantry', builtIn: 'pantry' },
];
export const loadLocations = () => readJSON<StorageLocation[]>(KEYS.locations, DEFAULT_LOCATIONS);
export const saveLocations = (l: StorageLocation[]) => writeJSON(KEYS.locations, l);

// ---------- Notification preferences ----------

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
    enabled: true,
    leadDays: [2, 0, -1], // same schedule as v1
    hour: 9,
    minute: 0,
    dailyDigest: false,
    weeklyDigest: false,
};

export const loadNotifPrefs = async (): Promise<NotificationPrefs> => {
    const stored = await readJSON<NotificationPrefs | null>(KEYS.notifPrefs, null);
    if (stored) return { ...DEFAULT_NOTIF_PREFS, ...stored };
    const legacy = await readString(KEYS.legacyNotifications);
    return { ...DEFAULT_NOTIF_PREFS, enabled: legacy === null || legacy === 'true' };
};
export const saveNotifPrefs = (p: NotificationPrefs) => writeJSON(KEYS.notifPrefs, p);

// ---------- Simple preferences ----------

export const getThemePreference = () => readString(KEYS.theme);
export const setThemePreference = (v: string) => writeString(KEYS.theme, v);

export const getLanguagePreference = () => readString(KEYS.language);
export const setLanguagePreference = (v: string) => writeString(KEYS.language, v);

export const getAccent = async () => (await readString(KEYS.accent)) as AccentId | null;
export const setAccent = (v: AccentId) => writeString(KEYS.accent, v);

export const getCurrency = () => readString(KEYS.currency);
export const setCurrency = (v: string) => writeString(KEYS.currency, v);

export const getHasSeenOnboarding = async () => (await readString(KEYS.onboarding)) === 'true';
export const setHasSeenOnboarding = (seen = true) => writeString(KEYS.onboarding, String(seen));

export const getOcrUsed = async () => Number((await readString(KEYS.ocrUsed)) ?? 0);
export const setOcrUsed = (n: number) => writeString(KEYS.ocrUsed, String(n));

export const getDebugPro = async () => (await readString(KEYS.debugPro)) === 'true';
export const setDebugPro = (v: boolean) => writeString(KEYS.debugPro, String(v));

export const getReviewAsked = async () => (await readString(KEYS.reviewAsked)) === 'true';
export const setReviewAsked = () => writeString(KEYS.reviewAsked, 'true');
