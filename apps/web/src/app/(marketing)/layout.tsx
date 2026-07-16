import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

const NAV = [
  { href: '/', label: 'Главная' },
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
      <header className="sticky top-0 z-40 border-b border-hair/15 bg-ground/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gradient shadow-card">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/90" />
            </span>
            <b className="text-[17px] tracking-tight">
              Nebula<span className="text-accent">.</span>
            </b>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-accent/5 hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl border border-hair/30 px-4 py-2 text-sm text-ink transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              Войти
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-gradient px-4 py-2 text-sm font-medium text-white shadow-card transition-opacity hover:opacity-90"
            >
              Оставить заявку <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-hair/15 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-ink-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Nebula — цифровые продукты под ключ</span>
          <div className="flex gap-4">
            <Link href="/faq" className="hover:text-ink">
              FAQ
            </Link>
            <Link href="/reviews" className="hover:text-ink">
              Отзывы
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
