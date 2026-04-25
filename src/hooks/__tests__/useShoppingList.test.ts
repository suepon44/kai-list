import { renderHook, act } from '@testing-library/react';
import { useShoppingList } from '../useShoppingList';
import type { Recipe, StoreLayout, WeeklyMealPlan } from '../../types';

beforeEach(() => {
  localStorage.clear();
});

const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'カレーライス',
    ingredients: [
      { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
      { name: '玉ねぎ', quantity: 3, unit: '個', category: '野菜' },
      { name: '豚肉', quantity: 300, unit: 'g', category: '肉類' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'r2',
    name: '肉じゃが',
    ingredients: [
      { name: 'にんじん', quantity: 1, unit: '本', category: '野菜' },
      { name: 'じゃがいも', quantity: 4, unit: '個', category: '野菜' },
      { name: '豚肉', quantity: 200, unit: 'g', category: '肉類' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'r3',
    name: '味噌汁',
    ingredients: [
      { name: '豆腐', quantity: 1, unit: '丁', category: null },
      { name: 'わかめ', quantity: 10, unit: 'g', category: null },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mealPlan: WeeklyMealPlan = {
  monday: ['r1'],
  tuesday: ['r2'],
  wednesday: [],
  thursday: [],
  friday: [],
};

const emptyPlan: WeeklyMealPlan = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
};

const storeLayout: StoreLayout = {
  id: 'store1',
  storeName: 'テストスーパー',
  aisles: [
    {
      id: 'a1',
      name: '通路1',
      order: 0,
      sections: [
        { id: 's1', name: '野菜コーナー', categories: ['野菜'], order: 0 },
      ],
    },
    {
      id: 'a2',
      name: '通路2',
      order: 1,
      sections: [
        { id: 's2', name: '精肉コーナー', categories: ['肉類'], order: 0 },
      ],
    },
  ],
};

describe('useShoppingList', () => {
  describe('初期状態', () => {
    it('初期状態では shoppingList が null', () => {
      const { result } = renderHook(() => useShoppingList());
      expect(result.current.shoppingList).toBeNull();
      expect(result.current.sortedList).toBeNull();
      expect(result.current.checkedCount).toBe(0);
      expect(result.current.uncheckedCount).toBe(0);
      expect(result.current.displayItems).toEqual([]);
    });
  });

  describe('generate', () => {
    it('週間献立から買い物リストを生成できる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      expect(result.current.shoppingList).not.toBeNull();
      expect(result.current.shoppingList!.items.length).toBeGreaterThan(0);
    });

    it('同一材料の分量が合算される', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      const carrots = result.current.shoppingList!.items.find(
        (item) => item.name === 'にんじん',
      );
      expect(carrots).toBeDefined();
      expect(carrots!.totalQuantity).toBe(3); // 2 + 1
      expect(carrots!.unit).toBe('本');
    });

    it('空の献立では shoppingList が null になる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(emptyPlan, recipes);
      });

      expect(result.current.shoppingList).toBeNull();
    });

    it('mealPlanId を指定できる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes, 'plan-123');
      });

      expect(result.current.shoppingList!.mealPlanId).toBe('plan-123');
    });

    it('生成時に sortedList がリセットされる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });
      act(() => {
        result.current.sortByStore(storeLayout);
      });
      expect(result.current.sortedList).not.toBeNull();

      act(() => {
        result.current.generate(mealPlan, recipes);
      });
      expect(result.current.sortedList).toBeNull();
    });
  });

  describe('sortByStore', () => {
    it('店舗レイアウトで並べ替えできる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });
      act(() => {
        result.current.sortByStore(storeLayout);
      });

      expect(result.current.sortedList).not.toBeNull();
      expect(result.current.sortedList!.storeLayoutId).toBe('store1');
      expect(result.current.sortedList!.groups.length).toBeGreaterThan(0);
    });

    it('shoppingList が null の場合は何もしない', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.sortByStore(storeLayout);
      });

      expect(result.current.sortedList).toBeNull();
    });
  });

  describe('toggleChecked', () => {
    it('材料をチェック/アンチェックできる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      // チェック
      act(() => {
        result.current.toggleChecked('にんじん::本');
      });
      expect(result.current.checkedItems.has('にんじん::本')).toBe(true);
      expect(result.current.checkedCount).toBe(1);

      // アンチェック
      act(() => {
        result.current.toggleChecked('にんじん::本');
      });
      expect(result.current.checkedItems.has('にんじん::本')).toBe(false);
      expect(result.current.checkedCount).toBe(0);
    });

    it('チェック状態が localStorage に永続化される', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      act(() => {
        result.current.toggleChecked('にんじん::本');
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:checklist-state') || '{}',
      );
      expect(stored.checkedItems).toContain('にんじん::本');
    });
  });

  describe('checkedCount / uncheckedCount', () => {
    it('チェック数と未チェック数の合計が総材料数と一致する', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      const totalItems = result.current.shoppingList!.items.length;
      expect(result.current.checkedCount + result.current.uncheckedCount).toBe(
        totalItems,
      );

      act(() => {
        result.current.toggleChecked('にんじん::本');
      });
      expect(result.current.checkedCount + result.current.uncheckedCount).toBe(
        totalItems,
      );

      act(() => {
        result.current.toggleChecked('豚肉::g');
      });
      expect(result.current.checkedCount + result.current.uncheckedCount).toBe(
        totalItems,
      );
    });
  });

  describe('displayItems — 表示順序', () => {
    it('購入済み材料が未購入の下に表示される', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      // にんじんをチェック
      act(() => {
        result.current.toggleChecked('にんじん::本');
      });

      const items = result.current.displayItems;
      const checkedIndex = items.findIndex((i) => i.name === 'にんじん');
      const uncheckedItems = items.filter(
        (i) => !result.current.checkedItems.has(`${i.name}::${i.unit}`),
      );

      // チェック済みアイテムは未チェックアイテムの後に来る
      for (const unchecked of uncheckedItems) {
        const uncheckedIdx = items.indexOf(unchecked);
        expect(uncheckedIdx).toBeLessThan(checkedIndex);
      }
    });

    it('shoppingList が null の場合は空配列を返す', () => {
      const { result } = renderHook(() => useShoppingList());
      expect(result.current.displayItems).toEqual([]);
    });
  });

  describe('displaySortedList — 並べ替え済みの表示順序', () => {
    it('各グループ内で購入済み材料が未購入の下に表示される', () => {
      const { result } = renderHook(() => useShoppingList());

      // 味噌汁も含む献立で生成（未分類材料あり）
      const planWithMiso: WeeklyMealPlan = {
        monday: ['r1', 'r3'],
        tuesday: ['r2'],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      act(() => {
        result.current.generate(planWithMiso, recipes);
      });
      act(() => {
        result.current.sortByStore(storeLayout);
      });

      // 野菜グループ内のにんじんをチェック
      act(() => {
        result.current.toggleChecked('にんじん::本');
      });

      const sorted = result.current.displaySortedList!;
      const veggieGroup = sorted.groups.find(
        (g) => g.sectionName === '野菜コーナー',
      );
      expect(veggieGroup).toBeDefined();

      // グループ内で未チェックが先、チェック済みが後
      const items = veggieGroup!.items;
      const checkedIdx = items.findIndex((i) => i.name === 'にんじん');
      const uncheckedInGroup = items.filter(
        (i) => !result.current.checkedItems.has(`${i.name}::${i.unit}`),
      );
      for (const unchecked of uncheckedInGroup) {
        expect(items.indexOf(unchecked)).toBeLessThan(checkedIdx);
      }
    });

    it('sortedList が null の場合は null を返す', () => {
      const { result } = renderHook(() => useShoppingList());
      expect(result.current.displaySortedList).toBeNull();
    });
  });

  describe('clearChecks', () => {
    it('すべてのチェックをクリアできる', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });

      act(() => {
        result.current.toggleChecked('にんじん::本');
        result.current.toggleChecked('豚肉::g');
      });
      expect(result.current.checkedCount).toBe(2);

      act(() => {
        result.current.clearChecks();
      });
      expect(result.current.checkedCount).toBe(0);
      expect(result.current.checkedItems.size).toBe(0);
    });

    it('クリア後に localStorage も更新される', () => {
      const { result } = renderHook(() => useShoppingList());

      act(() => {
        result.current.generate(mealPlan, recipes);
      });
      act(() => {
        result.current.toggleChecked('にんじん::本');
      });
      act(() => {
        result.current.clearChecks();
      });

      const stored = JSON.parse(
        localStorage.getItem('sgl:checklist-state') || '{}',
      );
      expect(stored.checkedItems).toEqual([]);
    });
  });
});
