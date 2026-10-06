import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as StoreReview from 'expo-store-review';
import {
    CategoryId,
    FoodItem,
    HistoryEntry,
    NotificationPrefs,
    Outcome,
    ShoppingItem,
    StorageLocation,
} from '../types';
import {
    CATEGORY_PRICE_ESTIMATE,
    currencyFactor,
    detectTags,
    freezerDaysFor,
    openedDaysFor,
} from '../data/ingredients';
import { FREE_LIMITS, REVIEW_AFTER_CONSUMED } from '../config';
import {
    DEFAULT_LOCATIONS,
    DEFAULT_NOTIF_PREFS,
    getReviewAsked,
    loadHistory,
    loadItems,
    loadLocations,
    loadNotifPrefs,
    loadShopping,
    isValidItem,
    migrateItem,
    saveHistory,
    saveItems,
    saveLocations,
    saveNotifPrefs,
    saveShopping,
    setReviewAsked,
} from '../utils/storage';
import { ensureChannel, syncNotifications } from '../utils/notifications';
import { addDays, daysUntil, startOfDay, toExpiryISO } from '../utils/dateUtils';
import { Backup } from '../utils/exporter';
import { useLanguage } from './LanguageContext';
import { usePremium } from './PremiumContext';

export interface ItemDraft {
    name: string;
    category: CategoryId;
    locationId: string;
    expirationDate: Date;
    price?: number;
    barcode?: string;
}

