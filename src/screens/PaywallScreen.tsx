import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import { RootScreen, PaywallReason } from '../navigation/types';
import { useLanguage } from '../contexts/LanguageContext';
import { Plan, usePremium } from '../contexts/PremiumContext';
import { Button, T, haptic } from '../components/ui';
import { FONTS, RADIUS, SPACE } from '../theme/tokens';
import { TKey } from '../i18n';
import { PRIVACY_URL } from '../config';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const FEATURES: { key: TKey; reasons: PaywallReason[] }[] = [
    { key: 'feat_unlimited', reasons: ['items'] },
    { key: 'feat_ocr', reasons: ['ocr'] },
    { key: 'feat_locations', reasons: ['locations', 'freezer'] },
    { key: 'feat_stats', reasons: ['stats'] },
    { key: 'feat_recipes', reasons: ['recipes'] },
    { key: 'feat_notifs', reasons: ['notifications'] },
    { key: 'feat_export', reasons: ['export'] },
    { key: 'feat_themes', reasons: ['themes'] },
];

// The paywall is always dark with a warm glow: it reads as a different, special place
const INK = '#0B0D1A';
const PAPER = '#FFFFFF';
const GOLD = '#FFC23D';
const CTA: [string, string] = ['#FFC23D', '#FF6B2C'];

