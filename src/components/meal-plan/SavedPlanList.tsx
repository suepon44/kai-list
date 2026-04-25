import React, { useEffect, useRef, useState } from 'react';
import type { SavedMealPlan } from '../../types';
import { ConfirmDialog } from '../common';
import styles from './SavedPlanList.module.css';

export interface SavedPlanListProps {
  open: boolean;
  savedPlans: SavedMealPlan[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/** ISO 8601 日時文字列を「YYYY/MM/DD」形式にフォーマットする */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export const SavedPlanList: React.FC<SavedPlanListProps> = ({
  open,
  savedPlans,
  onLoad,
  onDelete,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
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

  const handleLoad = (id: string) => {
    onLoad(id);
    onClose();
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
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

  const targetPlan = deleteTarget
    ? savedPlans.find((p) => p.id === deleteTarget)
    : null;

  return (
    <>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="saved-plan-list-title"
        onClick={handleBackdropClick}
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 id="saved-plan-list-title" className={styles.title}>
              保存済み献立
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
          <div className={styles.list} role="list">
            {savedPlans.length === 0 ? (
              <p className={styles.emptyMessage}>
                保存済みの献立がありません
              </p>
            ) : (
              savedPlans.map((plan) => (
                <div key={plan.id} className={styles.planItem} role="listitem">
                  <button
                    type="button"
                    className={styles.planInfo}
                    onClick={() => handleLoad(plan.id)}
                    aria-label={`${plan.name}を読み込む`}
                  >
                    <span className={styles.planName}>{plan.name}</span>
                    <span className={styles.planDate}>
                      {formatDate(plan.createdAt)}
                      {plan.weekStartDate && ` ｜ 週開始: ${plan.weekStartDate}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteRequest(plan.id)}
                    aria-label={`${plan.name}を削除`}
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </dialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="献立の削除"
        message={
          targetPlan
            ? `「${targetPlan.name}」を削除しますか？この操作は取り消せません。`
            : ''
        }
        confirmLabel="削除"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </>
  );
};
