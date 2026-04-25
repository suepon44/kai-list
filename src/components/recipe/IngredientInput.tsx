import React, { useState, useRef, useEffect } from 'react';
import type { Ingredient } from '../../types';
import type { SelectOption } from '../common';
import { TextInput, NumberInput, Select } from '../common';
import styles from './IngredientInput.module.css';

export interface IngredientInputProps {
  ingredient: Ingredient;
  index: number;
  categories: string[];
  onChange: (index: number, ingredient: Ingredient) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  suggestions?: string[];
  onQueryChange?: (query: string) => void;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredient,
  index,
  categories,
  onChange,
  onRemove,
  canRemove,
  suggestions = [],
  onQueryChange,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const categoryOptions: SelectOption[] = [
    { value: '', label: '未分類' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const handleNameChange = (value: string) => {
    onChange(index, { ...ingredient, name: value });
    onQueryChange?.(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (name: string) => {
    onChange(index, { ...ingredient, name });
    onQueryChange?.('');
    setShowSuggestions(false);
  };

  const handleNameBlur = () => {
    // Small delay so click on suggestion registers before hiding
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleNameFocus = () => {
    if (ingredient.name.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleQuantityChange = (value: number | '') => {
    onChange(index, { ...ingredient, quantity: value === '' ? undefined : value });
  };

  const handleUnitChange = (value: string) => {
    onChange(index, { ...ingredient, unit: value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    onChange(index, { ...ingredient, category: value || null });
  };

  const visibleSuggestions = suggestions.slice(0, 5);

  return (
    <div className={styles.row} role="group" aria-label={`材料 ${index + 1}`}>
      <div className={styles.nameField}>
        <div
          className={styles.nameFieldWrapper}
          onBlur={handleNameBlur}
          onFocus={handleNameFocus}
        >
          <TextInput
            label="材料名"
            value={ingredient.name}
            onChange={handleNameChange}
            placeholder="例: にんじん"
            required
            id={`ingredient-name-${index}`}
          />
          {showSuggestions && visibleSuggestions.length > 0 && (
            <ul
              className={styles.suggestionList}
              role="listbox"
              aria-label="材料名の候補"
            >
              {visibleSuggestions.map((name) => (
                <li
                  key={name}
                  className={styles.suggestionItem}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur before click
                    handleSuggestionClick(name);
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={styles.quantityField}>
        <NumberInput
          label="分量"
          value={ingredient.quantity ?? ''}
          onChange={handleQuantityChange}
          placeholder="2"
          min={0}
          step={0.1}
          id={`ingredient-quantity-${index}`}
        />
      </div>
      <div className={styles.unitField}>
        <TextInput
          label="単位"
          value={ingredient.unit ?? ''}
          onChange={handleUnitChange}
          placeholder="本"
          id={`ingredient-unit-${index}`}
        />
      </div>
      <div className={styles.categoryField}>
        <Select
          label="カテゴリ"
          value={ingredient.category ?? ''}
          onChange={handleCategoryChange}
          options={categoryOptions}
          id={`ingredient-category-${index}`}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => onRemove(index)}
          aria-label={`材料 ${index + 1} を削除`}
        >
          ✕
        </button>
      )}
    </div>
  );
};
