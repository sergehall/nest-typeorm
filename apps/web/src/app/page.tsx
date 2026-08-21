import Link from 'next/link';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { platformCapabilities } from '@/features/platform/data/platform-capabilities';

export default function HomePage() {
  return (
    <>
      <section className="hero-section shell">
        <div className="hero-section__copy">
          <p className="eyebrow">
            <span>Full-stack study project</span>
            <span>2026 edition</span>
          </p>
          <h1>
            The backend became
            <span>a complete product.</span>
          </h1>
          <p className="hero-section__lead">
            A large educational NestJS API now has its own Next.js interface, with clear boundaries,
            a shared engineering story, and room for future experiments.
          </p>
          <div className="button-row">
            <Link className="button button--primary" href="/features">
              Explore the platform <ArrowIcon />
            </Link>
            <Link className="button button--ghost" href="/status">
              Check API status
            </Link>
          </div>
        </div>

        <div className="architecture-card" aria-label="Project architecture">
          <div className="architecture-card__header">
            <span>workspace://nest-lab</span>
            <span className="status-dot">live structure</span>
          </div>
          <div className="architecture-card__body">
            <div className="architecture-node architecture-node--web">
              <span className="architecture-node__index">01</span>
              <div>
                <strong>apps/web</strong>
                <span>Next.js · React · RSC</span>
              </div>
            </div>
            <div className="architecture-connector">
              <span>HTTP</span>
            </div>
            <div className="architecture-node architecture-node--api">
              <span className="architecture-node__index">02</span>
              <div>
                <strong>apps/api</strong>
                <span>NestJS · TypeORM · REST</span>
              </div>
            </div>
            <div className="architecture-card__footer">
              <span>one repository</span>
              <span>two clear boundaries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="principles-strip" aria-label="Project principles">
        <div className="shell principles-strip__inner">
          <span>Strict TypeScript</span>
          <span aria-hidden="true">✦</span>
          <span>Modular NestJS</span>
          <span aria-hidden="true">✦</span>
          <span>Server-first Next.js</span>
          <span aria-hidden="true">✦</span>
          <span>API-driven contract</span>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What is already inside</p>
            <h2>More than a three-endpoint demo.</h2>
          </div>
          <p>
            The project grew from coursework into a large modular backend. The new web layer makes
            its capabilities visible and establishes a foundation for user-facing workflows.
          </p>
        </div>

        <div className="capability-grid">
          {platformCapabilities.map((capability) => (
            <article className="capability-card" key={capability.number}>
              <div className="capability-card__top">
                <span>{capability.number}</span>
                <span>{capability.eyebrow}</span>
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <ul aria-label={`Technologies: ${capability.title}`}>
                {capability.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell learning-section">
        <div className="learning-section__number">36</div>
        <div className="learning-section__copy">
          <p className="eyebrow">Learning in public</p>
          <h2>Architecture that can be read.</h2>
          <p>
            The API remains a modular monolith, while the web layer is an independent application.
            They evolve together without hiding their boundaries and expose the complete data path,
            from the interface to the database.
          </p>
          <Link className="text-link" href="/contact">
            Discuss the project <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
