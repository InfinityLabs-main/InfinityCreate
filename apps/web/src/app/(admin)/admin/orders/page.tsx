import type { Metadata } from 'next';
import Link from 'next/link';
import type { OrderStatus } from '@nebula/db';
import { getAdminOrders } from '@/features/admin/order-queries';
import { AdminHeader, Table, Row, Cell, EmptyState } from '@/features/admin/ui';
import { StatusPill } from '@/shared/ui/StatusPill';
import { ORDER_STATUSES, STATUS_LABELS } from '@/domain/orders/status';
import { formatPrice, formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export const metadata: Metadata = { title: 'Админка · Заказы', robots: { index: false } };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const active = ORDER_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined;
  const orders = await getAdminOrders(active);

  const chip = (isActive: boolean) =>
    cn(
      'rounded-full border px-3 py-1.5 text-sm transition-colors',
      isActive
        ? 'border-accent/50 bg-accent/10 text-ink'
        : 'border-hair/25 text-ink-soft hover:text-ink hover:border-accent/40',
    );

  return (
    <div>
      <AdminHeader title="Заказы" description="Все заказы платформы и их статусы." />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={chip(!active)}>
          Все
        </Link>
        {ORDER_STATUSES.map((st) => (
          <Link key={st} href={`/admin/orders?status=${st}`} className={chip(active === st)}>
            {STATUS_LABELS[st]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState>Заказов с этим статусом нет.</EmptyState>
      ) : (
        <Table head={['№', 'Услуга', 'Клиент', 'Исполнитель', 'Статус', 'Сумма', 'Дата']}>
          {orders.map((o) => (
            <Row key={o.id}>
              <Cell className="font-mono text-xs">
                <Link href={`/admin/orders/${o.id}`} className="text-ink-faint hover:text-accent">
                  №{o.number}
                </Link>
              </Cell>
              <Cell className="font-medium">
                <Link href={`/admin/orders/${o.id}`} className="hover:text-accent">
                  {o.service.title}
                </Link>
              </Cell>
              <Cell className="text-ink-soft">{o.user.name ?? o.user.email}</Cell>
              <Cell className="text-ink-soft">{o.assignee?.name ?? '—'}</Cell>
              <Cell>
                <StatusPill status={o.status} />
              </Cell>
              <Cell className="tabular-nums">{formatPrice(o.amount)}</Cell>
              <Cell className="text-ink-faint">{formatDate(o.createdAt)}</Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
