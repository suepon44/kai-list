import React, { useCallback, useState } from 'react';
import type { ExtraItem } from '../../types';
import styles from './ExtraItemsSection.module.css';

export interface ExtraItemsSectionProps {
  /** 現在の調味料・日用品リスト */
  extraItems: ExtraItem[];
  /** 過去に追加したアイテムの履歴 */
  history: ExtraItem[];
  /** 利用可能なカテゴリ一覧 */
  categories: string[];
  /** アイテム追加 */
  onAddItem: (name: string, category: string | null) => void;
  /** アイテム削除（インデックス指定） */
  onRemoveItem: (index: number) => void;
  /** 全アイテムクリア */
  onClearItems: () => void;
}

/**
 * 調味料・日用品セクション。
 * レシピに含まれない追加アイテムを週間献立に登録するためのUI。
 */
export const ExtraItemsSection: React.FC<ExtraItemsSectionProps> = ({
  extraItems,
  history,
  categories,
  onAddItem,
  onRemoveItem,
  onClearItems,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleAdd = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddItem(trimmed, category || null);
    setName('');
  }, [name, category, onAddItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAdd();
      }
    },
    [handleAdd],
  );

  const handleAddFromHistory = useCallback(
    (item: ExtraItem) => {
      onAddItem(item.name, item.category);
    },
    [onAddItem],
  );

  // 履歴から現在のリストに既に含まれているアイテムを除外
  const availableHistory = history.filter(
    (h) => !extraItems.some((e) => e.name === h.name),
  );

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>🧴 調味料・日用品</h3>
        {extraItems.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearItems}
          >
            クリア
          </button>
        )}
      </div>

      <div className={styles.body}>
        {/* 入力行 */}
        <div className={styles.inputRow}>
          <input
            type="text"
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="アイテム名を入力"
            aria-label="調味料・日用品のアイテム名"
          />
          <select
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="カテゴリ"
          >
            <option value="">未分類</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAdd}
          >
            追加
          </button>
        </div>

        {/* アイテムリスト */}
        {extraItems.length > 0 ? (
          <div className={styles.itemList} role="list">
            {extraItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className={styles.item}
                role="listitem"
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.category && (
                    <span className={styles.itemCategory}>{item.category}</span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemoveItem(index)}
                  aria-label={`${item.name}を削除`}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>
            レシピ以外の買い物アイテムを追加できます
          </p>
        )}

        {/* 履歴セクション */}
        {availableHistory.length > 0 && (
          <div className={styles.historySection}>
            <button
              type="button"
              className={styles.historyToggle}
              onClick={() => setHistoryOpen((prev) => !prev)}
            >
              {historyOpen ? '履歴を閉じる' : '履歴から追加'}
            </button>
            {historyOpen && (
              <div className={styles.historyList} role="list">
                {availableHistory.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={styles.historyItem}
                    onClick={() => handleAddFromHistory(item)}
                    role="listitem"
                    aria-label={`${item.name}を追加`}
                  >
                    {item.name}
                    {item.category ? ` (${item.category})` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
