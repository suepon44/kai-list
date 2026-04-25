import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIngredientMaster } from '../useIngredientMaster';
import { STORAGE_KEYS } from '../../constants';
import type { Recipe } from '../../types';

const recipes: Recipe[] = [
  {
    id: '1',
    name: 'カレーライス',
    ingredients: [
      { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
      { name: '牛肉', quantity: 300, unit: 'g', category: '肉類' },
      { name: 'たまねぎ', quantity: 3, unit: '個', category: '野菜' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: '肉じゃが',
    ingredients: [
      { name: 'じゃがいも', quantity: 4, unit: '個', category: '野菜' },
      { name: 'にんじん', quantity: 1, unit: '本', category: '野菜' },
      { name: '牛肉', quantity: 200, unit: 'g', category: '肉類' },
    ],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('useIngredientMaster', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('レシピからユニークな材料名を抽出する', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    expect(result.current.allIngredients).toContain('にんじん');
    expect(result.current.allIngredients).toContain('牛肉');
    expect(result.current.allIngredients).toContain('たまねぎ');
    expect(result.current.allIngredients).toContain('じゃがいも');
    // 重複なし
    expect(
      result.current.allIngredients.filter((n) => n === 'にんじん').length,
    ).toBe(1);
  });

  it('材料名がソートされている', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    const sorted = [...result.current.allIngredients].sort((a, b) =>
      a.localeCompare(b, 'ja'),
    );
    expect(result.current.allIngredients).toEqual(sorted);
  });

  it('空のレシピ配列では空リストを返す', () => {
    const { result } = renderHook(() => useIngredientMaster([]));

    expect(result.current.allIngredients).toEqual([]);
    expect(result.current.customIngredients).toEqual([]);
  });

  it('カスタム材料を追加できる', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('バター');
    });

    expect(result.current.customIngredients).toContain('バター');
    expect(result.current.allIngredients).toContain('バター');
  });

  it('カスタム材料が localStorage に保存される', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('バター');
    });

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INGREDIENT_MASTER) ?? '[]',
    );
    expect(stored).toContain('バター');
  });

  it('カスタム材料を削除できる', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('バター');
    });
    expect(result.current.customIngredients).toContain('バター');

    act(() => {
      result.current.deleteCustomIngredient('バター');
    });
    expect(result.current.customIngredients).not.toContain('バター');
  });

  it('空文字のカスタム材料は追加されない', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('');
      result.current.addCustomIngredient('   ');
    });

    expect(result.current.customIngredients).toEqual([]);
  });

  it('重複するカスタム材料は追加されない', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('バター');
      result.current.addCustomIngredient('バター');
    });

    expect(
      result.current.customIngredients.filter((n) => n === 'バター').length,
    ).toBe(1);
  });

  it('getSuggestions が部分一致でフィルタする', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    const suggestions = result.current.getSuggestions('にん');
    expect(suggestions).toContain('にんじん');
    expect(suggestions).not.toContain('牛肉');
  });

  it('getSuggestions が大文字小文字を無視する', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    act(() => {
      result.current.addCustomIngredient('Butter');
    });

    const suggestions = result.current.getSuggestions('butter');
    expect(suggestions).toContain('Butter');
  });

  it('getSuggestions が空クエリで空配列を返す', () => {
    const { result } = renderHook(() => useIngredientMaster(recipes));

    expect(result.current.getSuggestions('')).toEqual([]);
    expect(result.current.getSuggestions('   ')).toEqual([]);
  });

  it('localStorage から既存のカスタム材料を読み込む', () => {
    localStorage.setItem(
      STORAGE_KEYS.INGREDIENT_MASTER,
      JSON.stringify(['バター', 'チーズ']),
    );

    const { result } = renderHook(() => useIngredientMaster(recipes));

    expect(result.current.customIngredients).toEqual(['バター', 'チーズ']);
    expect(result.current.allIngredients).toContain('バター');
    expect(result.current.allIngredients).toContain('チーズ');
  });
});
