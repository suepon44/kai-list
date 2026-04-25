import { useState, useCallback, useMemo } from 'react';
import type { Recipe } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * localStorage からカスタム材料リストを読み込む。
 */
function loadCustomIngredients(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INGREDIENT_MASTER);
    if (data === null) return [];
    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

/**
 * カスタム材料リストを localStorage に保存する。
 */
function saveCustomIngredients(items: string[]): void {
  localStorage.setItem(STORAGE_KEYS.INGREDIENT_MASTER, JSON.stringify(items));
}

/**
 * レシピ全体から材料名を抽出し、カスタム材料と統合して管理するフック。
 * オートコンプリート用のサジェスト機能も提供する。
 */
export function useIngredientMaster(recipes: Recipe[]) {
  const [customIngredients, setCustomIngredients] = useState<string[]>(
    loadCustomIngredients,
  );

  /** レシピ由来のユニークな材料名（ソート済み） */
  const recipeIngredients = useMemo(() => {
    const names = new Set<string>();
    for (const recipe of recipes) {
      for (const ing of recipe.ingredients) {
        const trimmed = ing.name.trim();
        if (trimmed) {
          names.add(trimmed);
        }
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [recipes]);

  /** レシピ由来 + カスタムの全材料名（ソート済み・重複なし） */
  const allIngredients = useMemo(() => {
    const names = new Set<string>(recipeIngredients);
    for (const name of customIngredients) {
      names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [recipeIngredients, customIngredients]);

  /** カスタム材料を追加する */
  const addCustomIngredient = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      // 既にカスタムリストにある場合はスキップ
      if (customIngredients.includes(trimmed)) return;
      const updated = [...customIngredients, trimmed];
      setCustomIngredients(updated);
      saveCustomIngredients(updated);
    },
    [customIngredients],
  );

  /** カスタム材料を削除する */
  const deleteCustomIngredient = useCallback(
    (name: string) => {
      const updated = customIngredients.filter((n) => n !== name);
      setCustomIngredients(updated);
      saveCustomIngredients(updated);
    },
    [customIngredients],
  );

  /** 部分一致でサジェストを返す（大文字小文字無視） */
  const getSuggestions = useCallback(
    (query: string): string[] => {
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return [];
      return allIngredients.filter((name) =>
        name.toLowerCase().includes(trimmed),
      );
    },
    [allIngredients],
  );

  return {
    allIngredients,
    customIngredients,
    addCustomIngredient,
    deleteCustomIngredient,
    getSuggestions,
  };
}
