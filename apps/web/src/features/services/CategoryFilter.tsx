import Link from 'next/link';
import { cn } from '@/shared/lib/cn';

type Category = { slug: string; title: string };

// Фильтр по категориям через URL (SSR-friendly, ссылки шарятся и индексируются).
// Поиск сохраняем в query при переключении категории.
export function CategoryFilter({
  categories,
  active,
  q,
}: {
  categories: Category[];
  active?: string;
  q?: string;
}) {
  const hrefFor = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    if (q) params.set('q', q);
    const qs = params.toString();
    return qs ? `/services?${qs}` : '/services';
  };

  const chip = (isActive: boolean) =>
    cn(
      'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
      isActive
        ? 'border-accent/50 bg-accent/10 text-ink'
        : 'border-hair/25 text-ink-soft hover:text-ink hover:border-accent/40',
    );

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={hrefFor()} className={chip(!active)}>
        Все
      </Link>
      {categories.map((c) => (
        <Link key={c.slug} href={hrefFor(c.slug)} className={chip(active === c.slug)}>
          {c.title}
        </Link>
      ))}
    </div>
  );
}
