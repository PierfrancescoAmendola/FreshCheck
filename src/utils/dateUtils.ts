import { ExpirationStatus } from '../types';

const DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (d: Date = new Date()): Date => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

export const addDays = (d: Date, n: number): Date => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

// Whole days from today to the date (negative when past)
export const daysUntil = (iso: string | Date): number => {
    const target = startOfDay(typeof iso === 'string' ? new Date(iso) : iso);
    return Math.round((target.getTime() - startOfDay().getTime()) / DAY);
};

export const statusFor = (days: number): ExpirationStatus => {
    if (days < 0) return 'expired';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    if (days <= 7) return 'week';
    return 'later';
};

export const STATUS_ORDER: ExpirationStatus[] = ['expired', 'today', 'soon', 'week', 'later'];

// Store expiry dates at local noon so time zones never shift the day
export const toExpiryISO = (d: Date): string => {
    const x = new Date(d);
    x.setHours(12, 0, 0, 0);
    return x.toISOString();
};

export const sameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
