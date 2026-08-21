import type { Metadata } from 'next';
import { ArrowIcon } from '@/components/ui/arrow-icon';
import { siteConfig } from '@/config/site';
import { ContactEmailAction } from '@/features/contact/components/contact-email-action';

const socialProfiles = [
  {
    label: 'Instagram',
    handle: '@sergioartg',
    href: siteConfig.instagramUrl,
    description: 'Visual projects, current work, and creative direction.',
  },
  {
    label: 'GitHub',
    handle: 'SergeHall',
    href: 'https://github.com/SergeHall',
    description: 'Code, backend systems, architectural experiments, and project history.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Email and social profiles for the creator of the NestLab educational platform.',
};

export default function ContactPage() {
  return (
    <div className="shell page-stack contact-page">
      <header className="page-hero">
        <p className="eyebrow">Contact / Los Angeles</p>
        <h1>Let us talk about the project and engineering practice.</h1>
        <p>
          Whether you have an architecture question, an idea for the next module, or general
          feedback, choose the channel that works best for you. This contact block was adapted from
          the Lavoval project.
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
                <h3>Direct message</h3>
                <p>The best channel for product, architecture, and collaboration inquiries.</p>
              </div>
              <ContactEmailAction>
                Send an email <ArrowIcon />
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
          <h2>An educational project designed to evolve.</h2>
          <p>
            The frontend currently presents the architecture and verifies the API. The next step is
            to integrate real user flows for authentication, blogs, quizzes, and real-time features.
          </p>
          <a
            className="text-link"
            href={siteConfig.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the repository <ArrowIcon />
          </a>
        </aside>
      </section>
    </div>
  );
}
