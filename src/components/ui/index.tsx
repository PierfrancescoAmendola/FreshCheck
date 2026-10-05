import React, { ReactNode } from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleProp,
    StyleSheet,
    Text,
    TextProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONTS, RADIUS, shadow, SPACE, TYPE } from '../../theme/tokens';

// ---------- Typography ----------

type Variant = 'hero' | 'title' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'tiny' | 'label' | 'italic';

const VARIANTS: Record<Variant, TextStyle> = {
    hero: { fontFamily: FONTS.displayBold, fontSize: TYPE.hero, lineHeight: TYPE.hero * 1.08, letterSpacing: -1.4 },
    title: { fontFamily: FONTS.displayBold, fontSize: TYPE.title, lineHeight: TYPE.title * 1.12, letterSpacing: -0.9 },
    h2: { fontFamily: FONTS.display, fontSize: TYPE.h2, lineHeight: TYPE.h2 * 1.2, letterSpacing: -0.5 },
    h3: { fontFamily: FONTS.bodyBold, fontSize: TYPE.h3, lineHeight: TYPE.h3 * 1.3 },
    body: { fontFamily: FONTS.body, fontSize: TYPE.body, lineHeight: TYPE.body * 1.45 },
    bodyStrong: { fontFamily: FONTS.bodyBold, fontSize: TYPE.body, lineHeight: TYPE.body * 1.4 },
    small: { fontFamily: FONTS.body, fontSize: TYPE.small, lineHeight: TYPE.small * 1.4 },
    tiny: { fontFamily: FONTS.bodySemi, fontSize: TYPE.tiny, lineHeight: TYPE.tiny * 1.3 },
    label: { fontFamily: FONTS.bodyBold, fontSize: TYPE.small, letterSpacing: -0.1 },
    italic: { fontFamily: FONTS.displayItalic, fontSize: TYPE.h3, lineHeight: TYPE.h3 * 1.3 },
};

interface TProps extends TextProps {
    v?: Variant;
    color?: string;
    muted?: boolean;
    center?: boolean;
    style?: StyleProp<TextStyle>;
}

export const T = ({ v = 'body', color, muted, center, style, ...rest }: TProps) => {
    const { colors } = useTheme();
    return (
        <Text
            {...rest}
            style={[VARIANTS[v], { color: color ?? (muted ? colors.muted : colors.ink) }, center && { textAlign: 'center' }, style]}
        />
    );
};

// ---------- Buttons ----------

export const haptic = (kind: 'light' | 'success' | 'warning' = 'light') => {
    if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    else Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
};

interface ButtonProps extends Omit<PressableProps, 'style'> {
    label: string;
    kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
    icon?: ReactNode;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    small?: boolean;
    textColor?: string;
    gradient?: [string, string];
}

export const Button = ({ label, kind = 'primary', icon, loading, style, small, textColor, gradient: stops, onPress, disabled, ...rest }: ButtonProps) => {
    const { colors, isDark } = useTheme();
    const gradient = kind === 'primary';
    const bg = { primary: colors.accent, secondary: colors.accentTint, ghost: 'transparent', danger: colors.expired }[kind];
    const fg = textColor ?? { primary: colors.onAccent, secondary: colors.accent, ghost: colors.ink, danger: '#FFFFFF' }[kind];
    const content = loading ? (
        <ActivityIndicator color={fg} />
    ) : (
        <>
            {icon}
            <T v="bodyStrong" color={fg} style={small && { fontSize: TYPE.small }}>
                {label}
            </T>
        </>
    );
    return (
        <Pressable
            accessibilityRole="button"
            {...rest}
            disabled={disabled || loading}
            onPress={(e) => {
                haptic();
                onPress?.(e);
            }}
            style={({ pressed }) => [
                { borderRadius: RADIUS.pill, opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                (gradient || kind === 'danger') && !disabled && shadow(isDark, stops?.[1] ?? bg),
                style,
            ]}
        >
            {gradient ? (
                <LinearGradient
                    colors={stops ?? [colors.accent, colors.accentGrad]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, small && styles.buttonSmall]}
                >
                    {content}
                </LinearGradient>
            ) : (
                <View
                    style={[
                        styles.button,
                        small && styles.buttonSmall,
                        { backgroundColor: bg },
                        kind === 'ghost' && { borderWidth: 1.5, borderColor: colors.line },
                    ]}
                >
                    {content}
                </View>
            )}
        </Pressable>
    );
};

export const IconButton = ({
    children,
    onPress,
    label,
    tint,
    style,
}: {
    children: ReactNode;
    onPress: () => void;
    label: string;
    tint?: string;
    style?: StyleProp<ViewStyle>;
}) => {
    const { colors, isDark } = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={8}
            onPress={() => {
                haptic();
                onPress();
            }}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: tint ?? colors.surface, transform: [{ scale: pressed ? 0.92 : 1 }] }, !tint && shadow(isDark), style]}
        >
            {children}
        </Pressable>
    );
};

// ---------- Chips ----------

export const Chip = ({
    label,
    selected,
    onPress,
    icon,
    locked,
}: {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    icon?: ReactNode;
    locked?: boolean;
}) => {
    const { colors } = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
                haptic();
                onPress?.();
            }}
            style={({ pressed }) => [
                styles.chip,
                {
                    backgroundColor: selected ? colors.accent : colors.surface,
                    borderColor: selected ? colors.accent : colors.line,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                },
            ]}
        >
            {icon}
            <T v="small" color={selected ? colors.onAccent : colors.ink} style={{ fontFamily: FONTS.bodyBold }}>
                {label}
            </T>
            {locked && <Lock size={12} color={selected ? colors.onAccent : colors.muted} />}
        </Pressable>
    );
};

// ---------- Surfaces ----------

export const Card = ({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) => {
    const { colors, isDark } = useTheme();
    return (
        <View style={[styles.card, padded && { padding: SPACE.lg }, { backgroundColor: colors.card }, shadow(isDark), style]}>
            {children}
        </View>
    );
};

export const ProBadge = ({ inverted }: { inverted?: boolean }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.pro, { backgroundColor: inverted ? '#FFFFFF' : colors.gold }]}>
            <T v="label" color={inverted ? colors.accent : '#1A1300'} style={{ fontSize: 10, fontFamily: FONTS.bodyHeavy, letterSpacing: 0.4 }}>
                PRO
            </T>
        </View>
    );
};

export const SectionLabel = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
    <View style={styles.sectionLabel}>
        <T v="label" muted>
            {children}
        </T>
        {right}
    </View>
);

export const Divider = () => {
    const { colors } = useTheme();
    return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }} />;
};

const styles = StyleSheet.create({
    button: {
        minHeight: 54,
        borderRadius: RADIUS.pill,
        paddingHorizontal: SPACE.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE.sm,
    },
    buttonSmall: { minHeight: 40, paddingHorizontal: SPACE.lg },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACE.lg,
        paddingVertical: SPACE.sm + 1,
        borderRadius: RADIUS.pill,
        borderWidth: 1.5,
    },
    card: {
        borderRadius: RADIUS.lg,
    },
    pro: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 7,
    },
    sectionLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACE.sm,
    },
});
