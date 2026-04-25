import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeForm } from '../RecipeForm';
import type { Recipe } from '../../../types';

const categories = ['野菜', '果物', '肉類'];

describe('RecipeForm', () => {
  it('renders an empty form for new recipe', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/料理名/)).toHaveValue('');
    expect(screen.getByText('登録')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('pre-fills form when editing an existing recipe', () => {
    const recipe: Recipe = {
      id: '1',
      name: 'カレーライス',
      ingredients: [
        { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
      ],
      source: { type: 'book', bookName: 'きょうの料理', page: 42 },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    render(
      <RecipeForm
        recipe={recipe}
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/料理名/)).toHaveValue('カレーライス');
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({
          valid: false,
          errors: ['料理名を入力してください'],
        }))}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('登録'));
    expect(screen.getByText('料理名を入力してください')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('can add ingredient rows', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    // Initially one ingredient row (no remove button since only one)
    expect(screen.queryByLabelText('材料 1 を削除')).not.toBeInTheDocument();

    // Add a second ingredient
    fireEvent.click(screen.getByText('＋ 材料を追加'));
    expect(screen.getByLabelText('材料 1 を削除')).toBeInTheDocument();
    expect(screen.getByLabelText('材料 2 を削除')).toBeInTheDocument();
  });

  it('can remove ingredient rows', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    // Add a second ingredient then remove it
    fireEvent.click(screen.getByText('＋ 材料を追加'));
    fireEvent.click(screen.getByLabelText('材料 2 を削除'));
    expect(screen.queryByLabelText('材料 2 を削除')).not.toBeInTheDocument();
  });

  it('shows source fields when book type is selected', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('献立本'));
    expect(screen.getByLabelText('本の名前')).toBeInTheDocument();
    expect(screen.getByLabelText('ページ')).toBeInTheDocument();
  });

  it('shows URL field when URL type is selected', () => {
    render(
      <RecipeForm
        categories={categories}
        onSubmit={vi.fn(() => ({ valid: true, errors: [] }))}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('URL'));
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
  });
});
