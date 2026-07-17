import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Crumb = { name: string; path: string };

// Заголовок раздела с хлебными крошками. Композиция у каждой страницы своя,
// но крошки и эйебрау — общий паттерн.
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-14">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Хлебные крошки" className="mb-5 flex items-center gap-1.5 text-sm text-ink-faint">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="opacity-50" />}
              {i < crumbs.length - 1 ? (
                <Link href={c.path} className="transition-colors hover:text-ink">
                  {c.name}
                </Link>
              ) : (
                <span className="text-ink-soft">{c.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <h1 className="mt-1 text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-ink-soft">{description}</p>}
    </div>
  );
}
