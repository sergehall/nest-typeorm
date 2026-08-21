import type { Metadata } from 'next';
import { getApiHealth } from '@/features/platform/data/get-api-health';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'API Status',
  description: 'NestJS API availability checks from the Next.js server layer.',
};

export default async function StatusPage() {
  const health = await getApiHealth();
  const checkedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'America/Los_Angeles',
  }).format(new Date(health.checkedAt));

  return (
    <div className="shell page-stack status-page">
      <header className="page-hero page-hero--compact">
        <p className="eyebrow">System / API health</p>
        <h1>The connection between the web application and the API.</h1>
        <p>
          The check runs on the Next.js server. The backend address is never included in the client
          bundle.
        </p>
      </header>

      <section className={`status-card status-card--${health.status}`} aria-live="polite">
        <div className="status-card__signal" aria-hidden="true">
          <span />
        </div>
        <div className="status-card__main">
          <div className="status-card__heading">
            <div>
              <p className="eyebrow">NestJS application</p>
              <h2>{health.status === 'online' ? 'API is online' : 'API is unavailable'}</h2>
            </div>
            <span className="status-pill">{health.status}</span>
          </div>
          <p className="status-card__message">{health.message}</p>
          <dl className="status-details">
            <div>
              <dt>Endpoint</dt>
              <dd>{health.url}</dd>
            </div>
            <div>
              <dt>Checked</dt>
              <dd>{checkedAt} PT</dd>
            </div>
            <div>
              <dt>Response time</dt>
              <dd>{health.status === 'online' ? `${health.responseTimeMs} ms` : '—'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="code-note">
        <span>$</span>
        <code>yarn dev:api</code>
        <p>Start the API in a separate terminal, then refresh this page.</p>
      </div>
    </div>
  );
}
