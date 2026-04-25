import React, { useState } from 'react';
import type { StoreLayout, Aisle } from '../../types';
import { validateStoreLayout } from '../../hooks/useStoreLayout';
import { TextInput, ErrorMessage } from '../common';
import { AisleEditor } from './AisleEditor';
import styles from './StoreLayoutEditor.module.css';

export interface StoreLayoutEditorProps {
  layout: StoreLayout;
  allCategories: string[];
  customCategories: string[];
  onSave: (layout: StoreLayout) => void;
  onCancel: () => void;
  onAddCustomCategory: (category: string) => void;
  onDeleteCustomCategory: (category: string) => void;
}

export const StoreLayoutEditor: React.FC<StoreLayoutEditorProps> = ({
  layout,
  allCategories,
  customCategories,
  onSave,
  onCancel,
  onAddCustomCategory,
  onDeleteCustomCategory,
}) => {
  const [storeName, setStoreName] = useState(layout.storeName);
  const [aisles, setAisles] = useState<Aisle[]>(layout.aisles);
  const [errors, setErrors] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const handleAisleChange = (index: number, updated: Aisle) => {
    setAisles((prev) => prev.map((a, i) => (i === index ? updated : a)));
  };

  const handleAisleDelete = (index: number) => {
    setAisles((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((a, i) => ({ ...a, order: i }));
    });
  };

  const handleAddAisle = () => {
    const newAisle: Aisle = {
      id: crypto.randomUUID(),
      name: '',
      order: aisles.length,
      sections: [],
    };
    setAisles((prev) => [...prev, newAisle]);
  };

  const handleMoveAisle = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= aisles.length) return;

    setAisles((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((a, i) => ({ ...a, order: i }));
    });
  };

  const handleSave = () => {
    setErrors([]);

    const updatedLayout: StoreLayout = {
      ...layout,
      storeName: storeName.trim(),
      aisles,
    };

    const validation = validateStoreLayout(updatedLayout);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(updatedLayout);
  };

  const handleAddCustomCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    onAddCustomCategory(trimmed);
    setNewCategory('');
  };

  const handleCustomCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomCategory();
    }
  };

  return (
    <div className={styles.editor}>
      <TextInput
        label="店舗名"
        value={storeName}
        onChange={setStoreName}
        placeholder="例: イオン○○店"
        required
        autoFocus
        id="store-name"
      />

      <section>
        <h3 className={styles.sectionTitle}>通路</h3>

        {aisles.length > 0 && (
          <div className={styles.aislesList}>
            {aisles.map((aisle, index) => (
              <AisleEditor
                key={aisle.id}
                aisle={aisle}
                allCategories={allCategories}
                isFirst={index === 0}
                isLast={index === aisles.length - 1}
                onMoveUp={() => handleMoveAisle(index, 'up')}
                onMoveDown={() => handleMoveAisle(index, 'down')}
                onChange={(updated) => handleAisleChange(index, updated)}
                onDelete={() => handleAisleDelete(index)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          className={styles.addAisleButton}
          onClick={handleAddAisle}
        >
          ＋ 通路を追加
        </button>
      </section>

      <section className={styles.customCategorySection}>
        <h3 className={styles.sectionTitle}>カスタムカテゴリを追加</h3>
        <div className={styles.customCategoryForm}>
          <div className={styles.customCategoryInput}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={handleCustomCategoryKeyDown}
              placeholder="新しいカテゴリ名"
              aria-label="新しいカテゴリ名"
            />
          </div>
          <button
            type="button"
            className={styles.customCategoryAddButton}
            onClick={handleAddCustomCategory}
          >
            追加
          </button>
        </div>

        {customCategories.length > 0 && (
          <div className={styles.customCategoryList}>
            {customCategories.map((category) => (
              <span key={category} className={styles.customCategoryChip}>
                {category}
                <button
                  type="button"
                  className={styles.customCategoryRemove}
                  onClick={() => onDeleteCustomCategory(category)}
                  aria-label={`カテゴリ「${category}」を削除`}
                >
                  ×
                </button>
              </span>
            ))}
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
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          キャンセル
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
        >
          保存
        </button>
      </div>
    </div>
  );
};
