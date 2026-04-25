import React, { useState } from 'react';
import type { Recipe, Ingredient, RecipeSource } from '../../types';
import type { RecipeInput } from '../../domain/recipe';
import { validateRecipe } from '../../domain/recipe';
import { TextInput, NumberInput, ErrorMessage } from '../common';
import { IngredientInput } from './IngredientInput';
import styles from './RecipeForm.module.css';

export interface RecipeFormProps {
  recipe?: Recipe;
  categories: string[];
  onSubmit: (input: RecipeInput) => { valid: boolean; errors: string[] };
  onCancel: () => void;
  getSuggestions?: (query: string) => string[];
}

function createEmptyIngredient(): Ingredient {
  return { name: '', category: null };
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  categories,
  onSubmit,
  onCancel,
  getSuggestions,
}) => {
  const [name, setName] = useState(recipe?.name ?? '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [createEmptyIngredient()],
  );
  const [sourceType, setSourceType] = useState<'none' | 'book' | 'url'>(
    recipe?.source?.type ?? 'none',
  );
  const [bookName, setBookName] = useState(recipe?.source?.bookName ?? '');
  const [page, setPage] = useState<number | ''>(recipe?.source?.page ?? '');
  const [url, setUrl] = useState(recipe?.source?.url ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const [suggestionQueries, setSuggestionQueries] = useState<Record<number, string>>({});

  const handleQueryChange = (index: number, query: string) => {
    setSuggestionQueries((prev) => ({ ...prev, [index]: query }));
  };

  const handleIngredientChange = (index: number, updated: Ingredient) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? updated : ing)));
  };

  const handleIngredientRemove = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, createEmptyIngredient()]);
  };

  const buildSource = (): RecipeSource | undefined => {
    if (sourceType === 'book' && bookName.trim()) {
      return {
        type: 'book',
        bookName: bookName.trim(),
        page: page === '' ? undefined : page,
      };
    }
    if (sourceType === 'url' && url.trim()) {
      return { type: 'url', url: url.trim() };
    }
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const input: RecipeInput = {
      name: name.trim(),
      ingredients: ingredients.filter(
        (ing) => ing.name.trim() !== '',
      ),
      source: buildSource(),
    };

    // Client-side pre-validation for better UX
    const validation = validateRecipe(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const result = onSubmit(input);
    if (!result.valid) {
      setErrors(result.errors);
    }
  };

  const isEditing = !!recipe;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextInput
        label="料理名"
        value={name}
        onChange={setName}
        placeholder="例: カレーライス"
        required
        autoFocus
        id="recipe-name"
      />

      <section>
        <h3 className={styles.sectionTitle}>材料（4人分）</h3>
        <div className={styles.ingredientsList}>
          {ingredients.map((ingredient, index) => (
            <IngredientInput
              key={index}
              ingredient={ingredient}
              index={index}
              categories={categories}
              onChange={handleIngredientChange}
              onRemove={handleIngredientRemove}
              canRemove={ingredients.length > 1}
              suggestions={getSuggestions?.(suggestionQueries[index] ?? '')}
              onQueryChange={(query) => handleQueryChange(index, query)}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddIngredient}
        >
          ＋ 材料を追加
        </button>
      </section>

      <section className={styles.sourceSection}>
        <h3 className={styles.sectionTitle}>参照元（任意）</h3>
        <div className={styles.sourceTypeToggle} role="group" aria-label="参照元タイプ">
          <button
            type="button"
            className={`${styles.sourceTypeButton} ${sourceType === 'none' ? styles.active : ''}`}
            onClick={() => setSourceType('none')}
            aria-pressed={sourceType === 'none'}
          >
            なし
          </button>
          <button
            type="button"
            className={`${styles.sourceTypeButton} ${sourceType === 'book' ? styles.active : ''}`}
            onClick={() => setSourceType('book')}
            aria-pressed={sourceType === 'book'}
          >
            献立本
          </button>
          <button
            type="button"
            className={`${styles.sourceTypeButton} ${sourceType === 'url' ? styles.active : ''}`}
            onClick={() => setSourceType('url')}
            aria-pressed={sourceType === 'url'}
          >
            URL
          </button>
        </div>

        {sourceType === 'book' && (
          <div className={styles.sourceFields}>
            <div className={styles.bookFields}>
              <div className={styles.bookNameField}>
                <TextInput
                  label="本の名前"
                  value={bookName}
                  onChange={setBookName}
                  placeholder="例: きょうの料理"
                  id="source-book-name"
                />
              </div>
              <div className={styles.pageField}>
                <NumberInput
                  label="ページ"
                  value={page}
                  onChange={setPage}
                  placeholder="42"
                  min={1}
                  step={1}
                  id="source-page"
                />
              </div>
            </div>
          </div>
        )}

        {sourceType === 'url' && (
          <div className={styles.sourceFields}>
            <TextInput
              label="URL"
              value={url}
              onChange={setUrl}
              placeholder="https://example.com/recipe"
              id="source-url"
            />
          </div>
        )}
      </section>

      {errors.length > 0 && (
        <ul className={styles.errorList} aria-label="入力エラー">
          {errors.map((error, i) => (
            <li key={i}>
              <ErrorMessage message={error} />
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className={styles.submitButton}>
          {isEditing ? '更新' : '登録'}
        </button>
      </div>
    </form>
  );
};
