import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DaySlot } from '../DaySlot';
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
];

describe('DaySlot', () => {
  it('displays the Japanese weekday label', () => {
    render(
      <DaySlot
        day="monday"
        recipeIds={[]}
        recipes={recipes}
        onAddRecipe={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />,
    );
    expect(screen.getByText('月曜日')).toBeInTheDocument();
  });

  it('shows empty message when no recipes are assigned', () => {
    render(
      <DaySlot
        day="tuesday"
        recipeIds={[]}
        recipes={recipes}
        onAddRecipe={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />,
    );
    expect(screen.getByText('レシピ未設定')).toBeInTheDocument();
  });

  it('displays assigned recipe names and ingredients', () => {
    render(
      <DaySlot
        day="wednesday"
        recipeIds={['r1']}
        recipes={recipes}
        onAddRecipe={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />,
    );
    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.getByText(/にんじん/)).toBeInTheDocument();
    expect(screen.getByText(/牛肉/)).toBeInTheDocument();
  });

  it('displays multiple recipes per day', () => {
    render(
      <DaySlot
        day="thursday"
        recipeIds={['r1', 'r2']}
        recipes={recipes}
        onAddRecipe={vi.fn()}
        onRemoveRecipe={vi.fn()}
      />,
    );
    expect(screen.getByText('カレーライス')).toBeInTheDocument();
    expect(screen.getByText('肉じゃが')).toBeInTheDocument();
  });

  it('calls onAddRecipe with the correct day when add button is clicked', () => {
    const onAddRecipe = vi.fn();
    render(
      <DaySlot
        day="friday"
        recipeIds={[]}
        recipes={recipes}
        onAddRecipe={onAddRecipe}
        onRemoveRecipe={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('レシピを追加'));
    expect(onAddRecipe).toHaveBeenCalledWith('friday');
  });

  it('calls onRemoveRecipe when remove button is clicked', () => {
    const onRemoveRecipe = vi.fn();
    render(
      <DaySlot
        day="monday"
        recipeIds={['r1']}
        recipes={recipes}
        onAddRecipe={vi.fn()}
        onRemoveRecipe={onRemoveRecipe}
      />,
    );
    fireEvent.click(screen.getByLabelText('カレーライスを月曜日から削除'));
    expect(onRemoveRecipe).toHaveBeenCalledWith('monday', 'r1');
  });
});
