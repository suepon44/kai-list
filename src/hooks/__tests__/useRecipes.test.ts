import { renderHook, act } from '@testing-library/react';
import { useRecipes } from '../useRecipes';
import type { RecipeInput } from '../../domain/recipe';
import type { ValidationResult } from '../../types';

// localStorage をテストごとにクリアする
beforeEach(() => {
  localStorage.clear();
});

const validInput: RecipeInput = {
  name: 'カレーライス',
  ingredients: [
    { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
    { name: '玉ねぎ', quantity: 3, unit: '個', category: '野菜' },
    { name: '豚肉', quantity: 300, unit: 'g', category: '肉類' },
  ],
};

describe('useRecipes', () => {
  describe('初期状態', () => {
    it('localStorageが空の場合、空配列を返す', () => {
      const { result } = renderHook(() => useRecipes());
      expect(result.current.recipes).toEqual([]);
    });

    it('localStorageに既存データがある場合、それを読み込む', () => {
      const existing = [
        {
          id: 'test-id',
          name: '味噌汁',
          ingredients: [
            { name: '豆腐', quantity: 1, unit: '丁', category: null },
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('sgl:recipes', JSON.stringify(existing));

      const { result } = renderHook(() => useRecipes());
      expect(result.current.recipes).toHaveLength(1);
      expect(result.current.recipes[0].name).toBe('味噌汁');
    });
  });

  describe('addRecipe', () => {
    it('有効なレシピを追加できる', () => {
      const { result } = renderHook(() => useRecipes());

      let validationResult;
      act(() => {
        validationResult = result.current.addRecipe(validInput);
      });

      expect(validationResult).toEqual({ valid: true, errors: [] });
      expect(result.current.recipes).toHaveLength(1);
      expect(result.current.recipes[0].name).toBe('カレーライス');
      expect(result.current.recipes[0].ingredients).toEqual(
        validInput.ingredients
      );
    });

    it('追加されたレシピにid, createdAt, updatedAtが付与される', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const recipe = result.current.recipes[0];
      expect(recipe.id).toBeDefined();
      expect(recipe.createdAt).toBeDefined();
      expect(recipe.updatedAt).toBeDefined();
    });

    it('参照元情報付きのレシピを追加できる', () => {
      const { result } = renderHook(() => useRecipes());

      const inputWithSource: RecipeInput = {
        ...validInput,
        source: { type: 'book', bookName: '基本の料理', page: 42 },
      };

      act(() => {
        result.current.addRecipe(inputWithSource);
      });

      expect(result.current.recipes[0].source).toEqual({
        type: 'book',
        bookName: '基本の料理',
        page: 42,
      });
    });

    it('空の料理名の場合、バリデーションエラーを返し保存しない', () => {
      const { result } = renderHook(() => useRecipes());

      let validationResult;
      act(() => {
        validationResult = result.current.addRecipe({
          ...validInput,
          name: '',
        });
      });

      expect(validationResult).toEqual({
        valid: false,
        errors: ['料理名を入力してください'],
      });
      expect(result.current.recipes).toHaveLength(0);
    });

    it('空の材料リストの場合、バリデーションエラーを返し保存しない', () => {
      const { result } = renderHook(() => useRecipes());

      let validationResult;
      act(() => {
        validationResult = result.current.addRecipe({
          ...validInput,
          ingredients: [],
        });
      });

      expect(validationResult).toEqual({
        valid: false,
        errors: ['材料を1つ以上追加してください'],
      });
      expect(result.current.recipes).toHaveLength(0);
    });

    it('localStorageにデータが永続化される', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:recipes') || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('カレーライス');
    });
  });

  describe('updateRecipe', () => {
    it('既存のレシピを更新できる', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const id = result.current.recipes[0].id;
      const updatedInput: RecipeInput = {
        name: 'チキンカレー',
        ingredients: [
          { name: '鶏肉', quantity: 400, unit: 'g', category: '肉類' },
        ],
      };

      let validationResult;
      act(() => {
        validationResult = result.current.updateRecipe(id, updatedInput);
      });

      expect(validationResult).toEqual({ valid: true, errors: [] });
      expect(result.current.recipes).toHaveLength(1);
      expect(result.current.recipes[0].name).toBe('チキンカレー');
    });

    it('更新時にupdatedAtが更新され、createdAtは変わらない', () => {
      vi.useFakeTimers();
      const baseTime = new Date('2024-01-01T00:00:00.000Z');
      vi.setSystemTime(baseTime);

      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const original = result.current.recipes[0];
      const originalCreatedAt = original.createdAt;

      // 時間を進めてから更新
      vi.setSystemTime(new Date('2024-01-01T01:00:00.000Z'));

      act(() => {
        result.current.updateRecipe(original.id, {
          ...validInput,
          name: '更新済みカレー',
        });
      });

      const updated = result.current.recipes[0];
      expect(updated.createdAt).toBe(originalCreatedAt);
      expect(updated.updatedAt).not.toBe(original.updatedAt);

      vi.useRealTimers();
    });

    it('存在しないIDの場合、エラーを返す', () => {
      const { result } = renderHook(() => useRecipes());

      let validationResult;
      act(() => {
        validationResult = result.current.updateRecipe(
          'non-existent-id',
          validInput
        );
      });

      expect(validationResult).toEqual({
        valid: false,
        errors: ['ID "non-existent-id" のレシピが見つかりません'],
      });
    });

    it('バリデーションエラーの場合、更新しない', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const id = result.current.recipes[0].id;

      let validationResult: ValidationResult | undefined;
      act(() => {
        validationResult = result.current.updateRecipe(id, {
          name: '  ',
          ingredients: validInput.ingredients,
        });
      });

      expect(validationResult?.valid).toBe(false);
      expect(result.current.recipes[0].name).toBe('カレーライス');
    });
  });

  describe('deleteRecipe', () => {
    it('レシピを削除できる', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const id = result.current.recipes[0].id;

      act(() => {
        result.current.deleteRecipe(id);
      });

      expect(result.current.recipes).toHaveLength(0);
    });

    it('削除がlocalStorageに反映される', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });

      const id = result.current.recipes[0].id;

      act(() => {
        result.current.deleteRecipe(id);
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:recipes') || '[]'
      );
      expect(stored).toHaveLength(0);
    });

    it('複数レシピから特定のレシピのみ削除できる', () => {
      const { result } = renderHook(() => useRecipes());

      act(() => {
        result.current.addRecipe(validInput);
      });
      act(() => {
        result.current.addRecipe({
          name: '味噌汁',
          ingredients: [
            { name: '豆腐', quantity: 1, unit: '丁', category: null },
          ],
        });
      });

      expect(result.current.recipes).toHaveLength(2);

      const firstId = result.current.recipes[0].id;

      act(() => {
        result.current.deleteRecipe(firstId);
      });

      expect(result.current.recipes).toHaveLength(1);
      expect(result.current.recipes[0].name).toBe('味噌汁');
    });
  });
});
