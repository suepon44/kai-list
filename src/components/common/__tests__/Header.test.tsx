import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '../Header';

describe('Header', () => {
  it('renders the title text', () => {
    render(<Header title="レシピ" />);
    expect(screen.getByText('レシピ')).toBeInTheDocument();
  });

  it('renders as a banner landmark', () => {
    render(<Header title="テスト" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders an h1 element', () => {
    render(<Header title="買い物リスト" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('買い物リスト');
  });
});
