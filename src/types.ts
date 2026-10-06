// Core data model for FreshCheck

export type CategoryId =
    | 'dairy'
    | 'meat'
    | 'fish'
    | 'fruitVeg'
    | 'bakery'
    | 'pantry'
    | 'frozen'
    | 'drinks'
    | 'other';

export const CATEGORY_IDS: CategoryId[] = [
    'dairy',
    'meat',
    'fish',
    'fruitVeg',
    'bakery',
    'pantry',
    'frozen',
    'drinks',
    'other',
];

export type BuiltInLocation = 'fridge' | 'freezer' | 'pantry';

export interface StorageLocation {
    id: string;
    // Built-in locations are translated; custom ones use `name`
    builtIn?: BuiltInLocation;
    name?: string;
}

export type ExpirationStatus = 'expired' | 'today' | 'soon' | 'week' | 'later';

export interface FoodItem {
    id: string;
    name: string;
    category: CategoryId;
    locationId: string;
    expirationDate: string; // ISO
    createdAt: string; // ISO
    openedAt?: string; // ISO
    price?: number;
    barcode?: string;
    tags: string[]; // ingredient tags used by recipes and shelf-life table
}

export type Outcome = 'consumed' | 'wasted';

export interface HistoryEntry {
    id: string;
    name: string;
    category: CategoryId;
    price: number;
    outcome: Outcome;
    date: string; // ISO
}

export interface ShoppingItem {
    id: string;
    name: string;
    checked: boolean;
    createdAt: string;
}

export interface NotificationPrefs {
    enabled: boolean;
    // Days before expiry to notify (0 = on the day, -1 = day after)
    leadDays: number[];
    hour: number;
    minute: number;
    dailyDigest: boolean;
    weeklyDigest: boolean;
}

export type AccentId = 'forest' | 'tomato' | 'ocean' | 'plum' | 'saffron';
