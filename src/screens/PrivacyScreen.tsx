import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Globe, HardDrive, ShieldCheck } from 'lucide-react-native';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card, T } from '../components/ui';
import { SPACE } from '../theme/tokens';
import { TKey } from '../i18n';

const SECTIONS: { icon: typeof Camera; title: TKey; body: TKey }[] = [
    { icon: HardDrive, title: 'privacyLocalTitle', body: 'privacyLocalBody' },
    { icon: Camera, title: 'privacyCameraTitle', body: 'privacyCameraBody' },
    { icon: Globe, title: 'privacyNetworkTitle', body: 'privacyNetworkBody' },
    { icon: ShieldCheck, title: 'privacyDeleteTitle', body: 'privacyDeleteBody' },
];

export const PrivacyScreen = (_: RootScreen<'Privacy'>) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useLanguage();
    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xxxl }}>
            <ScreenHeader title={t('privacyTitle')} />
            <View style={{ paddingHorizontal: SPACE.lg, gap: SPACE.md }}>
                <T v="h3" style={{ marginBottom: SPACE.md }}>
                    {t('privacyIntro')}
                </T>
                {SECTIONS.map(({ icon: Icon, title, body }) => (
                    <Card key={title}>
                        <View style={styles.head}>
                            <Icon size={18} color={colors.accent} />
                            <T v="bodyStrong">{t(title)}</T>
                        </View>
                        <T v="body" muted>
                            {t(body)}
                        </T>
                    </Card>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    head: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginBottom: SPACE.sm },
});
