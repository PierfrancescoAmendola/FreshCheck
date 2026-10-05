// Hand-curated ingredient dictionary.
// Each tag links product names (in every supported language) to a category,
// a typical shelf life and a freezer extension. Recipes reference these tags.
import { CategoryId } from '../types';

export interface Ingredient {
    tag: string;
    category: CategoryId;
    days: number; // typical shelf life once bought, stored as usual
    openedDays?: number; // once opened
    freezerDays?: number; // if frozen
    keywords: string[]; // lowercase, accents stripped
}

export const INGREDIENTS: Ingredient[] = [
    { tag: 'egg', category: 'dairy', days: 21, freezerDays: 0, keywords: ['egg', 'uova', 'uovo', 'huevo', 'oeuf', 'eier', 'ei ', 'ovo', 'jaja', 'jajk', '卵', 'たまご', '계란', '달걀'] },
    { tag: 'milk', category: 'dairy', days: 7, openedDays: 4, freezerDays: 60, keywords: ['milk', 'latte', 'leche', 'lait', 'milch', 'leite', 'melk', 'mleko', '牛乳', 'ミルク', '우유'] },
    { tag: 'yogurt', category: 'dairy', days: 14, openedDays: 5, keywords: ['yogurt', 'yoghurt', 'yogur', 'yaourt', 'joghurt', 'iogurte', 'jogurt', 'ヨーグルト', '요거트', '요구르트', 'skyr', 'kefir'] },
    { tag: 'cheese', category: 'dairy', days: 21, openedDays: 10, freezerDays: 90, keywords: ['cheese', 'formaggio', 'parmigiano', 'grana padano', 'pecorino', 'queso', 'fromage', 'kase', 'queijo', 'kaas', 'ser ', 'cheddar', 'gouda', 'emmental', 'feta', 'ricotta', 'チーズ', '치즈'] },
    { tag: 'mozzarella', category: 'dairy', days: 7, openedDays: 2, keywords: ['mozzarella', 'burrata', 'fior di latte', 'bocconcini'] },
    { tag: 'butter', category: 'dairy', days: 45, openedDays: 21, freezerDays: 180, keywords: ['butter', 'burro', 'mantequilla', 'beurre', 'manteiga', 'boter', 'maslo', 'バター', '버터'] },
    { tag: 'cream', category: 'dairy', days: 10, openedDays: 4, keywords: ['cream', 'panna', 'nata', 'creme', 'sahne', 'room', 'smietan', '生クリーム', '크림', 'mascarpone'] },
    { tag: 'chicken', category: 'meat', days: 2, freezerDays: 270, keywords: ['chicken', 'pollo', 'poulet', 'hahnchen', 'huhn', 'frango', 'kip', 'kurczak', '鶏', 'チキン', '닭'] },
    { tag: 'beef', category: 'meat', days: 3, freezerDays: 270, keywords: ['beef', 'manzo', 'vitello', 'macinato', 'res ', 'ternera', 'boeuf', 'rind', 'carne moida', 'rundvlees', 'gehakt', 'wolowin', '牛肉', '소고기', 'mince', 'steak', 'bistecca', 'hackfleisch'] },
    { tag: 'pork', category: 'meat', days: 3, freezerDays: 180, keywords: ['pork', 'maiale', 'cerdo', 'porc', 'schwein', 'porco', 'varken', 'wieprz', '豚', '돼지'] },
    { tag: 'ham', category: 'meat', days: 7, openedDays: 4, keywords: ['ham', 'prosciutto', 'jamon', 'jambon', 'schinken', 'presunto', 'szynk', 'ハム', '햄', 'speck'] },
    { tag: 'bacon', category: 'meat', days: 10, openedDays: 5, freezerDays: 90, keywords: ['bacon', 'pancetta', 'guanciale', 'tocino', 'lardons', 'speck', 'ベーコン', '베이컨', 'boczek'] },
    { tag: 'sausage', category: 'meat', days: 5, freezerDays: 60, keywords: ['sausage', 'salsiccia', 'wurstel', 'salchicha', 'chorizo', 'saucisse', 'wurst', 'linguica', 'worst', 'kielbas', 'ソーセージ', '소시지'] },
    { tag: 'fish', category: 'fish', days: 2, freezerDays: 180, keywords: ['fish', 'pesce', 'merluzzo', 'pescado', 'poisson', 'fisch', 'peixe', 'vis ', 'ryba', '魚', '생선', 'cod', 'baccala', 'orata', 'branzino'] },
    { tag: 'salmon', category: 'fish', days: 2, openedDays: 2, freezerDays: 90, keywords: ['salmon', 'salmone', 'saumon', 'lachs', 'salmao', 'zalm', 'losos', 'サーモン', '鮭', '연어'] },
    { tag: 'tuna', category: 'fish', days: 365, openedDays: 3, keywords: ['tuna', 'tonno', 'atun', 'thon', 'thunfisch', 'atum', 'tonijn', 'tunczyk', 'ツナ', '참치'] },
    { tag: 'shrimp', category: 'fish', days: 2, freezerDays: 180, keywords: ['shrimp', 'prawn', 'gamber', 'gamba', 'camaron', 'crevette', 'garnele', 'camarao', 'garnaal', 'krewet', 'エビ', '새우'] },
    { tag: 'tofu', category: 'other', days: 14, openedDays: 4, keywords: ['tofu', '豆腐', '두부'] },
    { tag: 'bread', category: 'bakery', days: 3, freezerDays: 90, keywords: ['bread', 'pane', 'pan ', 'pain', 'brot', 'pao', 'brood', 'chleb', 'パン', '빵', 'baguette', 'ciabatta', 'focaccia', 'toast'] },
    { tag: 'tortilla', category: 'bakery', days: 14, openedDays: 5, keywords: ['tortilla', 'wrap', 'piadina', 'pita'] },
    { tag: 'rice', category: 'pantry', days: 365, keywords: ['rice', 'riso', 'arroz', 'riz', 'reis', 'rijst', 'ryz', '米', 'ご飯', '쌀', '밥'] },
    { tag: 'pasta', category: 'pantry', days: 365, keywords: ['pasta', 'spaghetti', 'penne', 'fusilli', 'rigatoni', 'linguine', 'tagliatelle', 'pates', 'nudeln', 'macarrao', 'makaron', 'パスタ', '파스타', 'noodle'] },
    { tag: 'flour', category: 'pantry', days: 240, keywords: ['flour', 'farina', 'harina', 'farine', 'mehl', 'farinha', 'bloem', 'maka', '小麦粉', '밀가루'] },
    { tag: 'potato', category: 'fruitVeg', days: 21, keywords: ['potato', 'patat', 'papa', 'pomme de terre', 'kartoffel', 'batata', 'aardappel', 'ziemniak', 'じゃがいも', 'ポテト', '감자'] },
    { tag: 'tomato', category: 'fruitVeg', days: 6, keywords: ['tomato', 'pomodor', 'tomate', 'tomaat', 'pomidor', 'トマト', '토마토', 'passata', 'pelati'] },
    { tag: 'onion', category: 'fruitVeg', days: 30, keywords: ['onion', 'cipoll', 'cebolla', 'oignon', 'zwiebel', 'cebola', 'ui ', 'uien', 'cebul', '玉ねぎ', 'たまねぎ', '양파', 'scalogno', 'shallot'] },
    { tag: 'garlic', category: 'fruitVeg', days: 60, keywords: ['garlic', 'aglio', 'ajo', 'ail', 'knoblauch', 'alho', 'knoflook', 'czosnek', 'にんにく', '마늘'] },
    { tag: 'carrot', category: 'fruitVeg', days: 21, keywords: ['carrot', 'carot', 'zanahoria', 'karotte', 'mohre', 'cenoura', 'wortel', 'marchew', 'にんじん', '당근'] },
    { tag: 'zucchini', category: 'fruitVeg', days: 6, keywords: ['zucchin', 'courgette', 'calabacin', 'abobrinha', 'cukinia', 'ズッキーニ', '애호박', '주키니'] },
    { tag: 'pepper', category: 'fruitVeg', days: 8, keywords: ['bell pepper', 'peperon', 'pimiento', 'poivron', 'paprika', 'pimentao', 'papryk', 'ピーマン', 'パプリカ', '피망', '파프리카'] },
    { tag: 'spinach', category: 'fruitVeg', days: 4, freezerDays: 240, keywords: ['spinach', 'spinac', 'espinaca', 'epinard', 'spinat', 'espinafre', 'spinazie', 'szpinak', 'ほうれん草', '시금치'] },
    { tag: 'lettuce', category: 'fruitVeg', days: 5, keywords: ['lettuce', 'lattuga', 'insalata', 'lechuga', 'laitue', 'salade', 'salat', 'alface', 'sla ', 'salata', 'レタス', '상추', 'rucola', 'rocket', 'arugula'] },
    { tag: 'mushroom', category: 'fruitVeg', days: 5, keywords: ['mushroom', 'funghi', 'fungo', 'champignon', 'seta', 'pilz', 'cogumelo', 'paddenstoel', 'grzyb', 'pieczark', 'きのこ', 'しいたけ', '버섯'] },
    { tag: 'broccoli', category: 'fruitVeg', days: 5, freezerDays: 240, keywords: ['broccol', 'brocoli', 'brokkoli', 'brocolis', 'brokul', 'ブロッコリー', '브로콜리', 'cavolfiore', 'cauliflower', 'coliflor', 'chou-fleur', 'blumenkohl'] },
    { tag: 'cucumber', category: 'fruitVeg', days: 7, keywords: ['cucumber', 'cetriol', 'pepino', 'concombre', 'gurke', 'komkommer', 'ogorek', 'きゅうり', '오이'] },
    { tag: 'eggplant', category: 'fruitVeg', days: 6, keywords: ['eggplant', 'aubergine', 'melanzan', 'berenjena', 'berinjela', 'baklazan', 'なす', '가지'] },
    { tag: 'avocado', category: 'fruitVeg', days: 4, keywords: ['avocado', 'aguacate', 'avocat', 'abacate', 'awokado', 'アボカド', '아보카도'] },
    { tag: 'banana', category: 'fruitVeg', days: 5, freezerDays: 90, keywords: ['banan', 'platano', 'banane', 'バナナ', '바나나'] },
    { tag: 'apple', category: 'fruitVeg', days: 30, keywords: ['apple', 'mela', 'mele', 'manzana', 'pomme', 'apfel', 'maca', 'appel', 'jablk', 'りんご', '사과'] },
    { tag: 'berries', category: 'fruitVeg', days: 4, freezerDays: 240, keywords: ['berr', 'fragol', 'mirtill', 'lampon', 'fresa', 'arandano', 'frambues', 'fraise', 'myrtille', 'framboise', 'erdbeer', 'heidelbeer', 'himbeer', 'morango', 'mirtilo', 'aardbei', 'truskaw', 'borowk', 'いちご', 'ベリー', '딸기', '블루베리'] },
    { tag: 'lemon', category: 'fruitVeg', days: 21, keywords: ['lemon', 'limon', 'citron', 'zitrone', 'limao', 'citroen', 'cytryn', 'レモン', '레몬', 'lime'] },
    { tag: 'orange', category: 'fruitVeg', days: 21, keywords: ['orange', 'arancia', 'naranja', 'laranja', 'sinaasappel', 'pomarancz', 'オレンジ', '오렌지'] },
    { tag: 'herbs', category: 'fruitVeg', days: 6, keywords: ['basil', 'basilico', 'parsley', 'prezzemolo', 'coriander', 'cilantro', 'perejil', 'albahaca', 'persil', 'basilic', 'petersilie', 'manjericao', 'peterselie', 'pietruszk', 'bazyli', 'バジル', 'パセリ', '바질', 'dill', 'aneto', 'menta', 'mint'] },
    { tag: 'beans', category: 'pantry', days: 730, openedDays: 3, keywords: ['beans', 'fagiol', 'frijol', 'alubia', 'haricot', 'bohnen', 'feijao', 'bonen', 'fasol', '豆', '콩'] },
    { tag: 'chickpeas', category: 'pantry', days: 730, openedDays: 3, keywords: ['chickpea', 'cec', 'garbanzo', 'pois chiche', 'kichererbse', 'grao de bico', 'kikkererwt', 'ciecierzyc', 'ひよこ豆', '병아리콩', 'hummus'] },
    { tag: 'lentils', category: 'pantry', days: 365, keywords: ['lentil', 'lenticch', 'lenteja', 'lentille', 'linsen', 'lentilha', 'linzen', 'soczewic', 'レンズ豆', '렌틸'] },
    { tag: 'cabbage', category: 'fruitVeg', days: 14, keywords: ['cabbage', 'cavolo', 'verza', 'col ', 'repollo', 'chou', 'kohl', 'couve', 'kool', 'kapust', 'キャベツ', '白菜', '양배추', '배추', 'kale'] },
    { tag: 'corn', category: 'pantry', days: 365, openedDays: 3, keywords: ['corn', 'mais', 'maiz', 'milho', 'kukurydz', 'コーン', 'とうもろこし', '옥수수'] },
    { tag: 'peas', category: 'frozen', days: 240, keywords: ['peas', 'piselli', 'guisante', 'petits pois', 'erbsen', 'ervilha', 'erwten', 'groszek', 'グリンピース', '완두'] },
    { tag: 'coconutMilk', category: 'pantry', days: 365, openedDays: 4, keywords: ['coconut milk', 'latte di cocco', 'leche de coco', 'lait de coco', 'kokosmilch', 'leite de coco', 'kokosmelk', 'mleko kokos', 'ココナッツミルク', '코코넛 밀크'] },
];

