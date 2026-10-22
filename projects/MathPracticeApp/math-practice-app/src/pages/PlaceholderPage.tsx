import { Link } from 'react-router-dom';

interface PlaceholderPageProps { title: string; description: string }
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="panel">
      <p className="eyebrow">Coming in a later phase</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button button-primary" to="/">Back to Home</Link>
    </section>
  );
}
