import React, { ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import {
    Bell,
    ChevronRight,
    Download,
    FileJson,
    LifeBuoy,
    MapPin,
    PlayCircle,
    Shield,
    Star,
    Upload,
} from 'lucide-react-native';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePremium } from '../contexts/PremiumContext';
import { usePantry } from '../contexts/PantryContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button, Card, Chip, Divider, ProBadge, SectionLabel, T } from '../components/ui';
import { ACCENTS, RADIUS, shadow, SPACE, ThemeMode } from '../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { buildDemoBackup } from '../utils/demoData';
import { AccentId } from '../types';
import { exportBackup, exportCsv, pickBackup } from '../utils/exporter';
import { SUPPORT_URL } from '../config';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'KRW', 'PLN', 'BRL', 'MXN', 'SEK'];

const Row = ({ icon, label, onPress, right }: { icon: ReactNode; label: string; onPress?: () => void; right?: ReactNode }) => {
    const { colors, isDark } = useTheme();
    return (
        <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
            {icon}
            <T v="body" style={{ flex: 1 }}>
                {label}
            </T>
            {right ?? (onPress ? <ChevronRight size={16} color={colors.muted} /> : null)}
        </Pressable>
    );
};

export const SettingsScreen = ({ navigation }: RootScreen<'Settings'>) => {
    const insets = useSafeAreaInsets();
    const { colors, mode, setMode, accent, setAccent, isDark } = useTheme();
    const { t, language, setLanguage, languages, currency, setCurrency } = useLanguage();
    const { isPro, debugPro, setDebugPro } = usePremium();
    const { items, history, shopping, locations, restoreBackup } = usePantry();
    const { replay } = useOnboarding();

    const onImport = async () => {
        const res = await pickBackup();
        if (!res) return;
        if (res === 'invalid') return Alert.alert(t('error'), t('importFailed'));
        await restoreBackup(res);
        Alert.alert(t('importDone'));
    };

    const iconColor = colors.inkSoft;
    const version = Constants.expoConfig?.version ?? '';

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xxxl }}>
            <ScreenHeader title={t('settings')} />
            <View style={{ paddingHorizontal: SPACE.lg, gap: SPACE.xl }}>
                {/* Membership */}
                <LinearGradient
                    colors={isPro ? [colors.accent, colors.accentGrad] : ['#FF6B2C', '#FF2E7E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.member, shadow(isDark, isPro ? colors.accent : '#FF2E7E')]}
                >
                    <View style={{ flex: 1 }}>
                        <T v="label" color="#FFFFFF" style={{ opacity: 0.85 }}>
                            {t('membership')}
                        </T>
                        <T v="h2" color="#FFFFFF">
                            {isPro ? t('proPlan') : t('freePlan')}
                        </T>
                    </View>
                    {!isPro && (
                        <Button small label={t('upgrade')} onPress={() => navigation.navigate('Paywall', { reason: 'settings' })} kind="secondary" style={{ backgroundColor: '#FFFFFF' }} textColor="#FF2E7E" />
                    )}
                </LinearGradient>

                {/* Appearance */}
                <View>
                    <SectionLabel>{t('appearance')}</SectionLabel>
                    <Card>
                        <T v="small" muted style={{ marginBottom: SPACE.sm }}>
                            {t('theme')}
                        </T>
                        <View style={styles.wrap}>
                            {(['light', 'dark', 'auto'] as ThemeMode[]).map((m) => (
                                <Chip key={m} label={t(m === 'auto' ? 'system' : m)} selected={mode === m} onPress={() => setMode(m)} />
                            ))}
                        </View>
                        <View style={styles.inline}>
                            <T v="small" muted>
                                {t('accentColor')}
                            </T>
                            {!isPro && <ProBadge />}
                        </View>
                        <View style={styles.swatches}>
                            {(Object.keys(ACCENTS) as AccentId[]).map((a) => (
                                <Pressable
                                    key={a}
                                    accessibilityLabel={a}
                                    onPress={() => (isPro || a === 'forest' ? setAccent(a) : navigation.navigate('Paywall', { reason: 'themes' }))}
                                    style={[styles.swatch, { backgroundColor: ACCENTS[a].light, borderColor: accent === a ? colors.ink : 'transparent' }, accent === a && shadow(isDark, ACCENTS[a].light)]}
                                />
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Language & currency */}
                <View>
                    <SectionLabel>{t('language')}</SectionLabel>
                    <View style={styles.wrap}>
                        {languages.map((l) => (
                            <Chip key={l.code} label={l.name} selected={language === l.code} onPress={() => setLanguage(l.code)} />
                        ))}
                    </View>
                    <View style={{ height: SPACE.lg }} />
                    <SectionLabel>{t('currency')}</SectionLabel>
                    <View style={styles.wrap}>
                        {CURRENCIES.map((c) => (
                            <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
                        ))}
                    </View>
                </View>

                {/* Organise */}
                <Card padded={false}>
                    <Row icon={<Bell size={18} color={iconColor} />} label={t('notifications')} onPress={() => navigation.navigate('Reminders')} />
                    <Divider />
                    <Row
                        icon={<MapPin size={18} color={iconColor} />}
                        label={t('locations')}
                        onPress={() => (isPro ? navigation.navigate('Locations') : navigation.navigate('Paywall', { reason: 'locations' }))}
                        right={!isPro ? <ProBadge /> : undefined}
                    />
                </Card>

                {/* Data */}
                <View>
                    <SectionLabel right={!isPro ? <ProBadge /> : undefined}>{t('data')}</SectionLabel>
                    <Card padded={false}>
                        <Row
                            icon={<Download size={18} color={iconColor} />}
                            label={t('exportCsv')}
                            onPress={() => (isPro ? exportCsv(items, history) : navigation.navigate('Paywall', { reason: 'export' }))}
                        />
                        <Divider />
                        <Row
                            icon={<FileJson size={18} color={iconColor} />}
                            label={t('exportBackup')}
                            onPress={() =>
                                isPro ? exportBackup({ items, history, shopping, locations }) : navigation.navigate('Paywall', { reason: 'export' })
                            }
                        />
                        <Divider />
                        <Row
                            icon={<Upload size={18} color={iconColor} />}
                            label={t('importBackup')}
                            onPress={() => (isPro ? onImport() : navigation.navigate('Paywall', { reason: 'export' }))}
                        />
                    </Card>
                </View>

                {/* About */}
                <View>
                    <SectionLabel>{t('about')}</SectionLabel>
                    <Card padded={false}>
                        <Row icon={<Shield size={18} color={iconColor} />} label={t('privacy')} onPress={() => navigation.navigate('Privacy')} />
                        <Divider />
                        <Row icon={<LifeBuoy size={18} color={iconColor} />} label={t('support')} onPress={() => Linking.openURL(SUPPORT_URL)} />
                        <Divider />
                        <Row
                            icon={<Star size={18} color={iconColor} />}
                            label={t('rateApp')}
                            onPress={async () => {
                                const url = StoreReview.storeUrl();
                                if (url) Linking.openURL(url);
                                else if (await StoreReview.hasAction()) StoreReview.requestReview();
                            }}
                        />
                        <Divider />
                        <Row
                            icon={<PlayCircle size={18} color={iconColor} />}
                            label={t('replayOnboarding')}
                            onPress={() => {
                                navigation.goBack();
                                replay();
                            }}
                        />
                    </Card>
                </View>

                {__DEV__ && (
                    <Card>
                        <Row label={t('debugPro')} icon={null} right={<Switch value={debugPro} onValueChange={setDebugPro} />} />
                        <Divider />
                        <Row label="Developer: load demo data" icon={null} onPress={() => restoreBackup(buildDemoBackup(language, currency))} />
                    </Card>
                )}

                <T v="tiny" muted center>
                    FreshCheck · {t('version', { v: version })}
                </T>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    member: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        borderRadius: RADIUS.xl,
        padding: SPACE.xl,
    },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
    inline: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, marginTop: SPACE.lg, marginBottom: SPACE.sm },
    swatches: { flexDirection: 'row', gap: SPACE.md },
    swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        paddingHorizontal: SPACE.lg,
        paddingVertical: SPACE.lg,
    },
});
