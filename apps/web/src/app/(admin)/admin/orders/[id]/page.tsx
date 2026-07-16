import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/shared/auth/session';
import { getAdminOrder, getAssignees } from '@/features/admin/order-queries';
import { StatusControl, AssignControl } from '@/features/admin/OrderControls';
import { AdminHeader } from '@/features/admin/ui';
import { StatusPill } from '@/shared/ui/StatusPill';
import { Card } from '@/shared/ui/Card';
import { STATUS_LABELS } from '@/domain/orders/status';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Админка · Заказ', robots: { index: false } };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('MANAGER');
  const { id } = await params;
  const [order, assignees] = await Promise.all([getAdminOrder(id), getAssignees()]);
  if (!order) notFound();

  const isPaid = order.payments.some((p) => p.status === 'SUCCEEDED');

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-ink-soft hover:text-ink">
        ← К заказам
      </Link>
      <AdminHeader
        title={`Заказ №${order.number}`}
        description={order.service.title}
        action={<StatusPill status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Клиент</p>
            <p className="mt-1 font-medium">{order.user.name ?? '—'}</p>
            <p className="text-sm text-ink-soft">{order.user.email}</p>
            {order.details && (
              <>
                <p className="mt-4 font-mono text-xs uppercase tracking-wide text-ink-faint">
                  Требования
                </p>
                <p className="mt-1 text-ink-soft">{order.details}</p>
              </>
            )}
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">История статусов</h2>
            <ol className="relative ml-3 border-l border-hair/25">
              {order.timeline.map((e) => (
                <li key={e.id} className="mb-4 ml-5">
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-accent-gradient" />
                  <p className="text-sm font-medium">
                    {e.from ? `${STATUS_LABELS[e.from]} → ${STATUS_LABELS[e.to]}` : STATUS_LABELS[e.to]}
                  </p>
                  {e.comment && <p className="text-sm text-ink-soft">{e.comment}</p>}
                  <p className="text-xs text-ink-faint">{formatDate(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Сумма</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatPrice(order.amount)}</p>
            <p className="mt-1 text-sm">
              {isPaid ? (
                <span className="text-ok">оплачен</span>
              ) : (
                <span className="text-ink-faint">не оплачен</span>
              )}
            </p>
          </Card>
          <Card>
            <StatusControl orderId={order.id} current={order.status} />
          </Card>
          <Card>
            <AssignControl
              orderId={order.id}
              currentAssigneeId={order.assignee?.id ?? null}
              assignees={assignees}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
