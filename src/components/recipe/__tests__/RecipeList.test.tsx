import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeList } from '../RecipeList';
import type { Recipe } from '../../../types';

const recipes: Recipe[] = [
  {
    id: '1',
    name: 'カレーライス',
    ingredients: [
      { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
      { name: '牛肉', quantity: 300, unit: 'g', category: '肉類' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: '肉じゃが',
    ingredients: [
      { name: 'じゃがいも', quantity: 4, unit: '個', category: '野菜' },
    ],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const categories = ['野菜', '果物', '肉類'];

describe('RecipeList', () => {
  it('displays all recipes with name and ingredient count', () => {
    render(
      <RecipeList
        recipes={recipes}
        categories={categories}
        onAdd={vi.fn(() => ({ valid: true, errors: [] }))}
        onUpdate={vi.fn(() => ({ valid: true, errors: [] }))}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.getByText('材料 2品')).toBeInTheDocument();
    expect(screen.getByText('肉じゃが')).toBeInTheDocument();
    expect(screen.getByText('材料 1品')).toBeInTheDocument();
  });

  it('shows empty message when no recipes exist', () => {
    render(
      <RecipeList
        recipes={[]}
        categories={categories}
        onAdd={vi.fn(() => ({ valid: true, errors: [] }))}
        onUpdate={vi.fn(() => ({ valid: true, errors: [] }))}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/レシピがまだ登録されていません/),
    ).toBeInTheDocument();
  });

  it('shows the "新規レシピ" button', () => {
    render(
      <RecipeList
        recipes={recipes}
        categories={categories}
        onAdd={vi.fn(() => ({ valid: true, errors: [] }))}
        onUpdate={vi.fn(() => ({ valid: true, errors: [] }))}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('新規レシピ')).toBeInTheDocument();
  });

  it('navigates to form view when "新規レシピ" is clicked', () => {
    render(
      <RecipeList
        recipes={recipes}
        categories={categories}
        onAdd={vi.fn(() => ({ valid: true, errors: [] }))}
        onUpdate={vi.fn(() => ({ valid: true, errors: [] }))}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('新規レシピ'));
    expect(screen.getByText('登録')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('navigates to detail view when a recipe is clicked', () => {
    render(
      <RecipeList
        recipes={recipes}
        categories={categories}
        onAdd={vi.fn(() => ({ valid: true, errors: [] }))}
        onUpdate={vi.fn(() => ({ valid: true, errors: [] }))}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('カレーライス'));
    // Detail view should show edit and delete buttons
    expect(screen.getByText('編集')).toBeInTheDocument();
    // Use getAllByText since ConfirmDialog also has a "削除" button
    const deleteButtons = screen.getAllByText('削除');
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });
});
