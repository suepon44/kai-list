import { useState, useCallback, useMemo } from 'react';
import type {
  ExtraItem,
  Recipe,
  ShoppingList,
  SortedShoppingList,
  StoreLayout,
  WeeklyMealPlan,
} from '../types';
import { generateShoppingList } from '../domain/shopping-list';
import { sortByStoreLayout } from '../domain/sorting';
import { STORAGE_KEYS } from '../constants';

/**
 * localStorage からチェック済みアイテムのセットを復元する。
 * shoppingListId が一致しない場合は空のセットを返す。
 */
function loadCheckedItems(shoppingListId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_STATE);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as {
      shoppingListId: string;
      checkedItems: string[];
    };
    if (parsed.shoppingListId !== shoppingListId) return new Set();
    return new Set(parsed.checkedItems);
  } catch {
    return new Set();
  }
}

/**
 * チェック済みアイテムのセットを localStorage に保存する。
 */
function saveCheckedItems(
  shoppingListId: string,
  checkedItems: Set<string>,
): void {
  try {
    const data = {
      shoppingListId,
      checkedItems: Array.from(checkedItems),
    };
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_STATE, JSON.stringify(data));
  } catch {
    // localStorage 書き込み失敗は無視する（容量超過等）
  }
}

/**
 * 買い物リストの生成・並べ替え・チェック管理を提供するカスタムフック。
 *
 * - `generate()` で週間献立から買い物リストを生成
 * - `sortByStore()` で店舗レイアウトに基づいて並べ替え
 * - `toggleChecked()` で材料の購入済み/未購入をトグル
 * - チェック状態は localStorage に永続化される
 * - 購入済み材料は未購入の下に表示される
 */
export function useShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [sortedList, setSortedList] = useState<SortedShoppingList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  /**
   * 週間献立から買い物リストを生成する。
   * 生成時にチェック状態を localStorage から復元する。
   */
  const generate = useCallback(
    (mealPlan: WeeklyMealPlan, recipes: Recipe[], mealPlanId?: string, extraItems?: ExtraItem[]): void => {
      const list = generateShoppingList(mealPlan, recipes, mealPlanId, extraItems);
      setShoppingList(list);
      setSortedList(null);

      if (list) {
        const restored = loadCheckedItems(list.id);
        setCheckedItems(restored);
      } else {
        setCheckedItems(new Set());
      }
    },
    [],
  );

  /**
   * 現在の買い物リストを店舗レイアウトで並べ替える。
   */
  const sortByStore = useCallback(
    (storeLayout: StoreLayout): void => {
      if (!shoppingList) return;
      const sorted = sortByStoreLayout(shoppingList, storeLayout);
      setSortedList(sorted);
    },
    [shoppingList],
  );

  /**
   * 材料の購入済み/未購入をトグルする。
   * キーは "name::unit" 形式。
   */
  const toggleChecked = useCallback(
    (ingredientKey: string): void => {
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (next.has(ingredientKey)) {
          next.delete(ingredientKey);
        } else {
          next.add(ingredientKey);
        }
        if (shoppingList) {
          saveCheckedItems(shoppingList.id, next);
        }
        return next;
      });
    },
    [shoppingList],
  );

  /**
   * すべてのチェックをクリアする。
   */
  const clearChecks = useCallback((): void => {
    const empty = new Set<string>();
    setCheckedItems(empty);
    if (shoppingList) {
      saveCheckedItems(shoppingList.id, empty);
    }
  }, [shoppingList]);

  /** 買い物リストの総材料数 */
  const totalCount = shoppingList?.items.length ?? 0;

  /** 購入済みの材料数 */
  const checkedCount = useMemo(() => {
    if (!shoppingList) return 0;
    return shoppingList.items.filter((item) =>
      checkedItems.has(`${item.name}::${item.unit ?? ''}`),
    ).length;
  }, [shoppingList, checkedItems]);

  /** 未購入の材料数 */
  const uncheckedCount = totalCount - checkedCount;

  /**
   * 表示用の買い物リスト（未購入が上、購入済みが下）。
   * sortedList がある場合はグループ内で並べ替え、
   * ない場合は shoppingList.items を並べ替える。
   */
  const displayItems = useMemo(() => {
    if (!shoppingList) return [];
    const items = shoppingList.items;
    const unchecked = items.filter(
      (item) => !checkedItems.has(`${item.name}::${item.unit ?? ''}`),
    );
    const checked = items.filter((item) =>
      checkedItems.has(`${item.name}::${item.unit ?? ''}`),
    );
    return [...unchecked, ...checked];
  }, [shoppingList, checkedItems]);

  /**
   * 表示用の並べ替え済み買い物リスト（各グループ内で未購入が上、購入済みが下）。
   */
  const displaySortedList = useMemo((): SortedShoppingList | null => {
    if (!sortedList) return null;
    return {
      ...sortedList,
      groups: sortedList.groups.map((group) => {
        const unchecked = group.items.filter(
          (item) => !checkedItems.has(`${item.name}::${item.unit ?? ''}`),
        );
        const checked = group.items.filter((item) =>
          checkedItems.has(`${item.name}::${item.unit ?? ''}`),
        );
        return { ...group, items: [...unchecked, ...checked] };
      }),
      uncategorized: (() => {
        const unchecked = sortedList.uncategorized.filter(
          (item) => !checkedItems.has(`${item.name}::${item.unit ?? ''}`),
        );
        const checked = sortedList.uncategorized.filter((item) =>
          checkedItems.has(`${item.name}::${item.unit ?? ''}`),
        );
        return [...unchecked, ...checked];
      })(),
    };
  }, [sortedList, checkedItems]);

  return {
    shoppingList,
    sortedList,
    displayItems,
    displaySortedList,
    generate,
    sortByStore,
    toggleChecked,
    clearChecks,
    checkedItems,
    checkedCount,
    uncheckedCount,
  };
}