// Defaults per category when no ingredient matches
export const CATEGORY_DEFAULT_DAYS: Record<CategoryId, number> = {
    dairy: 7,
    meat: 3,
    fish: 2,
    fruitVeg: 6,
    bakery: 3,
    pantry: 180,
    frozen: 180,
    drinks: 30,
    other: 14,
};

export const CATEGORY_FREEZER_DAYS: Record<CategoryId, number> = {
    dairy: 60,
    meat: 180,
    fish: 120,
    fruitVeg: 240,
    bakery: 90,
    pantry: 0,
    frozen: 0,
    drinks: 0,
    other: 60,
};

// Rough price estimates (EUR-equivalent) used for savings when the user
// leaves the price empty.
export const CATEGORY_PRICE_ESTIMATE: Record<CategoryId, number> = {
    dairy: 1.8,
    meat: 5,
    fish: 6,
    fruitVeg: 1.5,
    bakery: 1.6,
    pantry: 1.4,
    frozen: 3,
    drinks: 1.5,
    other: 2,
};

// Multiplier to bring EUR-equivalent estimates into the user's currency
const CURRENCY_FACTOR: Record<string, number> = {
    JPY: 160, KRW: 1450, PLN: 4.3, BRL: 6, MXN: 20, ARS: 1000, CLP: 1000, COP: 4300,
    INR: 90, CHF: 1, USD: 1.1, GBP: 0.85, CAD: 1.5, AUD: 1.6, SEK: 11.5, NOK: 11.5,
    DKK: 7.5, CZK: 25, HUF: 390, TRY: 35,
};

