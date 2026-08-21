import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { platformCapabilities } from '@/features/platform/data/platform-capabilities';

export const metadata: Metadata = {
  title: 'Capabilities',
  description: 'Core product domains and integrations in the NestLab educational platform.',
};

export default function FeaturesPage() {
  return (
    <div className="shell page-stack">
      <header className="page-hero">
        <p className="eyebrow">Platform map / 04 domains</p>
        <h1>From authentication to real-time communication and payments.</h1>
        <p>
          The backend already supports dozens of workflows. They are organized here by the product
          problems the platform solves, not by framework folders.
        </p>
      </header>

      <div className="feature-list">
        {platformCapabilities.map((capability) => (
          <article className="feature-row" key={capability.number}>
            <div className="feature-row__number">{capability.number}</div>
            <div className="feature-row__content">
              <p className="eyebrow">{capability.eyebrow}</p>
              <h2>{capability.title}</h2>
              <p>{capability.description}</p>
            </div>
            <ul className="feature-row__tags" aria-label="Technologies">
              {capability.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="cta-panel">
        <div>
          <p className="eyebrow">Live boundary</p>
          <h2>The web application can verify the API.</h2>
          <p>The status page performs a server-side request and handles an unavailable backend.</p>
        </div>
        <Link className="button button--light" href="/status">
          View API status <ArrowIcon />
        </Link>
      </aside>
    </div>
  );
}
