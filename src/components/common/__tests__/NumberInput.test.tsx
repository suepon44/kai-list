import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NumberInput } from '../NumberInput';

describe('NumberInput', () => {
  it('renders label and input', () => {
    render(<NumberInput label="分量" value={0} onChange={() => {}} />);
    expect(screen.getByLabelText('分量')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<NumberInput label="分量" value={100} onChange={() => {}} />);
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('calls onChange with a number when input changes', () => {
    const onChange = vi.fn();
    render(<NumberInput label="分量" value={0} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('分量'), { target: { value: '250' } });
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it('calls onChange with empty string when input is cleared', () => {
    const onChange = vi.fn();
    render(<NumberInput label="分量" value={100} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('分量'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('displays an error message', () => {
    render(<NumberInput label="分量" value={0} onChange={() => {}} error="分量を入力してください" />);
    expect(screen.getByRole('alert')).toHaveTextContent('分量を入力してください');
  });

  it('sets aria-invalid when there is an error', () => {
    render(<NumberInput label="分量" value={0} onChange={() => {}} error="エラー" />);
    expect(screen.getByLabelText('分量')).toHaveAttribute('aria-invalid', 'true');
  });
});
