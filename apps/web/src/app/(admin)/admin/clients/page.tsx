import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { AdminHeader, Table, Row, Cell, EmptyState } from '@/features/admin/ui';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Админка · Клиенты', robots: { index: false } };

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole('MANAGER');
  const { q } = await searchParams;

  const clients = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } }, orders: { select: { amount: true } } },
    take: 100,
  });

  return (
    <div>
      <AdminHeader title="Клиенты" description="База клиентов, история и баланс." />

      <form action="/admin/clients" method="get" className="relative mb-6 max-w-xs">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени или email"
          className="w-full rounded-xl border border-hair/30 bg-panel py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent/60"
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState>{q ? `По запросу «${q}» ничего не найдено.` : 'Клиентов пока нет.'}</EmptyState>
      ) : (
        <Table head={['Имя', 'Email', 'Заказов', 'Сумма', 'Регистрация']}>
          {clients.map((c) => {
            const total = c.orders.reduce((sum, o) => sum + o.amount, 0);
            return (
              <Row key={c.id}>
                <Cell className="font-medium">{c.name ?? '—'}</Cell>
                <Cell className="text-ink-soft">{c.email}</Cell>
                <Cell className="tabular-nums">{c._count.orders}</Cell>
                <Cell className="tabular-nums">{formatPrice(total)}</Cell>
                <Cell className="text-ink-faint">{formatDate(c.createdAt)}</Cell>
              </Row>
            );
          })}
        </Table>
      )}
    </div>
  );
}
