import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalendarView } from '../CalendarView';

describe('CalendarView', () => {
  const defaultProps = {
    selectedMonth: { year: 2025, month: 1 },
    dateRecipeMap: new Map<string, { recipeName: string; recipeId: string }[]>(),
    onPreviousMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onDayClick: vi.fn(),
  };

  it('renders month/year header', () => {
    render(<CalendarView {...defaultProps} />);
    expect(screen.getByText('2025年1月')).toBeInTheDocument();
  });

  it('renders day-of-week headers', () => {
    render(<CalendarView {...defaultProps} />);
    for (const label of ['日', '月', '火', '水', '木', '金', '土']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders navigation buttons', () => {
    render(<CalendarView {...defaultProps} />);
    expect(screen.getByRole('button', { name: '前月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '翌月' })).toBeInTheDocument();
  });

  it('calls onPreviousMonth when ← is clicked', () => {
    const onPreviousMonth = vi.fn();
    render(<CalendarView {...defaultProps} onPreviousMonth={onPreviousMonth} />);
    fireEvent.click(screen.getByRole('button', { name: '前月' }));
    expect(onPreviousMonth).toHaveBeenCalledOnce();
  });

  it('calls onNextMonth when → is clicked', () => {
    const onNextMonth = vi.fn();
    render(<CalendarView {...defaultProps} onNextMonth={onNextMonth} />);
    fireEvent.click(screen.getByRole('button', { name: '翌月' }));
    expect(onNextMonth).toHaveBeenCalledOnce();
  });

  it('renders day cells for the selected month', () => {
    render(<CalendarView {...defaultProps} />);
    // January 2025 has 31 days — each day should have a button with aria-label
    for (let d = 1; d <= 31; d++) {
      expect(
        screen.getByRole('button', { name: new RegExp(`1月${d}日`) }),
      ).toBeInTheDocument();
    }
  });

  it('calls onDayClick with YYYY-MM-DD format when a day is clicked', () => {
    const onDayClick = vi.fn();
    render(<CalendarView {...defaultProps} onDayClick={onDayClick} />);
    // Click on January 15
    const btn = screen.getByRole('button', { name: /1月15日/ });
    fireEvent.click(btn);
    expect(onDayClick).toHaveBeenCalledWith('2025-01-15');
  });

  it('displays recipe names on days with recipes', () => {
    const dateRecipeMap = new Map([
      ['2025-01-10', [
        { recipeName: 'カレーライス', recipeId: 'r1' },
      ]],
    ]);
    render(<CalendarView {...defaultProps} dateRecipeMap={dateRecipeMap} />);
    expect(screen.getByText('カレーライス')).toBeInTheDocument();
  });

  it('shows recipe indicator dot on days with recipes', () => {
    const dateRecipeMap = new Map([
      ['2025-01-10', [
        { recipeName: 'カレーライス', recipeId: 'r1' },
      ]],
    ]);
    const { container } = render(
      <CalendarView {...defaultProps} dateRecipeMap={dateRecipeMap} />,
    );
    // The day cell for Jan 10 should have a recipe indicator
    const indicators = container.querySelectorAll('[class*="recipeIndicator"]');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('shows "+N more" when more than 2 recipes on a day', () => {
    const dateRecipeMap = new Map([
      ['2025-01-20', [
        { recipeName: 'レシピA', recipeId: 'r1' },
        { recipeName: 'レシピB', recipeId: 'r2' },
        { recipeName: 'レシピC', recipeId: 'r3' },
      ]],
    ]);
    render(<CalendarView {...defaultProps} dateRecipeMap={dateRecipeMap} />);
    expect(screen.getByText('レシピA')).toBeInTheDocument();
    expect(screen.getByText('レシピB')).toBeInTheDocument();
    expect(screen.queryByText('レシピC')).not.toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('dims days outside the current month', () => {
    const { container } = render(<CalendarView {...defaultProps} />);
    // January 2025 starts on Wednesday, so there should be outside days (Sun-Tue of first week)
    const outsideCells = container.querySelectorAll('[class*="outside"]');
    expect(outsideCells.length).toBeGreaterThan(0);
  });
});