export const PaywallScreen = ({ navigation, route }: RootScreen<'Paywall'>) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const { plans, purchase, restore, isPro } = usePremium();
    const [selected, setSelected] = useState<Plan['kind']>('annual');
    const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

    const reason = route.params?.reason;
    const features = useMemo(() => {
        if (!reason) return FEATURES;
        const first = FEATURES.filter((f) => f.reasons.includes(reason));
        return [...first, ...FEATURES.filter((f) => !f.reasons.includes(reason))];
    }, [reason]);

    const plan = plans.find((p) => p.kind === selected) ?? plans[0];

    const onBuy = async () => {
        if (!plan) return;
        setBusy('buy');
        const res = await purchase(plan);
        setBusy(null);
        if (res === 'success') {
            haptic('success');
            Alert.alert(t('purchaseDone'));
            navigation.goBack();
        } else if (res === 'unavailable') Alert.alert(t('error'), t('storeUnavailable'));
        else if (res === 'error') Alert.alert(t('error'), t('storeUnavailable'));
    };

    const onRestore = async () => {
        setBusy('restore');
        const res = await restore();
        setBusy(null);
        if (res === 'restored') {
            Alert.alert(t('purchaseDone'));
            navigation.goBack();
        } else Alert.alert(res === 'none' ? t('restoreNone') : t('storeUnavailable'));
    };

    const periodLabel = (p: Plan) => (p.kind === 'monthly' ? t('perMonth') : p.kind === 'annual' ? t('perYear') : t('oneTime'));
    const planLabel = (p: Plan) => (p.kind === 'monthly' ? t('planMonthly') : p.kind === 'annual' ? t('planAnnual') : t('planLifetime'));
    const cta = plan?.kind === 'lifetime' ? t('buyLifetime') : plan?.hasTrial ? t('startTrial') : t('subscribe');

    return (
        <View style={{ flex: 1, backgroundColor: INK }}>
            <LinearGradient colors={['#FF6B2C', '#FF2E7E', 'rgba(11,13,26,0)']} locations={[0, 0.45, 1]} style={styles.glow} />
            <ScrollView contentContainerStyle={{ padding: SPACE.xl, paddingTop: insets.top + SPACE.lg, paddingBottom: SPACE.xl }}>
                <Pressable onPress={() => navigation.goBack()} accessibilityLabel={t('close')} hitSlop={12} style={styles.close}>
                    <X size={20} color={PAPER} />
                </Pressable>

                <View style={styles.seal}>
                    <T v="label" color={PAPER} style={{ fontFamily: FONTS.bodyHeavy }}>
                        FreshCheck Pro ✦
                    </T>
                </View>

                <T style={styles.title}>{t('paywallTitle')}</T>
                <T v="body" color={PAPER} style={{ opacity: 0.85, marginTop: SPACE.md, fontSize: 16, lineHeight: 24 }}>
                    {isPro ? t('alreadyPro') : t('paywallSubtitle')}
                </T>

                <View style={styles.features}>
                    {features.map((f, i) => (
                        <View key={f.key} style={styles.feature}>
                            <View style={[styles.check, { backgroundColor: i === 0 && reason ? GOLD : 'rgba(255,255,255,0.12)' }]}>
                                <Check size={13} color={i === 0 && reason ? INK : PAPER} strokeWidth={3} />
                            </View>
                            <T v={i === 0 && reason ? 'bodyStrong' : 'body'} color={PAPER}>
                                {t(f.key)}
                            </T>
                        </View>
                    ))}
                </View>

                {!isPro && (
                    <View style={{ gap: SPACE.sm, marginTop: SPACE.xl }}>
                        {plans.map((p) => {
                            const on = p.kind === selected;
                            return (
                                <Pressable
                                    key={p.kind}
                                    onPress={() => {
                                        haptic();
                                        setSelected(p.kind);
                                    }}
                                    style={[styles.plan, { borderColor: on ? GOLD : 'rgba(255,255,255,0.18)', backgroundColor: on ? 'rgba(255,194,61,0.14)' : 'transparent' }]}
                                >
                                    <View style={[styles.radio, { borderColor: on ? GOLD : 'rgba(255,255,255,0.4)' }]}>
                                        {on && <View style={[styles.radioDot, { backgroundColor: GOLD }]} />}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <T v="bodyStrong" color={PAPER}>
                                            {planLabel(p)}
                                        </T>
                                        {p.hasTrial && (
                                            <T v="tiny" color={GOLD}>
                                                {t('freeTrial')}
                                            </T>
                                        )}
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <T v="bodyStrong" color={PAPER} style={{ fontFamily: FONTS.display, fontSize: 19 }}>
                                            {p.price}
                                        </T>
                                        <T v="tiny" color={PAPER} style={{ opacity: 0.6 }}>
                                            {periodLabel(p)}
                                        </T>
                                    </View>
                                    {p.kind === 'annual' && (
                                        <View style={[styles.tag, { backgroundColor: GOLD }]}>
                                            <T v="label" color={INK} style={{ fontSize: 10, fontFamily: FONTS.bodyHeavy }}>
                                                {t('bestValue')}
                                            </T>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {!isPro && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + SPACE.md }]}>
                    <Button
                        label={cta}
                        loading={busy === 'buy'}
                        onPress={onBuy}
                        gradient={CTA}
                        textColor={INK}
                        disabled={!!busy}
                    />
                    <View style={styles.links}>
                        <Pressable onPress={onRestore} disabled={!!busy} hitSlop={8}>
                            <T v="tiny" color={PAPER} style={{ opacity: 0.75 }}>
                                {busy === 'restore' ? '…' : t('restore')}
                            </T>
                        </Pressable>
                        <T v="tiny" color={PAPER} style={{ opacity: 0.4 }}>
                            ·
                        </T>
                        <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
                            <T v="tiny" color={PAPER} style={{ opacity: 0.75 }}>
                                {t('terms')}
                            </T>
                        </Pressable>
                        <T v="tiny" color={PAPER} style={{ opacity: 0.4 }}>
                            ·
                        </T>
                        <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
                            <T v="tiny" color={PAPER} style={{ opacity: 0.75 }}>
                                {t('privacyShort')}
                            </T>
                        </Pressable>
                    </View>
                    <T v="tiny" color={PAPER} center style={{ opacity: 0.45, fontSize: 10, lineHeight: 13 }}>
                        {t('paywallLegal')}
                    </T>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    close: {
        alignSelf: 'flex-end',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 460 },
    seal: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.pill,
        paddingHorizontal: SPACE.md,
        paddingVertical: 6,
        marginTop: SPACE.md,
    },
    title: {
        fontFamily: FONTS.displayBold,
        fontSize: 42,
        lineHeight: 46,
        letterSpacing: -1.6,
        color: PAPER,
        marginTop: SPACE.lg,
    },
    features: { marginTop: SPACE.xl, gap: SPACE.md },
    feature: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
    check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    plan: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        borderWidth: 1.5,
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
    },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    tag: {
        position: 'absolute',
        top: -9,
        right: SPACE.lg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    footer: {
        paddingHorizontal: SPACE.xl,
        paddingTop: SPACE.md,
        gap: SPACE.sm,

    },
    links: { flexDirection: 'row', justifyContent: 'center', gap: SPACE.sm, marginTop: SPACE.xs },
});
