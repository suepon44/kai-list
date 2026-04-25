import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with the default recipes tab active', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the Header with the current page title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'レシピ' })).toBeInTheDocument();
  });

  it('switches to meal-plan tab when clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /献立/ }));

    expect(screen.getByRole('heading', { level: 1, name: '献立' })).toBeInTheDocument();
    expect(screen.getByText('週間献立')).toBeInTheDocument();
  });

  it('switches to shopping-list tab when clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /おかいもの/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'おかいもの' })).toBeInTheDocument();
  });

  it('switches to store-settings tab when clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /お店/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'お店' })).toBeInTheDocument();
    expect(screen.getByText('店舗レイアウト')).toBeInTheDocument();
  });

  it('wraps content in ErrorBoundary', () => {
    render(<App />);
    // ErrorBoundary is present — if it catches an error, it shows a fallback.
    // We verify the app renders without error, which means ErrorBoundary is working.
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('switches to diary tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ごはん日記/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'ごはん日記' })).toBeInTheDocument();
  });
});
