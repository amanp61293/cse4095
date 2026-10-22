import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../app/App';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); window.history.pushState({}, '', '/'); });

async function openSetup() {
  window.history.pushState({}, '', '/practice/setup');
  render(<App />);
  return userEvent.setup();
}

describe('Phase 3 practice setup', () => {
  it('displays operation, difficulty and length options with defaults', async () => {
    await openSetup();
    expect(screen.getByRole('heading', { name: 'Choose Your Practice' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /addition/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /level 2: easy/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /10 questions/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /past mistakes/i })).toBeDisabled();
  });

  it('allows mixed operations and choosing a single difficulty and length', async () => {
    const user = await openSetup();
    await user.click(screen.getByRole('button', { name: /clear all/i }));
    await user.click(screen.getByRole('button', { name: /select all/i }));
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(4);
    await user.click(screen.getByRole('radio', { name: /level 4: advanced/i }));
    expect(screen.getByRole('radio', { name: /level 4: advanced/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /level 2: easy/i })).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: /continuous practice/i }));
    expect(screen.getByRole('radio', { name: /continuous practice/i })).toBeChecked();
  });

  it('blocks sessions with no operations and shows guidance', async () => {
    const user = await openSetup();
    await user.click(screen.getByRole('button', { name: /clear all/i }));
    expect(screen.getByRole('button', { name: /start session/i })).toBeDisabled();
    expect(screen.getByText('Choose at least one operation to start.')).toBeInTheDocument();
  });

  it('passes selected configuration to the session route', async () => {
    const user = await openSetup();
    await user.click(screen.getByRole('button', { name: /clear all/i }));
    await user.click(screen.getByRole('checkbox', { name: /addition/i }));
    await user.click(screen.getByRole('checkbox', { name: /division/i }));
    await user.click(screen.getByRole('radio', { name: /level 3: intermediate/i }));
    await user.click(screen.getByRole('radio', { name: /5 questions/i }));
    await user.click(screen.getByRole('button', { name: /start session/i }));
    expect(await screen.findByRole('heading', { name: 'Math Practice' })).toBeInTheDocument();
    expect(screen.getByText(/addition, division/i)).toBeInTheDocument();
    expect(screen.getByText(/level 3/i)).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
  });

  it('asks for setup when session is opened directly', () => {
    window.history.pushState({}, '', '/practice/session');
    render(<App />);
    expect(screen.getByRole('heading', { name: /set up your practice first/i })).toBeInTheDocument();
  });
});
