import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';

const navigation = [
  { href: '/', label: 'Главная' },
  { href: '/features', label: 'Возможности' },
  { href: '/status', label: 'Статус API' },
  { href: '/contact', label: 'Контакты' },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="site-header__brand" href="/" aria-label="NestLab — на главную">
          <BrandMark />
          <span>NestLab</span>
        </Link>

        <nav aria-label="Основная навигация">
          <ul className="site-header__nav">
            {navigation.map((item) => (
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
