import * as Notifications from 'expo-notifications';
import { MAX_PENDING, planNotifications, syncNotifications } from '../utils/notifications';
import { NOW, localParts, makeItem, prefs, tIt } from './helpers';

const N = Notifications as any;

describe('planNotifications: per-item reminders', () => {
    it('schedules the free schedule (2 days before, on the day, day after) at 9:00', () => {
        const milk = makeItem('Latte', 5);
        const plan = planNotifications([milk], prefs(), false, tIt, NOW);
        expect(plan.map((p) => p.id)).toEqual([`item-${milk.id}-2`, `item-${milk.id}-0`, `item-${milk.id}--1`]);
        expect(plan.map((p) => localParts(p.date))).toEqual([
            { y: 2026, m: 10, d: 9, h: 9, min: 0 },
            { y: 2026, m: 10, d: 11, h: 9, min: 0 },
            { y: 2026, m: 10, d: 12, h: 9, min: 0 },
        ]);
        expect(plan[0].title).toBe('Latte scade tra 2 giorni');
        expect(plan[1].title).toBe('Latte scade oggi');
        expect(plan[2].title).toBe('Latte è scaduto ieri');
        expect(plan[0].data).toEqual({ foodId: milk.id });
    });

    it('nothing at all when reminders are switched off', () => {
        expect(planNotifications([makeItem('Latte', 5)], prefs({ enabled: false }), true, tIt, NOW)).toEqual([]);
    });

    it('never schedules in the past', () => {
        // Expires today: the 2-days-before reminder is gone, today 9:00 is still ahead at 8:00
        const plan = planNotifications([makeItem('Yogurt', 0)], prefs(), false, tIt, NOW);
        expect(plan.map((p) => localParts(p.date).d)).toEqual([6, 7]);
        // Same item at 10:00: today 9:00 has passed too
        const later = new Date(2026, 9, 6, 10, 0);
        expect(planNotifications([makeItem('Yogurt', 0, {}, later)], prefs(), false, tIt, later).map((p) => localParts(p.date).d)).toEqual([7]);
        // Expired two days ago: nothing left to say
        expect(planNotifications([makeItem('Pane', -2)], prefs(), false, tIt, NOW)).toEqual([]);
    });

    it('free users cannot get custom lead days, time or digests even if stored', () => {
        const custom = prefs({ leadDays: [7, 1], hour: 20, minute: 30, dailyDigest: true, weeklyDigest: true });
        const plan = planNotifications([makeItem('Latte', 10)], custom, false, tIt, NOW);
        expect(plan.map((p) => p.id.split('-').slice(2).join('-'))).toEqual(['2', '0', '-1']);
        expect(plan.every((p) => localParts(p.date).h === 9 && localParts(p.date).min === 0)).toBe(true);
        expect(plan.some((p) => p.id.startsWith('digest'))).toBe(false);
    });

    it('Pro users get their own lead days and time', () => {
        const custom = prefs({ leadDays: [7, 1], hour: 20, minute: 30 });
        const plan = planNotifications([makeItem('Latte', 10)], custom, true, tIt, NOW);
        expect(plan.map((p) => [p.id.split('-').slice(2).join('-'), localParts(p.date)])).toEqual([
            ['7', { y: 2026, m: 10, d: 9, h: 20, min: 30 }],
            ['1', { y: 2026, m: 10, d: 15, h: 20, min: 30 }],
        ]);
        expect(plan[1].title).toBe('Latte scade domani');
    });

    it('duplicate lead days do not create duplicate notifications', () => {
        const plan = planNotifications([makeItem('Latte', 10)], prefs({ leadDays: [2, 2, 0] }), true, tIt, NOW);
        expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
        expect(plan).toHaveLength(2);
    });

    it('keeps the local reminder time across the daylight saving change', () => {
        // Clocks go back on 25 October 2026 in Europe/Rome
        const plan = planNotifications([makeItem('Formaggio', 26)], prefs(), false, tIt, NOW);
        expect(plan.map((p) => localParts(p.date))).toEqual([
            { y: 2026, m: 10, d: 30, h: 9, min: 0 },
            { y: 2026, m: 11, d: 1, h: 9, min: 0 },
            { y: 2026, m: 11, d: 2, h: 9, min: 0 },
        ]);
    });

    it('skips items with an unreadable date instead of crashing', () => {
        const broken = { ...makeItem('Rotto', 3), expirationDate: 'not a date' };
        expect(planNotifications([broken, makeItem('Latte', 5)], prefs(), false, tIt, NOW)).toHaveLength(3);
    });
});

describe('planNotifications: iOS pending limit', () => {
    it('keeps at most MAX_PENDING, always the soonest ones', () => {
        const items = Array.from({ length: 40 }, (_, i) => makeItem(`P${i}`, 3 + i));
        const plan = planNotifications(items, prefs(), true, tIt, NOW);
        expect(plan).toHaveLength(MAX_PENDING);
        const times = plan.map((p) => p.date.getTime());
        expect(times).toEqual([...times].sort((a, b) => a - b));
        // The very first reminder (P0, 2 days before) is kept, the furthest ones are left for a later sync
        expect(plan[0].id).toBe(`item-${items[0].id}-2`);
        expect(plan.some((p) => p.id.startsWith(`item-${items[39].id}`))).toBe(false);
    });
});

