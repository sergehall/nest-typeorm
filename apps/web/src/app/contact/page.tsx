import type { Metadata } from 'next';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { siteConfig } from '@/config/site';
import { ContactEmailAction } from '@/features/contact/components/contact-email-action';

const socialProfiles = [
  {
    label: 'Instagram',
    handle: '@sergioartg',
    href: siteConfig.instagramUrl,
    description: 'Визуальные проекты, текущая работа и творческое направление.',
  },
  {
    label: 'GitHub',
    handle: 'SergeHall',
    href: 'https://github.com/SergeHall',
    description: 'Код, backend-системы, архитектурные эксперименты и история проекта.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Email и профили автора учебной платформы NestLab.',
};

export default function ContactPage() {
  return (
    <div className="shell page-stack contact-page">
      <header className="page-hero">
        <p className="eyebrow">Contact / Los Angeles</p>
        <h1>Поговорим о проекте и инженерной практике.</h1>
        <p>
          Вопрос по архитектуре, идея для следующего модуля или просто обратная связь — выбирайте
          удобный канал. Контактный блок адаптирован из проекта Lavoval.
        </p>
      </header>

      <section className="contact-grid" aria-labelledby="contact-methods-title">
        <div className="contact-card contact-card--primary">
          <div className="contact-card__heading">
            <span className="contact-card__index">01</span>
            <h2 id="contact-methods-title">Email and profiles</h2>
          </div>

          <div className="contact-list">
            <article className="contact-item">
              <div>
                <p className="eyebrow">Email</p>
                <h3>Прямое сообщение</h3>
                <p>Лучший канал для вопросов о продукте, архитектуре и совместной работе.</p>
              </div>
              <ContactEmailAction>
                Отправить письмо <ArrowIcon />
              </ContactEmailAction>
            </article>

            {socialProfiles.map((profile) => (
              <a
                className="contact-item contact-item--link"
                href={profile.href}
                key={profile.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <p className="eyebrow">{profile.label}</p>
                  <h3>{profile.handle}</h3>
                  <p>{profile.description}</p>
                </div>
                <span className="contact-item__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <aside className="contact-card contact-card--note">
          <p className="eyebrow">About this build</p>
          <h2>Учебный проект, открытый для развития.</h2>
          <p>
            Сейчас frontend показывает архитектуру и проверяет API. Следующий шаг — подключать
            настоящие пользовательские сценарии: авторизацию, блоги, викторину и realtime.
          </p>
          <a
            className="text-link"
            href={siteConfig.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть репозиторий <ArrowIcon />
          </a>
        </aside>
      </section>
    </div>
  );
}
