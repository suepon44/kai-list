import type { Recipe, SavedMealPlan, Weekday } from '../types';

/** すべての曜日キー（meal-plan.ts と同じ順序） */
const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/** 曜日ごとのオフセット（月曜=0, 火曜=1, ..., 金曜=4） */
const WEEKDAY_OFFSETS: Record<Weekday, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
};

/**
 * weekStartDate に曜日オフセットを加算して YYYY-MM-DD 文字列を返す。
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * レシピIDからレシピ名を引くためのMapを構築する。
 */
function buildRecipeMap(recipes: Recipe[]): Map<string, Recipe> {
  return new Map(recipes.map((r) => [r.id, r]));
}

/**
 * 保存済み献立から日付→レシピ情報のマッピングを構築する。
 *
 * weekStartDate が設定されている献立のみ対象。
 * 各献立について月〜金の日付を算出し、その日に割り当てられた
 * レシピIDをレシピ名とともにマッピングする。
 *
 * @param savedPlans - 保存済み週間献立の配列
 * @param recipes - レシピ一覧
 * @returns 日付文字列(YYYY-MM-DD) → { recipeName, recipeId }[] のMap
 */
export function buildDateRecipeMap(
  savedPlans: SavedMealPlan[],
  recipes: Recipe[],
): Map<string, { recipeName: string; recipeId: string }[]> {
  const recipeMap = buildRecipeMap(recipes);
  const result = new Map<string, { recipeName: string; recipeId: string }[]>();

  for (const plan of savedPlans) {
    if (!plan.weekStartDate) {
      continue;
    }

    for (const day of WEEKDAYS) {
      const dateStr = addDays(plan.weekStartDate, WEEKDAY_OFFSETS[day]);
      const recipeIds = plan.plan[day];

      for (const recipeId of recipeIds) {
        const recipe = recipeMap.get(recipeId);
        if (!recipe) {
          continue;
        }

        const existing = result.get(dateStr) ?? [];
        existing.push({ recipeName: recipe.name, recipeId: recipe.id });
        result.set(dateStr, existing);
      }
    }
  }

  return result;
}

/**
 * レシピの使用回数ランキングを算出する。
 *
 * 保存済み献立の全曜日に割り当てられたレシピIDを集計し、
 * 使用回数が多い順にソートして返す。
 * dateRange が指定された場合、weekStartDate がその範囲内の献立のみ集計する。
 *
 * @param savedPlans - 保存済み週間献立の配列
 * @param recipes - レシピ一覧
 * @param dateRange - 集計期間（任意）
 * @returns レシピID・レシピ名・使用回数の配列（使用回数降順）
 */
export function computeRecipeRanking(
  savedPlans: SavedMealPlan[],
  recipes: Recipe[],
  dateRange?: { start: string; end: string },
): { recipeId: string; recipeName: string; count: number }[] {
  const recipeMap = buildRecipeMap(recipes);
  const counts = new Map<string, number>();

  const filteredPlans = filterPlansByDateRange(savedPlans, dateRange);

  for (const plan of filteredPlans) {
    for (const day of WEEKDAYS) {
      for (const recipeId of plan.plan[day]) {
        counts.set(recipeId, (counts.get(recipeId) ?? 0) + 1);
      }
    }
  }

  const ranking: { recipeId: string; recipeName: string; count: number }[] = [];

  for (const [recipeId, count] of counts) {
    const recipe = recipeMap.get(recipeId);
    if (!recipe) {
      continue;
    }
    ranking.push({ recipeId, recipeName: recipe.name, count });
  }

  ranking.sort((a, b) => b.count - a.count);

  return ranking;
}

/**
 * カテゴリ別の使用比率を算出する。
 *
 * 保存済み献立の全レシピの全材料について、カテゴリごとの使用回数を集計し、
 * 使用比率（パーセンテージ）を算出する。
 * カテゴリが null の材料は「未分類」として集計する。
 *
 * @param savedPlans - 保存済み週間献立の配列
 * @param recipes - レシピ一覧
 * @param dateRange - 集計期間（任意）
 * @returns カテゴリ名・使用回数・パーセンテージの配列
 */
export function computeCategoryBalance(
  savedPlans: SavedMealPlan[],
  recipes: Recipe[],
  dateRange?: { start: string; end: string },
): { category: string; count: number; percentage: number }[] {
  const recipeMap = buildRecipeMap(recipes);
  const categoryCounts = new Map<string, number>();

  const filteredPlans = filterPlansByDateRange(savedPlans, dateRange);

  for (const plan of filteredPlans) {
    for (const day of WEEKDAYS) {
      for (const recipeId of plan.plan[day]) {
        const recipe = recipeMap.get(recipeId);
        if (!recipe) {
          continue;
        }
        for (const ingredient of recipe.ingredients) {
          const category = ingredient.category ?? '未分類';
          categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
        }
      }
    }
  }

  const total = Array.from(categoryCounts.values()).reduce((sum, c) => sum + c, 0);

  const result: { category: string; count: number; percentage: number }[] = [];

  for (const [category, count] of categoryCounts) {
    result.push({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    });
  }

  result.sort((a, b) => b.count - a.count);

  return result;
}

/**
 * 最近使っていないレシピを最終使用日の古い順に返す。
 *
 * 登録済みレシピのうち、保存済み献立で最後に使用された日が古い順にソートする。
 * 一度も使われていないレシピは lastUsedDate: null でリストの先頭に配置する。
 *
 * @param savedPlans - 保存済み週間献立の配列
 * @param recipes - レシピ一覧
 * @returns レシピID・レシピ名・最終使用日の配列
 */
export function computeStaleRecipes(
  savedPlans: SavedMealPlan[],
  recipes: Recipe[],
): { recipeId: string; recipeName: string; lastUsedDate: string | null }[] {
  // 各レシピの最終使用日を追跡
  const lastUsedMap = new Map<string, string>();

  for (const plan of savedPlans) {
    if (!plan.weekStartDate) {
      continue;
    }

    for (const day of WEEKDAYS) {
      const dateStr = addDays(plan.weekStartDate, WEEKDAY_OFFSETS[day]);

      for (const recipeId of plan.plan[day]) {
        const current = lastUsedMap.get(recipeId);
        if (!current || dateStr > current) {
          lastUsedMap.set(recipeId, dateStr);
        }
      }
    }
  }

  const result: { recipeId: string; recipeName: string; lastUsedDate: string | null }[] = [];

  for (const recipe of recipes) {
    result.push({
      recipeId: recipe.id,
      recipeName: recipe.name,
      lastUsedDate: lastUsedMap.get(recipe.id) ?? null,
    });
  }

  // ソート: 未使用(null)が先頭、次に lastUsedDate 昇順（古い順）
  result.sort((a, b) => {
    if (a.lastUsedDate === null && b.lastUsedDate === null) return 0;
    if (a.lastUsedDate === null) return -1;
    if (b.lastUsedDate === null) return 1;
    return a.lastUsedDate.localeCompare(b.lastUsedDate);
  });

  return result;
}

/**
 * dateRange が指定されている場合、weekStartDate がその範囲内の献立のみフィルタする。
 * dateRange が未指定の場合はすべての献立を返す。
 */
function filterPlansByDateRange(
  savedPlans: SavedMealPlan[],
  dateRange?: { start: string; end: string },
): SavedMealPlan[] {
  if (!dateRange) {
    return savedPlans;
  }

  return savedPlans.filter((plan) => {
    if (!plan.weekStartDate) {
      return false;
    }
    return plan.weekStartDate >= dateRange.start && plan.weekStartDate <= dateRange.end;
  });
}
