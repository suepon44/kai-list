import React, { useState } from 'react';
import type { Recipe } from '../../types';
import type { RecipeInput } from '../../domain/recipe';
import type { ValidationResult } from '../../types';
import { ConfirmDialog } from '../common';
import { RecipeDetail } from './RecipeDetail';
import { RecipeForm } from './RecipeForm';
import styles from './RecipeList.module.css';

export interface RecipeListProps {
  recipes: Recipe[];
  categories: string[];
  onAdd: (input: RecipeInput) => ValidationResult;
  onUpdate: (id: string, input: RecipeInput) => ValidationResult;
  onDelete: (id: string) => void;
}

type View = 'list' | 'detail' | 'form';

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [view, setView] = useState<View>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
  };

  const handleNewRecipe = () => {
    setEditingRecipe(undefined);
    setView('form');
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setView('form');
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
      setSelectedRecipe(undefined);
      setView('list');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleFormSubmit = (input: RecipeInput): ValidationResult => {
    if (editingRecipe) {
      const result = onUpdate(editingRecipe.id, input);
      if (result.valid) {
        setEditingRecipe(undefined);
        setSelectedRecipe(undefined);
        setView('list');
      }
      return result;
    } else {
      const result = onAdd(input);
      if (result.valid) {
        setView('list');
      }
      return result;
    }
  };

  const handleFormCancel = () => {
    setEditingRecipe(undefined);
    if (selectedRecipe) {
      setView('detail');
    } else {
      setView('list');
    }
  };

  const handleBackToList = () => {
    setSelectedRecipe(undefined);
    setView('list');
  };

  if (view === 'form') {
    return (
      <RecipeForm
        recipe={editingRecipe}
        categories={categories}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  if (view === 'detail' && selectedRecipe) {
    // Find the latest version of the recipe from the list
    const current = recipes.find((r) => r.id === selectedRecipe.id) ?? selectedRecipe;
    return (
      <>
        <RecipeDetail
          recipe={current}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onBack={handleBackToList}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          title="レシピの削除"
          message={`「${current.name}」を削除しますか？この操作は取り消せません。`}
          confirmLabel="削除"
          cancelLabel="キャンセル"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          variant="danger"
        />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>レシピ一覧</h2>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleNewRecipe}
        >
          新規レシピ
        </button>
      </div>

      {recipes.length === 0 ? (
        <p className={styles.emptyMessage}>
          レシピがまだ登録されていません。「新規レシピ」ボタンから追加してください。
        </p>
      ) : (
        <div className={styles.list} role="list">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={styles.recipeItem}
              role="listitem"
              tabIndex={0}
              onClick={() => handleRecipeClick(recipe)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRecipeClick(recipe);
                }
              }}
            >
              <span className={styles.recipeName}>{recipe.name}</span>
              <span className={styles.ingredientCount}>
                材料 {recipe.ingredients.length}品
              </span>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null && view === 'list'}
        title="レシピの削除"
        message="このレシピを削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
};
