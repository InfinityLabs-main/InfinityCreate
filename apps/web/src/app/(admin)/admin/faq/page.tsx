import type { Metadata } from 'next';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { createFaq, deleteFaq, toggleFaqVisible } from '@/features/admin/content-actions';
import { AdminHeader } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';

export const metadata: Metadata = { title: 'Админка · FAQ', robots: { index: false } };

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';

export default async function AdminFaqPage() {
  await requireRole('ADMIN');
  const items = await prisma.faq.findMany({ orderBy: { order: 'asc' } });

  return (
    <div>
      <AdminHeader title="FAQ" description="Частые вопросы на публичной странице." />

      <div className="mb-8 rounded-card border border-hair/15 bg-panel p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold">Добавить вопрос</h2>
        <form action={createFaq} className="flex flex-col gap-3">
          <input name="question" required placeholder="Вопрос" className={field} />
          <textarea name="answer" required rows={3} placeholder="Ответ" className={`${field} resize-y`} />
          <div>
            <Button type="submit">Добавить</Button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {items.map((f) => (
          <div
            key={f.id}
            className="flex items-start justify-between gap-4 rounded-card border border-hair/15 bg-panel p-5 shadow-card"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {f.question}
                {!f.isVisible && <span className="ml-2 text-xs text-ink-faint">(скрыт)</span>}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{f.answer}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <form action={toggleFaqVisible}>
                <input type="hidden" name="id" value={f.id} />
                <button
                  type="submit"
                  title={f.isVisible ? 'Скрыть' : 'Показать'}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
                >
                  {f.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </form>
              <form action={deleteFaq}>
                <input type="hidden" name="id" value={f.id} />
                <button
                  type="submit"
                  title="Удалить"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-risk/50 hover:text-risk"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
