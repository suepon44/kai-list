import { useState, useCallback } from 'react';
import type { SavedMealPlan, Weekday, WeeklyMealPlan } from '../types';
import { LocalStorageRepository } from '../repositories/local-storage';
import { STORAGE_KEYS } from '../constants';

const mealPlanRepository = new LocalStorageRepository<SavedMealPlan>(
  STORAGE_KEYS.MEAL_PLANS
);

/** 空の週間献立を生成する */
function createEmptyPlan(): WeeklyMealPlan {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };
}

/**
 * 週間献立の作成・保存・読み込み・削除を提供するカスタムフック。
 * localStorageとReact状態を同期し、献立のCRUD操作を提供する。
 */
export function useMealPlan() {
  const [currentPlan, setCurrentPlan] = useState<WeeklyMealPlan>(
    createEmptyPlan
  );
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>(() =>
    mealPlanRepository.getAll()
  );

  /**
   * 指定した曜日にレシピを割り当てる。
   * 同じレシピIDが既に割り当てられていても重複して追加する
   * （1日に同じレシピを複数回割り当て可能）。
   */
  const assignRecipe = useCallback(
    (day: Weekday, recipeId: string): void => {
      setCurrentPlan((prev) => ({
        ...prev,
        [day]: [...prev[day], recipeId],
      }));
    },
    []
  );

  /**
   * 指定した曜日からレシピを削除する。
   * 同じレシピIDが複数ある場合は最初の1つのみ削除する。
   */
  const removeRecipe = useCallback(
    (day: Weekday, recipeId: string): void => {
      setCurrentPlan((prev) => {
        const dayRecipes = prev[day];
        const index = dayRecipes.indexOf(recipeId);
        if (index === -1) return prev;
        const updated = [...dayRecipes];
        updated.splice(index, 1);
        return {
          ...prev,
          [day]: updated,
        };
      });
    },
    []
  );

  /**
   * 現在の献立を名前付きで保存する。
   * 新しいIDとタイムスタンプを付与してlocalStorageに保存する。
   */
  const savePlan = useCallback(
    (name: string, weekStartDate?: string): void => {
      const newPlan: SavedMealPlan = {
        id: crypto.randomUUID(),
        name,
        plan: { ...currentPlan },
        ...(weekStartDate ? { weekStartDate } : {}),
        createdAt: new Date().toISOString(),
      };
      mealPlanRepository.save(newPlan);
      setSavedPlans(mealPlanRepository.getAll());
    },
    [currentPlan]
  );

  /**
   * 保存済み献立を読み込み、currentPlanに設定する。
   * 指定されたIDの献立が見つからない場合は何もしない。
   */
  const loadPlan = useCallback((id: string): void => {
    const plan = mealPlanRepository.getById(id);
    if (!plan) return;
    setCurrentPlan({ ...plan.plan });
  }, []);

  /**
   * 保存済み献立を削除する。
   */
  const deletePlan = useCallback((id: string): void => {
    mealPlanRepository.delete(id);
    setSavedPlans(mealPlanRepository.getAll());
  }, []);

  /**
   * 既存の保存済み献立を現在の献立内容で上書きする。
   * 指定されたIDの献立が見つからない場合は何もしない。
   */
  const overwritePlan = useCallback(
    (id: string): void => {
      const existing = mealPlanRepository.getById(id);
      if (!existing) return;
      const updatedPlan: SavedMealPlan = {
        ...existing,
        plan: { ...currentPlan },
      };
      mealPlanRepository.update(id, updatedPlan);
      setSavedPlans(mealPlanRepository.getAll());
    },
    [currentPlan]
  );

  /**
   * 現在の献立を空にリセットする。
   */
  const resetPlan = useCallback((): void => {
    setCurrentPlan(createEmptyPlan());
  }, []);

  return {
    currentPlan,
    assignRecipe,
    removeRecipe,
    savePlan,
    loadPlan,
    deletePlan,
    savedPlans,
    overwritePlan,
    resetPlan,
  };
}
