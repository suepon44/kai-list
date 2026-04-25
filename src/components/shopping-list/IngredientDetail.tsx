import React, { useState } from 'react';
import type { Weekday } from '../../types';
import styles from './IngredientDetail.module.css';

/** 曜日キーから短縮日本語ラベルへのマッピング */
const WEEKDAY_SHORT_LABELS: Record<Weekday, string> = {
  monday: '月',
  tuesday: '火',
  wednesday: '水',
  thursday: '木',
  friday: '金',
};

export interface IngredientSource {
  day: Weekday;
  recipeName: string;
  quantity?: number;
}

export interface IngredientDetailProps {
  sources: IngredientSource[];
  unit?: string;
}

/**
 * 材料の使用元内訳を展開表示するコンポーネント。
 * どのレシピ（曜日・料理名）でこの材料が使われるかを表示する。
 */
export const IngredientDetail: React.FC<IngredientDetailProps> = ({
  sources,
  unit,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? '内訳を閉じる' : '内訳を表示'}
      >
        {expanded ? '▲ 内訳を閉じる' : '▼ 内訳を表示'}
      </button>
      {expanded && (
        <ul className={styles.sourceList}>
          {sources.map((source, index) => (
            <li key={index} className={styles.sourceItem}>
              <span className={styles.day}>
                {WEEKDAY_SHORT_LABELS[source.day]}
              </span>
              <span className={styles.recipeName}>{source.recipeName}</span>
              <span className={styles.quantity}>
                {source.quantity != null ? source.quantity : ''}{unit ?? ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
