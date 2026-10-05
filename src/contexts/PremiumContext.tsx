import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { isRevenueCatConfigured, REVENUECAT_API_KEY, REVENUECAT_ENTITLEMENT } from '../config';
import { getDebugPro, setDebugPro as saveDebugPro } from '../utils/storage';

export type PlanKind = 'monthly' | 'annual' | 'lifetime';

export interface Plan {
    kind: PlanKind;
    price: string; // localized by the store
    pkg?: PurchasesPackage;
    hasTrial: boolean;
}

// Shown only while the store has not answered (or is not configured yet).
const FALLBACK_PLANS: Plan[] = [
    { kind: 'annual', price: '€19,99', hasTrial: true },
    { kind: 'monthly', price: '€2,99', hasTrial: false },
    { kind: 'lifetime', price: '€49,99', hasTrial: false },
];

type PurchaseResult = 'success' | 'cancelled' | 'unavailable' | 'error';

interface PremiumContextType {
    isPro: boolean;
    plans: Plan[];
    storeReady: boolean;
    purchase: (plan: Plan) => Promise<PurchaseResult>;
    restore: () => Promise<'restored' | 'none' | 'unavailable' | 'error'>;
    debugPro: boolean;
    setDebugPro: (v: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const hasEntitlement = (info?: CustomerInfo | null) => !!info?.entitlements.active[REVENUECAT_ENTITLEMENT];

const KIND_BY_TYPE: Record<string, PlanKind> = { MONTHLY: 'monthly', ANNUAL: 'annual', LIFETIME: 'lifetime' };

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
    const [entitled, setEntitled] = useState(false);
    const [debugPro, setDebugProState] = useState(false);
    const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
    const [storeReady, setStoreReady] = useState(false);

    useEffect(() => {
        getDebugPro().then((v) => __DEV__ && setDebugProState(v));
        if (!isRevenueCatConfigured()) return;

        const listener = (info: CustomerInfo) => setEntitled(hasEntitlement(info));
        (async () => {
            try {
                Purchases.configure({ apiKey: REVENUECAT_API_KEY! });
                Purchases.addCustomerInfoUpdateListener(listener);
                setEntitled(hasEntitlement(await Purchases.getCustomerInfo()));
                const offerings = await Purchases.getOfferings();
                const pkgs = offerings.current?.availablePackages ?? [];
                const loaded = pkgs
                    .filter((p) => KIND_BY_TYPE[p.packageType])
                    .map<Plan>((p) => ({
                        kind: KIND_BY_TYPE[p.packageType],
                        price: p.product.priceString,
                        pkg: p,
                        hasTrial: !!p.product.introPrice && p.product.introPrice.price === 0,
                    }));
                const order: PlanKind[] = ['annual', 'monthly', 'lifetime'];
                if (loaded.length) setPlans(loaded.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)));
                setStoreReady(loaded.length > 0);
            } catch (e) {
                console.warn('RevenueCat init', e);
            }
        })();
        return () => {
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    }, []);

    const purchase = useCallback(async (plan: Plan): Promise<PurchaseResult> => {
        if (!plan.pkg) return 'unavailable';
        try {
            const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
            const ok = hasEntitlement(customerInfo);
            setEntitled(ok);
            return ok ? 'success' : 'error';
        } catch (e: any) {
            if (e?.userCancelled) return 'cancelled';
            console.warn('purchase', e);
            return 'error';
        }
    }, []);

    const restore = useCallback(async () => {
        if (!isRevenueCatConfigured()) return 'unavailable' as const;
        try {
            const info = await Purchases.restorePurchases();
            const ok = hasEntitlement(info);
            setEntitled(ok);
            return ok ? ('restored' as const) : ('none' as const);
        } catch (e) {
            console.warn('restore', e);
            return 'error' as const;
        }
    }, []);

    const setDebugPro = useCallback((v: boolean) => {
        if (!__DEV__) return;
        setDebugProState(v);
        saveDebugPro(v);
    }, []);

    const isPro = entitled || (__DEV__ && debugPro);

    const value = useMemo(
        () => ({ isPro, plans, storeReady, purchase, restore, debugPro, setDebugPro }),
        [isPro, plans, storeReady, purchase, restore, debugPro, setDebugPro],
    );
    return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
    const ctx = useContext(PremiumContext);
    if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
    return ctx;
};
