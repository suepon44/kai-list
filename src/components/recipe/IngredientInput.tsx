import React from 'react';
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
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredient,
  index,
  categories,
  onChange,
  onRemove,
  canRemove,
}) => {
  const categoryOptions: SelectOption[] = [
    { value: '', label: '未分類' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const handleNameChange = (value: string) => {
    onChange(index, { ...ingredient, name: value });
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

  return (
    <div className={styles.row} role="group" aria-label={`材料 ${index + 1}`}>
      <div className={styles.nameField}>
        <TextInput
          label="材料名"
          value={ingredient.name}
          onChange={handleNameChange}
          placeholder="例: にんじん"
          required
          id={`ingredient-name-${index}`}
        />
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
