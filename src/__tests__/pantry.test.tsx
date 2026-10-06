import React from 'react';
import { AppState } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { PantryProvider, usePantry } from '../contexts/PantryContext';
import { addDays, daysUntil, startOfDay } from '../utils/dateUtils';
import { NOW, localParts } from './helpers';

const N = Notifications as any;

// The store is not available under Jest: Pro is driven by the test
let mockPro = false;
jest.mock('../contexts/PremiumContext', () => ({
    usePremium: () => ({ isPro: mockPro }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>
        <PantryProvider>{children}</PantryProvider>
    </LanguageProvider>
);

const usePantryAndLanguage = () => ({ pantry: usePantry(), lang: useLanguage() });

const setup = async () => {
    const hook = await renderHook(usePantryAndLanguage, { wrapper });
    await waitFor(() => expect(hook.result.current.pantry.loaded).toBe(true));
    return hook;
};

const pending = async () => (await N.getAllScheduledNotificationsAsync()) as { identifier: string; content: any; trigger: any }[];
// Waits for the debounced sync to reach the scheduler
const settle = (check: (p: Awaited<ReturnType<typeof pending>>) => void) => waitFor(async () => check(await pending()), { timeout: 3000 });

const draft = (name: string, days: number, extra: Record<string, unknown> = {}) => ({
    name,
    category: 'dairy' as const,
    locationId: 'fridge',
    expirationDate: addDays(startOfDay(), days),
    ...extra,
});

beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, advanceTimers: true });
    mockPro = false;
    N.__reset();
    jest.clearAllMocks();
    await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

describe('adding and editing items', () => {
    it('adding an item schedules its reminders and saves it', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('  Latte intero  ', 5, { price: 1.5 })));
        const item = result.current.pantry.items[0];
        expect(item.name).toBe('Latte intero');
        expect(item.tags).toContain('milk');
        expect(localParts(new Date(item.expirationDate)).h).toBe(12);
        await settle((p) => expect(p.map((x) => x.identifier)).toEqual([`item-${item.id}-2`, `item-${item.id}-0`, `item-${item.id}--1`]));
        expect(JSON.parse((await AsyncStorage.getItem('@ecoshelf_food_items'))!)[0].name).toBe('Latte intero');
    });

    it('changing the date moves the reminders, changing the name retitles them', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 5)));
        const id = result.current.pantry.items[0].id;
        await act(() => result.current.pantry.updateItem(id, draft('Yogurt', 9)));
        await settle((p) => {
            expect(p.map((x) => localParts(new Date(x.trigger.date)).d)).toEqual([13, 15, 16]);
            expect(p[0].content.title).toBe('Yogurt scade tra 2 giorni');
        });
        expect(result.current.pantry.items[0].tags).toEqual(['yogurt']);
    });

    it('eating an item removes its reminders and records the saving', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 5, { price: 1.29 })));
        await settle((p) => expect(p).toHaveLength(3));
        await act(async () => {
            await result.current.pantry.finishItem(result.current.pantry.items[0].id, 'consumed');
        });
        expect(result.current.pantry.items).toEqual([]);
        expect(result.current.pantry.history).toEqual([expect.objectContaining({ name: 'Latte', price: 1.29, outcome: 'consumed' })]);
        await settle((p) => expect(p).toEqual([]));
    });

    it('throwing away without a price uses the category estimate', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem({ ...draft('Bistecca', 2), category: 'meat' }));
        await act(async () => {
            await result.current.pantry.finishItem(result.current.pantry.items[0].id, 'wasted');
        });
        expect(result.current.pantry.history[0]).toEqual(expect.objectContaining({ outcome: 'wasted', price: 5 }));
    });

    it('deleting an item removes its reminders without touching history', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 5)));
        await act(() => result.current.pantry.addItem(draft('Uova', 8)));
        await settle((p) => expect(p).toHaveLength(6));
        await act(() => result.current.pantry.deleteItem(result.current.pantry.items[0].id));
        await settle((p) => expect(p.every((x) => x.content.title.startsWith('Uova'))).toBe(true));
        expect(result.current.pantry.history).toEqual([]);
    });

    it('asks for a review once, after the third eaten item', async () => {
        const { result } = await setup();
        for (const n of ['A', 'B', 'C', 'D']) {
            await act(() => result.current.pantry.addItem(draft(n, 5)));
            await act(async () => {
                await result.current.pantry.finishItem(result.current.pantry.items[0].id, 'consumed');
            });
        }
        await waitFor(() => expect(StoreReview.requestReview).toHaveBeenCalledTimes(1));
    });
});