interface PantryContextType {
    loaded: boolean;
    items: FoodItem[];
    history: HistoryEntry[];
    shopping: ShoppingItem[];
    locations: StorageLocation[];
    notifPrefs: NotificationPrefs;
    canAddItem: boolean;
    addItem: (d: ItemDraft) => Promise<void>;
    updateItem: (id: string, d: ItemDraft) => Promise<void>;
    finishItem: (id: string, outcome: Outcome) => Promise<FoodItem | undefined>;
    deleteItem: (id: string) => Promise<void>;
    markOpened: (id: string) => Promise<void>;
    moveToFreezer: (id: string) => Promise<FoodItem | undefined>;
    addShopping: (names: string[]) => void;
    toggleShopping: (id: string) => void;
    removeShopping: (id: string) => void;
    clearCheckedShopping: () => void;
    addLocation: (name: string) => void;
    removeLocation: (id: string) => void;
    setNotifPrefs: (p: NotificationPrefs) => Promise<void>;
    restoreBackup: (b: Backup) => Promise<void>;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const PantryProvider = ({ children }: { children: ReactNode }) => {
    const { t, currency } = useLanguage();
    const { isPro } = usePremium();

    const [loaded, setLoaded] = useState(false);
    const [items, setItems] = useState<FoodItem[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [shopping, setShopping] = useState<ShoppingItem[]>([]);
    const [locations, setLocations] = useState<StorageLocation[]>(DEFAULT_LOCATIONS);
    const [notifPrefs, setNotifPrefsState] = useState<NotificationPrefs | null>(null);

    // Refs let async actions read the latest state without stale closures
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const prefsRef = useRef(notifPrefs);
    prefsRef.current = notifPrefs;

    useEffect(() => {
        (async () => {
            const [i, h, s, l, p] = await Promise.all([
                loadItems(),
                loadHistory(),
                loadShopping(),
                loadLocations(),
                loadNotifPrefs(),
            ]);
            setItems(i);
            setHistory(h);
            setShopping(s);
            setLocations(l.length ? l : DEFAULT_LOCATIONS);
            setNotifPrefsState(p);
            setLoaded(true);
        })();
    }, []);

    useEffect(() => {
        ensureChannel(t);
    }, [t]);

    // Persist on change once loaded
    useEffect(() => { if (loaded) saveItems(items); }, [items, loaded]);
    useEffect(() => { if (loaded) saveHistory(history); }, [history, loaded]);
    useEffect(() => { if (loaded) saveShopping(shopping); }, [shopping, loaded]);
    useEffect(() => { if (loaded) saveLocations(locations); }, [locations, loaded]);

    // One plan for every reminder and digest, rebuilt whenever the pantry, the settings,
    // the plan or the language change. Debounced so a burst of edits schedules once.
    useEffect(() => {
        if (!loaded || !notifPrefs) return;
        const h = setTimeout(() => syncNotifications(items, notifPrefs, isPro, t), 500);
        return () => clearTimeout(h);
    }, [items, notifPrefs, loaded, isPro, t]);

    // Coming back to the app refills the queue: digests move forward and reminders
    // that did not fit in the iOS limit get their turn
    const syncArgs = useRef({ isPro, t });
    syncArgs.current = { isPro, t };
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state !== 'active' || !prefsRef.current) return;
            syncNotifications(itemsRef.current, prefsRef.current, syncArgs.current.isPro, syncArgs.current.t);
        });
        return () => sub.remove();
    }, []);

    const prefs = notifPrefs ?? DEFAULT_NOTIF_PREFS;

    const canAddItem = isPro || items.length < FREE_LIMITS.items;

    const addItem = useCallback(
        async (d: ItemDraft) => {
            const base: FoodItem = {
                id: uid(),
                name: d.name.trim(),
                category: d.category,
                locationId: d.locationId,
                expirationDate: toExpiryISO(d.expirationDate),
                createdAt: new Date().toISOString(),
                price: d.price,
                barcode: d.barcode,
                tags: detectTags(d.name),
            };
            setItems((prev) => [...prev, base]);
        },
        [],
    );

    const replaceItem = useCallback(
        async (id: string, update: (prev: FoodItem) => FoodItem) => {
            const prev = itemsRef.current.find((i) => i.id === id);
            if (!prev) return undefined;
            const next = update(prev);
            setItems((all) => all.map((i) => (i.id === id ? next : i)));
            return next;
        },
        [],
    );

    const updateItem = useCallback(
        async (id: string, d: ItemDraft) => {
            await replaceItem(id, (prev) => ({
                ...prev,
                name: d.name.trim(),
                category: d.category,
                locationId: d.locationId,
                expirationDate: toExpiryISO(d.expirationDate),
                price: d.price,
                barcode: d.barcode ?? prev.barcode,
                tags: detectTags(d.name),
            }));
        },
        [replaceItem],
    );

    const maybeAskReview = useCallback(async (consumedCount: number) => {
        if (consumedCount < REVIEW_AFTER_CONSUMED || (await getReviewAsked())) return;
        try {
            if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
                await setReviewAsked();
            }
        } catch (e) {
            console.warn('review', e);
        }
    }, []);

    const finishItem = useCallback(
        async (id: string, outcome: Outcome) => {
            const item = itemsRef.current.find((i) => i.id === id);
            if (!item) return undefined;
            const price = item.price ?? CATEGORY_PRICE_ESTIMATE[item.category] * currencyFactor(currency);
            const entry: HistoryEntry = {
                id: uid(),
                name: item.name,
                category: item.category,
                price: Math.round(price * 100) / 100,
                outcome,
                date: new Date().toISOString(),
            };
            setItems((all) => all.filter((i) => i.id !== id));
            setHistory((h) => {
                const next = [...h, entry];
                if (outcome === 'consumed') maybeAskReview(next.filter((e) => e.outcome === 'consumed').length);
                return next;
            });
            return item;
        },
        [currency, maybeAskReview],
    );

    const deleteItem = useCallback(async (id: string) => {
        setItems((all) => all.filter((i) => i.id !== id));
    }, []);

    const markOpened = useCallback(
        async (id: string) => {
            await replaceItem(id, (prev) => {
                const days = openedDaysFor(prev.tags);
                const today = startOfDay();
                let expiry = new Date(prev.expirationDate);
                if (days !== undefined) {
                    const openedLimit = addDays(today, days);
                    if (openedLimit < expiry) expiry = openedLimit;
                }
                return { ...prev, openedAt: today.toISOString(), expirationDate: toExpiryISO(expiry) };
            });
        },
        [replaceItem],
    );

    const moveToFreezer = useCallback(
        async (id: string) =>
            replaceItem(id, (prev) => {
                const extra = freezerDaysFor(prev.tags, prev.category);
                // Foods that do not freeze well keep their date: freezing must never revive an expired item
                if (extra <= 0) return { ...prev, locationId: 'freezer' };
                const candidate = addDays(startOfDay(), extra);
                const current = new Date(prev.expirationDate);
                const expiry = daysUntil(current) < 0 || candidate > current ? candidate : current;
                return { ...prev, locationId: 'freezer', expirationDate: toExpiryISO(expiry) };
            }),
        [replaceItem],
    );

    const addShopping = useCallback((names: string[]) => {
        setShopping((s) => {
            const existing = new Set(s.filter((x) => !x.checked).map((x) => x.name.toLowerCase()));
            const fresh = names
                .map((n) => n.trim())
                .filter((n) => {
                    // Skip blanks and anything already on the list, including repeats within this batch
                    const key = n.toLowerCase();
                    if (!n || existing.has(key)) return false;
                    existing.add(key);
                    return true;
                })
                .map<ShoppingItem>((name) => ({ id: uid(), name, checked: false, createdAt: new Date().toISOString() }));
            return [...fresh, ...s];
        });
    }, []);

    const toggleShopping = useCallback((id: string) => {
        setShopping((s) => s.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x)));
    }, []);

    const removeShopping = useCallback((id: string) => setShopping((s) => s.filter((x) => x.id !== id)), []);
    const clearCheckedShopping = useCallback(() => setShopping((s) => s.filter((x) => !x.checked)), []);

    const addLocation = useCallback((name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setLocations((l) => [...l, { id: uid(), name: trimmed }]);
    }, []);

    const removeLocation = useCallback((id: string) => {
        setLocations((l) => l.filter((x) => x.id !== id || x.builtIn));
        setItems((all) => all.map((i) => (i.locationId === id ? { ...i, locationId: 'fridge' } : i)));
    }, []);

    const setNotifPrefs = useCallback(async (p: NotificationPrefs) => {
        setNotifPrefsState(p);
        await saveNotifPrefs(p);
    }, []);

    // Backups come from a file the user picked, so every part is validated like stored data
    const restoreBackup = useCallback(async (b: Backup) => {
        const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
        setItems(list<any>(b.items).filter(isValidItem).map(migrateItem));
        setHistory(list<HistoryEntry>(b.history).filter((h) => h && h.date && h.outcome));
        setShopping(list<ShoppingItem>(b.shopping).filter((s) => s && s.name));
        const locations = list<StorageLocation>(b.locations).filter((l) => l && l.id);
        setLocations(locations.length ? locations : DEFAULT_LOCATIONS);
    }, []);

    const value = useMemo<PantryContextType>(
        () => ({
            loaded,
            items,
            history,
            shopping,
            locations,
            notifPrefs: prefs,
            canAddItem,
            addItem,
            updateItem,
            finishItem,
            deleteItem,
            markOpened,
            moveToFreezer,
            addShopping,
            toggleShopping,
            removeShopping,
            clearCheckedShopping,
            addLocation,
            removeLocation,
            setNotifPrefs,
            restoreBackup,
        }),
        [loaded, items, history, shopping, locations, prefs, canAddItem, addItem, updateItem, finishItem, deleteItem, markOpened, moveToFreezer, addShopping, toggleShopping, removeShopping, clearCheckedShopping, addLocation, removeLocation, setNotifPrefs, restoreBackup],
    );

    return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
};

export const usePantry = () => {
    const ctx = useContext(PantryContext);
    if (!ctx) throw new Error('usePantry must be used within PantryProvider');
    return ctx;
};
