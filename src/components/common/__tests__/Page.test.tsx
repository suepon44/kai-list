import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Page } from '../Page';

describe('Page', () => {
  it('renders children content', () => {
    render(<Page><p>テストコンテンツ</p></Page>);
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('renders as a main landmark', () => {
    render(<Page><p>内容</p></Page>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
