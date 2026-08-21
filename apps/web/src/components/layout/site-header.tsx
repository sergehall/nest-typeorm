import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import { getPublicApiUrl } from '@/config/site';

const internalNavigation = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Capabilities' },
  { href: '/status', label: 'API Status' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteHeader() {
  const apiUrl = getPublicApiUrl();

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="NestLab home">
          <BrandMark />
          <span>NestLab</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="site-header__nav">
            {internalNavigation.slice(0, 2).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <a href={apiUrl}>Backend API</a>
            </li>
            {internalNavigation.slice(2).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
