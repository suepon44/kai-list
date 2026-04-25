import React from 'react';
import styles from './RecipeRanking.module.css';

export interface RecipeRankingProps {
  ranking: { recipeId: string; recipeName: string; count: number }[];
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
}

const MAX_DISPLAY = 10;

export const RecipeRanking: React.FC<RecipeRankingProps> = ({
  ranking,
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

  const top10 = ranking.slice(0, MAX_DISPLAY);

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

      {top10.length === 0 ? (
        <p className={styles.emptyMessage}>データがありません</p>
      ) : (
        <ol className={styles.rankingList} aria-label="レシピランキング">
          {top10.map((item, index) => (
            <li key={item.recipeId} className={styles.rankingItem}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.recipeName}>{item.recipeName}</span>
              <span className={styles.count}>{item.count}回</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
