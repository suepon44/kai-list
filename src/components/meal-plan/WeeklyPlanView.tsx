import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ExtraItem, Recipe, SavedMealPlan, Weekday, WeeklyMealPlan } from '../../types';
import { isMealPlanEmpty } from '../../domain/meal-plan';
import { ConfirmDialog } from '../common';
import { DaySlot } from './DaySlot';
import { ExtraItemsSection } from './ExtraItemsSection';
import { RecipeSelector } from './RecipeSelector';
import { SavedPlanList } from './SavedPlanList';
import styles from './WeeklyPlanView.module.css';

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
  const [planName, setPlanName] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [overwriteId, setOverwriteId] = useState<string>('');
  const [saveError, setSaveError] = useState('');
  const saveDialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
    if (isMealPlanEmpty(currentPlan)) {
      setEmptyConfirmOpen(true);
      return;
    }
    openSaveDialog();
  }, [currentPlan]);

  const openSaveDialog = () => {
    setPlanName('');
    setWeekStartDate('');
    setOverwriteId('');
    setSaveError('');
    setSaveDialogOpen(true);
  };

  useEffect(() => {
    const dialog = saveDialogRef.current;
    if (!dialog) return;

    if (saveDialogOpen && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => nameInputRef.current?.focus());
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

    const trimmed = planName.trim();
    if (!trimmed) {
      setSaveError('献立名を入力してください');
      return;
    }

    onSavePlan(trimmed, weekStartDate || undefined);
    setSaveDialogOpen(false);
  }, [planName, weekStartDate, overwriteId, onSavePlan, onOverwritePlan]);

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
                  if (e.target.value) {
                    setSaveError('');
                  }
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

          {!overwriteId && (
            <div className={styles.saveDialogField}>
              <label htmlFor="plan-name-input" className={styles.saveDialogLabel}>
                献立名
              </label>
              <input
                ref={nameInputRef}
                id="plan-name-input"
                type="text"
                className={styles.saveDialogInput}
                value={planName}
                onChange={(e) => {
                  setPlanName(e.target.value);
                  setSaveError('');
                }}
                placeholder="例: 第1週の献立"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveConfirm();
                  }
                }}
              />
              {saveError && (
                <span className={styles.saveDialogError}>{saveError}</span>
              )}
            </div>
          )}

          <div className={styles.saveDialogField}>
            <label htmlFor="week-start-date-input" className={styles.saveDialogLabel}>
              週の開始日（任意）
            </label>
            <input
              id="week-start-date-input"
              type="date"
              className={styles.saveDialogInput}
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>

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
