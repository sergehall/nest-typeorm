import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { platformCapabilities } from '@/features/platform/data/platform-capabilities';

export const metadata: Metadata = {
  title: 'Возможности',
  description: 'Основные предметные области и интеграции учебной full-stack платформы NestLab.',
};

export default function FeaturesPage() {
  return (
    <div className="shell page-stack">
      <header className="page-hero">
        <p className="eyebrow">Platform map / 04 domains</p>
        <h1>От авторизации до realtime и платежей.</h1>
        <p>
          Backend уже содержит десятки сценариев. Здесь они собраны не по папкам фреймворка, а по
          продуктовым задачам, которые решает платформа.
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
            <ul className="feature-row__tags" aria-label="Технологии">
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
          <h2>Web умеет проверять API.</h2>
          <p>
            Страница состояния делает server-side запрос и корректно переживает выключенный backend.
          </p>
        </div>
        <Link className="button button--light" href="/status">
          Открыть статус <ArrowIcon />
        </Link>
      </aside>
    </div>
  );
}
