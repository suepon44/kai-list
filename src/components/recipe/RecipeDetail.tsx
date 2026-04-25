import React from 'react';
import type { Recipe } from '../../types';
import styles from './RecipeDetail.module.css';

export interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onEdit,
  onDelete,
  onBack,
}) => {
  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="一覧に戻る"
        >
          ← 戻る
        </button>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => onEdit(recipe)}
          >
            編集
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(recipe.id)}
          >
            削除
          </button>
        </div>
      </div>

      <h2 className={styles.title}>{recipe.name}</h2>

      <section>
        <h3 className={styles.sectionTitle}>材料（4人分）</h3>
        <table className={styles.ingredientTable}>
          <thead>
            <tr>
              <th>材料名</th>
              <th>分量</th>
              <th>カテゴリ</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients.map((ing, index) => (
              <tr key={index}>
                <td>{ing.name}</td>
                <td>
                  {[ing.quantity != null ? ing.quantity : null, ing.unit].filter(v => v != null && v !== '').join(' ') || '—'}
                </td>
                <td>
                  {ing.category ? (
                    <span className={styles.categoryBadge}>{ing.category}</span>
                  ) : (
                    <span className={styles.categoryBadge}>未分類</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>参照元</h3>
        {recipe.source ? (
          <div className={styles.sourceInfo}>
            {recipe.source.type === 'book' && (
              <>
                <span className={styles.sourceLabel}>献立本</span>
                <span className={styles.sourceValue}>
                  {recipe.source.bookName}
                  {recipe.source.page != null && ` (p.${recipe.source.page})`}
                </span>
              </>
            )}
            {recipe.source.type === 'url' && (
              <>
                <span className={styles.sourceLabel}>URL</span>
                <a
                  href={recipe.source.url}
                  className={styles.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {recipe.source.url}
                </a>
              </>
            )}
          </div>
        ) : (
          <p className={styles.noSource}>参照元情報なし</p>
        )}
      </section>
    </div>
  );
};
