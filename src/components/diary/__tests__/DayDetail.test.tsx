import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { DayDetail } from '../DayDetail';

describe('DayDetail', () => {
  // jsdom doesn't implement HTMLDialogElement.showModal/close natively
  beforeAll(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute('open', '');
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.removeAttribute('open');
      };
    }
  });

  const defaultProps = {
    dateStr: '2025-01-15' as string | null,
    recipes: [
      { recipeName: 'カレーライス', recipeId: 'r1' },
      { recipeName: '味噌汁', recipeId: 'r2' },
    ],
    onClose: vi.fn(),
  };

  it('renders date label and recipe list when open', () => {
    render(<DayDetail {...defaultProps} />);
    expect(screen.getByText('1月15日の献立')).toBeInTheDocument();
    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.getByText('味噌汁')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<DayDetail {...defaultProps} />);
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<DayDetail {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows empty message when no recipes', () => {
    render(<DayDetail {...defaultProps} recipes={[]} />);
    expect(screen.getByText('この日の献立はありません')).toBeInTheDocument();
  });

  it('does not show dialog when dateStr is null', () => {
    const { container } = render(
      <DayDetail dateStr={null} recipes={[]} onClose={vi.fn()} />,
    );
    const dialog = container.querySelector('dialog');
    expect(dialog).not.toHaveAttribute('open');
  });
});
