import React, { useEffect, useRef } from 'react';
import styles from './DayDetail.module.css';

export interface DayDetailProps {
  dateStr: string | null;
  recipes: { recipeName: string; recipeId: string }[];
  onClose: () => void;
}

/**
 * YYYY-MM-DD 形式の日付文字列を「M月D日」形式に変換する。
 */
function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${month}月${day}日`;
}

export const DayDetail: React.FC<DayDetailProps> = ({
  dateStr,
  recipes,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const open = dateStr !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
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

  const dateLabel = dateStr ? formatDateLabel(dateStr) : '';

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="day-detail-title"
      onClick={handleBackdropClick}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id="day-detail-title" className={styles.title}>
            {dateLabel}の献立
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            閉じる
          </button>
        </div>

        {recipes.length === 0 ? (
          <p className={styles.emptyMessage}>この日の献立はありません</p>
        ) : (
          <ul className={styles.recipeList}>
            {recipes.map((r, i) => (
              <li key={`${r.recipeId}-${i}`} className={styles.recipeItem}>
                {r.recipeName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
};
