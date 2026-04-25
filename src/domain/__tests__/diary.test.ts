import { describe, expect, it } from 'vitest';
import {
  buildDateRecipeMap,
  computeRecipeRanking,
  computeCategoryBalance,
  computeStaleRecipes,
} from '../diary';
import type { Recipe, SavedMealPlan } from '../../types';

// --- テスト用ヘルパー ---

function makeRecipe(id: string, name: string, ingredients: { name: string; category: string | null }[] = []): Recipe {
  return {
    id,
    name,
    ingredients: ingredients.map((ing) => ({
      name: ing.name,
      category: ing.category,
    })),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function makeSavedPlan(
  id: string,
  plan: Partial<Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', string[]>>,
  weekStartDate?: string,
): SavedMealPlan {
  return {
    id,
    name: `Plan ${id}`,
    plan: {
      monday: plan.monday ?? [],
      tuesday: plan.tuesday ?? [],
      wednesday: plan.wednesday ?? [],
      thursday: plan.thursday ?? [],
      friday: plan.friday ?? [],
    },
    weekStartDate,
    createdAt: '2024-01-01T00:00:00Z',
  };
}

// --- テストデータ ---

const recipes: Recipe[] = [
  makeRecipe('r1', 'カレー', [
    { name: 'にんじん', category: '野菜' },
    { name: '牛肉', category: '肉類' },
  ]),
  makeRecipe('r2', '味噌汁', [
    { name: '豆腐', category: null },
    { name: 'わかめ', category: '乾物' },
  ]),
  makeRecipe('r3', 'サラダ', [
    { name: 'レタス', category: '野菜' },
    { name: 'トマト', category: '野菜' },
  ]),
  makeRecipe('r4', '焼き魚', [
    { name: '鮭', category: '魚介類' },
  ]),
];

// --- buildDateRecipeMap ---

describe('buildDateRecipeMap', () => {
  it('weekStartDate がある献立から日付→レシピのマッピングを構築する', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'], wednesday: ['r2'] }, '2024-06-03'),
    ];

    const result = buildDateRecipeMap(plans, recipes);

    // 月曜 = 2024-06-03 (offset 0)
    expect(result.get('2024-06-03')).toEqual([
      { recipeName: 'カレー', recipeId: 'r1' },
    ]);
    // 水曜 = 2024-06-05 (offset 2)
    expect(result.get('2024-06-05')).toEqual([
      { recipeName: '味噌汁', recipeId: 'r2' },
    ]);
    // 火曜・木曜・金曜はレシピなし
    expect(result.has('2024-06-04')).toBe(false);
    expect(result.has('2024-06-06')).toBe(false);
    expect(result.has('2024-06-07')).toBe(false);
  });

  it('weekStartDate がない献立は無視する', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }), // weekStartDate なし
    ];

    const result = buildDateRecipeMap(plans, recipes);
    expect(result.size).toBe(0);
  });

  it('存在しないレシピIDは無視する', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1', 'nonexistent'] }, '2024-06-03'),
    ];

    const result = buildDateRecipeMap(plans, recipes);
    expect(result.get('2024-06-03')).toEqual([
      { recipeName: 'カレー', recipeId: 'r1' },
    ]);
  });

  it('同じ日に複数レシピがある場合すべてマッピングされる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1', 'r2'] }, '2024-06-03'),
    ];

    const result = buildDateRecipeMap(plans, recipes);
    expect(result.get('2024-06-03')).toEqual([
      { recipeName: 'カレー', recipeId: 'r1' },
      { recipeName: '味噌汁', recipeId: 'r2' },
    ]);
  });

  it('複数の献立が同じ日付に重なる場合、両方のレシピが含まれる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      makeSavedPlan('p2', { monday: ['r2'] }, '2024-06-03'),
    ];

    const result = buildDateRecipeMap(plans, recipes);
    expect(result.get('2024-06-03')).toEqual([
      { recipeName: 'カレー', recipeId: 'r1' },
      { recipeName: '味噌汁', recipeId: 'r2' },
    ]);
  });

  it('金曜日のオフセット(+4)が正しく計算される', () => {
    const plans = [
      makeSavedPlan('p1', { friday: ['r3'] }, '2024-06-03'),
    ];

    const result = buildDateRecipeMap(plans, recipes);
    // 金曜 = 2024-06-03 + 4 = 2024-06-07
    expect(result.get('2024-06-07')).toEqual([
      { recipeName: 'サラダ', recipeId: 'r3' },
    ]);
  });
});

