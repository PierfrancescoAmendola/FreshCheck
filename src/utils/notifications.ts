import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodItem, NotificationPrefs } from '../types';
import { TKey, Params } from '../i18n';
import { addDays, daysUntil, startOfDay } from './dateUtils';

type T = (key: TKey, params?: Params) => string;

const CHANNEL = 'freshcheck-expiration';

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

const at = (day: Date, prefs: NotificationPrefs) => {
    const d = new Date(day);
    d.setHours(prefs.hour, prefs.minute, 0, 0);
    return d;
};

const schedule = async (date: Date, title: string, body: string, data: Record<string, unknown>, identifier?: string) => {
    if (date.getTime() <= Date.now()) return undefined;
    return Notifications.scheduleNotificationAsync({
        identifier,
        content: { title, body, data, sound: 'default' },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: Platform.OS === 'android' ? CHANNEL : undefined,
        },
    });
};

const copyFor = (lead: number, name: string, t: T) => {
    if (lead > 1) return { title: t('notifTitleLead', { name, n: lead }), body: t('notifBodyLead') };
    if (lead === 1) return { title: t('notifTitleTomorrow', { name }), body: t('notifBodyLead') };
    if (lead === 0) return { title: t('notifTitleToday', { name }), body: t('notifBodyToday') };
    return { title: t('notifTitleAfter', { name }), body: t('notifBodyAfter') };
};

export const scheduleForItem = async (item: FoodItem, prefs: NotificationPrefs, t: T): Promise<string[]> => {
    if (!prefs.enabled) return [];
    const ids: string[] = [];
    const expiry = startOfDay(new Date(item.expirationDate));
    for (const lead of prefs.leadDays) {
        try {
            const { title, body } = copyFor(lead, item.name, t);
            const id = await schedule(at(addDays(expiry, -lead), prefs), title, body, { foodId: item.id });
            if (id) ids.push(id);
        } catch (e) {
            console.warn('schedule notification', e);
        }
    }
    return ids;
};

export const cancelIds = async (ids?: string[]) => {
    if (!ids?.length) return;
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
};

const DIGEST_DAYS = 7;

// Digests are rebuilt whenever items change so their text stays accurate
export const rescheduleDigests = async (items: FoodItem[], prefs: NotificationPrefs, t: T, isPro: boolean) => {
    const ids = [...Array.from({ length: DIGEST_DAYS }, (_, i) => `digest-daily-${i}`), 'digest-weekly'];
    await cancelIds(ids);
    if (!prefs.enabled || !isPro) return;

    if (prefs.dailyDigest) {
        for (let i = 0; i < DIGEST_DAYS; i++) {
            const day = addDays(startOfDay(), i);
            const due = items.filter((it) => daysUntil(it.expirationDate) === i);
            if (due.length === 0) continue;
            const names = due.slice(0, 4).map((d) => d.name).join(', ') + (due.length > 4 ? '…' : '');
            await schedule(at(day, prefs), t('digestTitle'), t('digestBody', { items: names }), {}, `digest-daily-${i}`).catch(() => undefined);
        }
    }

    if (prefs.weeklyDigest) {
        const today = startOfDay();
        const offset = (8 - today.getDay()) % 7 || 7; // next Monday
        const monday = addDays(today, offset);
        const count = items.filter((it) => {
            const d = daysUntil(it.expirationDate);
            return d >= offset && d < offset + 7;
        }).length;
        if (count > 0) {
            await schedule(at(monday, prefs), t('weeklyTitle'), t('weeklyBody', { n: count }), {}, 'digest-weekly').catch(() => undefined);
        }
    }
};

export const cancelAll = () => Notifications.cancelAllScheduledNotificationsAsync();
