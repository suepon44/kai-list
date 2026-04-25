import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavedPlanList } from '../SavedPlanList';
import type { SavedMealPlan } from '../../../types';

const savedPlans: SavedMealPlan[] = [
  {
    id: 'p1',
    name: '第1週の献立',
    plan: {
      monday: ['r1'],
      tuesday: [],
      wednesday: ['r2'],
      thursday: [],
      friday: [],
    },
    createdAt: '2024-06-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    name: '第2週の献立',
    plan: {
      monday: [],
      tuesday: ['r1'],
      wednesday: [],
      thursday: ['r3'],
      friday: [],
    },
    createdAt: '2024-06-08T00:00:00.000Z',
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

describe('SavedPlanList', () => {
  it('displays saved plan names and dates', () => {
    render(
      <SavedPlanList
        open={true}
        savedPlans={savedPlans}
        onLoad={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('第1週の献立')).toBeInTheDocument();
    expect(screen.getByText('2024/06/01')).toBeInTheDocument();
    expect(screen.getByText('第2週の献立')).toBeInTheDocument();
    expect(screen.getByText('2024/06/08')).toBeInTheDocument();
  });

  it('calls onLoad and onClose when a plan is clicked', () => {
    const onLoad = vi.fn();
    const onClose = vi.fn();
    render(
      <SavedPlanList
        open={true}
        savedPlans={savedPlans}
        onLoad={onLoad}
        onDelete={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByLabelText('第1週の献立を読み込む'));
    expect(onLoad).toHaveBeenCalledWith('p1');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <SavedPlanList
        open={true}
        savedPlans={savedPlans}
        onLoad={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('第1週の献立を削除'));
    expect(screen.getByText(/「第1週の献立」を削除しますか/)).toBeInTheDocument();
  });

  it('shows empty message when no saved plans exist', () => {
    render(
      <SavedPlanList
        open={true}
        savedPlans={[]}
        onLoad={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('保存済みの献立がありません')).toBeInTheDocument();
  });
});
