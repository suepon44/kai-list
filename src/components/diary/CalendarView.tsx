import React from 'react';
import styles from './CalendarView.module.css';

export interface CalendarViewProps {
  selectedMonth: { year: number; month: number };
  dateRecipeMap: Map<string, { recipeName: string; recipeId: string }[]>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
}

/** 日〜土の曜日ヘッダー */
const WEEKDAY_HEADERS = ['日', '月', '火', '水', '木', '金', '土'];

/** 数値を2桁ゼロ埋めする */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD 形式の日付文字列を返す */
function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

interface CalendarDay {
  year: number;
  month: number;
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
}

/**
 * 指定月のカレンダーグリッド用の日付配列を生成する。
 * 前月末・翌月初の日付も含め、7の倍数になるよう調整する。
 */
function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDow = firstDay.getDay(); // 0=Sunday

  const days: CalendarDay[] = [];

  // 前月の日を埋める
  if (startDow > 0) {
    const prevLastDay = new Date(year, month - 1, 0);
    const prevDaysInMonth = prevLastDay.getDate();
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevDaysInMonth - i;
      days.push({
        year: prevYear,
        month: prevMonth,
        day: d,
        dateStr: formatDateStr(prevYear, prevMonth, d),
        isCurrentMonth: false,
      });
    }
  }

  // 当月の日
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      year,
      month,
      day: d,
      dateStr: formatDateStr(year, month, d),
      isCurrentMonth: true,
    });
  }

  // 翌月の日を埋める（7の倍数になるまで）
  const remainder = days.length % 7;
  if (remainder > 0) {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const fill = 7 - remainder;
    for (let d = 1; d <= fill; d++) {
      days.push({
        year: nextYear,
        month: nextMonth,
        day: d,
        dateStr: formatDateStr(nextYear, nextMonth, d),
        isCurrentMonth: false,
      });
    }
  }

  return days;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedMonth,
  dateRecipeMap,
  onPreviousMonth,
  onNextMonth,
  onDayClick,
}) => {
  const { year, month } = selectedMonth;
  const days = buildCalendarDays(year, month);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navButton}
          onClick={onPreviousMonth}
          aria-label="前月"
        >
          ←
        </button>
        <h2 className={styles.monthLabel}>
          {year}年{month}月
        </h2>
        <button
          type="button"
          className={styles.navButton}
          onClick={onNextMonth}
          aria-label="翌月"
        >
          →
        </button>
      </div>

      <div className={styles.weekdayRow} role="row">
        {WEEKDAY_HEADERS.map((label) => (
          <div key={label} className={styles.weekdayCell} role="columnheader">
            {label}
          </div>
        ))}
      </div>

      <div className={styles.grid} role="grid" aria-label={`${year}年${month}月のカレンダー`}>
        {days.map((d) => {
          const recipes = dateRecipeMap.get(d.dateStr) ?? [];
          const hasRecipes = recipes.length > 0;
          const maxDisplay = 2;

          return (
            <button
              key={d.dateStr}
              type="button"
              className={`${styles.dayCell} ${!d.isCurrentMonth ? styles.outside : ''}`}
              onClick={() => onDayClick(d.dateStr)}
              aria-label={`${d.month}月${d.day}日${hasRecipes ? `、${recipes.length}件のレシピ` : ''}`}
            >
              <div className={styles.dayNumber}>
                {d.day}
                {hasRecipes && <span className={styles.recipeIndicator} />}
              </div>
              {recipes.slice(0, maxDisplay).map((r, i) => (
                <span key={`${r.recipeId}-${i}`} className={styles.recipeName}>
                  {r.recipeName}
                </span>
              ))}
              {recipes.length > maxDisplay && (
                <span className={styles.moreLabel}>
                  +{recipes.length - maxDisplay} more
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
