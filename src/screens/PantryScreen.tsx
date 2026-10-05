import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, ChevronRight, Refrigerator, ScanLine, Search, Settings2, X } from 'lucide-react-native';
import { TabScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { FoodCard } from '../components/FoodCard';
import { Button, Chip, IconButton, T } from '../components/ui';
import { ExpirationStatus, FoodItem, Outcome } from '../types';
import { daysUntil, statusFor, STATUS_ORDER } from '../utils/dateUtils';
import { matchRecipes } from '../utils/recipeMatcher';
import { locationName } from '../utils/labels';
import { FREE_LIMITS } from '../config';
import { FONTS, RADIUS, shadow, SPACE, TAB_BAR_SPACE } from '../theme/tokens';
import { TKey } from '../i18n';

const SECTION_TITLE: Record<ExpirationStatus, TKey> = {
    expired: 'sectionExpired',
    today: 'sectionToday',
    soon: 'sectionSoon',
    week: 'sectionWeek',
    later: 'sectionLater',
};

export const PantryScreen = ({ navigation }: TabScreen<'Pantry'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, date } = useLanguage();
    const { isPro } = usePremium();
    const { items, locations, finishItem, addShopping, canAddItem } = usePantry();
    const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items
            .filter((i) => !isPro || locationFilter === 'all' || i.locationId === locationFilter)
            .filter((i) => !q || i.name.toLowerCase().includes(q))
            .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
    }, [items, query, locationFilter, isPro]);

    const counts = useMemo(() => {
        const c: Record<ExpirationStatus, number> = { expired: 0, today: 0, soon: 0, week: 0, later: 0 };
        items.forEach((i) => c[statusFor(daysUntil(i.expirationDate))]++);
        return c;
    }, [items]);

    const sections = useMemo(() => {
        const groups = new Map<ExpirationStatus, FoodItem[]>();
        filtered.forEach((i) => {
            const s = statusFor(daysUntil(i.expirationDate));
            groups.set(s, [...(groups.get(s) ?? []), i]);
        });
        return STATUS_ORDER.filter((s) => groups.has(s)).map((s) => ({ status: s, data: groups.get(s)! }));
    }, [filtered]);

    const recipeCount = useMemo(
        () => matchRecipes(items).filter((m) => m.usedItems.some((i) => daysUntil(i.expirationDate) <= 3)).length,
        [items],
    );

    const urgent = counts.today + counts.soon;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('greetingMorning') : hour < 18 ? t('greetingAfternoon') : t('greetingEvening');
    const locById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);

    const onFinish = async (item: FoodItem, outcome: Outcome) => {
        const done = await finishItem(item.id, outcome);
        if (!done) return;
        Alert.alert(t('addToList'), t('addToListBody', { name: done.name }), [
            { text: t('no'), style: 'cancel' },
            { text: t('yes'), onPress: () => addShopping([done.name]) },
        ]);
    };

    const openEditor = (startScan?: 'barcode' | 'date') =>
        canAddItem ? navigation.navigate('ItemEditor', { startScan }) : navigation.navigate('Paywall', { reason: 'items' });

    const header = (
        <View>
            <View style={[styles.topRow, { paddingTop: insets.top + SPACE.md }]}>
                <View style={{ flex: 1 }}>
                    <T v="label" muted>
                        {date(new Date(), 'long')}
                    </T>
                    <T v="title" style={{ marginTop: 4 }}>
                        {greeting}
                    </T>
                </View>
                <IconButton
                    label={t('searchPlaceholder')}
                    onPress={() => {
                        // Closing the search also clears it, otherwise the list stays filtered
                        if (searching) setQuery('');
                        setSearching(!searching);
                    }}
                >
                    {searching ? <X size={18} color={colors.ink} /> : <Search size={18} color={colors.ink} />}
                </IconButton>
                <IconButton label={t('settings')} onPress={() => navigation.navigate('Settings')} style={{ marginLeft: SPACE.sm }}>
                    <Settings2 size={18} color={colors.ink} />
                </IconButton>
            </View>

            {searching && (
                <View style={[styles.search, { backgroundColor: colors.surface }, shadow(isDark)]}>
                    <Search size={16} color={colors.muted} />
                    <TextInput
                        autoFocus
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t('searchPlaceholder')}
                        placeholderTextColor={colors.muted}
                        style={[styles.searchInput, { color: colors.ink }]}
                    />
                </View>
            )}

            {items.length > 0 && (
                <LinearGradient
                    colors={[colors.accent, colors.accentGrad]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.ledger, shadow(isDark, colors.accent)]}
                >
                    <View style={[styles.blob, { right: -40, top: -50 }]} />
                    <View style={[styles.blob, { width: 110, height: 110, right: 70, bottom: -60 }]} />
                    <View style={styles.ledgerTop}>
                        <T style={[styles.ledgerNumber, { color: colors.onAccent }]}>{urgent}</T>
                        <View style={{ flex: 1, paddingBottom: 10 }}>
                            <T v="h3" color={colors.onAccent}>
                                {t('sectionSoon')}
                            </T>
                            <T v="small" color={colors.onAccent} style={{ opacity: 0.85 }}>
                                {t('pantrySummary', { n: items.length, soon: urgent })}
                            </T>
                        </View>
                    </View>
                    <View style={styles.bar}>
                        {STATUS_ORDER.map((s) =>
                            counts[s] ? <View key={s} style={{ flex: counts[s], backgroundColor: colors[s], height: 10, borderRadius: 5 }} /> : null,
                        )}
                    </View>
                    <View style={styles.legend}>
                        {STATUS_ORDER.filter((s) => counts[s]).map((s) => (
                            <View key={s} style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: colors[s] }]} />
                                <T v="tiny" color={colors.onAccent} style={{ fontFamily: FONTS.bodyBold }}>
                                    {t(SECTION_TITLE[s])} {counts[s]}
                                </T>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            )}

            {recipeCount > 0 && (
                <Pressable
                    onPress={() => navigation.navigate('Recipes')}
                    style={({ pressed }) => [styles.hint, { backgroundColor: colors.card, transform: [{ scale: pressed ? 0.98 : 1 }] }, shadow(isDark)]}
                >
                    <View style={[styles.hintIcon, { backgroundColor: colors.accentTint }]}>
                        <ChefHat size={18} color={colors.accent} strokeWidth={2.2} />
                    </View>
                    <T v="small" style={{ flex: 1, fontFamily: FONTS.bodyBold }}>
                        {t('useItRecipesHint', { n: recipeCount })}
                    </T>
                    <ChevronRight size={16} color={colors.accent} />
                </Pressable>
            )}

            {!isPro && items.length >= FREE_LIMITS.items - 5 && (
                <Pressable
                    onPress={() => navigation.navigate('Paywall', { reason: 'items' })}
                    style={[styles.limit, { backgroundColor: `${colors.gold}26` }]}
                >
                    <T v="small" style={{ flex: 1 }}>
                        {t('limitBanner', { n: items.length, max: FREE_LIMITS.items })}
                    </T>
                    <T v="small" color={isDark ? colors.gold : '#B36B00'} style={{ fontFamily: FONTS.bodyHeavy }}>
                        {t('upgrade')}
                    </T>
                </Pressable>
            )}

            {isPro && items.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    <Chip label={t('allLocations')} selected={locationFilter === 'all'} onPress={() => setLocationFilter('all')} />
                    {locations.map((l) => (
                        <Chip key={l.id} label={locationName(l, t)} selected={locationFilter === l.id} onPress={() => setLocationFilter(l.id)} />
                    ))}
                </ScrollView>
            )}
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: SPACE.lg }}>
                {header}
                <View style={styles.empty}>
                    <LinearGradient
                        colors={[colors.accent, colors.accentGrad]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.shelf, shadow(isDark, colors.accent)]}
                    >
                        <Refrigerator size={56} color={colors.onAccent} strokeWidth={1.8} />
                    </LinearGradient>
                    <T v="h2" center>
                        {t('pantryEmptyTitle')}
                    </T>
                    <T v="body" muted center style={{ marginTop: SPACE.sm, marginBottom: SPACE.xl }}>
                        {t('pantryEmptyBody')}
                    </T>
                    <Button label={t('addFirst')} onPress={() => openEditor()} style={{ alignSelf: 'stretch' }} />
                    <Button
                        label={t('scanBarcode')}
                        kind="ghost"
                        icon={<ScanLine size={18} color={colors.ink} />}
                        onPress={() => openEditor('barcode')}
                        style={{ alignSelf: 'stretch', marginTop: SPACE.sm }}
                    />
                </View>
            </View>
        );
    }

    return (
        <SectionList
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={{ backgroundColor: colors.background }}
            sections={sections}
            keyExtractor={(i) => i.id}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={header}
            contentContainerStyle={{ paddingHorizontal: SPACE.lg, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
            renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionDot, { backgroundColor: colors[section.status] }]} />
                    <T v="h3" style={{ flex: 1 }}>
                        {t(SECTION_TITLE[section.status])}
                    </T>
                    <View style={[styles.countPill, { backgroundColor: `${colors[section.status]}22` }]}>
                        <T v="tiny" color={colors[section.status]} style={{ fontFamily: FONTS.bodyHeavy }}>
                            {section.data.length}
                        </T>
                    </View>
                </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: SPACE.md - 2 }} />}
            renderItem={({ item }) => (
                <FoodCard
                    item={item}
                    location={locById.get(item.locationId)}
                    showLocation={isPro}
                    onPress={(i) => navigation.navigate('ItemEditor', { itemId: i.id })}
                    onFinish={onFinish}
                />
            )}
        />
    );
};

