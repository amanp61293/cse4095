import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { OperationSelector } from '../components/practice/OperationSelector';
import { DifficultySelector } from '../components/practice/DifficultySelector';
import { SessionLengthSelector } from '../components/practice/SessionLengthSelector';
import type { DifficultyLevel, MathOperation } from '../types/question';
import type { SessionLength } from '../types/session';
import type { PracticeConfig } from '../types/practiceConfig';
import { saveDifficulty, loadPractice } from '../storage/practiceStorage';
import { clearActiveSession, loadActiveSession } from '../storage/activeSessionStorage';
import { Link } from 'react-router-dom';

export function PracticeSetupPage() {
  const navigate = useNavigate();
  const defaults = loadPractice().settings;
  const [operations, setOperations] = useState<MathOperation[]>(defaults.defaultOperations);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaults.defaultDifficulty);
  const [sessionLength, setSessionLength] = useState<SessionLength>(defaults.defaultSessionLength);
  const [reviewMode, setReviewMode] = useState<PracticeConfig['reviewMode']>('regular');

  const availableMistakes = loadPractice().mistakes.filter((p) => !p.mastered && operations.includes(p.operation) && p.difficulty === difficulty).length;
  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operations.length === 0 || (reviewMode === 'mistake-review' && availableMistakes === 0)) return;
    const config: PracticeConfig = { operations, difficulty, sessionLength, reviewMode };
    saveDifficulty(difficulty);
    clearActiveSession();
    // Pass setup choices into the session route.
    navigate('/practice/session', { state: { config } });
  }

  const resumable = loadActiveSession();

  return (
    <section className="setup-panel" aria-labelledby="setup-heading">
      <p className="eyebrow">Ready to learn?</p>
      <h1 id="setup-heading">Choose Your Practice</h1>
      <p className="setup-intro">Make a practice session that's just right for you!</p>
      {resumable && <p className="resume-session"><Link className="button button-secondary" to="/practice/session">Resume unfinished session</Link></p>}
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
            <label className={`option-card ${reviewMode === 'mistake-review' ? 'selected' : ''}`}>
              <input type="radio" name="review-mode" disabled={availableMistakes === 0} checked={reviewMode === 'mistake-review'} onChange={() => setReviewMode('mistake-review')} />
              <span>Practice past mistakes ({availableMistakes} active)</span>
            </label>
          </div>
        </fieldset>
        {availableMistakes === 0 && <p role="status" className="validation-message">No saved mistakes for these operations and level yet. Try regular practice first.</p>}
        {operations.length === 0 && <p role="alert" className="validation-message">Choose at least one operation to start.</p>}
        <button className="button button-primary start-session" type="submit" disabled={operations.length === 0 || (reviewMode === 'mistake-review' && availableMistakes === 0)}>Start Session</button>
      </form>
    </section>
  );
}
