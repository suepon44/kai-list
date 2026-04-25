import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ExtraItem, Recipe, SavedMealPlan, Weekday, WeeklyMealPlan } from '../../types';
import { isMealPlanEmpty } from '../../domain/meal-plan';
import { ConfirmDialog } from '../common';
import { DaySlot } from './DaySlot';
import { ExtraItemsSection } from './ExtraItemsSection';
import { RecipeSelector } from './RecipeSelector';
import { SavedPlanList } from './SavedPlanList';
import styles from './WeeklyPlanView.module.css';

/** 日付から「○月第○週（○/○-○/○）」形式の献立名を自動生成する */
function generatePlanName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // 第何週かを計算（1日〜7日=第1週、8日〜14日=第2週、...）
  const weekNum = Math.ceil(day / 7);
  // 金曜日の日付を計算（+4日）
  const friday = new Date(date);
  friday.setDate(friday.getDate() + 4);
  const friMonth = friday.getMonth() + 1;
  const friDay = friday.getDate();
  return `${month}月第${weekNum}週（${month}/${day}-${friMonth}/${friDay}）`;
}

/** 今日の日付から直近の月曜日を YYYY-MM-DD で返す */
function getThisMonday(): string {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // Monday offset
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

export interface WeeklyPlanViewProps {
  currentPlan: WeeklyMealPlan;
  recipes: Recipe[];
  savedPlans: SavedMealPlan[];
  extraItems: ExtraItem[];
  extraItemsHistory: ExtraItem[];
  allCategories: string[];
  onAssignRecipe: (day: Weekday, recipeId: string) => void;
  onRemoveRecipe: (day: Weekday, recipeId: string) => void;
  onSavePlan: (name: string, weekStartDate?: string) => void;
  onOverwritePlan: (id: string) => void;
  onLoadPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onResetPlan: () => void;
  onAddExtraItem: (name: string, category: string | null) => void;
  onRemoveExtraItem: (index: number) => void;
  onClearExtraItems: () => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  currentPlan,
  recipes,
  savedPlans,
  extraItems,
  extraItemsHistory,
  allCategories,
  onAssignRecipe,
  onRemoveRecipe,
  onSavePlan,
  onOverwritePlan,
  onLoadPlan,
  onDeletePlan,
  onResetPlan,
  onAddExtraItem,
  onRemoveExtraItem,
  onClearExtraItems,
}) => {
  // Recipe selector state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorDay, setSelectorDay] = useState<Weekday>('monday');

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [overwriteId, setOverwriteId] = useState<string>('');
  const saveDialogRef = useRef<HTMLDialogElement>(null);

  // Saved plan list state
  const [savedListOpen, setSavedListOpen] = useState(false);

  // Current week start date (set when saving or loading a plan)
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string>('');

  // Empty plan confirmation state
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);

  // --- Recipe selector handlers ---
  const handleAddRecipe = useCallback((day: Weekday) => {
    setSelectorDay(day);
    setSelectorOpen(true);
  }, []);

  const handleSelectRecipe = useCallback(
    (recipeId: string) => {
      onAssignRecipe(selectorDay, recipeId);
    },
    [selectorDay, onAssignRecipe]
  );

  // --- Save dialog handlers ---
  const handleSaveClick = useCallback(() => {
    if (isMealPlanEmpty(currentPlan) && extraItems.length === 0) {
      setEmptyConfirmOpen(true);
      return;
    }

    if (savedPlans.length > 0) {
      // Show dialog to choose overwrite or new
      setOverwriteId('');
      setSaveDialogOpen(true);
    } else {
      // No saved plans, save directly
      const weekStart = currentWeekStartDate || getThisMonday();
      const autoName = generatePlanName(weekStart);
      onSavePlan(autoName, weekStart);
    }
  }, [currentPlan, extraItems, savedPlans, currentWeekStartDate, onSavePlan]);

  const openSaveDialog = () => {
    setOverwriteId('');
    setSaveDialogOpen(true);
  };

  useEffect(() => {
    const dialog = saveDialogRef.current;
    if (!dialog) return;

    if (saveDialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!saveDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [saveDialogOpen]);

  useEffect(() => {
    const dialog = saveDialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      setSaveDialogOpen(false);
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, []);

  const handleSaveDialogBackdrop = (
    e: React.MouseEvent<HTMLDialogElement>
  ) => {
    if (e.target === saveDialogRef.current) {
      setSaveDialogOpen(false);
    }
  };

  const handleSaveConfirm = useCallback(() => {
    if (overwriteId) {
      onOverwritePlan(overwriteId);
      setSaveDialogOpen(false);
      return;
    }

    // Auto-generate name from date
    const weekStart = currentWeekStartDate || getThisMonday();
    const autoName = generatePlanName(weekStart);
    onSavePlan(autoName, weekStart);
    setSaveDialogOpen(false);
  }, [overwriteId, currentWeekStartDate, onSavePlan, onOverwritePlan]);

  // --- Empty plan confirmation handlers ---
  const handleEmptyConfirm = useCallback(() => {
    setEmptyConfirmOpen(false);
    openSaveDialog();
  }, []);

  const handleEmptyCancel = useCallback(() => {
    setEmptyConfirmOpen(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>週間献立</h2>
        <div className={styles.headerActions}>
          <input
            type="date"
            className={styles.weekStartDateInput}
            value={currentWeekStartDate}
            onChange={(e) => setCurrentWeekStartDate(e.target.value)}
            aria-label="週の開始日"
            title="週の開始日"
          />
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetPlan}
          >
            リセット
          </button>
          <button
            type="button"
            className={styles.savedButton}
            onClick={() => setSavedListOpen(true)}
          >
            保存済み献立
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveClick}
          >
            保存
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((day) => (
          <DaySlot
            key={day}
            day={day}
            recipeIds={currentPlan[day]}
            recipes={recipes}
            weekStartDate={currentWeekStartDate || undefined}
            onAddRecipe={handleAddRecipe}
            onRemoveRecipe={onRemoveRecipe}
          />
        ))}
      </div>

      {/* Extra items section */}
      <ExtraItemsSection
        extraItems={extraItems}
        history={extraItemsHistory}
        categories={allCategories}
        onAddItem={onAddExtraItem}
        onRemoveItem={onRemoveExtraItem}
        onClearItems={onClearExtraItems}
      />

      {/* Recipe selector dialog */}
      <RecipeSelector
        open={selectorOpen}
        recipes={recipes}
        onSelect={handleSelectRecipe}
        onClose={() => setSelectorOpen(false)}
      />

      {/* Saved plan list dialog */}
      <SavedPlanList
        open={savedListOpen}
        savedPlans={savedPlans}
        onLoad={onLoadPlan}
        onDelete={onDeletePlan}
        onClose={() => setSavedListOpen(false)}
      />

      {/* Save dialog */}
      <dialog
        ref={saveDialogRef}
        className={styles.saveDialog}
        aria-labelledby="save-dialog-title"
        onClick={handleSaveDialogBackdrop}
      >
        <div className={styles.saveDialogContent}>
          <h2 id="save-dialog-title" className={styles.saveDialogTitle}>
            献立を保存
          </h2>

          {savedPlans.length > 0 && (
            <div className={styles.overwriteSection}>
              <label
                htmlFor="overwrite-select"
                className={styles.overwriteLabel}
              >
                既存の献立を上書き（任意）
              </label>
              <select
                id="overwrite-select"
                className={styles.overwriteSelect}
                value={overwriteId}
                onChange={(e) => {
                  setOverwriteId(e.target.value);
                }}
              >
                <option value="">新規保存</option>
                {savedPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.saveDialogActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setSaveDialogOpen(false)}
            >
              キャンセル
            </button>
            <button
              type="button"
              className={styles.confirmSaveButton}
              onClick={handleSaveConfirm}
            >
              {overwriteId ? '上書き保存' : '保存'}
            </button>
          </div>
        </div>
      </dialog>

      {/* Empty plan confirmation */}
      <ConfirmDialog
        open={emptyConfirmOpen}
        title="空の献立"
        message="レシピが1つも割り当てられていません。このまま保存しますか？"
        confirmLabel="保存する"
        cancelLabel="キャンセル"
        onConfirm={handleEmptyConfirm}
        onCancel={handleEmptyCancel}
        variant="warning"
      />
    </div>
  );
};
