import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Users } from 'lucide-react-native';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { Button, IconButton, SectionLabel, T } from '../components/ui';
import { RECIPES, recipeText } from '../data/recipes';
import { FONTS, RADIUS, SPACE, shadow } from '../theme/tokens';

export const RecipeDetailScreen = ({ navigation, route }: RootScreen<'RecipeDetail'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, language } = useLanguage();
    const { items, addShopping } = usePantry();
    const recipe = RECIPES.find((r) => r.id === route.params.recipeId);

    const have = useMemo(() => {
        if (!recipe) return [];
        return items.filter((i) => i.tags.some((tag) => recipe.tags.includes(tag)));
    }, [items, recipe]);

    if (!recipe) return null;
    const text = recipeText(recipe, language);

    const addMissing = () => {
        const haveNames = have.map((h) => h.name.toLowerCase());
        const missing = text.ingredients.filter((ing) => !haveNames.some((n) => ing.toLowerCase().includes(n.split(' ')[0])));
        addShopping(missing);
        Alert.alert(t('addedToList'));
    };

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xxxl }}>
            <View style={[styles.hero, { backgroundColor: colors.accentTint, paddingTop: insets.top + SPACE.md }]}>
                <IconButton label={t('close')} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={18} color={colors.ink} />
                </IconButton>
                <T style={styles.emoji}>{recipe.emoji}</T>
                <T v="title">{text.title}</T>
                <View style={styles.meta}>
                    <View style={styles.metaItem}>
                        <Clock size={14} color={colors.inkSoft} />
                        <T v="small">{t('minutes', { n: recipe.minutes })}</T>
                    </View>
                    <View style={styles.metaItem}>
                        <Users size={14} color={colors.inkSoft} />
                        <T v="small">{t('servings', { n: recipe.servings })}</T>
                    </View>
                </View>
            </View>

            <View style={styles.body}>
                {have.length > 0 && (
                    <View style={[styles.have, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}>
                        <SectionLabel>{t('youHave')}</SectionLabel>
                        <T v="bodyStrong" color={colors.accent}>
                            {have.map((h) => h.name).join(' · ')}
                        </T>
                    </View>
                )}

                <SectionLabel>{t('ingredients')}</SectionLabel>
                {text.ingredients.map((ing) => (
                    <View key={ing} style={[styles.ingredient, { borderColor: colors.line }]}>
                        <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
                        <T v="body" style={{ flex: 1 }}>
                            {ing}
                        </T>
                    </View>
                ))}

                <Button label={t('addMissing')} kind="secondary" small onPress={addMissing} style={{ marginTop: SPACE.lg, alignSelf: 'flex-start' }} />

                <View style={{ marginTop: SPACE.xxl }}>
                    <SectionLabel>{t('steps')}</SectionLabel>
                    {text.steps.map((step, i) => (
                        <View key={i} style={styles.step}>
                            <T style={[styles.stepNum, { color: colors.accent }]}>{i + 1}</T>
                            <T v="body" style={{ flex: 1 }}>
                                {step}
                            </T>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    hero: {
        paddingHorizontal: SPACE.lg,
        paddingBottom: SPACE.xl,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
    },
    emoji: { fontSize: 64, lineHeight: 76, marginTop: SPACE.lg },
    meta: { flexDirection: 'row', gap: SPACE.lg, marginTop: SPACE.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    body: { padding: SPACE.lg, paddingTop: SPACE.xl },
    have: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
        marginBottom: SPACE.xl,
    },
    ingredient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        paddingVertical: SPACE.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bullet: { width: 6, height: 6, borderRadius: 3 },
    step: { flexDirection: 'row', gap: SPACE.lg, marginBottom: SPACE.lg },
    stepNum: { fontFamily: FONTS.displayBold, fontSize: 28, lineHeight: 30, width: 26 },
});
