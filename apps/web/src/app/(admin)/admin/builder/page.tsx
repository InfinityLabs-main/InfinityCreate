import type { Metadata } from 'next';
import { ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { moveBlock, toggleBlockVisible } from '@/features/admin/builder-actions';
import { AdminHeader, EmptyState } from '@/features/admin/ui';

export const metadata: Metadata = { title: 'Админка · Конструктор', robots: { index: false } };

// Русские названия типов блоков.
const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero (шапка)',
  services: 'Услуги',
  cases: 'Кейсы',
  reviews: 'Отзывы',
  faq: 'FAQ',
  cta: 'Призыв к действию',
};

export default async function BuilderPage() {
  await requireRole('ADMIN');
  const blocks = await prisma.pageBlock.findMany({
    where: { page: 'home' },
    orderBy: { order: 'asc' },
  });

  const btn =
    'grid h-9 w-9 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-accent/50 hover:text-ink disabled:opacity-30';

  return (
    <div>
      <AdminHeader
        title="Конструктор главной"
        description="Порядок и видимость блоков главной страницы — без изменения кода."
      />

      {blocks.length === 0 ? (
        <EmptyState>Блоки не заданы. Запустите сид или добавьте вручную.</EmptyState>
      ) : (
        <div className="space-y-2">
          {blocks.map((b, i) => {
            const title = (b.props as { title?: string })?.title;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-card border border-hair/15 bg-panel p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-faint">{i + 1}</span>
                  <div>
                    <p className="font-medium">
                      {BLOCK_LABELS[b.type] ?? b.type}
                      {!b.isVisible && (
                        <span className="ml-2 text-xs text-ink-faint">(скрыт)</span>
                      )}
                    </p>
                    {title && <p className="text-xs text-ink-soft">{title}</p>}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" title="Вверх" disabled={i === 0} className={btn}>
                      <ArrowUp size={15} />
                    </button>
                  </form>
                  <form action={moveBlock}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      type="submit"
                      title="Вниз"
                      disabled={i === blocks.length - 1}
                      className={btn}
                    >
                      <ArrowDown size={15} />
                    </button>
                  </form>
                  <form action={toggleBlockVisible}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" title={b.isVisible ? 'Скрыть' : 'Показать'} className={btn}>
                      {b.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
