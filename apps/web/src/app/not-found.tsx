import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell not-found">
      <p className="eyebrow">Error / 404</p>
      <h1>This page does not exist yet.</h1>
      <p>The route may not have been added to the new web application.</p>
      <Link className="button button--primary" href="/">
        Return home
      </Link>
    </div>
  );
}
