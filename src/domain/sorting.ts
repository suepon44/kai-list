import type {
  AggregatedIngredient,
  ShoppingList,
  SortedGroup,
  SortedShoppingList,
  StoreLayout,
  StoreLocation,
} from '../types';

/**
 * 材料のカテゴリから、店舗レイアウト上の位置（通路・セクション）を解決する。
 * カテゴリが null または店舗レイアウトに存在しない場合は null を返す。
 *
 * @param category - 商品カテゴリ（null = 未分類）
 * @param storeLayout - 店舗レイアウト
 * @returns 店舗内位置、またはカテゴリが未割り当ての場合は null
 */
export function resolveLocation(
  category: string | null,
  storeLayout: StoreLayout,
): StoreLocation | null {
  if (category === null) {
    return null;
  }

  for (const aisle of storeLayout.aisles) {
    for (const section of aisle.sections) {
      if (section.categories.includes(category)) {
        return {
          aisleId: aisle.id,
          aisleName: aisle.name,
          aisleOrder: aisle.order,
          sectionId: section.id,
          sectionName: section.name,
          sectionOrder: section.order,
        };
      }
    }
  }

  return null;
}

/**
 * 買い物リストを店舗レイアウトのピッキング順序に並べ替える。
 * 通路順序 → セクション順序 の優先度で並べ替え、
 * 未分類の材料はリスト末尾にまとめる。
 *
 * 不変条件: 並べ替え前後で材料の総数と各材料の分量が一致する。
 *
 * @param shoppingList - 買い物リスト
 * @param storeLayout - 店舗レイアウト
 * @returns 並べ替え済み買い物リスト
 */
export function sortByStoreLayout(
  shoppingList: ShoppingList,
  storeLayout: StoreLayout,
): SortedShoppingList {
  const uncategorized: AggregatedIngredient[] = [];
  const groupMap = new Map<string, SortedGroup>();

  for (const item of shoppingList.items) {
    const location = item.category !== null
      ? resolveLocation(item.category, storeLayout)
      : null;

    if (location === null) {
      uncategorized.push(item);
    } else {
      const groupKey = `${location.aisleId}::${location.sectionId}`;
      const existing = groupMap.get(groupKey);

      if (existing) {
        existing.items.push(item);
      } else {
        groupMap.set(groupKey, {
          aisleName: location.aisleName,
          sectionName: location.sectionName,
          aisleOrder: location.aisleOrder,
          sectionOrder: location.sectionOrder,
          items: [item],
        });
      }
    }
  }

  // 通路順序 → セクション順序 の優先度で並べ替え
  const groups = Array.from(groupMap.values()).sort((a, b) => {
    if (a.aisleOrder !== b.aisleOrder) {
      return a.aisleOrder - b.aisleOrder;
    }
    return a.sectionOrder - b.sectionOrder;
  });

  return {
    storeLayoutId: storeLayout.id,
    groups,
    uncategorized,
  };
}
