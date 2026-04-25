import type { IngredientWithSource, Recipe, Weekday, WeeklyMealPlan } from '../types';

/** すべての曜日キー */
const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/**
 * 週間献立が空（レシピが1つも割り当てられていない）かどうかを判定する。
 *
 * @param mealPlan - 判定対象の週間献立
 * @returns レシピが1つも割り当てられていない場合 true
 */
export function isMealPlanEmpty(mealPlan: WeeklyMealPlan): boolean {
  return WEEKDAYS.every((day) => mealPlan[day].length === 0);
}

/**
 * 週間献立から全材料を曜日・レシピ名付きで抽出する。
 *
 * WeeklyMealPlan の各曜日に割り当てられたレシピIDを元に、
 * 対応する Recipe の材料を IngredientWithSource[] として返す。
 * 存在しないレシピIDは無視される。
 *
 * @param mealPlan - 週間献立
 * @param recipes - レシピ一覧（IDで検索するため）
 * @returns 曜日・レシピ名付きの全材料リスト
 */
export function extractAllIngredients(
  mealPlan: WeeklyMealPlan,
  recipes: Recipe[],
): IngredientWithSource[] {
  const recipeMap = new Map<string, Recipe>(
    recipes.map((r) => [r.id, r]),
  );

  const result: IngredientWithSource[] = [];

  for (const day of WEEKDAYS) {
    for (const recipeId of mealPlan[day]) {
      const recipe = recipeMap.get(recipeId);
      if (!recipe) {
        continue;
      }
      for (const ingredient of recipe.ingredients) {
        result.push({
          ingredient,
          day,
          recipeName: recipe.name,
        });
      }
    }
  }

  return result;
}
