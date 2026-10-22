import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QuestionCard } from '../components/practice/QuestionCard';
import type { PracticeConfig } from '../types/practiceConfig';
import type { ActiveSession } from '../types/activeSession';
import {
  finishPractice,
  nextQuestion,
  scoreAttempt,
  sessionComplete,
  startPractice,
  validConfig,
} from '../math/sessionEngine';
import {
  saveAttempt,
  saveSession,
  loadPractice,
  updateMistakeForAttempt,
} from '../storage/practiceStorage';
import { createUniqueId } from '../utils/random';
import type { PracticeSession } from '../types/session';
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../storage/activeSessionStorage';

function PracticeGame({ config }: { config: PracticeConfig }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<ActiveSession>(
    () => loadActiveSession() ?? startPractice(config),
  );
  const sessionRef = useRef(session);
  const busyRef = useRef(false);

  useEffect(() => {
    saveActiveSession(session);
  }, [session]);

  function onResult(correct: boolean, selectedAnswer: number) {
    if (busyRef.current) return;
    busyRef.current = true;
    const current = sessionRef.current;
    const saved = saveAttempt({
      id: createUniqueId(),
      questionId: current.question.id,
      operation: current.question.operation,
      firstOperand: current.question.firstOperand,
      secondOperand: current.question.secondOperand,
      correctAnswer: current.question.correctAnswer,
      selectedAnswer,
      selfReportedCorrect: correct,
      difficulty: current.question.difficulty,
      source: current.question.source,
      attemptedAt: new Date().toISOString(),
      sessionId: current.id,
    });
    if (!saved) {
      busyRef.current = false;
      window.alert(
        'Unable to save this answer. Please check browser storage permissions.',
      );
      return;
    }
    if (
      !updateMistakeForAttempt(
        current.question,
        correct,
        loadPractice().settings.masteryThreshold,
      )
    ) {
      window.alert(
        'Answer saved, but mistake-review progress could not be saved.',
      );
    }
    const scored = scoreAttempt(current, correct);
    // Checkpoint the scored state before advancing so a refresh never loses an answer.
    saveActiveSession(scored);
    if (sessionComplete(scored)) {
      finishAndNavigate(scored);
      return;
    }
    // If mastering the final active mistake exhausts the review pool, end cleanly.
    if (
      scored.config.reviewMode === 'mistake-review' &&
      !loadPractice().mistakes.some(
        (p) =>
          !p.mastered &&
          p.difficulty === scored.config.difficulty &&
          scored.config.operations.includes(p.operation),
      )
    ) {
      finishAndNavigate(scored);
      return;
    }
    const next = {
      ...scored,
      question: nextQuestion(scored.config, scored.question),
    };
    sessionRef.current = next;
    saveActiveSession(next);
    setSession(next);
    busyRef.current = false;
  }

  function finishAndNavigate(current: ActiveSession) {
    const result = finishPractice(current);
    const record: PracticeSession = {
      id: result.id,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      operations: result.config.operations,
      difficulty: result.config.difficulty,
      sessionLength: result.config.sessionLength,
      attempted: result.attempted,
      correct: result.correct,
      incorrect: result.incorrect,
    };
    clearActiveSession();
    if (!saveSession(record))
      window.alert(
        'The summary is available, but your session history could not be saved.',
      );
    navigate('/practice/summary', { replace: true, state: { result } });
  }

  function endSession() {
    if (!window.confirm('End this practice session and see your results?'))
      return;
    finishAndNavigate(sessionRef.current);
  }

  const settings = loadPractice().settings;
  const total = config.sessionLength;
  return (
    <section className="practice-panel">
      <div className="session-topline">
        <div>
          <h1>Math Practice</h1>
          <p>
            Level {config.difficulty} · {config.operations.join(', ')}
          </p>
        </div>
        {total === 'continuous' && (
          <button className="button button-secondary" onClick={endSession}>
            End Session
          </button>
        )}
      </div>
      {total !== 'continuous' && (
        <div className="progress-wrap">
          <div
            role="progressbar"
            aria-label="Practice progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={session.attempted}
            className="progress-track"
          >
            <div
              className="progress-fill"
              style={{ width: `${(session.attempted / total) * 100}%` }}
            />
          </div>
          <p>
            {session.attempted} of {total} completed
          </p>
        </div>
      )}
      <QuestionCard
        key={session.question.id}
        question={session.question}
        index={session.attempted + 1}
        total={total}
        onResult={onResult}
        animationsEnabled={settings.cardAnimationEnabled}
        showExplanations={settings.showExplanations}
        soundEnabled={settings.soundEffectsEnabled}
      />
      <p className="session-score" aria-live="polite">
        Correct: {session.correct} · Incorrect: {session.incorrect}
      </p>
      <Link
        to="/practice/setup"
        className="quiet-link"
        onClick={(event) => {
          if (
            !window.confirm(
              'Leave this session? You can resume it from Practice Setup.',
            )
          )
            event.preventDefault();
        }}
      >
        Change Choices
      </Link>
    </section>
  );
}

export function PracticeSessionPage() {
  const location = useLocation();
  const config = (location.state as { config?: PracticeConfig } | null)?.config;
  const recovered = loadActiveSession();
  const chosenConfig = validConfig(config) ? config : recovered?.config;
  if (!validConfig(chosenConfig))
    return (
      <section className="panel">
        <h1>Set up your practice first</h1>
        <p>Choose your practice options before starting a session.</p>
        <Link className="button button-primary" to="/practice/setup">
          Choose Practice
        </Link>
      </section>
    );
  return <PracticeGame config={chosenConfig} />;
}
