import React, { useCallback, useState } from 'react';
import type {
  AggregatedIngredient,
  ExtraItem,
  Recipe,
  SortedShoppingList,
  StoreLayout,
  WeeklyMealPlan,
} from '../../types';
import { ProgressBar } from './ProgressBar';
import { ShoppingItem } from './ShoppingItem';
import styles from './ShoppingListView.module.css';

export interface ShoppingListViewProps {
  /** 現在の週間献立 */
  currentPlan: WeeklyMealPlan;
  /** レシピ一覧 */
  recipes: Recipe[];
  /** 調味料・日用品アイテム */
  extraItems: ExtraItem[];
  /** 店舗レイアウト一覧 */
  storeLayouts: StoreLayout[];
  /** 買い物リスト生成済みかどうか（shoppingList が null でないか） */
  hasShoppingList: boolean;
  /** 並べ替え済み表示用リスト */
  displaySortedList: SortedShoppingList | null;
  /** 並べ替えなし表示用アイテム */
  displayItems: AggregatedIngredient[];
  /** チェック済みアイテムのセット */
  checkedItems: Set<string>;
  /** 購入済みカウント */
  checkedCount: number;
  /** 未購入カウント */
  uncheckedCount: number;
  /** 買い物リスト生成 */
  onGenerate: (mealPlan: WeeklyMealPlan, recipes: Recipe[], mealPlanId?: string, extraItems?: ExtraItem[]) => void;
  /** 店舗レイアウトで並べ替え */
  onSortByStore: (storeLayout: StoreLayout) => void;
  /** チェックトグル */
  onToggleChecked: (ingredientKey: string) => void;
  /** チェッククリア */
  onClearChecks: () => void;
}

/**
 * 買い物リスト全体表示コンポーネント。
 *
 * - 「買い物リスト生成」ボタンで献立から買い物リストを生成
 * - ProgressBar で購入進捗を表示
 * - 店舗レイアウト選択で並べ替え
 * - 通路・セクション別グループ表示
 * - 未分類材料は末尾に表示
 * - チェックトグルで購入済み/未購入を切り替え
 * - 「チェックをクリア」ボタンで全チェック解除
 */
export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  currentPlan,
  recipes,
  extraItems,
  storeLayouts,
  hasShoppingList,
  displaySortedList,
  displayItems,
  checkedItems,
  checkedCount,
  uncheckedCount,
  onGenerate,
  onSortByStore,
  onToggleChecked,
  onClearChecks,
}) => {
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  const totalCount = checkedCount + uncheckedCount;

  const handleGenerate = useCallback(() => {
    onGenerate(currentPlan, recipes, undefined, extraItems);
  }, [currentPlan, recipes, extraItems, onGenerate]);

  const handleLayoutChange = useCallback(
    (value: string) => {
      setSelectedLayoutId(value);
      if (!value) return;
      const layout = storeLayouts.find((l) => l.id === value);
      if (layout) {
        onSortByStore(layout);
      }
    },
    [storeLayouts, onSortByStore],
  );

  const isChecked = (item: AggregatedIngredient): boolean =>
    checkedItems.has(`${item.name}::${item.unit ?? ''}`);

  /** 並べ替え済みリストのグループ表示 */
  const renderSortedList = (sorted: SortedShoppingList) => (
    <div className={styles.groupList} role="list">
      {sorted.groups.map((group) => (
        <div
          key={`${group.aisleName}-${group.sectionName}`}
          className={styles.group}
        >
          <div className={styles.groupHeader}>
            <span className={styles.aisleName}>{group.aisleName}</span>
            <span className={styles.separator}>›</span>
            <span className={styles.sectionName}>{group.sectionName}</span>
          </div>
          <div role="list">
            {group.items.map((item) => (
              <ShoppingItem
                key={`${item.name}::${item.unit ?? ''}`}
                item={item}
                checked={isChecked(item)}
                sectionLabel={`${group.aisleName} › ${group.sectionName}`}
                onToggle={onToggleChecked}
              />
            ))}
          </div>
        </div>
      ))}
      {sorted.uncategorized.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.uncategorizedLabel}>未分類</span>
          </div>
          <div role="list">
            {sorted.uncategorized.map((item) => (
              <ShoppingItem
                key={`${item.name}::${item.unit ?? ''}`}
                item={item}
                checked={isChecked(item)}
                onToggle={onToggleChecked}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /** 並べ替えなしのフラットリスト表示 */
  const renderFlatList = () => (
    <div className={styles.flatList} role="list">
      {displayItems.map((item) => (
        <ShoppingItem
          key={`${item.name}::${item.unit ?? ''}`}
          item={item}
          checked={isChecked(item)}
          onToggle={onToggleChecked}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>買い物リスト</h2>
        <button
          type="button"
          className={styles.generateButton}
          onClick={handleGenerate}
        >
          買い物リスト生成
        </button>
      </div>

      {hasShoppingList && totalCount > 0 && (
        <>
          <ProgressBar checkedCount={checkedCount} totalCount={totalCount} />

          {storeLayouts.length > 0 && (
            <div className={styles.layoutSelector}>
              <label htmlFor="store-layout-select" className={styles.layoutLabel}>
                店舗レイアウト
              </label>
              <select
                id="store-layout-select"
                className={styles.layoutSelect}
                value={selectedLayoutId}
                onChange={(e) => handleLayoutChange(e.target.value)}
              >
                <option value="">並べ替えなし</option>
                {storeLayouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {displaySortedList
            ? renderSortedList(displaySortedList)
            : renderFlatList()}

          {checkedCount > 0 && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClearChecks}
            >
              チェックをクリア
            </button>
          )}
        </>
      )}

      {hasShoppingList && totalCount === 0 && (
        <p className={styles.emptyMessage}>買い物リストに材料がありません。</p>
      )}

      {!hasShoppingList && (
        <p className={styles.emptyMessage}>
          献立からリストを生成してください。
        </p>
      )}
    </div>
  );
};
