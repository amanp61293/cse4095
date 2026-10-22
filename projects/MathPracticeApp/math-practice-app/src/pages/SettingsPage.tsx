import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  loadPractice,
  saveSettings,
  clearApplicationData,
} from '../storage/practiceStorage';
import type { AppSettings } from '../types/settings';
import type { MathOperation } from '../types/question';

const OPERATIONS: MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
];
export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(
    () => loadPractice().settings,
  );
  const [message, setMessage] = useState('');
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      saveSettings(settings) ? 'Settings saved.' : 'Unable to save settings.',
    );
  }
  function clear() {
    if (
      !window.confirm(
        'Clear ALL Math Practice data, including settings, history, and mistakes?',
      )
    )
      return;
    if (clearApplicationData()) {
      setSettings(loadPractice().settings);
      setMessage('All application data cleared.');
      navigate('/');
    } else setMessage('Unable to clear application data.');
  }
  return (
    <section className="panel settings-page">
      <p className="eyebrow">Make it your own</p>
      <h1>Settings</h1>
      <form onSubmit={save} className="settings-form">
        {(
          [
            ['soundEffectsEnabled', 'Sound effects'],
            ['cardAnimationEnabled', 'Card animations'],
            ['showExplanations', 'Show explanations'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="setting-row">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) =>
                setSettings({ ...settings, [key]: e.target.checked })
              }
            />
          </label>
        ))}
        <label className="setting-row">
          Default session length
          <select
            value={settings.defaultSessionLength}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultSessionLength:
                  e.target.value === 'continuous'
                    ? 'continuous'
                    : (Number(e.target.value) as 5 | 10 | 20),
              })
            }
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={20}>20 questions</option>
            <option value="continuous">Continuous</option>
          </select>
        </label>
        <label className="setting-row">
          Default difficulty
          <select
            value={settings.defaultDifficulty}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultDifficulty: Number(e.target.value) as 1 | 2 | 3 | 4,
              })
            }
          >
            <option value={1}>Beginner</option>
            <option value={2}>Easy</option>
            <option value={3}>Intermediate</option>
            <option value={4}>Advanced</option>
          </select>
        </label>
        <fieldset className="selector-section">
          <legend>Default operations</legend>
          <div className="setting-operations">
            {OPERATIONS.map((operation) => (
              <label key={operation}>
                <input
                  type="checkbox"
                  checked={settings.defaultOperations.includes(operation)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultOperations: e.target.checked
                        ? [...settings.defaultOperations, operation]
                        : settings.defaultOperations.filter(
                            (o) => o !== operation,
                          ),
                    })
                  }
                />{' '}
                {operation}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="setting-row">
          Correct review answers needed for mastery
          <input
            type="number"
            min={1}
            max={20}
            value={settings.masteryThreshold}
            onChange={(e) =>
              setSettings({
                ...settings,
                masteryThreshold: Math.max(
                  1,
                  Math.min(20, Number(e.target.value) || 1),
                ),
              })
            }
          />
        </label>
        {settings.defaultOperations.length === 0 && (
          <p role="alert">Choose at least one default operation.</p>
        )}
        <button
          type="submit"
          className="button button-primary"
          disabled={settings.defaultOperations.length === 0}
        >
          Save Settings
        </button>
      </form>
      <h2>Reset application</h2>
      <p>This deletes your history, mistakes, and preferences.</p>
      <button type="button" className="button button-secondary" onClick={clear}>
        Clear All Application Data
      </button>
      {message && <p role="status">{message}</p>}
      <div className="summary-actions">
        <Link to="/" className="button button-secondary">
          Return Home
        </Link>
      </div>
    </section>
  );
}
