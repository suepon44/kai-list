import React from 'react';
import type { Aisle, Section } from '../../types';
import { SectionEditor } from './SectionEditor';
import styles from './AisleEditor.module.css';

export interface AisleEditorProps {
  aisle: Aisle;
  allCategories: string[];
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (updated: Aisle) => void;
  onDelete: () => void;
}

export const AisleEditor: React.FC<AisleEditorProps> = ({
  aisle,
  allCategories,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChange,
  onDelete,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...aisle, name: e.target.value });
  };

  const handleSectionChange = (index: number, updated: Section) => {
    const newSections = aisle.sections.map((s, i) =>
      i === index ? updated : s,
    );
    onChange({ ...aisle, sections: newSections });
  };

  const handleSectionDelete = (index: number) => {
    const newSections = aisle.sections.filter((_, i) => i !== index);
    // Re-assign order values
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    onChange({ ...aisle, sections: reordered });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: '',
      categories: [],
      order: aisle.sections.length,
    };
    onChange({ ...aisle, sections: [...aisle.sections, newSection] });
  };

  return (
    <div className={styles.aisle}>
      <div className={styles.aisleHeader}>
        <span className={styles.orderBadge} aria-label={`巡回順序 ${aisle.order + 1}`}>
          {aisle.order + 1}
        </span>

        <div className={styles.aisleNameInput}>
          <input
            type="text"
            value={aisle.name}
            onChange={handleNameChange}
            placeholder="通路名"
            aria-label="通路名"
          />
        </div>

        <div className={styles.reorderButtons}>
          <button
            type="button"
            className={styles.reorderButton}
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="上に移動"
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.reorderButton}
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="下に移動"
          >
            ▼
          </button>
        </div>

        <button
          type="button"
          className={styles.deleteAisleButton}
          onClick={onDelete}
          aria-label={`通路「${aisle.name || '無名'}」を削除`}
        >
          削除
        </button>
      </div>

      <p className={styles.sectionsLabel}>セクション</p>

      {aisle.sections.length > 0 && (
        <div className={styles.sectionsList}>
          {aisle.sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              allCategories={allCategories}
              onChange={(updated) => handleSectionChange(index, updated)}
              onDelete={() => handleSectionDelete(index)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className={styles.addSectionButton}
        onClick={handleAddSection}
      >
        ＋ セクションを追加
      </button>
    </div>
  );
};
