import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  checkedCount: number;
  totalCount: number;
}

/**
 * 購入進捗バー。
 * 「3/8 購入済み」のようにチェック済み/全体の数を表示し、
 * 視覚的なプログレスバーで進捗を示す。
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  checkedCount,
  totalCount,
}) => {
  const percentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <span className={styles.count}>
          {checkedCount}/{totalCount} 購入済み
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={checkedCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={`${checkedCount}/${totalCount} 購入済み`}
      >
        <div
          className={styles.fill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
