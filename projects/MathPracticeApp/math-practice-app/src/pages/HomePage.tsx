import { Link } from 'react-router-dom';
import { AppTitle } from '../components/common/AppTitle';

export function HomePage() {
  return (
    <section className="hero" aria-labelledby="app-title">
      <div className="hero-illustration" aria-hidden="true">✏️ <span>1 + 2 = 3</span></div>
      <p className="eyebrow">Learn • Try • Grow</p>
      <AppTitle />
      <p className="hero-lead">Make math your superpower! Practice at your own pace and celebrate every step.</p>
      <div className="action-group">
        <Link className="button button-primary" to="/practice/setup">Start Practice →</Link>
        <Link className="button button-secondary" to="/statistics">View Statistics</Link>
        <Link className="button button-secondary" to="/settings">Settings</Link>
      </div>
      <p className="helper-text">Addition · Subtraction · Multiplication · Division</p>
    </section>
  );
}
