import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { OperationSelector } from '../components/practice/OperationSelector';
import { DifficultySelector } from '../components/practice/DifficultySelector';
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector';
import type { DifficultyLevel, MathOperation } from '../types/question';
import type { SessionLength } from '../types/session';
import type { PracticeConfig } from '../types/practiceConfig';

export function PracticeSetupPage() {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<MathOperation[]>(['addition']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [sessionLength, setSessionLength] = useState<SessionLength>(10);
  const [reviewMode, setReviewMode] = useState<PracticeConfig['reviewMode']>('regular');

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operations.length === 0) return;
    const config: PracticeConfig = { operations, difficulty, sessionLength, reviewMode };
    // React Router state hands the configuration to Phase 7's practice page.
    navigate('/practice/session', { state: { config } });
  }

  return (
    <section className="setup-panel" aria-labelledby="setup-heading">
      <p className="eyebrow">Ready to learn?</p>
      <h1 id="setup-heading">Choose Your Practice</h1>
      <p className="setup-intro">Make a practice session that's just right for you!</p>
      <form onSubmit={startSession}>
        <OperationSelector selected={operations} onChange={setOperations} />
        <DifficultySelector selected={difficulty} onChange={setDifficulty} />
        <SessionLengthSelector selected={sessionLength} onChange={setSessionLength} />
        <fieldset className="selector-section">
          <legend>4. Practice mode</legend>
          <div className="option-grid">
            <label className={`option-card ${reviewMode === 'regular' ? 'selected' : ''}`}>
              <input type="radio" name="review-mode" checked={reviewMode === 'regular'} onChange={() => setReviewMode('regular')} />
              <span>Regular practice</span>
            </label>
            <label className="option-card disabled-option">
              <input type="radio" name="review-mode" disabled checked={reviewMode === 'mistake-review'} onChange={() => setReviewMode('mistake-review')} />
              <span>Practice past mistakes (coming later)</span>
            </label>
          </div>
        </fieldset>
        {operations.length === 0 && <p role="alert" className="validation-message">Choose at least one operation to start.</p>}
        <button className="button button-primary start-session" type="submit" disabled={operations.length === 0}>Start Session</button>
      </form>
    </section>
  );
}
