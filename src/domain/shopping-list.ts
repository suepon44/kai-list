import type {
  AggregatedIngredient,
  ExtraItem,
  IngredientWithSource,
  Recipe,
  ShoppingList,
  WeeklyMealPlan,
} from '../types';
import { extractAllIngredients } from './meal-plan';
import { isMealPlanEmpty } from './meal-plan';

/**
 * 材料の合算ロジック。
 * 同一材料名かつ同一単位の材料を1つにまとめ、分量を合計する。
 * 各集約済み材料に使用元の内訳（曜日・レシピ名・分量）を保持する。
 *
 * @param allIngredients - 使用元情報付き材料の配列
 * @returns 集約済み材料の配列
 */
export function aggregateIngredients(
  allIngredients: IngredientWithSource[],
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const { ingredient, day, recipeName } of allIngredients) {
    const key = `${ingredient.name}::${ingredient.unit ?? ''}`;
    const existing = map.get(key);

    if (existing) {
      if (ingredient.quantity != null) {
        existing.totalQuantity = (existing.totalQuantity ?? 0) + ingredient.quantity;
      }
      existing.sources.push({
        day,
        recipeName,
        quantity: ingredient.quantity,
      });
    } else {
      map.set(key, {
        name: ingredient.name,
        totalQuantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        sources: [
          {
            day,
            recipeName,
            quantity: ingredient.quantity,
          },
        ],
      });
    }
  }

  return Array.from(map.values());
}

/**
 * 調味料・日用品アイテムを AggregatedIngredient[] に変換する。
 * 各アイテムは source として "調味料・日用品" を持つ。
 *
 * @param extraItems - 調味料・日用品アイテムの配列
 * @returns 集約済み材料の配列
 */
export function convertExtraItems(
  extraItems: ExtraItem[],
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const item of extraItems) {
    const key = `${item.name}::`;
    const existing = map.get(key);

    if (existing) {
      // 同名アイテムが複数ある場合はソースを追加するだけ
      existing.sources.push({
        day: 'monday' as const,
        recipeName: '調味料・日用品',
      });
    } else {
      map.set(key, {
        name: item.name,
        totalQuantity: undefined,
        unit: undefined,
        category: item.category,
        sources: [
          {
            day: 'monday' as const,
            recipeName: '調味料・日用品',
          },
        ],
      });
    }
  }

  return Array.from(map.values());
}

/**
 * 週間献立から買い物リストを生成する。
 * 同一材料（材料名+単位が一致）の分量を合算し、
 * 各材料の使用元（曜日・レシピ名）を内訳として保持する。
 * 調味料・日用品アイテムも含めて生成する。
 *
 * @param mealPlan - 週間献立
 * @param recipes - レシピ一覧
 * @param mealPlanId - 元の週間献立ID（省略時は空文字列）
 * @param extraItems - 調味料・日用品アイテム（省略時は空配列）
 * @returns 買い物リスト。献立が空かつ調味料・日用品もない場合は null を返す。
 */
export function generateShoppingList(
  mealPlan: WeeklyMealPlan,
  recipes: Recipe[],
  mealPlanId: string = '',
  extraItems: ExtraItem[] = [],
): ShoppingList | null {
  const hasExtraItems = extraItems.length > 0;

  if (isMealPlanEmpty(mealPlan) && !hasExtraItems) {
    return null;
  }

  const allIngredients = extractAllIngredients(mealPlan, recipes);
  const aggregated = aggregateIngredients(allIngredients);

  // 調味料・日用品を追加
  const extraAggregated = convertExtraItems(extraItems);

  // マージ: 同名アイテムがレシピ材料にもある場合は別項目として追加
  const allItems = [...aggregated, ...extraAggregated];

  return {
    id: crypto.randomUUID(),
    mealPlanId,
    items: allItems,
    createdAt: new Date().toISOString(),
  };
}
