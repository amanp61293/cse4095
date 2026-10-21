import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import App from './App';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

describe('Phase 2 navigation', () => {
  it('shows the home page and three primary actions', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Math Practice' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /start practice/i }),
    ).toHaveAttribute('href', '/practice/setup');
    expect(
      screen.getByRole('link', { name: /view statistics/i }),
    ).toHaveAttribute('href', '/statistics');
    expect(
      screen
        .getAllByRole('link', { name: /^settings$/i })
        .some((link) => link.getAttribute('href') === '/settings'),
    ).toBe(true);
  });
  it('renders the fallback on an unknown route', () => {
    window.history.pushState({}, '', '/unknown-location');
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument();
  });
});
