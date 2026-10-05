import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Award, Flame, Lock } from 'lucide-react-native';
import { TabScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { Button, Card, SectionLabel, T } from '../components/ui';
import { CategoryIcon } from '../components/icons';
import { BADGES, currentStreak, earnedBadges, lastMonths, monthEntries, periodStats, topWastedCategories } from '../utils/stats';
import { formatMonth, TKey } from '../i18n';
import { FONTS, RADIUS, SPACE, TAB_BAR_SPACE, shadow } from '../theme/tokens';

const CHART_H = 150;

export const StatsScreen = ({ navigation }: TabScreen<'Stats'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, money, language } = useLanguage();
    const { isPro } = usePremium();
    const { history } = usePantry();

    const month = useMemo(() => periodStats(monthEntries(history, new Date())), [history]);
    const months = useMemo(() => lastMonths(history, 6), [history]);
    const streak = useMemo(() => currentStreak(history), [history]);
    const top = useMemo(() => topWastedCategories(history), [history]);
    const badges = useMemo(() => earnedBadges(history), [history]);

    const maxValue = Math.max(1, ...months.map((m) => m.stats.savedValue + m.stats.wastedValue));

    const tiles = [
        { label: t('itemsEaten'), value: String(month.eaten), color: colors.later },
        { label: t('itemsWasted'), value: String(month.wasted), color: colors.expired },
        { label: t('wasteRate'), value: `${Math.round(month.wasteRate * 100)}%`, color: colors.soon },
        { label: t('streak'), value: String(streak), color: colors.accent, icon: <Flame size={14} color={colors.accent} /> },
    ];

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{ paddingHorizontal: SPACE.lg, paddingTop: insets.top + SPACE.md, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        >
            <T v="label" muted>
                {t('thisMonth')}
            </T>
            <T v="title" style={{ marginTop: 4, marginBottom: SPACE.xl }}>
                {t('statsTitle')}
            </T>

            {/* Hero */}
            <LinearGradient colors={[colors.accent, colors.accentGrad]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, shadow(isDark, colors.accent)]}>
                <T v="label" color={colors.onAccent} style={{ opacity: 0.8 }}>
                    {t('saved')}
                </T>
                <T style={[styles.heroNumber, { color: colors.onAccent }]} adjustsFontSizeToFit numberOfLines={1}>
                    {money(month.savedValue)}
                </T>
                <T v="small" color={colors.onAccent} style={{ opacity: 0.85 }}>
                    {t('wasted')} {money(month.wastedValue)} · {t('streakDays', { n: streak })}
                </T>
            </LinearGradient>

            <View style={styles.tiles}>
                {tiles.map((tile) => (
                    <View key={tile.label} style={[styles.tile, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            {tile.icon}
                            <T style={[styles.tileValue, { color: tile.color }]}>{tile.value}</T>
                        </View>
                        <T v="tiny" muted numberOfLines={1}>
                            {tile.label}
                        </T>
                    </View>
                ))}
            </View>

            {history.length === 0 && (
                <T v="body" muted center style={{ marginTop: SPACE.xl }}>
                    {t('statsEmpty')}
                </T>
            )}

            {/* Pro section */}
            <View style={{ marginTop: SPACE.xl }}>
                <View style={!isPro && styles.lockedContent} pointerEvents={isPro ? 'auto' : 'none'}>
                    <SectionLabel>{t('last6Months')}</SectionLabel>
                    <Card>
                        <Svg width="100%" height={CHART_H + 24}>
                            <Line x1="0" x2="100%" y1={CHART_H} y2={CHART_H} stroke={colors.line} strokeWidth={1} />
                            {months.map((m, i) => {
                                const x = `${(i / months.length) * 100 + 100 / months.length / 2 - 5}%`;
                                const savedH = (m.stats.savedValue / maxValue) * (CHART_H - 10);
                                const wastedH = (m.stats.wastedValue / maxValue) * (CHART_H - 10);
                                return (
                                    <React.Fragment key={i}>
                                        <Rect x={x} y={CHART_H - savedH} width="10%" height={savedH} rx={4} fill={colors.later} />
                                        <Rect x={x} y={CHART_H - savedH - wastedH} width="10%" height={wastedH} rx={4} fill={colors.expired} />
                                        <SvgText
                                            x={`${(i / months.length) * 100 + 100 / months.length / 2}%`}
                                            y={CHART_H + 18}
                                            fontSize={11}
                                            fontFamily={FONTS.bodySemi}
                                            fill={colors.muted}
                                            textAnchor="middle"
                                        >
                                            {formatMonth(language, m.month)}
                                        </SvgText>
                                    </React.Fragment>
                                );
                            })}
                        </Svg>
                        <View style={styles.legend}>
                            <View style={[styles.dot, { backgroundColor: colors.later }]} />
                            <T v="tiny" muted>
                                {t('saved')}
                            </T>
                            <View style={[styles.dot, { backgroundColor: colors.expired, marginLeft: SPACE.md }]} />
                            <T v="tiny" muted>
                                {t('wasted')}
                            </T>
                        </View>
                    </Card>

                    {top.length > 0 && (
                        <View style={{ marginTop: SPACE.xl }}>
                            <SectionLabel>{t('topWasted')}</SectionLabel>
                            <Card padded={false}>
                                {top.map((c, i) => (
                                    <View key={c.category} style={[styles.topRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line }]}>
                                        <CategoryIcon category={c.category} color={colors.inkSoft} />
                                        <T v="body" style={{ flex: 1 }}>
                                            {t(`cat_${c.category}` as TKey)}
                                        </T>
                                        <T v="bodyStrong" color={colors.expired}>
                                            {c.count}
                                        </T>
                                    </View>
                                ))}
                            </Card>
                        </View>
                    )}

                    <View style={{ marginTop: SPACE.xl }}>
                        <SectionLabel>{t('badges')}</SectionLabel>
                        <View style={styles.badges}>
                            {BADGES.map((b) => {
                                const on = badges.has(b);
                                return (
                                    <View key={b} style={[styles.badge, { backgroundColor: on ? colors.accentTint : colors.surface, borderColor: on ? colors.accent : colors.line }]}>
                                        <Award size={22} color={on ? colors.gold : colors.muted} strokeWidth={on ? 2.2 : 1.5} />
                                        <T v="tiny" center color={on ? colors.ink : colors.muted}>
                                            {t(`badge_${b}` as TKey)}
                                        </T>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {!isPro && (
                    <View style={[styles.lockOverlay, { backgroundColor: `${colors.background}E6` }]}>
                        <Lock size={22} color={colors.gold} />
                        <T v="bodyStrong" center style={{ marginVertical: SPACE.md, paddingHorizontal: SPACE.xl }}>
                            {t('statsLocked')}
                        </T>
                        <Button small label={t('unlock')} onPress={() => navigation.navigate('Paywall', { reason: 'stats' })} />
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    hero: {
        borderRadius: RADIUS.xl,
        padding: SPACE.xl,
    },
    heroNumber: {
        fontFamily: FONTS.displayBold,
        fontSize: 56,
        lineHeight: 64,
        letterSpacing: -2,
        marginVertical: SPACE.xs,
    },
    tiles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACE.sm,
        marginTop: SPACE.md,
    },
    tile: {
        width: '48.8%',
        flexGrow: 1,
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
    },
    tileValue: {
        fontFamily: FONTS.displayBold,
        fontSize: 30,
        lineHeight: 34,
        letterSpacing: -1,
        fontVariant: ['tabular-nums'],
    },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: SPACE.sm },
    dot: { width: 8, height: 8, borderRadius: 4 },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        padding: SPACE.lg,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACE.sm,
    },
    badge: {
        width: '31.5%',
        flexGrow: 1,
        alignItems: 'center',
        gap: 6,
        padding: SPACE.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    lockedContent: { opacity: 0.35 },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.lg,
    },
});
