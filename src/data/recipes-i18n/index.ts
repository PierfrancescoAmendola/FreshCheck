// Recipe text for the languages not inlined in recipes.ts (which carries en, it, es).
import { RecipeTranslations } from './types';
import { de } from './de';
import { fr } from './fr';
import { ja } from './ja';
import { ko } from './ko';
import { nl } from './nl';
import { pl } from './pl';
import { pt } from './pt';

export const RECIPE_TRANSLATIONS: Record<string, RecipeTranslations> = { de, fr, ja, ko, nl, pl, pt };
