import React, { useState } from 'react';
import { CalendarView } from './CalendarView';
import { DayDetail } from './DayDetail';
import { RecipeRanking } from './RecipeRanking';
import { CategoryBalance } from './CategoryBalance';
import { StaleRecipes } from './StaleRecipes';
import styles from './DiaryPage.module.css';

export interface DiaryPageProps {
  dateRecipeMap: Map<string, { recipeName: string; recipeId: string }[]>;
  recipeRanking: { recipeId: string; recipeName: string; count: number }[];
  categoryBalance: { category: string; count: number; percentage: number }[];
  staleRecipes: { recipeId: string; recipeName: string; lastUsedDate: string | null }[];
  selectedMonth: { year: number; month: number };
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  dateRange: { start: string; end: string } | null;
  setDateRange: (range: { start: string; end: string } | null) => void;
}

type SubTab = 'calendar' | 'ranking' | 'balance' | 'stale';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'calendar', label: 'カレンダー' },
  { id: 'ranking', label: 'ランキング' },
  { id: 'balance', label: 'バランス' },
  { id: 'stale', label: '最近作ってない' },
];

export const DiaryPage: React.FC<DiaryPageProps> = ({
  dateRecipeMap,
  recipeRanking,
  categoryBalance,
  staleRecipes,
  selectedMonth,
  goToPreviousMonth,
  goToNextMonth,
  dateRange,
  setDateRange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
  };

  const selectedDayRecipes = selectedDay
    ? dateRecipeMap.get(selectedDay) ?? []
    : [];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'calendar':
        return (
          <CalendarView
            selectedMonth={selectedMonth}
            dateRecipeMap={dateRecipeMap}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onDayClick={handleDayClick}
          />
        );
      case 'ranking':
        return (
          <RecipeRanking
            ranking={recipeRanking}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        );
      case 'balance':
        return (
          <CategoryBalance
            balance={categoryBalance}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        );
      case 'stale':
        return <StaleRecipes staleRecipes={staleRecipes} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabBar} role="tablist" aria-label="ごはん日記タブ">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`${styles.tab} ${activeSubTab === tab.id ? styles.tabActive : ''}`}
            aria-selected={activeSubTab === tab.id}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent} role="tabpanel">
        {renderContent()}
      </div>

      <DayDetail
        dateStr={selectedDay}
        recipes={selectedDayRecipes}
        onClose={handleCloseDayDetail}
      />
    </div>
  );
};
