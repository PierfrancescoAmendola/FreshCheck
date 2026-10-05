// Store product IDs, identical on App Store Connect and Google Play Console.
// Purchases are handled directly by StoreKit / Play Billing (expo-iap), no third-party service.
export const PRODUCT_IDS = {
    monthly: 'com.anonymous.freshcheck.pro.monthly',
    annual: 'com.anonymous.freshcheck.pro.yearly',
    lifetime: 'com.anonymous.freshcheck.pro.lifetime',
} as const;

export const SUBSCRIPTION_IDS = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual];
export const PRO_PRODUCT_IDS: string[] = [PRODUCT_IDS.monthly, PRODUCT_IDS.annual, PRODUCT_IDS.lifetime];

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
