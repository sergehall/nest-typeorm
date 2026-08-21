'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/ui/brand-mark';

const internalNavigation = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Capabilities' },
  { href: '/status', label: 'API Status' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="NestLab home">
          <BrandMark />
          <span>NestLab</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="site-header__nav">
            {internalNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`));

              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
