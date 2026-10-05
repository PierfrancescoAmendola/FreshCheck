import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { IconButton, T } from './ui';
import { SPACE } from '../theme/tokens';

export const ScreenHeader = ({ title, kicker }: { title: string; kicker?: string }) => {
    const nav = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[styles.wrap, { paddingTop: insets.top + SPACE.sm }]}>
            <IconButton label={t('close')} onPress={() => nav.goBack()}>
                <ArrowLeft size={20} color={colors.ink} strokeWidth={2.2} />
            </IconButton>
            {kicker && (
                <T v="label" color={colors.accent} style={{ marginTop: SPACE.lg }}>
                    {kicker}
                </T>
            )}
            <T v="title" style={{ marginTop: kicker ? 4 : SPACE.lg }}>
                {title}
            </T>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: SPACE.lg, paddingBottom: SPACE.lg },
});
