import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navigation, NAV_ITEMS } from '../Navigation';

describe('Navigation', () => {
  it('renders all navigation tabs', () => {
    render(<Navigation activeTab="recipes" onTabChange={() => {}} />);
    for (const item of NAV_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('marks the active tab with aria-current', () => {
    render(<Navigation activeTab="meal-plan" onTabChange={() => {}} />);
    const activeButton = screen.getByText('献立').closest('button');
    expect(activeButton).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tabs with aria-current', () => {
    render(<Navigation activeTab="recipes" onTabChange={() => {}} />);
    const inactiveButton = screen.getByText('献立').closest('button');
    expect(inactiveButton).not.toHaveAttribute('aria-current');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<Navigation activeTab="recipes" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('おかいもの'));
    expect(onTabChange).toHaveBeenCalledWith('shopping-list');
  });

  it('renders a navigation landmark', () => {
    render(<Navigation activeTab="recipes" onTabChange={() => {}} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
