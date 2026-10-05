import { CategoryId, HistoryEntry } from '../types';
import { addDays, sameMonth, startOfDay } from './dateUtils';

export interface PeriodStats {
    savedValue: number;
    wastedValue: number;
    eaten: number;
    wasted: number;
    wasteRate: number; // 0..1
}

export const periodStats = (entries: HistoryEntry[]): PeriodStats => {
    let savedValue = 0;
    let wastedValue = 0;
    let eaten = 0;
    let wasted = 0;
    for (const e of entries) {
        if (e.outcome === 'consumed') {
            eaten++;
            savedValue += e.price;
        } else {
            wasted++;
            wastedValue += e.price;
        }
    }
    const total = eaten + wasted;
    return { savedValue, wastedValue, eaten, wasted, wasteRate: total ? wasted / total : 0 };
};

export const monthEntries = (history: HistoryEntry[], month: Date) =>
    history.filter((e) => sameMonth(new Date(e.date), month));

export const lastMonths = (history: HistoryEntry[], count: number) => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
        return { month: d, stats: periodStats(monthEntries(history, d)) };
    });
};

// Days since the last wasted item (or since first activity if none wasted)
export const currentStreak = (history: HistoryEntry[]): number => {
    if (history.length === 0) return 0;
    const lastWaste = history
        .filter((e) => e.outcome === 'wasted')
        .reduce<number | null>((max, e) => Math.max(max ?? 0, new Date(e.date).getTime()), null);
    const first = history.reduce((min, e) => Math.min(min, new Date(e.date).getTime()), Infinity);
    const from = startOfDay(new Date(lastWaste ?? first));
    const days = Math.floor((startOfDay().getTime() - from.getTime()) / 86400000);
    return lastWaste ? days : days + 1;
};

// Longest gap between wasted items, used for streak badges
export const bestStreak = (history: HistoryEntry[]): number => {
    if (history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    let best = 0;
    let start = startOfDay(new Date(sorted[0].date));
    for (const e of sorted) {
        if (e.outcome === 'wasted') {
            const d = startOfDay(new Date(e.date));
            best = Math.max(best, Math.floor((d.getTime() - start.getTime()) / 86400000));
            start = addDays(d, 1);
        }
    }
    return Math.max(best, currentStreak(history));
};

export const topWastedCategories = (history: HistoryEntry[]): { category: CategoryId; count: number }[] => {
    const counts = new Map<CategoryId, number>();
    history.filter((e) => e.outcome === 'wasted').forEach((e) => counts.set(e.category, (counts.get(e.category) ?? 0) + 1));
    return [...counts.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
};

export type BadgeId = 'first' | 'ten' | 'fifty' | 'week' | 'month' | 'zero';

export const BADGES: BadgeId[] = ['first', 'ten', 'fifty', 'week', 'month', 'zero'];

export const earnedBadges = (history: HistoryEntry[]): Set<BadgeId> => {
    const eaten = history.filter((e) => e.outcome === 'consumed').length;
    const streak = bestStreak(history);
    const earned = new Set<BadgeId>();
    if (eaten >= 1) earned.add('first');
    if (eaten >= 10) earned.add('ten');
    if (eaten >= 50) earned.add('fifty');
    if (streak >= 7) earned.add('week');
    if (streak >= 30) earned.add('month');
    // A completed calendar month with at least 5 items and no waste
    const now = new Date();
    for (let i = 1; i <= 12; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const s = periodStats(monthEntries(history, m));
        if (s.eaten >= 5 && s.wasted === 0) {
            earned.add('zero');
            break;
        }
    }
    return earned;
};
