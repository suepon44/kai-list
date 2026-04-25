import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeSelector } from '../RecipeSelector';
import type { Recipe } from '../../../types';

const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'カレーライス',
    ingredients: [
      { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
      { name: '牛肉', quantity: 300, unit: 'g', category: '肉類' },
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
  {
    id: 'r3',
    name: 'サラダ',
    ingredients: [
      { name: 'レタス', quantity: 1, unit: '個', category: '野菜' },
    ],
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
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

describe('RecipeSelector', () => {
  it('displays all recipes when open', () => {
    render(
      <RecipeSelector
        open={true}
        recipes={recipes}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.getByText('肉じゃが')).toBeInTheDocument();
    expect(screen.getByText('サラダ')).toBeInTheDocument();
  });

  it('filters recipes by search text', () => {
    render(
      <RecipeSelector
        open={true}
        recipes={recipes}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const searchInput = screen.getByPlaceholderText('レシピ名で検索...');
    fireEvent.change(searchInput, { target: { value: 'カレー' } });

    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.queryByText('肉じゃが')).not.toBeInTheDocument();
    expect(screen.queryByText('サラダ')).not.toBeInTheDocument();
  });

  it('calls onSelect and onClose when a recipe is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <RecipeSelector
        open={true}
        recipes={recipes}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText('肉じゃが'));
    expect(onSelect).toHaveBeenCalledWith('r2');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty message when no recipes match search', () => {
    render(
      <RecipeSelector
        open={true}
        recipes={recipes}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const searchInput = screen.getByPlaceholderText('レシピ名で検索...');
    fireEvent.change(searchInput, { target: { value: 'ラーメン' } });

    expect(screen.getByText('該当するレシピがありません')).toBeInTheDocument();
  });

  it('shows empty message when no recipes exist', () => {
    render(
      <RecipeSelector
        open={true}
        recipes={[]}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('レシピが登録されていません')).toBeInTheDocument();
  });
});
