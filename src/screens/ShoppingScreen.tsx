import React, { useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Plus, Share2, X } from 'lucide-react-native';
import { TabScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { IconButton, T, haptic } from '../components/ui';
import { FONTS, RADIUS, SPACE, TAB_BAR_SPACE, shadow } from '../theme/tokens';

export const ShoppingScreen = (_: TabScreen<'Shopping'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { shopping, addShopping, toggleShopping, removeShopping, clearCheckedShopping } = usePantry();
    const [draft, setDraft] = useState('');

    const sorted = [...shopping].sort((a, b) => Number(a.checked) - Number(b.checked));
    const hasChecked = shopping.some((s) => s.checked);

    const submit = () => {
        if (!draft.trim()) return;
        haptic();
        addShopping([draft]);
        setDraft('');
    };

    const share = () => {
        const lines = shopping.filter((s) => !s.checked).map((s) => `• ${s.name}`);
        if (lines.length) Share.share({ message: `${t('shoppingShareHeader')}\n\n${lines.join('\n')}` });
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.header, { paddingTop: insets.top + SPACE.md }]}>
                <View style={{ flex: 1 }}>
                    <T v="label" muted>
                        {shopping.filter((s) => !s.checked).length} · {t('tabShopping')}
                    </T>
                    <T v="title" style={{ marginTop: 4 }}>
                        {t('shoppingTitle')}
                    </T>
                </View>
                <IconButton label={t('share')} onPress={share}>
                    <Share2 size={18} color={colors.ink} />
                </IconButton>
            </View>

            <View style={[styles.input, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}>
                <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={submit}
                    placeholder={t('shoppingAddPlaceholder')}
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    style={[styles.inputText, { color: colors.ink }]}
                />
                <Pressable onPress={submit} hitSlop={8} style={[styles.addBtn, { backgroundColor: colors.accent }]}>
                    <Plus size={20} color={colors.onAccent} strokeWidth={2.6} />
                </Pressable>
            </View>

            <FlatList
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
                data={sorted}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ paddingHorizontal: SPACE.lg, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
                ListEmptyComponent={
                    <T v="body" muted center style={{ marginTop: SPACE.xxxl, paddingHorizontal: SPACE.xl }}>
                        {t('shoppingEmpty')}
                    </T>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            haptic();
                            toggleShopping(item.id);
                        }}
                        style={[styles.row, { borderColor: colors.line }]}
                    >
                        <View style={[styles.box, { borderColor: item.checked ? colors.accent : colors.muted, backgroundColor: item.checked ? colors.accent : 'transparent' }]}>
                            {item.checked && <Check size={14} color={colors.onAccent} strokeWidth={3} />}
                        </View>
                        <T
                            v="body"
                            style={[{ flex: 1 }, item.checked && { textDecorationLine: 'line-through', color: colors.muted }]}
                        >
                            {item.name}
                        </T>
                        <Pressable onPress={() => removeShopping(item.id)} hitSlop={10} accessibilityLabel={t('delete')}>
                            <X size={16} color={colors.muted} />
                        </Pressable>
                    </Pressable>
                )}
                ListFooterComponent={
                    hasChecked ? (
                        <Pressable onPress={clearCheckedShopping} style={{ alignSelf: 'center', padding: SPACE.lg }}>
                            <T v="small" color={colors.accent} style={{ fontFamily: FONTS.bodyBold }}>
                                {t('clearChecked')}
                            </T>
                        </Pressable>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACE.lg,
        paddingBottom: SPACE.lg,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACE.lg,
        marginBottom: SPACE.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.pill,
        paddingLeft: SPACE.lg,
        paddingRight: 6,
    },
    inputText: {
        flex: 1,
        fontFamily: FONTS.body,
        fontSize: 15,
        paddingVertical: SPACE.md,
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        paddingVertical: SPACE.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    box: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