describe('opening and freezing', () => {
    it('opening milk shortens its date to 4 days, never lengthens it', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 10)));
        await act(() => result.current.pantry.markOpened(result.current.pantry.items[0].id));
        expect(daysUntil(result.current.pantry.items[0].expirationDate)).toBe(4);
        expect(result.current.pantry.items[0].openedAt).toBeDefined();

        await act(() => result.current.pantry.addItem(draft('Latte fresco', 1)));
        const fresh = result.current.pantry.items.find((i) => i.name === 'Latte fresco')!;
        await act(() => result.current.pantry.markOpened(fresh.id));
        expect(daysUntil(result.current.pantry.items.find((i) => i.id === fresh.id)!.expirationDate)).toBe(1);
    });

    it('freezing moves the item and extends the date', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 2)));
        await act(async () => {
            await result.current.pantry.moveToFreezer(result.current.pantry.items[0].id);
        });
        expect(result.current.pantry.items[0].locationId).toBe('freezer');
        expect(daysUntil(result.current.pantry.items[0].expirationDate)).toBe(60);
    });

    it('freezing something that does not freeze keeps its date (it never revives an expired item)', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Uova', -3)));
        await act(async () => {
            await result.current.pantry.moveToFreezer(result.current.pantry.items[0].id);
        });
        expect(daysUntil(result.current.pantry.items[0].expirationDate)).toBe(-3);
    });
});

describe('reminder settings, plan and language', () => {
    it('switching reminders off empties the queue, on refills it, and the choice is saved', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Latte', 5)));
        await settle((p) => expect(p).toHaveLength(3));
        await act(() => result.current.pantry.setNotifPrefs({ ...result.current.pantry.notifPrefs, enabled: false }));
        await settle((p) => expect(p).toEqual([]));
        expect(JSON.parse((await AsyncStorage.getItem('@fc_notif_prefs'))!).enabled).toBe(false);
        await act(() => result.current.pantry.setNotifPrefs({ ...result.current.pantry.notifPrefs, enabled: true }));
        await settle((p) => expect(p).toHaveLength(3));
    });

    it('custom times apply only while Pro, and come back after resubscribing', async () => {
        mockPro = true;
        const hook = await setup();
        const { result } = hook;
        await act(() => result.current.pantry.addItem(draft('Latte', 10)));
        await act(() => result.current.pantry.setNotifPrefs({ ...result.current.pantry.notifPrefs, leadDays: [1], hour: 19, minute: 15 }));
        await settle((p) => expect(p.map((x) => localParts(new Date(x.trigger.date)))).toEqual([{ y: 2026, m: 10, d: 15, h: 19, min: 15 }]));

        // Subscription expires
        mockPro = false;
        await hook.rerender({});
        await settle((p) => expect(p.map((x) => localParts(new Date(x.trigger.date)).h)).toEqual([9, 9, 9]));

        mockPro = true;
        await hook.rerender({});
        await settle((p) => expect(p).toHaveLength(1));
    });

    it('changing language rewrites pending reminders in the new language', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Milk', 5)));
        await settle((p) => expect(p[0].content.title).toBe('Milk scade tra 2 giorni'));
        await act(async () => result.current.lang.setLanguage('en'));
        await settle((p) => expect(p[0].content.title).toBe('Milk expires in 2 days'));
    });

    it('coming back to the app refills reminders that did not fit before', async () => {
        const { result } = await setup();
        for (let i = 0; i < 25; i++) await act(() => result.current.pantry.addItem(draft(`P${i}`, 3 + i)));
        await settle((p) => expect(p).toHaveLength(60));
        const lastId = result.current.pantry.items[24].id;
        expect((await pending()).some((x) => x.identifier.startsWith(`item-${lastId}`))).toBe(false);

        // Three weeks later the user opens the app
        jest.setSystemTime(addDays(NOW, 21));
        const listener = (AppState.addEventListener as jest.Mock).mock.calls.map((c) => c[1]).pop();
        await act(async () => listener('active'));
        await settle((p) => expect(p.some((x) => x.identifier.startsWith(`item-${lastId}`))).toBe(true));
    });
});

describe('free plan limits', () => {
    it('free users can hold 20 items, Pro users more', async () => {
        const hook = await setup();
        for (let i = 0; i < 20; i++) await act(() => hook.result.current.pantry.addItem(draft(`P${i}`, 5)));
        expect(hook.result.current.pantry.canAddItem).toBe(false);
        mockPro = true;
        await hook.rerender({});
        expect(hook.result.current.pantry.canAddItem).toBe(true);
    });
});

