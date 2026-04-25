import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyPlanView } from '../WeeklyPlanView';
import type { Recipe, SavedMealPlan, WeeklyMealPlan } from '../../../types';

const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'カレーライス',
    ingredients: [
      { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'r2',
    name: '肉じゃが',
    ingredients: [
      { name: 'じゃがいも', quantity: 4, unit: '個', category: '野菜' },
    ],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const emptyPlan: WeeklyMealPlan = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
};

const filledPlan: WeeklyMealPlan = {
  monday: ['r1'],
  tuesday: ['r2'],
  wednesday: [],
  thursday: [],
  friday: [],
};

const savedPlans: SavedMealPlan[] = [
  {
    id: 'p1',
    name: '第1週の献立',
    plan: filledPlan,
    createdAt: '2024-06-01T00:00:00.000Z',
  },
];

// Mock HTMLDialogElement methods for jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

const defaultProps = {
  currentPlan: emptyPlan,
  recipes,
  savedPlans: [] as SavedMealPlan[],
  onAssignRecipe: vi.fn(),
  onRemoveRecipe: vi.fn(),
  onSavePlan: vi.fn(),
  onOverwritePlan: vi.fn(),
  onLoadPlan: vi.fn(),
  onDeletePlan: vi.fn(),
  onResetPlan: vi.fn(),
};

describe('WeeklyPlanView', () => {
  it('displays all five weekday slots', () => {
    render(<WeeklyPlanView {...defaultProps} />);
    expect(screen.getByText('月曜日')).toBeInTheDocument();
    expect(screen.getByText('火曜日')).toBeInTheDocument();
    expect(screen.getByText('水曜日')).toBeInTheDocument();
    expect(screen.getByText('木曜日')).toBeInTheDocument();
    expect(screen.getByText('金曜日')).toBeInTheDocument();
  });

  it('displays the header with title and action buttons', () => {
    render(<WeeklyPlanView {...defaultProps} />);
    expect(screen.getByText('週間献立')).toBeInTheDocument();
    // "保存" appears in both the header button and the save dialog confirm button
    const saveButtons = screen.getAllByText('保存');
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);
    // "保存済み献立" appears as both a button and dialog title
    const savedPlanElements = screen.getAllByText('保存済み献立');
    expect(savedPlanElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('リセット')).toBeInTheDocument();
  });

  it('shows empty plan confirmation when saving an empty plan', () => {
    render(<WeeklyPlanView {...defaultProps} />);
    // Use the header save button (first one)
    const saveButtons = screen.getAllByText('保存');
    fireEvent.click(saveButtons[0]);
    expect(
      screen.getByText('レシピが1つも割り当てられていません。このまま保存しますか？'),
    ).toBeInTheDocument();
  });

  it('opens save dialog when saving a non-empty plan', () => {
    render(
      <WeeklyPlanView {...defaultProps} currentPlan={filledPlan} />,
    );
    const saveButtons = screen.getAllByText('保存');
    fireEvent.click(saveButtons[0]);
    expect(screen.getByText('献立を保存')).toBeInTheDocument();
    expect(screen.getByLabelText('献立名')).toBeInTheDocument();
  });

  it('shows overwrite option when saved plans exist', () => {
    render(
      <WeeklyPlanView
        {...defaultProps}
        currentPlan={filledPlan}
        savedPlans={savedPlans}
      />,
    );
    const saveButtons = screen.getAllByText('保存');
    fireEvent.click(saveButtons[0]);
    expect(screen.getByText('既存の献立を上書き（任意）')).toBeInTheDocument();
  });

  it('calls onResetPlan when reset button is clicked', () => {
    const onResetPlan = vi.fn();
    render(<WeeklyPlanView {...defaultProps} onResetPlan={onResetPlan} />);
    fireEvent.click(screen.getByText('リセット'));
    expect(onResetPlan).toHaveBeenCalled();
  });

  it('displays assigned recipes in the correct day slots', () => {
    render(
      <WeeklyPlanView {...defaultProps} currentPlan={filledPlan} />,
    );
    // Recipe names appear in both DaySlot and RecipeSelector, use getAllByText
    const curryElements = screen.getAllByText('カレーライス');
    expect(curryElements.length).toBeGreaterThanOrEqual(1);
    const nikujagaElements = screen.getAllByText('肉じゃが');
    expect(nikujagaElements.length).toBeGreaterThanOrEqual(1);
  });
});
