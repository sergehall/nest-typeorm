import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <Link className="site-footer__brand" href="/">
            <BrandMark compact />
            <span>NestLab</span>
          </Link>
          <p>Учебный монолит с чёткой границей между web и API.</p>
        </div>
        <div className="site-footer__links" aria-label="Ссылки проекта">
          <Link href="/features">Возможности</Link>
          <Link href="/contact">Контакты</Link>
          <a href={siteConfig.repositoryUrl} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </div>
        <p className="site-footer__meta">
          Next.js · NestJS · TypeScript · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
