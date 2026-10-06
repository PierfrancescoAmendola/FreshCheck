// Native modules replaced with in-memory fakes so app logic can run under Jest.

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Behaves like the iOS scheduler: keeps pending requests by identifier (same id replaces),
// and only the 64 soonest survive, as on a real device.
jest.mock('expo-notifications', () => {
    const IOS_LIMIT = 64;
    let pending: { identifier: string; content: any; trigger: any }[] = [];
    let permission = 'granted';
    let counter = 0;
    const api = {
        SchedulableTriggerInputTypes: { DATE: 'date' },
        AndroidImportance: { HIGH: 4 },
        setNotificationHandler: jest.fn(),
        setNotificationChannelAsync: jest.fn(async () => null),
        getPermissionsAsync: jest.fn(async () => ({ status: permission })),
        requestPermissionsAsync: jest.fn(async () => ({ status: permission })),
        scheduleNotificationAsync: jest.fn(async ({ identifier, content, trigger }: any) => {
            const id = identifier ?? `auto-${++counter}`;
            pending = pending.filter((p) => p.identifier !== id);
            pending.push({ identifier: id, content, trigger });
            pending.sort((a, b) => new Date(a.trigger.date).getTime() - new Date(b.trigger.date).getTime());
            pending = pending.slice(0, IOS_LIMIT);
            return id;
        }),
        cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
            pending = pending.filter((p) => p.identifier !== id);
        }),
        cancelAllScheduledNotificationsAsync: jest.fn(async () => {
            pending = [];
        }),
        getAllScheduledNotificationsAsync: jest.fn(async () => pending.map((p) => ({ ...p }))),
        __reset: () => {
            pending = [];
            permission = 'granted';
            counter = 0;
        },
        __setPermission: (p: string) => {
            permission = p;
        },
    };
    return api;
});

jest.mock('expo-store-review', () => ({
    hasAction: jest.fn(async () => true),
    requestReview: jest.fn(async () => undefined),
}));

jest.mock('expo-localization', () => ({
    getLocales: () => [{ languageCode: 'it', languageTag: 'it-IT', currencyCode: 'EUR', regionCode: 'IT' }],
    getCalendars: () => [{ timeZone: 'Europe/Rome' }],
}));
