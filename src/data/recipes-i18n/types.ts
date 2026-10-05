export interface LocalizedRecipe {
    title: string;
    ingredients: string[];
    steps: string[];
}

// Recipe text for one language, keyed by recipe id
export type RecipeTranslations = Record<string, LocalizedRecipe>;
