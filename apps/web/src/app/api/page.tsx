import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { httpApiGroups } from '@/features/platform/data/http-api-reference';

const localApiUrl = 'http://localhost:5005';
const swaggerUrl = `${localApiUrl}/api/docs`;
const openApiJsonUrl = `${swaggerUrl}/openapi.json`;
const openApiYamlUrl = `${swaggerUrl}/openapi.yaml`;

export const metadata: Metadata = {
  title: 'HTTP API',
  description: 'A curated reference for the NestLab NestJS HTTP API and its access boundaries.',
};

export default function HttpApiPage() {
  return (
    <div className="shell page-stack api-reference-page">
      <header className="page-hero">
        <p className="eyebrow">HTTP API / REST reference</p>
        <h1>A practical map of the NestJS application boundary.</h1>
        <p>
          Start with the curated routes below, then use the generated Swagger documentation for
          complete schemas, query parameters, and response contracts.
        </p>
      </header>

      <section className="api-reference-summary" aria-labelledby="api-reference-summary-title">
        <div className="api-reference-summary__copy">
          <p className="eyebrow">Local development</p>
          <h2 id="api-reference-summary-title">One API, several access levels.</h2>
          <p>
            The backend exposes public resources, JWT-protected product workflows, refresh-cookie
            session operations, and Basic Auth administration routes.
          </p>
        </div>

        <dl className="api-reference-summary__details">
          <div>
            <dt>Base URL</dt>
            <dd>
              <code>{localApiUrl}</code>
            </dd>
          </div>
          <div>
            <dt>Protocol</dt>
            <dd>REST · JSON · 95 operations</dd>
          </div>
          <div>
            <dt>Live contract</dt>
            <dd>
              <a href={swaggerUrl} target="_blank" rel="noopener noreferrer">
                Swagger UI <span aria-hidden="true">↗</span>
              </a>
              {' · '}
              <a href={openApiJsonUrl} target="_blank" rel="noopener noreferrer">
                JSON <span aria-hidden="true">↗</span>
              </a>
              {' · '}
              <a href={openApiYamlUrl} target="_blank" rel="noopener noreferrer">
                YAML <span aria-hidden="true">↗</span>
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="api-reference-groups" aria-label="HTTP endpoint groups">
        {httpApiGroups.map((group) => (
          <article className="api-reference-group" key={group.number}>
            <header className="api-reference-group__heading">
              <span className="api-reference-group__number">{group.number}</span>
              <div>
                <p className="eyebrow">{group.eyebrow}</p>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span className="api-reference-group__count">
                {group.endpoints.length.toString().padStart(2, '0')} routes
              </span>
            </header>

            <div className="api-endpoint-list">
              {group.endpoints.map((endpoint) => (
                <div className="api-endpoint" key={`${endpoint.method}-${endpoint.path}`}>
                  <div className="api-endpoint__signature">
                    <span
                      className={`api-method api-method--${endpoint.method.toLowerCase()}`}
                      aria-label={`${endpoint.method} method`}
                    >
                      {endpoint.method}
                    </span>
                    <code>{endpoint.path}</code>
                  </div>
                  <p>{endpoint.description}</p>
                  <span className="api-access">{endpoint.access}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <aside className="cta-panel">
        <div>
          <p className="eyebrow">Runtime check</p>
          <h2>Confirm that the API is available.</h2>
          <p>The status route performs a server-side request to the configured backend.</p>
        </div>
        <Link className="button button--light" href="/status">
          View API status <ArrowIcon />
        </Link>
      </aside>
    </div>
  );
}
