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
            Backend стал
            <span>полноценным продуктом.</span>
          </h1>
          <p className="hero-section__lead">
            Большой учебный API на NestJS получил собственный интерфейс на Next.js — с чистыми
            границами, общей инженерной историей и пространством для следующих экспериментов.
          </p>
          <div className="button-row">
            <Link className="button button--primary" href="/features">
              Изучить платформу <ArrowIcon />
            </Link>
            <Link className="button button--ghost" href="/status">
              Проверить API
            </Link>
          </div>
        </div>

        <div className="architecture-card" aria-label="Архитектура проекта">
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

      <section className="principles-strip" aria-label="Принципы проекта">
        <div className="shell principles-strip__inner">
          <span>Строгий TypeScript</span>
          <span aria-hidden="true">✦</span>
          <span>Модульный NestJS</span>
          <span aria-hidden="true">✦</span>
          <span>Server-first Next.js</span>
          <span aria-hidden="true">✦</span>
          <span>Контракт через API</span>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Что уже внутри</p>
            <h2>Не демо из трёх эндпоинтов.</h2>
          </div>
          <p>
            Проект вырос из учебных задач в большой модульный backend. Новый web-слой делает его
            возможности видимыми и готовит основу для пользовательских сценариев.
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
              <ul aria-label={`Технологии: ${capability.title}`}>
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
          <h2>Архитектура, которую можно читать.</h2>
          <p>
            API остаётся модульным монолитом. Web — отдельным приложением. Они развиваются рядом, не
            прячут границы и позволяют изучать полный путь данных: от интерфейса до базы.
          </p>
          <Link className="text-link" href="/contact">
            Обсудить проект <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
