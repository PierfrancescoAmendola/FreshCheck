import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Check, Trash2 } from 'lucide-react-native';
import { FoodItem, Outcome, StorageLocation } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { daysUntil, statusFor } from '../utils/dateUtils';
import { FONTS, RADIUS, shadow, SPACE } from '../theme/tokens';
import { T, haptic } from './ui';
import { CategoryIcon, LocationIcon } from './icons';
import { locationName } from '../utils/labels';

interface Props {
    item: FoodItem;
    location?: StorageLocation;
    showLocation: boolean;
    onPress: (item: FoodItem) => void;
    onFinish: (item: FoodItem, outcome: Outcome) => void;
}

export const FoodCard = ({ item, location, showLocation, onPress, onFinish }: Props) => {
    const { colors, isDark } = useTheme();
    const { t, date } = useLanguage();
    const ref = useRef<Swipeable>(null);

    const days = daysUntil(item.expirationDate);
    const status = statusFor(days);
    const tone = colors[status];

    const big = days < 0 ? `${-days}` : days === 0 ? '0' : `${days}`;
    const small = days < 0 ? t('expiredShort') : days === 0 ? t('todayShort') : days === 1 ? t('dayLeft') : t('daysLeft');

    const action = (outcome: Outcome) => (progress: Animated.AnimatedInterpolation<number>) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1], extrapolate: 'clamp' });
        const consumed = outcome === 'consumed';
        return (
            <View style={[styles.action, { backgroundColor: consumed ? colors.later : colors.expired, alignItems: consumed ? 'flex-start' : 'flex-end' }]}>
                <Animated.View style={[styles.actionInner, { transform: [{ scale }] }]}>
                    {consumed ? <Check size={24} color="#FFFFFF" strokeWidth={2.6} /> : <Trash2 size={22} color="#FFFFFF" strokeWidth={2.4} />}
                    <T v="tiny" color="#FFFFFF" style={{ fontFamily: FONTS.bodyBold }}>
                        {consumed ? t('markConsumed') : t('markWasted')}
                    </T>
                </Animated.View>
            </View>
        );
    };

    const meta = [t(`cat_${item.category}` as any), showLocation ? locationName(location, t) : null].filter(Boolean).join(' · ');

    return (
        <Swipeable
            ref={ref}
            friction={1.6}
            leftThreshold={70}
            rightThreshold={70}
            overshootFriction={8}
            // Swipeable clips to a square box by default, which cuts the card's soft shadow into a grey rectangle
            containerStyle={styles.swipe}
            renderLeftActions={action('consumed')}
            renderRightActions={action('wasted')}
            onSwipeableOpen={(direction) => {
                haptic(direction === 'left' ? 'success' : 'warning');
                ref.current?.close();
                onFinish(item, direction === 'left' ? 'consumed' : 'wasted');
            }}
        >
            <Pressable
                onPress={() => onPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${big} ${small}`}
                style={({ pressed }) => [styles.card, { backgroundColor: colors.card, transform: [{ scale: pressed ? 0.98 : 1 }] }, shadow(isDark)]}
            >
                <View style={[styles.stub, { backgroundColor: tone }, shadow(isDark, tone)]}>
                    <T style={styles.stubNumber}>{big}</T>
                    <T v="tiny" color="#FFFFFF" style={styles.stubLabel}>
                        {small}
                    </T>
                </View>
                <View style={styles.body}>
                    <T v="bodyStrong" numberOfLines={1}>
                        {item.name}
                    </T>
                    <View style={styles.metaRow}>
                        <CategoryIcon category={item.category} size={13} color={colors.muted} />
                        <T v="small" muted numberOfLines={1} style={{ flex: 1 }}>
                            {meta}
                        </T>
                    </View>
                    <View style={styles.metaRow}>
                        {showLocation && <LocationIcon location={location} size={12} color={colors.muted} />}
                        <T v="tiny" muted>
                            {item.openedAt ? `${t('openedOn', { date: date(item.openedAt, 'short') })} · ` : ''}
                            {date(item.expirationDate, 'short')}
                        </T>
                    </View>
                </View>
            </Pressable>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    swipe: {
        overflow: 'visible',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        minHeight: 84,
        padding: SPACE.sm + 2,
    },
    stub: {
        width: 62,
        height: 62,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stubNumber: {
        fontFamily: FONTS.displayBold,
        fontSize: 26,
        lineHeight: 28,
        letterSpacing: -1,
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    stubLabel: {
        marginTop: -1,
        opacity: 0.92,
    },
    body: {
        flex: 1,
        paddingHorizontal: SPACE.md + 2,
        paddingVertical: SPACE.xs,
        justifyContent: 'center',
        gap: 3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    action: {
        flex: 1,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        paddingHorizontal: SPACE.xl,
    },
    actionInner: {
        alignItems: 'center',
        gap: 2,
    },
});
