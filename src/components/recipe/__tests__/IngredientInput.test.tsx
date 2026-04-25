import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IngredientInput } from '../IngredientInput';
import type { Ingredient } from '../../../types';

const defaultIngredient: Ingredient = {
  name: 'にんじん',
  quantity: 2,
  unit: '本',
  category: '野菜',
};

const categories = ['野菜', '果物', '肉類'];

function getField(id: string) {
  return document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
}

describe('IngredientInput', () => {
  it('renders all input fields for an ingredient', () => {
    render(
      <IngredientInput
        ingredient={defaultIngredient}
        index={0}
        categories={categories}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        canRemove={true}
      />,
    );

    expect(getField('ingredient-name-0')).toHaveValue('にんじん');
    expect(getField('ingredient-quantity-0')).toHaveValue(2);
    expect(getField('ingredient-unit-0')).toHaveValue('本');
    expect(getField('ingredient-category-0')).toHaveValue('野菜');
  });

  it('calls onChange when the name is updated', () => {
    const onChange = vi.fn();

    render(
      <IngredientInput
        ingredient={defaultIngredient}
        index={0}
        categories={categories}
        onChange={onChange}
        onRemove={vi.fn()}
        canRemove={true}
      />,
    );

    fireEvent.change(getField('ingredient-name-0'), {
      target: { value: 'たまねぎ' },
    });

    expect(onChange).toHaveBeenCalledWith(0, {
      ...defaultIngredient,
      name: 'たまねぎ',
    });
  });

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn();

    render(
      <IngredientInput
        ingredient={defaultIngredient}
        index={2}
        categories={categories}
        onChange={vi.fn()}
        onRemove={onRemove}
        canRemove={true}
      />,
    );

    fireEvent.click(screen.getByLabelText('材料 3 を削除'));
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it('does not show remove button when canRemove is false', () => {
    render(
      <IngredientInput
        ingredient={defaultIngredient}
        index={0}
        categories={categories}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        canRemove={false}
      />,
    );

    expect(screen.queryByLabelText('材料 1 を削除')).not.toBeInTheDocument();
  });

  it('sets category to null when "未分類" is selected', () => {
    const onChange = vi.fn();

    render(
      <IngredientInput
        ingredient={defaultIngredient}
        index={0}
        categories={categories}
        onChange={onChange}
        onRemove={vi.fn()}
        canRemove={true}
      />,
    );

    fireEvent.change(getField('ingredient-category-0'), {
      target: { value: '' },
    });

    expect(onChange).toHaveBeenCalledWith(0, {
      ...defaultIngredient,
      category: null,
    });
  });
});