describe('planNotifications: digests (Pro)', () => {
    it('morning digest lists what expires on each of the next 7 days', () => {
        const items = [makeItem('Latte', 0), makeItem('Uova', 0), makeItem('Pane', 3), makeItem('Riso', 30)];
        const plan = planNotifications(items, prefs({ enabled: true, leadDays: [0], dailyDigest: true }), true, tIt, NOW);
        const digests = plan.filter((p) => p.id.startsWith('digest-daily'));
        expect(digests.map((d) => [d.id, localParts(d.date).d, d.body])).toEqual([
            ['digest-daily-0', 6, 'Latte, Uova'],
            ['digest-daily-3', 9, 'Pane'],
        ]);
        expect(digests[0].title).toBe('Oggi in cucina');
    });

    it('truncates long digest lists', () => {
        const items = ['A', 'B', 'C', 'D', 'E', 'F'].map((n) => makeItem(n, 1));
        const plan = planNotifications(items, prefs({ dailyDigest: true }), true, tIt, NOW);
        expect(plan.find((p) => p.id === 'digest-daily-1')?.body).toBe('A, B, C, D…');
    });

    it('weekly plan fires next Monday and counts that week', () => {
        // NOW is Tuesday 6 Oct: next Monday is 12 Oct, week = 12..18 Oct
        const items = [makeItem('In settimana', 6), makeItem('Domenica', 12), makeItem('Troppo presto', 5), makeItem('Dopo', 13)];
        const plan = planNotifications(items, prefs({ weeklyDigest: true }), true, tIt, NOW);
        const weekly = plan.find((p) => p.id === 'digest-weekly')!;
        expect(localParts(weekly.date)).toEqual({ y: 2026, m: 10, d: 12, h: 9, min: 0 });
        expect(weekly.body).toBe('2 prodotti scadono questa settimana.');
    });

    it('on a Monday before the reminder time, the weekly plan is for today', () => {
        const monday = new Date(2026, 9, 12, 7, 0);
        const plan = planNotifications([makeItem('Latte', 2, {}, monday)], prefs({ weeklyDigest: true }), true, tIt, monday);
        expect(localParts(plan.find((p) => p.id === 'digest-weekly')!.date).d).toBe(12);
        const afterTime = new Date(2026, 9, 12, 10, 0);
        const later = planNotifications([makeItem('Latte', 8, {}, afterTime)], prefs({ weeklyDigest: true }), true, tIt, afterTime);
        expect(localParts(later.find((p) => p.id === 'digest-weekly')!.date).d).toBe(19);
    });

    it('no weekly plan when nothing expires that week', () => {
        const plan = planNotifications([makeItem('Riso', 60)], prefs({ weeklyDigest: true }), true, tIt, NOW);
        expect(plan.find((p) => p.id === 'digest-weekly')).toBeUndefined();
    });
});

describe('syncNotifications against the scheduler', () => {
    beforeEach(() => {
        N.__reset();
        jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick', 'setImmediate'] });
    });
    afterEach(() => jest.useRealTimers());

    it('replaces the whole queue with the current plan', async () => {
        const a = makeItem('Latte', 5);
        await syncNotifications([a], prefs(), false, tIt);
        expect((await N.getAllScheduledNotificationsAsync()).map((p: any) => p.identifier)).toHaveLength(3);

        // Item eaten: its reminders disappear
        await syncNotifications([], prefs(), false, tIt);
        expect(await N.getAllScheduledNotificationsAsync()).toEqual([]);
    });

    it('editing the expiry date moves the reminders', async () => {
        const a = makeItem('Latte', 5);
        await syncNotifications([a], prefs(), false, tIt);
        await syncNotifications([{ ...makeItem('Latte', 10), id: a.id }], prefs(), false, tIt);
        const pending = await N.getAllScheduledNotificationsAsync();
        expect(pending.map((p: any) => localParts(new Date(p.trigger.date)).d)).toEqual([14, 16, 17]);
    });

    it('a burst of syncs ends with the last state, never an older one', async () => {
        const a = makeItem('Latte', 5);
        const b = makeItem('Uova', 6);
        syncNotifications([a, b], prefs(), false, tIt);
        syncNotifications([a], prefs(), false, tIt);
        await syncNotifications([b], prefs(), false, tIt);
        const ids = (await N.getAllScheduledNotificationsAsync()).map((p: any) => p.identifier);
        expect(ids.every((id: string) => id.startsWith(`item-${b.id}`))).toBe(true);
    });

    it('with 100 items nothing is silently dropped by iOS: the queue stays under 64', async () => {
        const items = Array.from({ length: 100 }, (_, i) => makeItem(`P${i}`, 1 + (i % 30)));
        await syncNotifications(items, prefs({ dailyDigest: true, weeklyDigest: true }), true, tIt);
        const pending = await N.getAllScheduledNotificationsAsync();
        expect(pending.length).toBe(MAX_PENDING);
        expect(N.scheduleNotificationAsync).toHaveBeenLastCalledWith(expect.objectContaining({ trigger: expect.objectContaining({ type: 'date' }) }));
    });

    it('later reminders get scheduled once the earlier ones have fired', async () => {
        const items = Array.from({ length: 40 }, (_, i) => makeItem(`P${i}`, 3 + i));
        await syncNotifications(items, prefs(), false, tIt);
        const last = items[39];
        expect((await N.getAllScheduledNotificationsAsync()).some((p: any) => p.identifier.startsWith(`item-${last.id}`))).toBe(false);

        // A month later the user opens the app again (the AppState sync)
        jest.setSystemTime(new Date(2026, 10, 6, 8, 0));
        await syncNotifications(items, prefs(), false, tIt);
        expect((await N.getAllScheduledNotificationsAsync()).some((p: any) => p.identifier.startsWith(`item-${last.id}`))).toBe(true);
    });

    it('a failing schedule call does not stop the others', async () => {
        N.scheduleNotificationAsync.mockImplementationOnce(async () => {
            throw new Error('boom');
        });
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        await syncNotifications([makeItem('Latte', 5)], prefs(), false, tIt);
        expect(await N.getAllScheduledNotificationsAsync()).toHaveLength(2);
        warn.mockRestore();
    });
});
