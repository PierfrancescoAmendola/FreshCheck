import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card, Chip, Divider, ProBadge, SectionLabel, T } from '../components/ui';
import { NotificationPrefs } from '../types';
import { formatTime, TKey } from '../i18n';
import { requestPermission } from '../utils/notifications';
import { SPACE } from '../theme/tokens';

const LEADS: { days: number; key: TKey }[] = [
    { days: 7, key: 'leadDay_7' },
    { days: 3, key: 'leadDay_3' },
    { days: 2, key: 'leadDay_2' },
    { days: 1, key: 'leadDay_1' },
    { days: 0, key: 'leadDay_0' },
    { days: -1, key: 'leadDay_m1' },
];

export const RemindersScreen = ({ navigation }: RootScreen<'Reminders'>) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, language } = useLanguage();
    const { isPro } = usePremium();
    const { notifPrefs, setNotifPrefs } = usePantry();
    const [showTime, setShowTime] = useState(false);

    const update = async (patch: Partial<NotificationPrefs>) => {
        if (patch.enabled) await requestPermission();
        setNotifPrefs({ ...notifPrefs, ...patch });
    };

    const gate = (fn: () => void) => (isPro ? fn() : navigation.navigate('Paywall', { reason: 'notifications' }));

    const toggleLead = (d: number) =>
        gate(() => {
            const has = notifPrefs.leadDays.includes(d);
            const next = has ? notifPrefs.leadDays.filter((x) => x !== d) : [...notifPrefs.leadDays, d];
            if (next.length) update({ leadDays: next.sort((a, b) => b - a) });
        });

    const time = new Date();
    time.setHours(notifPrefs.hour, notifPrefs.minute, 0, 0);
    const shownLeads = isPro ? notifPrefs.leadDays : [2, 0, -1];

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xxxl }}>
            <ScreenHeader title={t('notifications')} />
            <View style={{ paddingHorizontal: SPACE.lg, gap: SPACE.xl }}>
                <Card>
                    <View style={styles.row}>
                        <T v="bodyStrong" style={{ flex: 1 }}>
                            {t('remindersOn')}
                        </T>
                        <Switch value={notifPrefs.enabled} onValueChange={(v) => update({ enabled: v })} trackColor={{ true: colors.accent }} />
                    </View>
                </Card>

                {notifPrefs.enabled && (
                    <>
                        <View>
                            <SectionLabel right={!isPro ? <ProBadge /> : undefined}>{t('remindWhen')}</SectionLabel>
                            <View style={styles.wrap}>
                                {LEADS.map((l) => (
                                    <Chip key={l.days} label={t(l.key)} selected={shownLeads.includes(l.days)} onPress={() => toggleLead(l.days)} />
                                ))}
                            </View>
                        </View>

                        <View>
                            <SectionLabel right={!isPro ? <ProBadge /> : undefined}>{t('remindAt')}</SectionLabel>
                            <Pressable onPress={() => gate(() => setShowTime((s) => !s))}>
                                <Card>
                                    <T v="h2">{formatTime(language, isPro ? notifPrefs.hour : 9, isPro ? notifPrefs.minute : 0)}</T>
                                </Card>
                            </Pressable>
                            {showTime && (
                                <DateTimePicker
                                    value={time}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(e, d) => {
                                        if (Platform.OS === 'android') setShowTime(false);
                                        if (e.type === 'set' && d) update({ hour: d.getHours(), minute: d.getMinutes() });
                                    }}
                                />
                            )}
                        </View>

                        <Card padded={false}>
                            <View style={[styles.row, styles.pad]}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.inline}>
                                        <T v="bodyStrong">{t('dailyDigest')}</T>
                                        {!isPro && <ProBadge />}
                                    </View>
                                    <T v="small" muted>
                                        {t('dailyDigestDesc')}
                                    </T>
                                </View>
                                <Switch
                                    value={isPro && notifPrefs.dailyDigest}
                                    onValueChange={(v) => gate(() => update({ dailyDigest: v }))}
                                    trackColor={{ true: colors.accent }}
                                />
                            </View>
                            <Divider />
                            <View style={[styles.row, styles.pad]}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.inline}>
                                        <T v="bodyStrong">{t('weeklyDigest')}</T>
                                        {!isPro && <ProBadge />}
                                    </View>
                                    <T v="small" muted>
                                        {t('weeklyDigestDesc')}
                                    </T>
                                </View>
                                <Switch
                                    value={isPro && notifPrefs.weeklyDigest}
                                    onValueChange={(v) => gate(() => update({ weeklyDigest: v }))}
                                    trackColor={{ true: colors.accent }}
                                />
                            </View>
                        </Card>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
    pad: { padding: SPACE.lg },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
    inline: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
});