// --- computeRecipeRanking ---

describe('computeRecipeRanking', () => {
  it('レシピの使用回数を正しく集計し降順で返す', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'], tuesday: ['r1', 'r2'], wednesday: ['r3'] }, '2024-06-03'),
      makeSavedPlan('p2', { monday: ['r1'], friday: ['r2'] }, '2024-06-10'),
    ];

    const result = computeRecipeRanking(plans, recipes);

    expect(result[0]).toEqual({ recipeId: 'r1', recipeName: 'カレー', count: 3 });
    expect(result[1]).toEqual({ recipeId: 'r2', recipeName: '味噌汁', count: 2 });
    expect(result[2]).toEqual({ recipeId: 'r3', recipeName: 'サラダ', count: 1 });
  });

  it('dateRange で期間を絞り込める', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      makeSavedPlan('p2', { monday: ['r2'] }, '2024-06-10'),
      makeSavedPlan('p3', { monday: ['r3'] }, '2024-07-01'),
    ];

    const result = computeRecipeRanking(plans, recipes, {
      start: '2024-06-01',
      end: '2024-06-30',
    });

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.recipeId)).toContain('r1');
    expect(result.map((r) => r.recipeId)).toContain('r2');
    expect(result.map((r) => r.recipeId)).not.toContain('r3');
  });

  it('weekStartDate がない献立も dateRange なしなら集計対象になる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }), // weekStartDate なし
    ];

    const result = computeRecipeRanking(plans, recipes);
    expect(result).toHaveLength(1);
    expect(result[0].recipeId).toBe('r1');
  });

  it('dateRange 指定時に weekStartDate がない献立は除外される', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }), // weekStartDate なし
    ];

    const result = computeRecipeRanking(plans, recipes, {
      start: '2024-01-01',
      end: '2024-12-31',
    });

    expect(result).toHaveLength(0);
  });

  it('存在しないレシピIDはランキングに含まれない', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['nonexistent'] }, '2024-06-03'),
    ];

    const result = computeRecipeRanking(plans, recipes);
    expect(result).toHaveLength(0);
  });

  it('空の献立配列では空の結果を返す', () => {
    const result = computeRecipeRanking([], recipes);
    expect(result).toEqual([]);
  });
});

// --- computeCategoryBalance ---

