import React from 'react';
import { AppState } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PremiumProvider, usePremium } from '../contexts/PremiumContext';
import { PRODUCT_IDS } from '../config';

// A scriptable StoreKit: tests decide what the store owns and how purchases end
const store = {
    connected: true,
    owned: [] as { productId: string; purchaseState: string }[],
    onUpdate: null as null | ((p: any) => void),
    onError: null as null | ((e: any) => void),
    throwOnListen: false,
    requestBehaviour: 'none' as 'none' | 'throwCancel' | 'throwOther',
};

jest.mock('expo-iap', () => ({
    ErrorCode: { UserCancelled: 'user-cancelled' },
    initConnection: jest.fn(async () => store.connected),
    getAvailablePurchases: jest.fn(async () => store.owned),
    fetchProducts: jest.fn(async ({ skus }: { skus: string[] }) =>
        skus.map((id) => ({ id, displayPrice: id.endsWith('lifetime') ? '49,99 €' : id.endsWith('yearly') ? '19,99 €' : '2,99 €', platform: 'ios', type: 'subs' })),
    ),
    finishTransaction: jest.fn(async () => undefined),
    restorePurchases: jest.fn(async () => undefined),
    requestPurchase: jest.fn(async () => {
        if (store.requestBehaviour === 'throwCancel') throw { code: 'user-cancelled' };
        if (store.requestBehaviour === 'throwOther') throw new Error('network');
    }),
    purchaseUpdatedListener: jest.fn((cb: any) => {
        if (store.throwOnListen) throw new Error('no native module');
        store.onUpdate = cb;
        return { remove: jest.fn() };
    }),
    purchaseErrorListener: jest.fn((cb: any) => {
        store.onError = cb;
        return { remove: jest.fn() };
    }),
}));

const iap = jest.requireMock('expo-iap');

const setup = async () => {
    const hook = await renderHook(usePremium, { wrapper: ({ children }) => <PremiumProvider>{children}</PremiumProvider> });
    return hook;
};

beforeEach(() => {
    Object.assign(store, { connected: true, owned: [], onUpdate: null, onError: null, throwOnListen: false, requestBehaviour: 'none' });
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('entitlement', () => {
    it('free when the store owns nothing; prices come from the store', async () => {
        const { result } = await setup();
        await waitFor(() => expect(result.current.storeReady).toBe(true));
        expect(result.current.isPro).toBe(false);
        expect(result.current.plans.map((p) => [p.kind, p.price])).toEqual([
            ['annual', '19,99 €'],
            ['monthly', '2,99 €'],
            ['lifetime', '49,99 €'],
        ]);
    });

    it.each([PRODUCT_IDS.monthly, PRODUCT_IDS.annual, PRODUCT_IDS.lifetime])('Pro with an active %s', async (id) => {
        store.owned = [{ productId: id, purchaseState: 'purchased' }];
        const { result } = await setup();
        await waitFor(() => expect(result.current.isPro).toBe(true));
    });

    it('a pending purchase or an unrelated product does not unlock Pro', async () => {
        store.owned = [
            { productId: PRODUCT_IDS.annual, purchaseState: 'pending' },
            { productId: 'other.app.product', purchaseState: 'purchased' },
        ];
        const { result } = await setup();
        await waitFor(() => expect(result.current.storeReady).toBe(true));
        expect(result.current.isPro).toBe(false);
    });

    it('a subscription that expires while the app is in the background is noticed on return', async () => {
        store.owned = [{ productId: PRODUCT_IDS.monthly, purchaseState: 'purchased' }];
        const { result } = await setup();
        await waitFor(() => expect(result.current.isPro).toBe(true));
        store.owned = [];
        const listener = (AppState.addEventListener as jest.Mock).mock.calls.map((c) => c[1]).pop();
        await act(async () => listener('active'));
        await waitFor(() => expect(result.current.isPro).toBe(false));
    });

    it('without a store module (Expo Go) the app runs as free and buying is unavailable', async () => {
        store.throwOnListen = true;
        const { result } = await setup();
        expect(result.current.isPro).toBe(false);
        expect(result.current.plans.every((p) => !p.available)).toBe(true);
        expect(await result.current.purchase(result.current.plans[0])).toBe('unavailable');
        expect(await result.current.restore()).toBe('unavailable');
    });
});

describe('buying', () => {
    const buy = async (finish: () => void) => {
        const hook = await setup();
        await waitFor(() => expect(hook.result.current.storeReady).toBe(true));
        let res: string | undefined;
        await act(async () => {
            const p = hook.result.current.purchase(hook.result.current.plans[0]);
            await Promise.resolve();
            finish();
            res = await p;
        });
        return { res, hook };
    };

    it('success unlocks Pro and finishes the transaction', async () => {
        const { res, hook } = await buy(() => store.onUpdate!({ productId: PRODUCT_IDS.annual, purchaseState: 'purchased' }));
        expect(res).toBe('success');
        expect(hook.result.current.isPro).toBe(true);
        expect(iap.finishTransaction).toHaveBeenCalledWith(expect.objectContaining({ isConsumable: false }));
    });

    it('Ask to Buy frees the paywall with "pending" and unlocks Pro once approved', async () => {
        const { res, hook } = await buy(() => store.onUpdate!({ productId: PRODUCT_IDS.annual, purchaseState: 'pending' }));
        expect(res).toBe('pending');
        expect(hook.result.current.isPro).toBe(false);
        await act(async () => store.onUpdate!({ productId: PRODUCT_IDS.annual, purchaseState: 'purchased' }));
        expect(hook.result.current.isPro).toBe(true);
    });

    it('cancelling from the store sheet is not an error', async () => {
        const { res, hook } = await buy(() => store.onError!({ code: 'user-cancelled' }));
        expect(res).toBe('cancelled');
        expect(hook.result.current.isPro).toBe(false);
    });

    it('a store error is reported as an error', async () => {
        const { res } = await buy(() => store.onError!({ code: 'network-error' }));
        expect(res).toBe('error');
    });

    it('request failures resolve right away', async () => {
        store.requestBehaviour = 'throwCancel';
        const { result } = await setup();
        await waitFor(() => expect(result.current.storeReady).toBe(true));
        expect(await result.current.purchase(result.current.plans[0])).toBe('cancelled');
        store.requestBehaviour = 'throwOther';
        expect(await result.current.purchase(result.current.plans[0])).toBe('error');
    });

    it('lifetime is bought as a one-time purchase, subscriptions as subs', async () => {
        const { result } = await setup();
        await waitFor(() => expect(result.current.storeReady).toBe(true));
        const lifetime = result.current.plans.find((p) => p.kind === 'lifetime')!;
        result.current.purchase(lifetime);
        await waitFor(() => expect(iap.requestPurchase).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'in-app' })));
        result.current.purchase(result.current.plans.find((p) => p.kind === 'monthly')!);
        await waitFor(() => expect(iap.requestPurchase).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'subs' })));
    });
});

describe('restoring', () => {
    it('restores an owned plan, reports none otherwise', async () => {
        const { result } = await setup();
        await waitFor(() => expect(result.current.storeReady).toBe(true));
        expect(await result.current.restore()).toBe('none');
        store.owned = [{ productId: PRODUCT_IDS.lifetime, purchaseState: 'purchased' }];
        let res: string | undefined;
        await act(async () => {
            res = await result.current.restore();
        });
        expect(res).toBe('restored');
        expect(result.current.isPro).toBe(true);
    });
});
