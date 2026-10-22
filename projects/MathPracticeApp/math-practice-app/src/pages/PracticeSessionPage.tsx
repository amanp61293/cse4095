import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QuestionCard } from '../components/practice/QuestionCard';
import type { PracticeConfig } from '../types/practiceConfig';
import type { ActiveSession } from '../types/activeSession';
import { finishPractice, nextQuestion, scoreAttempt, sessionComplete, startPractice, validConfig } from '../math/sessionEngine';

function PracticeGame({ config }: { config: PracticeConfig }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<ActiveSession>(() => startPractice(config));
  const sessionRef = useRef(session);
  const busyRef = useRef(false);

  function onResult(correct: boolean) {
    if (busyRef.current) return;
    busyRef.current = true;
    const scored = scoreAttempt(sessionRef.current, correct);
    if (sessionComplete(scored)) {
      navigate('/practice/summary', { replace: true, state: { result: finishPractice(scored) } });
      return;
    }
    const next = { ...scored, question: nextQuestion(scored.config, scored.question) };
    sessionRef.current = next;
    setSession(next);
    busyRef.current = false;
  }

  function endSession() {
    if (!window.confirm('End this practice session and see your results?')) return;
    navigate('/practice/summary', { replace: true, state: { result: finishPractice(sessionRef.current) } });
  }

  const total = config.sessionLength;
  return <section className="practice-panel">
    <div className="session-topline">
      <div><h1>Math Practice</h1><p>Level {config.difficulty} · {config.operations.join(', ')}</p></div>
      {total === 'continuous' && <button className="button button-secondary" onClick={endSession}>End Session</button>}
    </div>
    {total !== 'continuous' && <div className="progress-wrap"><div role="progressbar" aria-label="Practice progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={session.attempted} className="progress-track"><div className="progress-fill" style={{ width: `${session.attempted / total * 100}%` }} /></div><p>{session.attempted} of {total} completed</p></div>}
    <QuestionCard key={session.question.id} question={session.question} index={session.attempted + 1} total={total} onResult={onResult} />
    <p className="session-score" aria-live="polite">Correct: {session.correct} · Incorrect: {session.incorrect}</p>
    <Link to="/practice/setup" className="quiet-link" onClick={(event) => { if (!window.confirm('Leave this session? Unsaved progress will be lost.')) event.preventDefault(); }}>Change Choices</Link>
  </section>;
}

export function PracticeSessionPage() {
  const location = useLocation();
  const config = (location.state as { config?: PracticeConfig } | null)?.config;
  if (!validConfig(config)) return <section className="panel"><h1>Set up your practice first</h1><p>Choose your practice options before starting a session.</p><Link className="button button-primary" to="/practice/setup">Choose Practice</Link></section>;
  return <PracticeGame config={config} />;
}
