// FreshCheck design tokens — "fresh pop": clean cool whites, vivid accents, soft colored depth.
import { AccentId } from '../types';

export type ThemeMode = 'light' | 'dark' | 'auto';

const LIGHT = {
    background: '#F4F6FB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    sunken: '#EBEEF5',
    ink: '#111827',
    inkSoft: '#3B4456',
    muted: '#8A93A6',
    line: '#E4E8F0',
    overlay: 'rgba(17,24,39,0.45)',
    onAccent: '#FFFFFF',
    shadowTint: '#3A4A7A',
    // Urgency scale
    expired: '#FF3B5C',
    today: '#FF6B2C',
    soon: '#FFAE00',
    week: '#7CCB1F',
    later: '#12C47A',
    gold: '#FFB400',
};

const DARK: typeof LIGHT = {
    background: '#0D1017',
    surface: '#161A24',
    card: '#1A1F2B',
    sunken: '#090B10',
    ink: '#F4F6FB',
    inkSoft: '#C6CCD9',
    muted: '#7D879B',
    line: '#262C3A',
    overlay: 'rgba(0,0,0,0.6)',
    onAccent: '#FFFFFF',
    shadowTint: '#000000',
    expired: '#FF5272',
    today: '#FF8243',
    soon: '#FFC23D',
    week: '#9BE04A',
    later: '#2EE095',
    gold: '#FFC83D',
};

// `grad` is the second stop for gradient fills (buttons, hero blocks).
export const ACCENTS: Record<AccentId, { light: string; dark: string; grad: string; onAccent: string }> = {
    forest: { light: '#10B26C', dark: '#2EE095', grad: '#00D4A6', onAccent: '#FFFFFF' },
    tomato: { light: '#FF4D2E', dark: '#FF7A5C', grad: '#FF2E7E', onAccent: '#FFFFFF' },
    ocean: { light: '#2563FF', dark: '#5C8BFF', grad: '#00B8FF', onAccent: '#FFFFFF' },
    plum: { light: '#E0307F', dark: '#FF5FA2', grad: '#FF7A45', onAccent: '#FFFFFF' },
    saffron: { light: '#FFA800', dark: '#FFC23D', grad: '#FF6B2C', onAccent: '#1A1300' },
};

export const buildColors = (isDark: boolean, accent: AccentId) => {
    const base = isDark ? DARK : LIGHT;
    const a = ACCENTS[accent];
    const main = isDark ? a.dark : a.light;
    return {
        ...base,
        accent: main,
        accentGrad: a.grad,
        accentTint: `${main}${isDark ? '29' : '1A'}`,
        onAccent: a.onAccent,
    };
};

export type Colors = ReturnType<typeof buildColors>;

export const FONTS = {
    display: 'PlusJakartaSans_700Bold',
    displayBold: 'PlusJakartaSans_800ExtraBold',
    displayItalic: 'PlusJakartaSans_600SemiBold_Italic',
    body: 'PlusJakartaSans_500Medium',
    bodyRegular: 'PlusJakartaSans_400Regular',
    bodySemi: 'PlusJakartaSans_600SemiBold',
    bodyBold: 'PlusJakartaSans_700Bold',
    bodyHeavy: 'PlusJakartaSans_800ExtraBold',
};

export const SPACE = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const RADIUS = {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
    pill: 999,
};

export const TYPE = {
    hero: 40,
    title: 30,
    h2: 22,
    h3: 18,
    body: 15,
    small: 13,
    tiny: 11,
};

// Soft, tinted elevation. Pass a color to get a glow in that hue (e.g. accent buttons).
export const shadow = (isDark: boolean, tint?: string) =>
    isDark
        ? { shadowColor: tint ?? '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: tint ? 0.45 : 0.4, shadowRadius: 18, elevation: 4 }
        : { shadowColor: tint ?? '#3A4A7A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: tint ? 0.35 : 0.08, shadowRadius: 20, elevation: 3 };

// Bottom space reserved for the floating tab bar
export const TAB_BAR_SPACE = 110;
