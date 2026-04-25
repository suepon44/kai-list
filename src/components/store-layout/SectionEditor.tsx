import React from 'react';
import type { Section } from '../../types';
import styles from './SectionEditor.module.css';

export interface SectionEditorProps {
  section: Section;
  allCategories: string[];
  onChange: (updated: Section) => void;
  onDelete: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  allCategories,
  onChange,
  onDelete,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, name: e.target.value });
  };

  const handleCategoryToggle = (category: string) => {
    const isSelected = section.categories.includes(category);
    const updatedCategories = isSelected
      ? section.categories.filter((c) => c !== category)
      : [...section.categories, category];
    onChange({ ...section, categories: updatedCategories });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNameInput}>
          <input
            type="text"
            value={section.name}
            onChange={handleNameChange}
            placeholder="セクション名"
            aria-label="セクション名"
          />
        </div>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label={`セクション「${section.name || '無名'}」を削除`}
        >
          削除
        </button>
      </div>

      <div>
        <p className={styles.categoryLabel}>商品カテゴリ</p>
        <div className={styles.categoryList} role="group" aria-label="カテゴリ選択">
          {allCategories.map((category) => {
            const isSelected = section.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                className={`${styles.categoryChip} ${isSelected ? styles.categoryChipSelected : ''}`}
                onClick={() => handleCategoryToggle(category)}
                aria-pressed={isSelected}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
