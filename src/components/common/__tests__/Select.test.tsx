import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

const options = [
  { value: 'vegetable', label: '野菜' },
  { value: 'meat', label: '肉類' },
  { value: 'fish', label: '魚介類' },
];

describe('Select', () => {
  it('renders label and select element', () => {
    render(<Select label="カテゴリ" value="" onChange={() => {}} options={options} />);
    expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="カテゴリ" value="" onChange={() => {}} options={options} />);
    expect(screen.getByText('野菜')).toBeInTheDocument();
    expect(screen.getByText('肉類')).toBeInTheDocument();
    expect(screen.getByText('魚介類')).toBeInTheDocument();
  });

  it('renders a placeholder option', () => {
    render(
      <Select label="カテゴリ" value="" onChange={() => {}} options={options} placeholder="選択してください" />
    );
    expect(screen.getByText('選択してください')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<Select label="カテゴリ" value="" onChange={onChange} options={options} />);
    fireEvent.change(screen.getByLabelText('カテゴリ'), { target: { value: 'meat' } });
    expect(onChange).toHaveBeenCalledWith('meat');
  });

  it('displays an error message', () => {
    render(
      <Select label="カテゴリ" value="" onChange={() => {}} options={options} error="カテゴリを選択してください" />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('カテゴリを選択してください');
  });

  it('sets aria-invalid when there is an error', () => {
    render(
      <Select label="カテゴリ" value="" onChange={() => {}} options={options} error="エラー" />
    );
    expect(screen.getByLabelText('カテゴリ')).toHaveAttribute('aria-invalid', 'true');
  });
});
