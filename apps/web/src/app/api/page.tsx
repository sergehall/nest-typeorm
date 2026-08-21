import type { Metadata } from 'next';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { getPublicApiUrl } from '@/config/site';

export const metadata: Metadata = {
  title: 'Backend API',
  description: 'Open the backend-owned NestLab API dashboard and documentation.',
};

export default function ApiHandoffPage() {
  const apiUrl = getPublicApiUrl();

  return (
    <div className="shell page-stack api-reference-page">
      <header className="page-hero page-hero--compact">
        <p className="eyebrow">Backend application</p>
        <h1>The API now has its own control surface.</h1>
        <p>
          Runtime health, PostgreSQL status, Swagger UI, OpenAPI contracts, and endpoint navigation
          are owned and rendered by the NestJS application.
        </p>
      </header>

      <section className="cta-panel">
        <div>
          <p className="eyebrow">NestJS · localhost:5005</p>
          <h2>Continue to the backend API.</h2>
          <p>This leaves the Next.js application and opens the backend-owned dashboard.</p>
        </div>
        <a className="button button--light" href={apiUrl}>
          Open backend API <ArrowIcon />
        </a>
      </section>
    </div>
  );
}
