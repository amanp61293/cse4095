import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { SessionResult } from '../types/activeSession';
import { loadPractice } from '../storage/practiceStorage';

export function SessionSummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as { result?: SessionResult } | null)?.result;
  if (!result) return <section className="panel"><h1>No session results yet</h1><p>Complete a practice session to see your summary.</p><Link className="button button-primary" to="/practice/setup">Start Practice</Link></section>;
  const reviewAvailable = loadPractice().mistakes.some((p) => !p.mastered && result.config.operations.includes(p.operation) && p.difficulty === result.config.difficulty);
  const accuracy = result.attempted === 0 ? 0 : Math.round((result.correct / result.attempted) * 100);
  return <section className="panel summary-panel">
    <p className="eyebrow">Great effort!</p><h1>Session Summary</h1>
    <p className="summary-accuracy">{accuracy}% <span>accuracy</span></p>
    <div className="summary-grid"><div><strong>{result.attempted}</strong><span>Attempted</span></div><div><strong>{result.correct}</strong><span>Correct</span></div><div><strong>{result.incorrect}</strong><span>Incorrect</span></div></div>
    <p>Operations: {result.config.operations.join(', ')}</p><p>Difficulty: Level {result.config.difficulty}</p><p>Mistake-review questions: {result.mistakeReviewQuestions}</p>
    <div className="summary-actions">
      <button className="button button-primary" onClick={() => navigate('/practice/session', { state: { config: result.config } })}>Practice Again</button>
      {reviewAvailable && <button className="button button-secondary" onClick={() => navigate('/practice/session', { state: { config: { ...result.config, reviewMode: 'mistake-review' } } })}>Practice Mistakes</button>}
      <Link className="button button-secondary" to="/practice/setup">Change Settings</Link>
      <Link className="button button-secondary" to="/statistics">View Statistics</Link>
      <Link className="button button-secondary" to="/">Return Home</Link>
    </div>
    {!reviewAvailable && <p className="feature-note">Practice Mistakes becomes available after a missed question at this difficulty.</p>}
  </section>;
}
