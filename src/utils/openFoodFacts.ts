import { CategoryId } from '../types';

export interface ProductLookup {
    name: string;
    category?: CategoryId;
}

const CATEGORY_RULES: [CategoryId, string[]][] = [
    ['dairy', ['dairies', 'dairy', 'milk', 'yogurt', 'cheese', 'cream', 'butter', 'eggs']],
    ['fish', ['fish', 'seafood', 'salmon', 'tuna', 'shrimp']],
    ['meat', ['meat', 'poultry', 'chicken', 'ham', 'sausage', 'beef', 'pork']],
    ['frozen', ['frozen']],
    ['fruitVeg', ['fruit', 'vegetable', 'salad', 'fresh-produce']],
    ['bakery', ['bread', 'bakery', 'pastries', 'biscuits', 'cakes']],
    ['drinks', ['beverages', 'drinks', 'juice', 'water', 'soda', 'wine', 'beer']],
    ['pantry', ['pasta', 'rice', 'cereals', 'flour', 'canned', 'legumes', 'sauces', 'snacks', 'spreads']],
];

const categoryFromTags = (tags: string[]): CategoryId | undefined => {
    const joined = tags.join(' ').toLowerCase();
    for (const [cat, keys] of CATEGORY_RULES) {
        if (keys.some((k) => joined.includes(k))) return cat;
    }
    return undefined;
};

/**
 * Looks a barcode up on Open Food Facts (free, open database, no key).
 * Returns null when the product is unknown; throws on network errors.
 */
export const lookupBarcode = async (barcode: string, lang: string): Promise<ProductLookup | null> => {
    const fields = `product_name,product_name_${lang},generic_name,brands,categories_tags`;
    const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}&lc=${lang}`,
        { headers: { 'User-Agent': 'FreshCheck/2.0 (mobile app)' } },
    );
    if (!res.ok && res.status !== 404) throw new Error(`OFF ${res.status}`);
    const data = await res.json();
    const p = data?.product;
    if (data?.status !== 1 || !p) return null;
    const baseName: string | undefined = p[`product_name_${lang}`] || p.product_name || p.generic_name;
    if (!baseName) return null;
    const brand = typeof p.brands === 'string' ? p.brands.split(',')[0].trim() : '';
    const name = brand && !baseName.toLowerCase().includes(brand.toLowerCase()) ? `${baseName} · ${brand}` : baseName;
    return { name, category: categoryFromTags(p.categories_tags ?? []) };
};
