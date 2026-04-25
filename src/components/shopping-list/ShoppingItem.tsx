import React from 'react';
import type { AggregatedIngredient } from '../../types';
import { IngredientDetail } from './IngredientDetail';
import styles from './ShoppingItem.module.css';

export interface ShoppingItemProps {
  item: AggregatedIngredient;
  checked: boolean;
  sectionLabel?: string;
  onToggle: (ingredientKey: string) => void;
}

/**
 * 個別の買い物材料アイテム。
 * チェックトグル、材料名、合計分量、セクションラベル、
 * 展開可能な使用元内訳を表示する。
 */
export const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  checked,
  sectionLabel,
  onToggle,
}) => {
  const ingredientKey = `${item.name}::${item.unit ?? ''}`;

  return (
    <div
      className={`${styles.item} ${checked ? styles.checked : ''}`}
      role="listitem"
    >
      <button
        type="button"
        className={styles.toggleArea}
        onClick={() => onToggle(ingredientKey)}
        aria-label={`${item.name}を${checked ? '未購入に戻す' : '購入済みにする'}`}
        aria-pressed={checked}
      >
        <span className={styles.checkbox}>
          {checked ? '✓' : ''}
        </span>
        <span className={styles.info}>
          <span className={styles.nameRow}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.quantity}>
              {item.totalQuantity != null ? item.totalQuantity : ''}{item.unit ?? ''}
            </span>
          </span>
          {sectionLabel && (
            <span className={styles.sectionLabel}>{sectionLabel}</span>
          )}
        </span>
      </button>
      <IngredientDetail sources={item.sources} unit={item.unit} />
    </div>
  );
};
