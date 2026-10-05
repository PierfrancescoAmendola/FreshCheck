import { Platform } from 'react-native';

// RevenueCat public SDK keys. Create the app in app.revenuecat.com and paste
// the keys here. They are public keys, safe to ship in the binary.
export const REVENUECAT_API_KEY = Platform.select({
    ios: 'appl_REPLACE_ME',
    android: 'goog_REPLACE_ME',
    default: '',
});

export const REVENUECAT_ENTITLEMENT = 'pro';

export const isRevenueCatConfigured = (): boolean =>
    !!REVENUECAT_API_KEY && !REVENUECAT_API_KEY.includes('REPLACE_ME');

// Free tier limits
export const FREE_LIMITS = {
    items: 20,
    ocrScans: 3,
    recipes: 3,
};

// Ask for a store review after this many products are marked as consumed
export const REVIEW_AFTER_CONSUMED = 3;

export const SUPPORT_URL = 'https://pierfrancescoamendola.github.io/FreshCheck/support.html';
export const PRIVACY_URL = 'https://pierfrancescoamendola.github.io/FreshCheck/privacy.html';