export const currencyFactor = (currency: string): number => CURRENCY_FACTOR[currency] ?? 1;

// Lowercase, strip Latin accents, keep CJK intact (NFC after stripping)
const fold = (s: string): string =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');

export const normalize = (s: string): string => ` ${fold(s)} `;

const FOLDED: { ing: Ingredient; keys: string[] }[] = INGREDIENTS.map((ing) => ({
    ing,
    keys: ing.keywords.map(fold),
}));

export const detectTags = (name: string): string[] => {
    const n = normalize(name);
    return FOLDED.filter((f) => f.keys.some((k) => n.includes(k))).map((f) => f.ing.tag);
};

export const ingredientByTag = (tag: string): Ingredient | undefined =>
    INGREDIENTS.find((i) => i.tag === tag);

// Most specific known ingredient for a product name
export const primaryIngredient = (name: string): Ingredient | undefined => {
    const n = normalize(name);
    let best: { ing: Ingredient; len: number } | undefined;
    for (const { ing, keys } of FOLDED) {
        for (const k of keys) {
            if (n.includes(k) && (!best || k.length > best.len)) best = { ing, len: k.length };
        }
    }
    return best?.ing;
};

export const suggestedShelfLife = (name: string, category: CategoryId): number =>
    primaryIngredient(name)?.days ?? CATEGORY_DEFAULT_DAYS[category];

export const freezerDaysFor = (tags: string[], category: CategoryId): number => {
    for (const t of tags) {
        const d = ingredientByTag(t)?.freezerDays;
        if (d !== undefined) return d;
    }
    return CATEGORY_FREEZER_DAYS[category];
};

export const openedDaysFor = (tags: string[]): number | undefined => {
    for (const t of tags) {
        const d = ingredientByTag(t)?.openedDays;
        if (d !== undefined) return d;
    }
    return undefined;
};
