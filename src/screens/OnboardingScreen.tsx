import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, T } from '../components/ui';
import { requestPermission } from '../utils/notifications';
import { FONTS, RADIUS, shadow, SPACE } from '../theme/tokens';
import { TKey } from '../i18n';
import { Colors } from '../theme/tokens';

const SLIDES: { title: TKey; body: TKey }[] = [
    { title: 'ob1Title', body: 'ob1Body' },
    { title: 'ob2Title', body: 'ob2Body' },
    { title: 'ob3Title', body: 'ob3Body' },
];

// Mini pantry cards that echo the real list
const Stub = ({ n, tone, label, name, colors, rotate }: { n: string; tone: string; label: string; name: string; colors: Colors; rotate: string }) => (
    <View style={[styles.stub, { backgroundColor: colors.card, transform: [{ rotate }] }, shadow(false)]}>
        <View style={[styles.stubLeft, { backgroundColor: tone }]}>
            <T style={styles.stubN}>{n}</T>
            <T v="tiny" color="#FFFFFF">
                {label}
            </T>
        </View>
        <View style={{ paddingHorizontal: SPACE.md, flex: 1 }}>
            <T v="bodyStrong">{name}</T>
            <View style={[styles.fakeLine, { backgroundColor: colors.sunken }]} />
        </View>
    </View>
);

export const OnboardingScreen = ({ onDone }: { onDone: () => void }) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, money } = useLanguage();
    const [page, setPage] = useState(0);
    const scroller = useRef<ScrollView>(null);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

    const next = async () => {
        if (page < SLIDES.length - 1) {
            scroller.current?.scrollTo({ x: width * (page + 1), animated: true });
        } else {
            await requestPermission();
            onDone();
        }
    };

    const art = [
        <View key="a" style={styles.art}>
            <Stub n="0" tone={colors.today} label={t('todayShort')} name="Yogurt" colors={colors} rotate="-4deg" />
            <Stub n="2" tone={colors.soon} label={t('daysLeft')} name="Spinach" colors={colors} rotate="2deg" />
            <Stub n="9" tone={colors.later} label={t('daysLeft')} name="Parmesan" colors={colors} rotate="-1deg" />
        </View>,
        <View key="b" style={styles.art}>
            <View style={[styles.notif, { backgroundColor: colors.card }, shadow(false)]}>
                <T v="tiny" muted style={{ fontFamily: FONTS.bodyBold }}>
                    FreshCheck · 09:00
                </T>
                <T v="bodyStrong" style={{ marginTop: 4 }}>
                    {t('notifTitleLead', { name: 'Mozzarella', n: 2 })}
                </T>
                <T v="small" muted>
                    {t('notifBodyLead')}
                </T>
            </View>
            <View style={[styles.recipe, { backgroundColor: colors.ink }]}>
                <T style={{ fontSize: 38, lineHeight: 44 }}>🍝</T>
                <T v="h3" color={colors.background}>
                    {t('recipesTitle')}
                </T>
            </View>
        </View>,
        <View key="c" style={[styles.art, styles.savedCard, { backgroundColor: colors.card }, shadow(false)]}>
            <T v="label" muted>
                {t('saved')}
            </T>
            <T style={[styles.money, { color: colors.ink }]}>{money(47)}</T>
            <View style={styles.bars}>
                {[30, 46, 38, 64, 58, 88].map((h, i) => (
                    <View key={i} style={{ flex: 1, height: h, borderRadius: 8, backgroundColor: i === 5 ? colors.later : colors.sunken }} />
                ))}
            </View>
        </View>,
    ];

    const bgs: [string, string][] = [
        [colors.today, colors.expired],
        [colors.accent, colors.accentGrad],
        [colors.later, colors.week],
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient colors={bgs[page]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top }]} />
            <View style={[styles.top, { paddingTop: insets.top + SPACE.sm }]}>
                <T v="h3" color="#FFFFFF" style={{ fontFamily: FONTS.bodyHeavy, letterSpacing: -0.4 }}>
                    FreshCheck
                </T>
                {page < SLIDES.length - 1 && (
                    <Pressable onPress={onDone} hitSlop={10} style={styles.skip}>
                        <T v="small" color="#FFFFFF" style={{ fontFamily: FONTS.bodyBold }}>
                            {t('skip')}
                        </T>
                    </Pressable>
                )}
            </View>
            <ScrollView
                ref={scroller}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                style={{ flex: 1 }}
            >
                {SLIDES.map((s, i) => (
                    <View key={s.title} style={[styles.slide, { width }]}>
                        <View style={styles.artWrap}>{art[i]}</View>
                        <T v="hero">{t(s.title)}</T>
                        <T v="body" muted style={{ marginTop: SPACE.md, fontSize: 16, lineHeight: 24 }}>
                            {t(s.body)}
                        </T>
                    </View>
                ))}
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: insets.bottom + SPACE.lg }]}>
                <View style={styles.dots}>
                    {SLIDES.map((_, i) => (
                        <View key={i} style={[styles.dot, { backgroundColor: i === page ? bgs[page][0] : colors.line, width: i === page ? 26 : 8 }]} />
                    ))}
                </View>
                <Button label={page === SLIDES.length - 1 ? t('getStarted') : t('next')} onPress={next} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    hero: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '56%',
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACE.xl,
        paddingBottom: SPACE.sm,
    },
    skip: {
        paddingHorizontal: SPACE.md + 2,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.22)',
    },
    slide: { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.xl },
    artWrap: { flex: 1, justifyContent: 'center', paddingBottom: SPACE.xl },
    art: { gap: SPACE.md },
    stub: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        padding: SPACE.sm,
    },
    stubLeft: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    stubN: { fontFamily: FONTS.displayBold, fontSize: 24, lineHeight: 26, color: '#FFFFFF' },
    fakeLine: { height: 7, width: '50%', borderRadius: 4, marginTop: SPACE.sm },
    notif: {
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
    },
    recipe: {
        borderRadius: RADIUS.xl,
        padding: SPACE.xl,
        gap: SPACE.sm,
        transform: [{ rotate: '-3deg' }],
        marginLeft: SPACE.xxl,
    },
    savedCard: { borderRadius: RADIUS.xl, padding: SPACE.xl, alignItems: 'flex-start' },
    money: { fontFamily: FONTS.displayBold, fontSize: 64, lineHeight: 72, letterSpacing: -2.5 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACE.sm, marginTop: SPACE.md, alignSelf: 'stretch' },
    footer: { paddingHorizontal: SPACE.xl, gap: SPACE.lg },
    dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
    dot: { height: 8, borderRadius: 4 },
});
