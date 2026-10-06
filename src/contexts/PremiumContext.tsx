import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
    ErrorCode,
    fetchProducts,
    finishTransaction,
    getAvailablePurchases,
    initConnection,
    Product,
    ProductSubscription,
    Purchase,
    purchaseErrorListener,
    purchaseUpdatedListener,
    requestPurchase,
    restorePurchases,
} from 'expo-iap';
import { PRO_PRODUCT_IDS, PRODUCT_IDS, SUBSCRIPTION_IDS } from '../config';
import { getDebugPro, setDebugPro as saveDebugPro } from '../utils/storage';

export type PlanKind = 'monthly' | 'annual' | 'lifetime';

export interface Plan {
    kind: PlanKind;
    price: string; // localized by the store
    productId: string;
    offerToken?: string; // Google Play only
    available: boolean; // false until the store returned the product
}

// Shown only while the store has not answered (Expo Go, simulator without StoreKit config, offline).
const FALLBACK_PLANS: Plan[] = [
    { kind: 'annual', price: '€19,99', productId: PRODUCT_IDS.annual, available: false },
    { kind: 'monthly', price: '€2,99', productId: PRODUCT_IDS.monthly, available: false },
    { kind: 'lifetime', price: '€49,99', productId: PRODUCT_IDS.lifetime, available: false },
];

const KIND_BY_ID: Record<string, PlanKind> = {
    [PRODUCT_IDS.monthly]: 'monthly',
    [PRODUCT_IDS.annual]: 'annual',
    [PRODUCT_IDS.lifetime]: 'lifetime',
};
const ORDER: PlanKind[] = ['annual', 'monthly', 'lifetime'];

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

const ownsPro = (purchases: Purchase[]) =>
    purchases.some((p) => PRO_PRODUCT_IDS.includes(p.productId) && p.purchaseState !== 'pending');

const toPlan = (p: Product | ProductSubscription): Plan => {
    const kind = KIND_BY_ID[p.id];
    if (p.platform === 'android' && p.type === 'subs') {
        // Base plan offer: FreshCheck has no free trials
        const offer = p.subscriptionOffers?.[0];
        return { kind, price: p.displayPrice, productId: p.id, offerToken: offer?.offerTokenAndroid ?? undefined, available: true };
    }
    return { kind, price: p.displayPrice, productId: p.id, available: true };
};

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
    const [entitled, setEntitled] = useState(false);
    const [debugPro, setDebugProState] = useState(false);
    const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
    const [storeReady, setStoreReady] = useState(false);
    const connected = useRef(false);
    // Resolves the pending purchase() call when the store reports back through the listeners
    const pending = useRef<{ productId: string; resolve: (r: PurchaseResult) => void } | null>(null);

    const refreshEntitlement = useCallback(async () => {
        const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
        const ok = ownsPro(purchases);
        setEntitled(ok);
        return ok;
    }, []);

    useEffect(() => {
        getDebugPro().then((v) => __DEV__ && setDebugProState(v));

        const listen = () => {
            const updated = purchaseUpdatedListener(async (purchase: Purchase) => {
                if (!PRO_PRODUCT_IDS.includes(purchase.productId)) return;
                if (purchase.purchaseState === 'pending') return; // Ask to Buy / deferred: wait for the final update
                try {
                    await finishTransaction({ purchase, isConsumable: false });
                } catch (e) {
                    console.warn('finishTransaction', e);
                }
                setEntitled(true);
                if (pending.current?.productId === purchase.productId) {
                    pending.current.resolve('success');
                    pending.current = null;
                }
            });
            const failed = purchaseErrorListener((error) => {
                if (!pending.current) return;
                pending.current.resolve(error.code === ErrorCode.UserCancelled ? 'cancelled' : 'error');
                pending.current = null;
            });
            return [updated, failed];
        };

        let subscriptions: { remove: () => void }[] = [];
        try {
            subscriptions = listen();
        } catch (e) {
            // Expo Go has no StoreKit module: the app runs as free (or debug Pro)
            console.warn('Store listeners', e);
            return;
        }
        (async () => {
            try {
                connected.current = await initConnection();
                if (!connected.current) return;
                await refreshEntitlement();
                const [subs, lifetime] = await Promise.all([
                    fetchProducts({ skus: SUBSCRIPTION_IDS, type: 'subs' }),
                    fetchProducts({ skus: [PRODUCT_IDS.lifetime], type: 'in-app' }),
                ]);
                const loaded = [...((subs ?? []) as ProductSubscription[]), ...((lifetime ?? []) as Product[])]
                    .filter((p) => KIND_BY_ID[p.id])
                    .map(toPlan)
                    .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
                if (loaded.length) setPlans(loaded);
                setStoreReady(loaded.length > 0);
            } catch (e) {
                console.warn('Store init', e);
            }
        })();
        return () => subscriptions.forEach((s) => s.remove());
    }, [refreshEntitlement]);

    const purchase = useCallback(async (plan: Plan): Promise<PurchaseResult> => {
        if (!connected.current || !plan.available) return 'unavailable';
        const result = new Promise<PurchaseResult>((resolve) => {
            pending.current = { productId: plan.productId, resolve };
        });
        try {
            if (plan.kind === 'lifetime') {
                await requestPurchase({
                    type: 'in-app',
                    request: { apple: { sku: plan.productId }, google: { skus: [plan.productId] } },
                });
            } else {
                await requestPurchase({
                    type: 'subs',
                    request: {
                        apple: { sku: plan.productId },
                        google: {
                            skus: [plan.productId],
                            subscriptionOffers: plan.offerToken ? [{ sku: plan.productId, offerToken: plan.offerToken }] : [],
                        },
                    },
                });
            }
        } catch (e: any) {
            pending.current = null;
            if (e?.code === ErrorCode.UserCancelled) return 'cancelled';
            console.warn('purchase', e);
            return 'error';
        }
        return result;
    }, []);

    const restore = useCallback(async () => {
        if (!connected.current) return 'unavailable' as const;
        try {
            if (Platform.OS === 'ios') await restorePurchases();
            return (await refreshEntitlement()) ? ('restored' as const) : ('none' as const);
        } catch (e) {
            console.warn('restore', e);
            return 'error' as const;
        }
    }, [refreshEntitlement]);

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
