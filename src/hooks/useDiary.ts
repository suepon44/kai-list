import { useState, useMemo, useCallback } from 'react';
import type { Recipe, SavedMealPlan } from '../types';
import {
  buildDateRecipeMap,
  computeRecipeRanking,
  computeCategoryBalance,
  computeStaleRecipes,
} from '../domain/diary';

/**
 * ごはん日記（履歴振り返り機能）のカスタムフック。
 *
 * 保存済み献立とレシピデータを受け取り、月選択・期間指定の状態管理と
 * メモ化された各種分析データ（カレンダーマップ、ランキング、カテゴリバランス、
 * 最近使っていないレシピ）を返す。
 *
 * @param savedPlans - 保存済み週間献立の配列
 * @param recipes - レシピ一覧
 */
export function useDiary(savedPlans: SavedMealPlan[], recipes: Recipe[]) {
  const now = new Date();

  const [selectedMonth, setSelectedMonthState] = useState<{
    year: number;
    month: number;
  }>({
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-indexed (1=January)
  });

  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  /** 月選択を更新する */
  const setSelectedMonth = useCallback(
    (year: number, month: number): void => {
      setSelectedMonthState({ year, month });
    },
    [],
  );

  /** 前月に移動する */
  const goToPreviousMonth = useCallback((): void => {
    setSelectedMonthState((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  /** 翌月に移動する */
  const goToNextMonth = useCallback((): void => {
    setSelectedMonthState((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  /** 日付→レシピ情報のマッピング */
  const dateRecipeMap = useMemo(
    () => buildDateRecipeMap(savedPlans, recipes),
    [savedPlans, recipes],
  );

  /** レシピ使用回数ランキング（期間指定対応） */
  const recipeRanking = useMemo(
    () =>
      computeRecipeRanking(
        savedPlans,
        recipes,
        dateRange ?? undefined,
      ),
    [savedPlans, recipes, dateRange],
  );

  /** カテゴリ別使用比率（期間指定対応） */
  const categoryBalance = useMemo(
    () =>
      computeCategoryBalance(
        savedPlans,
        recipes,
        dateRange ?? undefined,
      ),
    [savedPlans, recipes, dateRange],
  );

  /** 最近使っていないレシピ */
  const staleRecipes = useMemo(
    () => computeStaleRecipes(savedPlans, recipes),
    [savedPlans, recipes],
  );

  return {
    dateRecipeMap,
    recipeRanking,
    categoryBalance,
    staleRecipes,
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    dateRange,
    setDateRange,
  };
}
