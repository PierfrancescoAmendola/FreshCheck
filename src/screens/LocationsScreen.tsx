import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card, Divider, T } from '../components/ui';
import { LocationIcon } from '../components/icons';
import { locationName } from '../utils/labels';
import { FONTS, RADIUS, SPACE, shadow } from '../theme/tokens';

export const LocationsScreen = (_: RootScreen<'Locations'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { locations, items, addLocation, removeLocation } = usePantry();
    const [draft, setDraft] = useState('');

    const submit = () => {
        addLocation(draft);
        setDraft('');
    };

    const confirmRemove = (id: string, name: string) =>
        Alert.alert(t('deleteLocation'), `${name}\n${t('deleteLocationBody')}`, [
            { text: t('cancel'), style: 'cancel' },
            { text: t('delete'), style: 'destructive', onPress: () => removeLocation(id) },
        ]);

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xxxl }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            <ScreenHeader title={t('locations')} kicker={t('locationsHint')} />
            <View style={{ paddingHorizontal: SPACE.lg, gap: SPACE.lg }}>
                <Card padded={false}>
                    {locations.map((l, i) => {
                        const count = items.filter((it) => it.locationId === l.id).length;
                        return (
                            <View key={l.id}>
                                {i > 0 && <Divider />}
                                <View style={styles.row}>
                                    <LocationIcon location={l} size={18} color={colors.inkSoft} />
                                    <T v="body" style={{ flex: 1 }}>
                                        {locationName(l, t)}
                                    </T>
                                    <T v="small" muted>
                                        {count}
                                    </T>
                                    {!l.builtIn && (
                                        <Pressable hitSlop={10} onPress={() => confirmRemove(l.id, locationName(l, t))} accessibilityLabel={t('delete')}>
                                            <Trash2 size={16} color={colors.expired} />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </Card>

                <View style={[styles.input, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}>
                    <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        onSubmitEditing={submit}
                        placeholder={t('locationPlaceholder')}
                        placeholderTextColor={colors.muted}
                        style={[styles.inputText, { color: colors.ink }]}
                    />
                    <Pressable onPress={submit} style={[styles.add, { backgroundColor: colors.accent }]} accessibilityLabel={t('newLocation')}>
                        <Plus size={20} color={colors.onAccent} strokeWidth={2.6} />
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, padding: SPACE.lg },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.pill,
        paddingLeft: SPACE.lg,
        paddingRight: 6,
    },
    inputText: { flex: 1, fontFamily: FONTS.body, fontSize: 15, paddingVertical: SPACE.md },
    add: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
