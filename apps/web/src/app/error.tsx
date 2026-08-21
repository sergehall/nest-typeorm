'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell not-found" role="alert">
      <p className="eyebrow">Error / application</p>
      <h1>Something went wrong.</h1>
      <p>Try the request again. If the error persists, report it through the contact page.</p>
      <button className="button button--primary" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
