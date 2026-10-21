import { Link, useLocation } from 'react-router-dom';
import type { PracticeConfig } from '../types/practiceConfig';

export function PracticeSessionPage() {
  const location = useLocation();
  const config = (location.state as { config?: PracticeConfig } | null)?.config;
  if (
    !config?.operations?.length ||
    ![1, 2, 3, 4].includes(config.difficulty) ||
    ![5, 10, 20, 'continuous'].includes(config.sessionLength)
  ) {
    return (
      <section className="panel">
        <h1>Set up your practice first</h1>
        <p>Choose your practice options before starting a session.</p>
        <Link className="button button-primary" to="/practice/setup">
          Choose Practice
        </Link>
      </section>
    );
  }
  return (
    <section className="panel">
      <h1>Session Ready!</h1>
      <p>Your choices were passed to the session page successfully.</p>
      <p>
        <strong>Operations:</strong> {config.operations.join(', ')}
      </p>
      <p>
        <strong>Difficulty:</strong> Level {config.difficulty}
      </p>
      <p>
        <strong>Length:</strong>{' '}
        {config.sessionLength === 'continuous'
          ? 'Continuous'
          : `${config.sessionLength} questions`}
      </p>
      <p>Math question cards will be added in upcoming phases.</p>
      <Link className="button button-secondary" to="/practice/setup">
        Change Choices
      </Link>
    </section>
  );
}
