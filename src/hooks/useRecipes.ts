import { useState, useCallback } from 'react';
import type { Recipe, ValidationResult } from '../types';
import { LocalStorageRepository } from '../repositories/local-storage';
import { validateRecipe, type RecipeInput } from '../domain/recipe';
import { STORAGE_KEYS } from '../constants';

const recipeRepository = new LocalStorageRepository<Recipe>(
  STORAGE_KEYS.RECIPES
);

/**
 * レシピのCRUD操作と状態管理を提供するカスタムフック。
 * localStorageとReact状態を同期し、バリデーション付きの
 * 追加・更新・削除操作を提供する。
 */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(() =>
    recipeRepository.getAll()
  );

  /**
   * 新しいレシピを追加する。
   * バリデーションに失敗した場合はエラーを返し、保存しない。
   */
  const addRecipe = useCallback(
    (input: RecipeInput): ValidationResult => {
      const result = validateRecipe(input);
      if (!result.valid) {
        return result;
      }

      const now = new Date().toISOString();
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        name: input.name,
        ingredients: input.ingredients,
        source: input.source,
        createdAt: now,
        updatedAt: now,
      };

      recipeRepository.save(newRecipe);
      setRecipes(recipeRepository.getAll());

      return result;
    },
    []
  );

  /**
   * 既存のレシピを更新する。
   * バリデーションに失敗した場合はエラーを返し、更新しない。
   */
  const updateRecipe = useCallback(
    (id: string, input: RecipeInput): ValidationResult => {
      const result = validateRecipe(input);
      if (!result.valid) {
        return result;
      }

      const existing = recipeRepository.getById(id);
      if (!existing) {
        return {
          valid: false,
          errors: [`ID "${id}" のレシピが見つかりません`],
        };
      }

      const updatedRecipe: Recipe = {
        ...existing,
        name: input.name,
        ingredients: input.ingredients,
        source: input.source,
        updatedAt: new Date().toISOString(),
      };

      recipeRepository.update(id, updatedRecipe);
      setRecipes(recipeRepository.getAll());

      return result;
    },
    []
  );

  /**
   * レシピを削除する。
   */
  const deleteRecipe = useCallback((id: string): void => {
    recipeRepository.delete(id);
    setRecipes(recipeRepository.getAll());
  }, []);

  return {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
