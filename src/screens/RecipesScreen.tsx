import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Lock, Sprout } from 'lucide-react-native';
import { TabScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { Button, Chip, T } from '../components/ui';
import { Recipe, RECIPES, recipeText } from '../data/recipes';
import { matchRecipes, RecipeMatch } from '../utils/recipeMatcher';
import { FREE_LIMITS } from '../config';
import { FONTS, RADIUS, SPACE, TAB_BAR_SPACE } from '../theme/tokens';

type Filter = 'all' | 'quick' | 'veggie';

export const RecipesScreen = ({ navigation }: TabScreen<'Recipes'>) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const { isPro } = usePremium();
    const { items } = usePantry();
    const [filter, setFilter] = useState<Filter>('all');

    const matches = useMemo(() => matchRecipes(items), [items]);

    const list = useMemo(() => {
        const matchedIds = new Set(matches.map((m) => m.recipe.id));
        const rest: RecipeMatch[] = RECIPES.filter((r) => !matchedIds.has(r.id)).map((recipe) => ({ recipe, score: 0, usedItems: [] }));
        return [...matches, ...rest].filter(({ recipe }) =>
            filter === 'quick' ? recipe.minutes <= 20 : filter === 'veggie' ? recipe.veggie : true,
        );
    }, [matches, filter]);

    const visible = isPro ? list : list.slice(0, FREE_LIMITS.recipes);
    const locked = list.length - visible.length;

    const onFilter = (f: Filter) => (isPro || f === 'all' ? setFilter(f) : navigation.navigate('Paywall', { reason: 'recipes' }));

    const renderCard = ({ item: m, index }: { item: RecipeMatch; index: number }) => {
        const text = recipeText(m.recipe, language);
        const featured = index === 0 && m.score > 0;
        return (
            <Pressable
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: m.recipe.id })}
                style={({ pressed }) => [
                    styles.card,
                    featured && styles.featured,
                    { backgroundColor: featured ? colors.accent : colors.card, borderColor: colors.line, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
            >
                <T style={featured ? styles.emojiBig : styles.emoji}>{m.recipe.emoji}</T>
                <View style={{ flex: 1 }}>
                    <T v={featured ? 'h2' : 'bodyStrong'} color={featured ? colors.onAccent : colors.ink} numberOfLines={2}>
                        {text.title}
                    </T>
                    {m.usedItems.length > 0 && (
                        <T v="small" color={featured ? colors.onAccent : colors.accent} numberOfLines={1} style={{ marginTop: 2, fontFamily: FONTS.bodySemi }}>
                            {t('uses', { items: m.usedItems.map((i) => i.name).join(', ') })}
                        </T>
                    )}
                    <View style={styles.meta}>
                        <Clock size={12} color={featured ? colors.onAccent : colors.muted} />
                        <T v="tiny" color={featured ? colors.onAccent : colors.muted}>
                            {t('minutes', { n: m.recipe.minutes })}
                        </T>
                        {m.recipe.veggie && <Sprout size={12} color={featured ? colors.onAccent : colors.later} />}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <FlatList
            style={{ backgroundColor: colors.background }}
            data={visible}
            keyExtractor={(m) => m.recipe.id}
            renderItem={renderCard}
            ItemSeparatorComponent={() => <View style={{ height: SPACE.sm }} />}
            contentContainerStyle={{ paddingHorizontal: SPACE.lg, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
            ListHeaderComponent={
                <View style={{ paddingTop: insets.top + SPACE.md, paddingBottom: SPACE.lg }}>
                    <T v="label" muted>
                        {t('recipesSubtitle')}
                    </T>
                    <T v="title" style={{ marginTop: 4, marginBottom: SPACE.lg }}>
                        {t('recipesTitle')}
                    </T>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.sm }}>
                        <Chip label={t('filterAll')} selected={filter === 'all'} onPress={() => onFilter('all')} />
                        <Chip label={t('filterQuick')} selected={filter === 'quick'} locked={!isPro} onPress={() => onFilter('quick')} />
                        <Chip label={t('filterVeggie')} selected={filter === 'veggie'} locked={!isPro} onPress={() => onFilter('veggie')} />
                    </ScrollView>
                    {items.length === 0 ? (
                        <T v="small" muted style={{ marginTop: SPACE.lg }}>
                            {t('recipesEmpty')}
                        </T>
                    ) : matches.length === 0 ? (
                        <T v="small" muted style={{ marginTop: SPACE.lg }}>
                            {t('recipesNoMatch')}
                        </T>
                    ) : null}
                </View>
            }
            ListFooterComponent={
                locked > 0 ? (
                    <View style={[styles.locked, { backgroundColor: `${colors.gold}24` }]}>
                        <Lock size={18} color={colors.gold} />
                        <T v="bodyStrong" center>
                            {t('lockedRecipes', { n: locked })}
                        </T>
                        <Button small label={t('unlock')} onPress={() => navigation.navigate('Paywall', { reason: 'recipes' })} />
                    </View>
                ) : null
            }
        />
    );
};

export const findRecipe = (id: string): Recipe | undefined => RECIPES.find((r) => r.id === id);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.lg,
        padding: SPACE.lg,
        borderRadius: RADIUS.lg,
        borderWidth: StyleSheet.hairlineWidth,
    },
    featured: {
        paddingVertical: SPACE.xl,
        borderRadius: RADIUS.xl,
    },
    emoji: { fontSize: 30, lineHeight: 36 },
    emojiBig: { fontSize: 46, lineHeight: 52 },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: SPACE.xs,
    },
    locked: {
        marginTop: SPACE.lg,
        alignItems: 'center',
        gap: SPACE.md,
        padding: SPACE.xl,
        borderRadius: RADIUS.xl,
    },
});
