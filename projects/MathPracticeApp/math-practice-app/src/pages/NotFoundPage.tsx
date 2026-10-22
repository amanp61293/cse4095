import { Link } from 'react-router-dom';
export function NotFoundPage() {
  return (
    <section className="panel">
      <h1>Page not found</h1>
      <p>That page doesn't exist. Let's get you back on track.</p>
      <Link className="button button-primary" to="/">Go Home</Link>
    </section>
  );
}
