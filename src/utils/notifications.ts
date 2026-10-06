import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodItem, NotificationPrefs } from '../types';
import { TKey, Params } from '../i18n';
import { addDays, startOfDay } from './dateUtils';

type T = (key: TKey, params?: Params) => string;

const CHANNEL = 'freshcheck-expiration';

// iOS keeps only the 64 soonest pending local notifications and silently drops the rest.
// Stay below that and refill the queue every time the app syncs (launch, foreground, changes).
export const MAX_PENDING = 60;
export const DIGEST_DAYS = 7;
// Free users always get the standard schedule; custom lead days, time and digests are Pro
export const FREE_LEAD_DAYS = [2, 0, -1];
export const FREE_HOUR = 9;
export const FREE_MINUTE = 0;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const ensureChannel = async (t: T) => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
            name: t('channelName'),
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10B26C',
        });
    }
};

export const requestPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') return true;
        const req = await Notifications.requestPermissionsAsync();
        return req.status === 'granted';
    } catch (e) {
        console.warn('notification permission', e);
        return false;
    }
};

// True when the user turned notifications off for the app in the system settings
export const isPermissionDenied = async (): Promise<boolean> => {
    try {
        return (await Notifications.getPermissionsAsync()).status === 'denied';
    } catch {
        return false;
    }
};

export interface PlannedNotification {
    id: string;
    date: Date;
    title: string;
    body: string;
    data: Record<string, unknown>;
}

export const effectivePrefs = (prefs: NotificationPrefs, isPro: boolean): NotificationPrefs =>
    isPro
        ? prefs
        : { ...prefs, leadDays: FREE_LEAD_DAYS, hour: FREE_HOUR, minute: FREE_MINUTE, dailyDigest: false, weeklyDigest: false };

const at = (day: Date, prefs: NotificationPrefs) => {
    const d = new Date(day);
    d.setHours(prefs.hour, prefs.minute, 0, 0);
    return d;
};

// Calendar days from `from` to the expiry date, independent of the time of day and of DST
const dayDiff = (iso: string, from: Date) => {
    const a = startOfDay(new Date(iso));
    const b = startOfDay(from);
    return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
};

const copyFor = (lead: number, name: string, t: T) => {
    if (lead > 1) return { title: t('notifTitleLead', { name, n: lead }), body: t('notifBodyLead') };
    if (lead === 1) return { title: t('notifTitleTomorrow', { name }), body: t('notifBodyLead') };
    if (lead === 0) return { title: t('notifTitleToday', { name }), body: t('notifBodyToday') };
    return { title: t('notifTitleAfter', { name }), body: t('notifBodyAfter') };
};

const listNames = (items: FoodItem[]) =>
    items.slice(0, 4).map((d) => d.name).join(', ') + (items.length > 4 ? '…' : '');

// Every notification the app wants pending right now, soonest first, capped at MAX_PENDING.
// Pure: the same input always gives the same plan, so it is easy to test.
export const planNotifications = (
    items: FoodItem[],
    prefs: NotificationPrefs,
    isPro: boolean,
    t: T,
    now: Date = new Date(),
): PlannedNotification[] => {
    if (!prefs.enabled) return [];
    const p = effectivePrefs(prefs, isPro);
    const plan: PlannedNotification[] = [];
    const add = (n: PlannedNotification) => {
        if (n.date.getTime() > now.getTime()) plan.push(n);
    };

    const leads = [...new Set(p.leadDays)];
    for (const item of items) {
        const expiry = startOfDay(new Date(item.expirationDate));
        if (Number.isNaN(expiry.getTime())) continue;
        for (const lead of leads) {
            const { title, body } = copyFor(lead, item.name, t);
            add({ id: `item-${item.id}-${lead}`, date: at(addDays(expiry, -lead), p), title, body, data: { foodId: item.id } });
        }
    }

    const today = startOfDay(now);
    if (p.dailyDigest) {
        for (let i = 0; i < DIGEST_DAYS; i++) {
            const due = items.filter((it) => dayDiff(it.expirationDate, today) === i);
            if (due.length === 0) continue;
            add({
                id: `digest-daily-${i}`,
                date: at(addDays(today, i), p),
                title: t('digestTitle'),
                body: t('digestBody', { items: listNames(due) }),
                data: { digest: 'daily' },
            });
        }
    }

    if (p.weeklyDigest) {
        // The coming Monday, or today when it is Monday and the reminder time has not passed yet
        let offset = (8 - today.getDay()) % 7;
        if (offset === 0 && at(today, p).getTime() <= now.getTime()) offset = 7;
        const count = items.filter((it) => {
            const d = dayDiff(it.expirationDate, today);
            return d >= offset && d < offset + 7;
        }).length;
        if (count > 0) {
            add({
                id: 'digest-weekly',
                date: at(addDays(today, offset), p),
                title: t('weeklyTitle'),
                body: t('weeklyBody', { n: count }),
                data: { digest: 'weekly' },
            });
        }
    }

    return plan.sort((a, b) => a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)).slice(0, MAX_PENDING);
};

const apply = async (plan: PlannedNotification[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const n of plan) {
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: n.id,
                content: { title: n.title, body: n.body, data: n.data, sound: 'default' },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: n.date,
                    channelId: Platform.OS === 'android' ? CHANNEL : undefined,
                },
            });
        } catch (e) {
            console.warn('schedule notification', e);
        }
    }
};

// Syncs run one after another so an older plan can never overwrite a newer one
let queue: Promise<void> = Promise.resolve();

export const syncNotifications = (items: FoodItem[], prefs: NotificationPrefs, isPro: boolean, t: T): Promise<void> => {
    queue = queue.then(() => apply(planNotifications(items, prefs, isPro, t))).catch((e) => console.warn('sync notifications', e));
    return queue;
};
