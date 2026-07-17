import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LogoMark } from '@/shared/ui/LogoMark';

const NAV = [
  { href: '/services', label: 'Услуги' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/cases', label: 'Кейсы' },
  { href: '/blog', label: 'Блог' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contacts', label: 'Контакты' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-hair/[0.07] bg-ground/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] max-w-6xl items-center gap-8 px-7">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <b className="font-display text-lg font-semibold tracking-tight">Nebula</b>
          </Link>
          <nav className="ml-2 hidden items-center gap-6 text-sm text-ink-soft lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:inline"
            >
              Войти
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-[18px] py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:-translate-y-px hover:bg-accent-2"
            >
              Оставить заявку <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-10 border-t border-hair/[0.07] py-9">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-7 text-sm text-ink-faint sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <b className="font-display text-base font-semibold text-ink">Nebula</b>
          </Link>
          <span className="font-mono text-[13px]">
            © {new Date().getFullYear()} · digital-продукты и инфраструктура
          </span>
        </div>
      </footer>
    </div>
  );
}