describe('shopping list and places', () => {
    it('shopping list skips blanks and duplicates, toggles and clears checked', async () => {
        const { result } = await setup();
        await act(async () => result.current.pantry.addShopping(['Pane', ' pane ', '', 'Uova']));
        expect(result.current.pantry.shopping.map((s) => s.name)).toEqual(['Pane', 'Uova']);
        await act(async () => result.current.pantry.addShopping(['PANE']));
        expect(result.current.pantry.shopping).toHaveLength(2);
        await act(async () => result.current.pantry.toggleShopping(result.current.pantry.shopping[0].id));
        // A checked item can be added again as a new line
        await act(async () => result.current.pantry.addShopping(['Pane']));
        expect(result.current.pantry.shopping).toHaveLength(3);
        await act(async () => result.current.pantry.clearCheckedShopping());
        expect(result.current.pantry.shopping.map((s) => [s.name, s.checked])).toEqual([
            ['Pane', false],
            ['Uova', false],
        ]);
        await act(async () => result.current.pantry.removeShopping(result.current.pantry.shopping[0].id));
        expect(result.current.pantry.shopping.map((s) => s.name)).toEqual(['Uova']);
    });

    it('removing a custom place moves its items to the fridge; built-in places stay', async () => {
        const { result } = await setup();
        await act(async () => result.current.pantry.addLocation('  Cantina '));
        await act(async () => result.current.pantry.addLocation('   '));
        const cellar = result.current.pantry.locations.find((l) => l.name === 'Cantina')!;
        expect(result.current.pantry.locations).toHaveLength(4);
        await act(() => result.current.pantry.addItem(draft('Vino', 100, { locationId: cellar.id })));
        await act(async () => result.current.pantry.removeLocation(cellar.id));
        await act(async () => result.current.pantry.removeLocation('freezer'));
        expect(result.current.pantry.locations.map((l) => l.id)).toEqual(['fridge', 'freezer', 'pantry']);
        expect(result.current.pantry.items[0].locationId).toBe('fridge');
    });
});

describe('stored data and backups', () => {
    it('loads v1 data: Italian categories, missing tags, broken rows are skipped', async () => {
        await AsyncStorage.setItem(
            '@ecoshelf_food_items',
            JSON.stringify([
                { id: 1, name: 'Latte', category: 'Latticini', expirationDate: addDays(NOW, 3).toISOString() },
                { id: 2, name: 'Senza data' },
                { id: 3, name: 'Data rotta', expirationDate: 'ieri' },
                null,
            ]),
        );
        await AsyncStorage.setItem('@ecoshelf_notifications_enabled', 'false');
        const { result } = await setup();
        expect(result.current.pantry.items).toEqual([expect.objectContaining({ id: '1', category: 'dairy', locationId: 'fridge', tags: ['milk'] })]);
        expect(result.current.pantry.notifPrefs.enabled).toBe(false);
    });

    it('survives corrupted storage', async () => {
        await AsyncStorage.setItem('@ecoshelf_food_items', '{not json');
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { result } = await setup();
        expect(result.current.pantry.items).toEqual([]);
        warn.mockRestore();
    });

    it('everything is still there after restarting the app', async () => {
        const first = await setup();
        await act(() => first.result.current.pantry.addItem(draft('Latte', 5)));
        await act(async () => first.result.current.pantry.addShopping(['Pane']));
        await act(async () => {
            await first.result.current.pantry.finishItem(first.result.current.pantry.items[0].id, 'wasted');
        });
        await act(() => first.result.current.pantry.addItem(draft('Uova', 9)));
        await first.unmount();

        const second = await setup();
        expect(second.result.current.pantry.items.map((i) => i.name)).toEqual(['Uova']);
        expect(second.result.current.pantry.history.map((h) => h.outcome)).toEqual(['wasted']);
        expect(second.result.current.pantry.shopping.map((s) => s.name)).toEqual(['Pane']);
    });

    it('restoring a backup validates every part and reschedules reminders', async () => {
        const { result } = await setup();
        await act(() => result.current.pantry.addItem(draft('Vecchio', 5)));
        await act(() =>
            result.current.pantry.restoreBackup({
                app: 'freshcheck',
                version: 2,
                exportedAt: NOW.toISOString(),
                items: [
                    { id: 'a', name: 'Formaggio', category: 'dairy', locationId: 'fridge', expirationDate: addDays(NOW, 6).toISOString(), createdAt: NOW.toISOString(), tags: ['cheese'] },
                    { id: 'b', name: 'Senza tag', expirationDate: addDays(NOW, 6).toISOString() } as any,
                    { id: 'c', name: 'Rotto', expirationDate: 'boh' } as any,
                ],
                history: 'nope' as any,
                shopping: [{ id: 's', name: 'Pane', checked: false, createdAt: NOW.toISOString() }, null as any],
                locations: [] as any,
            }),
        );
        expect(result.current.pantry.items.map((i) => [i.id, i.tags])).toEqual([
            ['a', ['cheese']],
            ['b', []],
        ]);
        expect(result.current.pantry.history).toEqual([]);
        expect(result.current.pantry.shopping.map((s) => s.name)).toEqual(['Pane']);
        expect(result.current.pantry.locations.map((l) => l.id)).toEqual(['fridge', 'freezer', 'pantry']);
        await settle((p) => expect(p.every((x) => /Formaggio|Senza tag/.test(x.content.title))).toBe(true));
    });
});
