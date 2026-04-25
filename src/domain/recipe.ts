import type { Ingredient, RecipeSource, ValidationResult } from '../types';

/** レシピ入力型（id, createdAt, updatedAt を除く） */
export interface RecipeInput {
  name: string;
  ingredients: Ingredient[];
  source?: RecipeSource;
}

/**
 * レシピデータのバリデーション。
 * 料理名が空でないこと、材料リストが1つ以上あることを検証する。
 *
 * @param recipe - バリデーション対象のレシピ入力
 * @returns バリデーション結果
 */
export function validateRecipe(recipe: RecipeInput): ValidationResult {
  const errors: string[] = [];

  if (!recipe.name || recipe.name.trim().length === 0) {
    errors.push('料理名を入力してください');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('材料を1つ以上追加してください');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
