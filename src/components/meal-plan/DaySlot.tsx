import React from 'react';
import type { Recipe, Weekday } from '../../types';
import styles from './DaySlot.module.css';

/** 曜日キーから日本語ラベルへのマッピング */
const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
};

export interface DaySlotProps {
  day: Weekday;
  recipeIds: string[];
  recipes: Recipe[];
  weekStartDate?: string;
  onAddRecipe: (day: Weekday) => void;
  onRemoveRecipe: (day: Weekday, recipeId: string) => void;
}

/** 曜日キーから月曜日起点のオフセット日数 */
const WEEKDAY_OFFSETS: Record<Weekday, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
};

/** weekStartDate + day offset から実際の日付文字列を計算する */
function computeDate(weekStartDate: string, day: Weekday): string {
  const base = new Date(weekStartDate);
  base.setDate(base.getDate() + WEEKDAY_OFFSETS[day]);
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${m}/${d}`;
}

export const DaySlot: React.FC<DaySlotProps> = ({
  day,
  recipeIds,
  recipes,
  weekStartDate,
  onAddRecipe,
  onRemoveRecipe,
}) => {
  const label = WEEKDAY_LABELS[day];
  const dateLabel = weekStartDate ? computeDate(weekStartDate, day) : null;

  /** recipeId に対応する Recipe を取得する。見つからない場合は undefined */
  const getRecipe = (recipeId: string): Recipe | undefined =>
    recipes.find((r) => r.id === recipeId);

  return (
    <div className={styles.slot} aria-label={`${label}の献立`}>
      <div className={styles.header}>
        <h3 className={styles.dayLabel}>
          {label}
          {dateLabel && <span className={styles.dateLabel}> ({dateLabel})</span>}
        </h3>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => onAddRecipe(day)}
          aria-label={`${label}にレシピを追加`}
        >
          レシピを追加
        </button>
      </div>
      <div className={styles.body}>
        {recipeIds.length === 0 ? (
          <p className={styles.emptyMessage}>レシピ未設定</p>
        ) : (
          <div className={styles.recipeList}>
            {recipeIds.map((recipeId, index) => {
              const recipe = getRecipe(recipeId);
              if (!recipe) return null;
              return (
                <div key={`${recipeId}-${index}`} className={styles.recipeCard}>
                  <div className={styles.recipeHeader}>
                    <span className={styles.recipeName}>{recipe.name}</span>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => onRemoveRecipe(day, recipeId)}
                      aria-label={`${recipe.name}を${label}から削除`}
                    >
                      削除
                    </button>
                  </div>
                  {recipe.ingredients.length > 0 && (
                    <ul className={styles.ingredientList}>
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className={styles.ingredientItem}>
                          {ing.name}
                          {ing.quantity != null && ing.quantity > 0 && ` ${ing.quantity}${ing.unit ?? ''}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
