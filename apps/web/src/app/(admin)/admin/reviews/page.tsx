import type { Metadata } from 'next';
import { Star, Check, Trash2 } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { approveReview, deleteReview } from '@/features/admin/content-actions';
import { AdminHeader, EmptyState } from '@/features/admin/ui';
import { formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Админка · Отзывы', robots: { index: false } };

export default async function AdminReviewsPage() {
  await requireRole('ADMIN');
  const reviews = await prisma.review.findMany({
    orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    include: { client: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <AdminHeader title="Отзывы" description="Модерация: одобрение и удаление." />

      {reviews.length === 0 ? (
        <EmptyState>Отзывов пока нет.</EmptyState>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-4 rounded-card border border-hair/15 bg-panel p-5 shadow-card"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < r.rating ? 'fill-warn text-warn' : 'text-ink-faint/40'}
                      />
                    ))}
                  </div>
                  {r.isApproved ? (
                    <span className="text-xs text-ok">одобрен</span>
                  ) : (
                    <span className="text-xs text-warn">на модерации</span>
                  )}
                </div>
                <p className="mt-2 text-ink-soft">«{r.body}»</p>
                <p className="mt-1 text-xs text-ink-faint">
                  {r.authorName ?? r.client.name ?? r.client.email} · {formatDate(r.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {!r.isApproved && (
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      title="Одобрить"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-ok/50 hover:text-ok"
                    >
                      <Check size={16} />
                    </button>
                  </form>
                )}
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
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
      )}
    </div>
  );
}
