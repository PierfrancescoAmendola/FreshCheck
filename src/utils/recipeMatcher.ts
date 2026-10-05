import { FoodItem } from '../types';
import { Recipe, RECIPES } from '../data/recipes';
import { daysUntil } from './dateUtils';

export interface RecipeMatch {
    recipe: Recipe;
    score: number;
    usedItems: FoodItem[];
}

// Items expiring sooner weigh more; expired items are left out on purpose
const urgencyWeight = (days: number): number => {
    if (days < 0) return 0;
    if (days === 0) return 5;
    if (days <= 3) return 3;
    if (days <= 7) return 2;
    return 1;
};

export const matchRecipes = (items: FoodItem[]): RecipeMatch[] => {
    const byTag = new Map<string, { item: FoodItem; weight: number }>();
    for (const item of items) {
        const w = urgencyWeight(daysUntil(item.expirationDate));
        if (w === 0) continue;
        for (const tag of item.tags) {
            const prev = byTag.get(tag);
            if (!prev || w > prev.weight) byTag.set(tag, { item, weight: w });
        }
    }

    return RECIPES.map((recipe) => {
        const used = new Map<string, FoodItem>();
        let score = 0;
        for (const tag of recipe.tags) {
            const hit = byTag.get(tag);
            if (hit) {
                score += hit.weight;
                used.set(hit.item.id, hit.item);
            }
        }
        // Prefer recipes that use several items rather than one urgent item
        if (used.size > 1) score += used.size;
        return { recipe, score, usedItems: [...used.values()] };
    })
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score || a.recipe.minutes - b.recipe.minutes);
};
