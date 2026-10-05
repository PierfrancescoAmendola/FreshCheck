// Development-only sample pantry, used to record demos and screenshots.
import { currencyFactor, detectTags } from '../data/ingredients';
import { CategoryId, FoodItem, HistoryEntry, ShoppingItem } from '../types';
import { DEFAULT_LOCATIONS } from './storage';
import { Backup } from './exporter';

const day = (offset: number) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString();
};

const NAMES: Record<string, string[]> = {
    'it': [
        'Yogurt greco',
        'Mozzarella',
        'Spinaci',
        'Pomodori',
        'Petto di pollo',
        'Zucchine',
        'Uova',
        'Parmigiano',
        'Pane integrale',
        'Piselli surgelati',
        'Pasta',
        'Latte',
        'Basilico',
        'Limoni',
        'Caffè',
        'Banane',
        'Riso'
    ],
    'en': [
        'Greek yogurt',
        'Mozzarella',
        'Spinach',
        'Tomatoes',
        'Chicken breast',
        'Zucchini',
        'Eggs',
        'Parmesan',
        'Wholegrain bread',
        'Frozen peas',
        'Pasta',
        'Milk',
        'Basil',
        'Lemons',
        'Coffee',
        'Bananas',
        'Rice'
    ],
    'es': [
        'Yogur griego',
        'Mozzarella',
        'Espinacas',
        'Tomates',
        'Pechuga de pollo',
        'Calabacín',
        'Huevos',
        'Parmesano',
        'Pan integral',
        'Guisantes congelados',
        'Pasta',
        'Leche',
        'Albahaca',
        'Limones',
        'Café',
        'Plátanos',
        'Arroz'
    ],
    'fr': [
        'Yaourt grec',
        'Mozzarella',
        'Épinards',
        'Tomates',
        'Blanc de poulet',
        'Courgettes',
        'Œufs',
        'Parmesan',
        'Pain complet',
        'Petits pois surgelés',
        'Pâtes',
        'Lait',
        'Basilic',
        'Citrons',
        'Café',
        'Bananes',
        'Riz'
    ],
    'de': [
        'Griechischer Joghurt',
        'Mozzarella',
        'Spinat',
        'Tomaten',
        'Hähnchenbrust',
        'Zucchini',
        'Eier',
        'Parmesan',
        'Vollkornbrot',
        'TK-Erbsen',
        'Nudeln',
        'Milch',
        'Basilikum',
        'Zitronen',
        'Kaffee',
        'Bananen',
        'Reis'
    ],
    'pt': [
        'Iogurte grego',
        'Mussarela',
        'Espinafre',
        'Tomates',
        'Peito de frango',
        'Abobrinha',
        'Ovos',
        'Parmesão',
        'Pão integral',
        'Ervilhas congeladas',
        'Massa',
        'Leite',
        'Manjericão',
        'Limões',
        'Café',
        'Bananas',
        'Arroz'
    ],
    'nl': [
        'Griekse yoghurt',
        'Mozzarella',
        'Spinazie',
        'Tomaten',
        'Kipfilet',
        'Courgette',
        'Eieren',
        'Parmezaan',
        'Volkorenbrood',
        'Diepvrieserwten',
        'Pasta',
        'Melk',
        'Basilicum',
        'Citroenen',
        'Koffie',
        'Bananen',
        'Rijst'
    ],
    'pl': [
        'Jogurt grecki',
        'Mozzarella',
        'Szpinak',
        'Pomidory',
        'Pierś z kurczaka',
        'Cukinia',
        'Jajka',
        'Parmezan',
        'Chleb pełnoziarnisty',
        'Mrożony groszek',
        'Makaron',
        'Mleko',
        'Bazylia',
        'Cytryny',
        'Kawa',
        'Banany',
        'Ryż'
    ],
    'ja': [
        'ギリシャヨーグルト',
        'モッツァレラ',
        'ほうれん草',
        'トマト',
        '鶏むね肉',
        'ズッキーニ',
        '卵',
        'パルメザン',
        '全粒粉パン',
        '冷凍グリーンピース',
        'パスタ',
        '牛乳',
        'バジル',
        'レモン',
        'コーヒー',
        'バナナ',
        'お米'
    ],
    'ko': [
        '그릭 요거트',
        '모차렐라',
        '시금치',
        '토마토',
        '닭가슴살',
        '애호박',
        '달걀',
        '파르메산',
        '통밀빵',
        '냉동 완두콩',
        '파스타',
        '우유',
        '바질',
        '레몬',
        '커피',
        '바나나',
        '쌀'
    ]
};

