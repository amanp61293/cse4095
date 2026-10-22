import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../app/App';
import { loadPractice } from '../storage/practiceStorage';

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/settings');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.pushState({}, '', '/');
});
describe('settings', () => {
  it('saves preferences and restores them from localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('checkbox', { name: /show explanations/i }),
    );
    await user.click(screen.getByRole('checkbox', { name: /sound effects/i }));
    await user.selectOptions(screen.getByLabelText('Default difficulty'), '4');
    await user.selectOptions(
      screen.getByLabelText('Default session length'),
      '5',
    );
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    expect(loadPractice().settings.showExplanations).toBe(false);
    expect(loadPractice().settings.soundEffectsEnabled).toBe(false);
    expect(loadPractice().settings.defaultDifficulty).toBe(4);
    expect(loadPractice().settings.defaultSessionLength).toBe(5);
  });
  it('requires confirmation before deleting application data', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await user.click(
      screen.getByRole('button', { name: 'Clear All Application Data' }),
    );
    expect(confirm).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument();
  });
});
