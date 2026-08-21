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
          <p>An educational monorepo with a clear boundary between the web application and API.</p>
        </div>
        <div className="site-footer__links" aria-label="Project links">
          <Link href="/features">Capabilities</Link>
          <Link href="/api">HTTP API</Link>
          <Link href="/contact">Contact</Link>
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