describe('computeCategoryBalance', () => {
  it('カテゴリ別の使用回数とパーセンテージを正しく算出する', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      // r1: にんじん(野菜), 牛肉(肉類)
    ];

    const result = computeCategoryBalance(plans, recipes);

    expect(result).toHaveLength(2);
    const veggie = result.find((r) => r.category === '野菜');
    const meat = result.find((r) => r.category === '肉類');
    expect(veggie).toEqual({ category: '野菜', count: 1, percentage: 50 });
    expect(meat).toEqual({ category: '肉類', count: 1, percentage: 50 });
  });

  it('null カテゴリは「未分類」として集計される', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r2'] }, '2024-06-03'),
      // r2: 豆腐(null→未分類), わかめ(乾物)
    ];

    const result = computeCategoryBalance(plans, recipes);

    const uncategorized = result.find((r) => r.category === '未分類');
    expect(uncategorized).toBeDefined();
    expect(uncategorized!.count).toBe(1);
  });

  it('dateRange で期間を絞り込める', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      makeSavedPlan('p2', { monday: ['r3'] }, '2024-07-01'),
    ];

    const result = computeCategoryBalance(plans, recipes, {
      start: '2024-06-01',
      end: '2024-06-30',
    });

    // r1 のみ: 野菜(1), 肉類(1)
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.category)).not.toContain('魚介類');
  });

  it('空の献立配列では空の結果を返す', () => {
    const result = computeCategoryBalance([], recipes);
    expect(result).toEqual([]);
  });

  it('パーセンテージの合計がおおよそ100になる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1', 'r2', 'r3'] }, '2024-06-03'),
    ];

    const result = computeCategoryBalance(plans, recipes);
    const totalPercentage = result.reduce((sum, r) => sum + r.percentage, 0);
    // 丸め誤差を考慮して±1の範囲で検証
    expect(totalPercentage).toBeGreaterThanOrEqual(99);
    expect(totalPercentage).toBeLessThanOrEqual(101);
  });
});

// --- computeStaleRecipes ---

describe('computeStaleRecipes', () => {
  it('未使用レシピが先頭に配置される', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
    ];

    const result = computeStaleRecipes(plans, recipes);

    // r2, r3, r4 は未使用 → 先頭に配置
    const unusedRecipes = result.filter((r) => r.lastUsedDate === null);
    const usedRecipes = result.filter((r) => r.lastUsedDate !== null);

    expect(unusedRecipes.length).toBe(3);
    expect(usedRecipes.length).toBe(1);

    // 未使用レシピが使用済みレシピより前にある
    const lastUnusedIndex = result.findIndex((r) => r.lastUsedDate !== null) - 1;
    expect(lastUnusedIndex).toBeGreaterThanOrEqual(0);
  });

  it('最終使用日が古い順にソートされる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      makeSavedPlan('p2', { monday: ['r2'] }, '2024-07-01'),
      makeSavedPlan('p3', { monday: ['r3'] }, '2024-06-10'),
    ];

    const result = computeStaleRecipes(plans, recipes);

    // r4 は未使用 → 先頭
    expect(result[0].recipeId).toBe('r4');
    expect(result[0].lastUsedDate).toBeNull();

    // 使用済みレシピは古い順: r1(6/3), r3(6/10), r2(7/1)
    const usedRecipes = result.filter((r) => r.lastUsedDate !== null);
    expect(usedRecipes[0].recipeId).toBe('r1');
    expect(usedRecipes[0].lastUsedDate).toBe('2024-06-03');
    expect(usedRecipes[1].recipeId).toBe('r3');
    expect(usedRecipes[1].lastUsedDate).toBe('2024-06-10');
    expect(usedRecipes[2].recipeId).toBe('r2');
    expect(usedRecipes[2].lastUsedDate).toBe('2024-07-01');
  });

  it('同じレシピが複数回使われた場合、最新の日付が最終使用日になる', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }, '2024-06-03'),
      makeSavedPlan('p2', { friday: ['r1'] }, '2024-07-01'),
    ];

    const result = computeStaleRecipes(plans, recipes);
    const r1 = result.find((r) => r.recipeId === 'r1');
    // 2024-07-01 + 4(金曜) = 2024-07-05
    expect(r1!.lastUsedDate).toBe('2024-07-05');
  });

  it('weekStartDate がない献立は無視される', () => {
    const plans = [
      makeSavedPlan('p1', { monday: ['r1'] }), // weekStartDate なし
    ];

    const result = computeStaleRecipes(plans, recipes);
    // すべて未使用
    expect(result.every((r) => r.lastUsedDate === null)).toBe(true);
  });

  it('全レシピが返される', () => {
    const result = computeStaleRecipes([], recipes);
    expect(result).toHaveLength(recipes.length);
    expect(result.every((r) => r.lastUsedDate === null)).toBe(true);
  });
});
