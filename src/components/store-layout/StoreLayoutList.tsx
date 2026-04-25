import React, { useState } from 'react';
import type { StoreLayout } from '../../types';
import { ConfirmDialog } from '../common';
import { StoreLayoutEditor } from './StoreLayoutEditor';
import styles from './StoreLayoutList.module.css';

export interface StoreLayoutListProps {
  storeLayouts: StoreLayout[];
  allCategories: string[];
  customCategories: string[];
  onAdd: (storeName: string) => StoreLayout;
  onUpdate: (id: string, layout: StoreLayout) => void;
  onDelete: (id: string) => void;
  onAddCustomCategory: (category: string) => void;
  onDeleteCustomCategory: (category: string) => void;
}

type View = 'list' | 'editor';

export const StoreLayoutList: React.FC<StoreLayoutListProps> = ({
  storeLayouts,
  allCategories,
  customCategories,
  onAdd,
  onUpdate,
  onDelete,
  onAddCustomCategory,
  onDeleteCustomCategory,
}) => {
  const [view, setView] = useState<View>('list');
  const [editingLayout, setEditingLayout] = useState<StoreLayout | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleNewLayout = () => {
    const newLayout = onAdd('');
    setEditingLayout(newLayout);
    setView('editor');
  };

  const handleLayoutClick = (layout: StoreLayout) => {
    setEditingLayout(layout);
    setView('editor');
  };

  const handleSave = (layout: StoreLayout) => {
    onUpdate(layout.id, layout);
    setEditingLayout(null);
    setView('list');
  };

  const handleCancel = () => {
    // If the layout being edited has no store name and no aisles, it was a new empty layout — delete it
    if (
      editingLayout &&
      !editingLayout.storeName &&
      editingLayout.aisles.length === 0
    ) {
      onDelete(editingLayout.id);
    }
    setEditingLayout(null);
    setView('list');
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  if (view === 'editor' && editingLayout) {
    // Get the latest version from the list
    const current =
      storeLayouts.find((l) => l.id === editingLayout.id) ?? editingLayout;
    return (
      <StoreLayoutEditor
        layout={current}
        allCategories={allCategories}
        customCategories={customCategories}
        onSave={handleSave}
        onCancel={handleCancel}
        onAddCustomCategory={onAddCustomCategory}
        onDeleteCustomCategory={onDeleteCustomCategory}
      />
    );
  }

  const deleteTargetLayout = deleteTarget
    ? storeLayouts.find((l) => l.id === deleteTarget)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>店舗レイアウト</h2>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleNewLayout}
        >
          新規店舗
        </button>
      </div>

      {storeLayouts.length === 0 ? (
        <p className={styles.emptyMessage}>
          店舗レイアウトがまだ登録されていません。「新規店舗」ボタンから追加してください。
        </p>
      ) : (
        <div className={styles.list} role="list">
          {storeLayouts.map((layout) => (
            <div
              key={layout.id}
              className={styles.layoutItem}
              role="listitem"
              tabIndex={0}
              onClick={() => handleLayoutClick(layout)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLayoutClick(layout);
                }
              }}
            >
              <span className={styles.storeName}>
                {layout.storeName || '（名称未設定）'}
              </span>
              <span className={styles.aisleCount}>
                通路 {layout.aisles.length}本
              </span>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="店舗レイアウトの削除"
        message={`「${deleteTargetLayout?.storeName || '（名称未設定）'}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  );
};
