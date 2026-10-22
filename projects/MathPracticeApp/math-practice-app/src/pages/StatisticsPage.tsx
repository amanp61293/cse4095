import { useState } from 'react';
import { Link } from 'react-router-dom';
import { accuracy, recentSessions } from '../math/statisticsEngine';
import { loadPractice, loadStatistics, resetStatistics } from '../storage/practiceStorage';
import type { MathOperation } from '../types/question';

const operations: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];
const levels = [1, 2, 3, 4] as const;

export function StatisticsPage() {
  const [revision, setRevision] = useState(0);
  const data = loadPractice();
  const stats = loadStatistics();
  function reset() {
    if (!window.confirm('Are you sure you want to erase all practice history and statistics?')) return;
    if (resetStatistics()) setRevision((current) => current + 1);
    else window.alert('Could not clear saved progress. Please check browser storage permissions.');
  }
  return <section className="panel stats-page" data-revision={revision}>
    <p className="eyebrow">Your learning journey</p><h1>Practice Statistics</h1>
    <p>See how much you have practiced and where you are improving.</p>
    {stats.attempted === 0 && <p className="feature-note">No questions attempted yet. Start a practice session to see your progress!</p>}
    <h2>Overall performance</h2>
    <div className="summary-grid stats-grid">
      <div><strong>{stats.attempted}</strong><span>Attempted</span></div>
      <div><strong>{stats.correct}</strong><span>Correct</span></div>
      <div><strong>{stats.incorrect}</strong><span>Incorrect</span></div>
      <div><strong>{accuracy(stats.correct, stats.attempted)}%</strong><span>Accuracy</span></div>
    </div>
    <h2>By operation</h2>
    <div className="summary-grid stats-grid">{operations.map((operation) => {
      const s = stats.byOperation[operation];
      return <div key={operation}><h3 className="stats-title">{operation[0].toUpperCase() + operation.slice(1)}</h3><p>{s.attempted} attempted</p><p>{s.correct} correct · {s.incorrect} incorrect</p><strong>{accuracy(s.correct, s.attempted)}%</strong><span>Accuracy</span></div>;
    })}</div>
    <h2>By difficulty</h2>
    <div className="summary-grid stats-grid">{levels.map((level) => {
      const s = stats.byDifficulty[level];
      return <div key={level}><h3 className="stats-title">Level {level}</h3><p>{s.attempted} attempted</p><p>{s.correct} correct · {s.incorrect} incorrect</p><strong>{accuracy(s.correct, s.attempted)}%</strong><span>Accuracy</span></div>;
    })}</div>
    <h2>Recent sessions</h2>
    {recentSessions(data.sessions).length === 0 ? <p>No completed sessions yet.</p> :
      <div className="table-scroll"><table className="stats-table"><thead><tr><th>Date</th><th>Operations</th><th>Level</th><th>Attempted</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr></thead><tbody>
        {recentSessions(data.sessions).map((s) => <tr key={s.id}><td>{new Date(s.completedAt!).toLocaleDateString()}</td><td>{s.operations.join(', ')}</td><td>{s.difficulty}</td><td>{s.attempted}</td><td>{s.correct}</td><td>{s.incorrect}</td><td>{accuracy(s.correct, s.attempted)}%</td></tr>)}
      </tbody></table></div>}
    <div className="summary-actions"><Link to="/practice/setup" className="button button-primary">Start Practice</Link><Link to="/" className="button button-secondary">Return Home</Link><button className="button button-secondary" onClick={reset}>Reset Statistics</button></div>
  </section>;
}
