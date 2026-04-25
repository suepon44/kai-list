import React from 'react';
import styles from './StaleRecipes.module.css';

export interface StaleRecipesProps {
  staleRecipes: { recipeId: string; recipeName: string; lastUsedDate: string | null }[];
}

/**
 * YYYY-MM-DD → YYYY/MM/DD に変換する。
 */
function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '/');
}

export const StaleRecipes: React.FC<StaleRecipesProps> = ({ staleRecipes }) => {
  if (staleRecipes.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>レシピがありません</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.recipeList} aria-label="最近作ってないレシピ">
        {staleRecipes.map((item) => (
          <li key={item.recipeId} className={styles.recipeItem}>
            <span className={styles.recipeName}>{item.recipeName}</span>
            {item.lastUsedDate === null ? (
              <span className={styles.unusedBadge}>未使用</span>
            ) : (
              <span className={styles.lastUsedDate}>
                {formatDate(item.lastUsedDate)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
