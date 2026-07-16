import type { Metadata } from 'next';
import Link from 'next/link';
import { getDashboardStats } from '@/features/admin/queries';
import { AdminHeader, StatTile, Table, Row, Cell, EmptyState } from '@/features/admin/ui';
import { StatusPill } from '@/shared/ui/StatusPill';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Админка · Обзор', robots: { index: false } };

export default async function AdminDashboard() {
  const s = await getDashboardStats();

  return (
    <div>
      <AdminHeader title="Обзор" description="Ключевые показатели платформы." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Заказов всего" value={String(s.orders)} />
        <StatTile label="Активных проектов" value={String(s.activeOrders)} />
        <StatTile label="Доход" value={formatPrice(s.revenue)} hint="оплаченные заказы" />
        <StatTile label="Клиентов" value={String(s.clients)} hint={`+${s.newClients} за 30 дней`} />
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold tracking-tight">Последние заказы</h2>
      {s.recentOrders.length === 0 ? (
        <EmptyState>Заказов пока нет.</EmptyState>
      ) : (
        <Table head={['№', 'Услуга', 'Клиент', 'Статус', 'Сумма', 'Дата']}>
          {s.recentOrders.map((o) => (
            <Row key={o.id}>
              <Cell className="font-mono text-xs text-ink-faint">
                <Link href={`/admin/orders/${o.id}`} className="hover:text-accent">
                  №{o.number}
                </Link>
              </Cell>
              <Cell className="font-medium">{o.service.title}</Cell>
              <Cell className="text-ink-soft">{o.user.name ?? o.user.email}</Cell>
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
