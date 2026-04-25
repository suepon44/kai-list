import React, { useEffect, useRef, useState } from 'react';
import type { Recipe } from '../../types';
import styles from './RecipeSelector.module.css';

export interface RecipeSelectorProps {
  open: boolean;
  recipes: Recipe[];
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  open,
  recipes,
  onSelect,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setSearch('');
      // Focus search input after dialog opens
      requestAnimationFrame(() => searchRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (recipeId: string) => {
    onSelect(recipeId);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="recipe-selector-title"
      onClick={handleBackdropClick}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id="recipe-selector-title" className={styles.title}>
            レシピを選択
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className={styles.searchField}>
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder="レシピ名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="レシピ検索"
          />
        </div>
        <div className={styles.list} role="list">
          {filteredRecipes.length === 0 ? (
            <p className={styles.emptyMessage}>
              {recipes.length === 0
                ? 'レシピが登録されていません'
                : '該当するレシピがありません'}
            </p>
          ) : (
            filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                className={styles.recipeOption}
                role="listitem"
                onClick={() => handleSelect(recipe.id)}
              >
                <span className={styles.recipeOptionName}>{recipe.name}</span>
                <span className={styles.recipeOptionCount}>
                  材料 {recipe.ingredients.length}品
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </dialog>
  );
};
