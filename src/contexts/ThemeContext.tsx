import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AccentId } from '../types';
import { buildColors, Colors, ThemeMode } from '../theme/tokens';
import { getAccent, getThemePreference, setAccent as saveAccent, setThemePreference } from '../utils/storage';

interface ThemeContextType {
    mode: ThemeMode;
    accent: AccentId;
    colors: Colors;
    isDark: boolean;
    setMode: (m: ThemeMode) => void;
    setAccent: (a: AccentId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const system = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('auto');
    const [accent, setAccentState] = useState<AccentId>('forest');

    useEffect(() => {
        (async () => {
            const [m, a] = await Promise.all([getThemePreference(), getAccent()]);
            if (m === 'light' || m === 'dark' || m === 'auto') setModeState(m);
            if (a) setAccentState(a);
        })();
    }, []);

    const isDark = mode === 'auto' ? system === 'dark' : mode === 'dark';
    const colors = useMemo(() => buildColors(isDark, accent), [isDark, accent]);

    const setMode = useCallback((m: ThemeMode) => {
        setModeState(m);
        setThemePreference(m);
    }, []);

    const setAccent = useCallback((a: AccentId) => {
        setAccentState(a);
        saveAccent(a);
    }, []);

    const value = useMemo(
        () => ({ mode, accent, colors, isDark, setMode, setAccent }),
        [mode, accent, colors, isDark, setMode, setAccent],
    );
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
