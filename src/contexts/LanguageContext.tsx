import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    detectCurrency,
    detectLanguage,
    formatDate,
    formatMoney,
    Language,
    LANGUAGES,
    Params,
    TKey,
    translate,
} from '../i18n';
import { getCurrency, getLanguagePreference, setCurrency as saveCurrency, setLanguagePreference } from '../utils/storage';

interface LanguageContextType {
    language: Language;
    setLanguage: (l: Language) => void;
    currency: string;
    setCurrency: (c: string) => void;
    t: (key: TKey, params?: Params) => string;
    date: (iso: string | Date, style?: 'short' | 'medium' | 'long') => string;
    money: (amount: number) => string;
    languages: typeof LANGUAGES;
    ready: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(detectLanguage());
    const [currency, setCurrencyState] = useState<string>(detectCurrency());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            const [l, c] = await Promise.all([getLanguagePreference(), getCurrency()]);
            if (l && LANGUAGES.some((x) => x.code === l)) setLanguageState(l as Language);
            if (c) setCurrencyState(c);
            setReady(true);
        })();
    }, []);

    const setLanguage = useCallback((l: Language) => {
        setLanguageState(l);
        setLanguagePreference(l);
    }, []);

    const setCurrency = useCallback((c: string) => {
        setCurrencyState(c);
        saveCurrency(c);
    }, []);

    const t = useCallback((key: TKey, params?: Params) => translate(language, key, params), [language]);
    const date = useCallback(
        (iso: string | Date, style: 'short' | 'medium' | 'long' = 'medium') => formatDate(language, iso, style),
        [language],
    );
    const money = useCallback((amount: number) => formatMoney(language, amount, currency), [language, currency]);

    const value = useMemo(
        () => ({ language, setLanguage, currency, setCurrency, t, date, money, languages: LANGUAGES, ready }),
        [language, setLanguage, currency, setCurrency, t, date, money, ready],
    );
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
};
