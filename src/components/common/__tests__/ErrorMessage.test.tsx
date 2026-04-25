import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="料理名を入力してください" />);
    expect(screen.getByText('料理名を入力してください')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="エラーです" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with a custom id', () => {
    render(<ErrorMessage message="エラー" id="name-error" />);
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'name-error');
  });
});