// name (Italian, replaced per language), category, location, days left, price
const ITEMS: [string, CategoryId, string, number, number][] = [
    ['Yogurt greco', 'dairy', 'fridge', -1, 1.9],
    ['Mozzarella', 'dairy', 'fridge', 0, 2.4],
    ['Spinaci', 'fruitVeg', 'fridge', 1, 1.6],
    ['Pomodori', 'fruitVeg', 'fridge', 2, 2.2],
    ['Petto di pollo', 'meat', 'fridge', 3, 6.5],
    ['Zucchine', 'fruitVeg', 'fridge', 5, 1.8],
    ['Uova', 'dairy', 'fridge', 9, 3.1],
    ['Parmigiano', 'dairy', 'fridge', 24, 5.9],
    ['Pane integrale', 'bakery', 'pantry', 2, 2.8],
    ['Piselli surgelati', 'frozen', 'freezer', 120, 1.7],
    ['Pasta', 'pantry', 'pantry', 300, 1.2],
];

const HISTORY: [string, CategoryId, 'consumed' | 'wasted', number, number][] = [
    ['Latte', 'dairy', 'consumed', -2, 1.5],
    ['Insalata', 'fruitVeg', 'consumed', -4, 1.9],
    ['Prosciutto', 'meat', 'consumed', -6, 3.8],
    ['Ricotta', 'dairy', 'wasted', -9, 2.1],
    ['Fragole', 'fruitVeg', 'consumed', -12, 3.5],
    ['Salmone', 'fish', 'consumed', -15, 7.9],
    ['Banane', 'fruitVeg', 'consumed', -20, 2.0],
    ['Pane', 'bakery', 'wasted', -40, 1.6],
    ['Burro', 'dairy', 'consumed', -45, 2.6],
    ['Peperoni', 'fruitVeg', 'consumed', -70, 2.3],
    ['Formaggio', 'dairy', 'consumed', -100, 4.2],
    ['Carote', 'fruitVeg', 'wasted', -130, 1.1],
];

export const buildDemoBackup = (language = 'it', currency = 'EUR'): Backup => {
    const n = NAMES[language] ?? NAMES.en;
    // Prices are written in EUR; scale and round them so other currencies look natural
    const f = currencyFactor(currency);
    const cash = (eur: number) => (f >= 100 ? Math.round((eur * f) / 10) * 10 : Math.round(eur * f * 100) / 100);
    const items: FoodItem[] = ITEMS.map(([, category, locationId, left, price], i) => ({
        id: `demo-${i}`,
        name: n[i],
        category,
        locationId,
        expirationDate: day(left),
        createdAt: day(-3),
        price: cash(price),
        tags: detectTags(n[i]),
    }));
    const history: HistoryEntry[] = HISTORY.map(([name, category, outcome, ago, price], i) => ({
        id: `demo-h-${i}`,
        name,
        category,
        price: cash(price),
        outcome,
        date: day(ago),
    }));
    const shopping: ShoppingItem[] = n.slice(11).map((name, i) => ({
        id: `demo-s-${i}`,
        name,
        checked: i === 2 || i === 4,
        createdAt: day(0),
    }));
    return { app: 'freshcheck', version: 2, exportedAt: day(0), items, history, shopping, locations: DEFAULT_LOCATIONS };
};
