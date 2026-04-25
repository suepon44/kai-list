import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders label and input', () => {
    render(<TextInput label="料理名" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('料理名')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<TextInput label="料理名" value="カレー" onChange={() => {}} />);
    expect(screen.getByDisplayValue('カレー')).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    render(<TextInput label="料理名" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('料理名'), { target: { value: 'カレー' } });
    expect(onChange).toHaveBeenCalledWith('カレー');
  });

  it('displays an error message', () => {
    render(<TextInput label="料理名" value="" onChange={() => {}} error="料理名を入力してください" />);
    expect(screen.getByRole('alert')).toHaveTextContent('料理名を入力してください');
  });

  it('sets aria-invalid when there is an error', () => {
    render(<TextInput label="料理名" value="" onChange={() => {}} error="エラー" />);
    expect(screen.getByLabelText('料理名')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows required indicator when required', () => {
    render(<TextInput label="料理名" value="" onChange={() => {}} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
