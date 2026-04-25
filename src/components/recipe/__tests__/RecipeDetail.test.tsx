import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeDetail } from '../RecipeDetail';
import type { Recipe } from '../../../types';

const recipe: Recipe = {
  id: '1',
  name: 'カレーライス',
  ingredients: [
    { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
    { name: '牛肉', quantity: 300, unit: 'g', category: '肉類' },
    { name: 'スパイス', quantity: 1, unit: '袋', category: null },
  ],
  source: { type: 'book', bookName: 'きょうの料理', page: 42 },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('RecipeDetail', () => {
  it('displays the recipe name', () => {
    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('カレーライス')).toBeInTheDocument();
  });

  it('displays all ingredients with quantities and categories', () => {
    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('にんじん')).toBeInTheDocument();
    expect(screen.getByText('2 本')).toBeInTheDocument();
    expect(screen.getByText('野菜')).toBeInTheDocument();
    expect(screen.getByText('牛肉')).toBeInTheDocument();
    expect(screen.getByText('300 g')).toBeInTheDocument();
  });

  it('displays "未分類" for ingredients without a category', () => {
    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const badges = screen.getAllByText('未分類');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('displays book source info', () => {
    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('献立本')).toBeInTheDocument();
    expect(screen.getByText('きょうの料理 (p.42)')).toBeInTheDocument();
  });

  it('displays URL source info as a link', () => {
    const urlRecipe: Recipe = {
      ...recipe,
      source: { type: 'url', url: 'https://example.com/recipe' },
    };

    render(
      <RecipeDetail
        recipe={urlRecipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const link = screen.getByText('https://example.com/recipe');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://example.com/recipe',
    );
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('displays "参照元情報なし" when no source', () => {
    const noSourceRecipe: Recipe = { ...recipe, source: undefined };

    render(
      <RecipeDetail
        recipe={noSourceRecipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('参照元情報なし')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();

    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('編集'));
    expect(onEdit).toHaveBeenCalledWith(recipe);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();

    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('削除'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();

    render(
      <RecipeDetail
        recipe={recipe}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBack={onBack}
      />,
    );

    fireEvent.click(screen.getByLabelText('一覧に戻る'));
    expect(onBack).toHaveBeenCalled();
  });
});