const styles = StyleSheet.create({
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: SPACE.lg,
    },
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.sm,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACE.lg,
        marginBottom: SPACE.lg,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SPACE.md,
        fontFamily: FONTS.body,
        fontSize: 15,
    },
    ledger: {
        borderRadius: RADIUS.xl,
        padding: SPACE.xl,
        paddingTop: SPACE.lg,
        marginBottom: SPACE.lg,
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    ledgerTop: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: SPACE.md,
    },
    ledgerNumber: {
        fontFamily: FONTS.displayBold,
        fontSize: 76,
        lineHeight: 80,
        letterSpacing: -3,
        fontVariant: ['tabular-nums'],
    },
    bar: {
        flexDirection: 'row',
        borderRadius: 6,
        padding: 3,
        gap: 3,
        marginTop: SPACE.md,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACE.md,
        marginTop: SPACE.md,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#FFFFFF' },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.sm,
        padding: SPACE.sm + 2,
        paddingRight: SPACE.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACE.md,
    },
    hintIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    limit: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACE.md,
        paddingHorizontal: SPACE.lg,
        borderRadius: RADIUS.md,
        marginBottom: SPACE.md,
    },
    chips: {
        gap: SPACE.sm,
        paddingBottom: SPACE.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.sm + 2,
        marginTop: SPACE.xl,
        marginBottom: SPACE.md,
    },
    sectionDot: { width: 10, height: 10, borderRadius: 5 },
    countPill: { minWidth: 26, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignItems: 'center' },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACE.xxl,
        paddingBottom: TAB_BAR_SPACE,
    },
    shelf: {
        width: 128,
        height: 128,
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACE.xl,
        transform: [{ rotate: '-6deg' }],
    },
});
