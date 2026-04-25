import React from 'react';
import styles from './CategoryBalance.module.css';

export interface CategoryBalanceProps {
  balance: { category: string; count: number; percentage: number }[];
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
}

/** カテゴリごとの色パレット（循環使用） */
const PALETTE = [
  '#4caf50',
  '#ff9800',
  '#2196f3',
  '#e91e63',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#607d8b',
  '#8bc34a',
  '#ffc107',
];

function getColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export const CategoryBalance: React.FC<CategoryBalanceProps> = ({
  balance,
  dateRange,
  onDateRangeChange,
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    if (!start) {
      onDateRangeChange(null);
      return;
    }
    onDateRangeChange({ start, end: dateRange?.end ?? start });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value;
    if (!end) {
      onDateRangeChange(null);
      return;
    }
    onDateRangeChange({ start: dateRange?.start ?? end, end });
  };

  const handleReset = () => {
    onDateRangeChange(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.dateFilter}>
        <input
          type="date"
          className={styles.dateInput}
          value={dateRange?.start ?? ''}
          onChange={handleStartChange}
          aria-label="開始日"
        />
        <span className={styles.dateSeparator}>〜</span>
        <input
          type="date"
          className={styles.dateInput}
          value={dateRange?.end ?? ''}
          onChange={handleEndChange}
          aria-label="終了日"
        />
        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          全期間
        </button>
      </div>

      {balance.length === 0 ? (
        <p className={styles.emptyMessage}>データがありません</p>
      ) : (
        <ul className={styles.chartList} aria-label="カテゴリバランス">
          {balance.map((item, index) => (
            <li key={item.category} className={styles.chartItem}>
              <div className={styles.chartHeader}>
                <span className={styles.categoryName}>{item.category}</span>
                <span className={styles.chartStats}>
                  {item.count}回 ({item.percentage}%)
                </span>
              </div>
              <div
                className={styles.barTrack}
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.category}: ${item.percentage}%`}
              >
                <div
                  className={styles.barFill}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: getColor(index),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
