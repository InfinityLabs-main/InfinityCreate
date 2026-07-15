import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText, MessageSquare, CreditCard } from 'lucide-react';
import { requireUser } from '@/shared/auth/session';
import { getUserOrder } from '@/features/orders/queries';
import { StatusPill } from '@/shared/ui/StatusPill';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { STATUS_LABELS } from '@/domain/orders/status';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Заказ', robots: { index: false } };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // Проверка владения внутри запроса (рубеж №2 RBAC).
  const order = await getUserOrder(user.id, id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/orders" className="text-sm text-ink-soft hover:text-ink">
        ← К заказам
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-ink-faint">Заказ №{order.number}</span>
        <StatusPill status={order.status} />
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{order.service.title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {order.details && (
            <Card>
              <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                Требования
              </p>
              <p className="mt-2 text-ink-soft">{order.details}</p>
            </Card>
          )}

          {/* Таймлайн — история переходов статусов (аудит) */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">История</h2>
            {order.timeline.length === 0 ? (
              <p className="text-sm text-ink-faint">Событий пока нет.</p>
            ) : (
              <ol className="relative ml-3 border-l border-hair/25">
                {order.timeline.map((e) => (
                  <li key={e.id} className="mb-5 ml-5">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-accent-gradient" />
                    <p className="text-sm font-medium">
                      {e.from ? (
                        <>
                          {STATUS_LABELS[e.from]} → {STATUS_LABELS[e.to]}
                        </>
                      ) : (
                        STATUS_LABELS[e.to]
                      )}
                    </p>
                    {e.comment && <p className="text-sm text-ink-soft">{e.comment}</p>}
                    <p className="text-xs text-ink-faint">{formatDate(e.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Документы */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Документы</h2>
            {order.documents.length === 0 ? (
              <p className="text-sm text-ink-faint">
                Документы по заказу появятся здесь.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {order.documents.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 rounded-xl border border-hair/20 bg-panel px-4 py-3"
                  >
                    <FileText size={18} className="text-accent" />
                    <span className="flex-1 truncate text-sm">{d.title}</span>
                    <span className="text-xs text-ink-faint">
                      {(d.size / 1024).toFixed(0)} КБ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Сводка + действия */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Сумма</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatPrice(order.amount)}</p>
            {order.assignee?.name && (
              <p className="mt-3 text-sm text-ink-soft">
                Исполнитель: <span className="text-ink">{order.assignee.name}</span>
              </p>
            )}

            {/* Оплата — реализуется в Спринте 3 (пока ведёт в чат/поддержку) */}
            <Button className="mt-5 w-full" disabled>
              <CreditCard size={16} /> Оплатить (скоро)
            </Button>
            <Link href="/chat" className="mt-2 block">
              <Button variant="outline" className="w-full">
                <MessageSquare size={16} /> Обсудить в чате
              </Button>
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
