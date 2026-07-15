import { Search } from 'lucide-react';

// Поиск через GET-форму — без JS, значение уходит в query, работает SSR.
// Категория сохраняется скрытым полем.
export function SearchBar({ q, category }: { q?: string; category?: string }) {
  return (
    <form action="/services" method="get" className="relative w-full max-w-xs">
      {category && <input type="hidden" name="category" value={category} />}
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Поиск услуг…"
        aria-label="Поиск услуг"
        className="w-full rounded-xl border border-hair/30 bg-panel py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent/60"
      />
    </form>
  );
}
