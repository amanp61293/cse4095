import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppTitle } from './AppTitle';

describe('AppTitle', () => {
  it('renders the default title', () => {
    render(<AppTitle />);
    expect(screen.getByRole('heading', { name: 'Math Practice' })).toBeInTheDocument();
  });

  it('accepts a custom title', () => {
    render(<AppTitle title="Numbers Are Fun" />);
    expect(screen.getByRole('heading', { name: 'Numbers Are Fun' })).toBeInTheDocument();
  });
});
