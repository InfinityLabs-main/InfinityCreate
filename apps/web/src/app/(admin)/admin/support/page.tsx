import type { Metadata } from 'next';
import Link from 'next/link';
import type { TicketStatus } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { getSupportTickets } from '@/features/admin/support-queries';
import { AdminHeader, Table, Row, Cell, EmptyState } from '@/features/admin/ui';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export const metadata: Metadata = { title: 'Админка · Обращения', robots: { index: false } };

const TICKET_STATUS: { key: TicketStatus; label: string }[] = [
  { key: 'OPEN', label: 'Открыты' },
  { key: 'PENDING', label: 'Ждут ответа' },
  { key: 'CLOSED', label: 'Закрыты' },
];
const STATUS_RU: Record<TicketStatus, string> = {
  OPEN: 'Открыто',
  PENDING: 'Ждёт ответа',
  CLOSED: 'Закрыто',
};

export default async function SupportInbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole('MANAGER');
  const sp = await searchParams;
  const status = TICKET_STATUS.find((t) => t.key === sp.status)?.key;
  const tickets = await getSupportTickets({ status, q: sp.q });

  const chip = (isActive: boolean) =>
    cn(
      'rounded-full border px-3 py-1.5 text-sm transition-colors',
      isActive
        ? 'border-accent/50 bg-accent/10 text-ink'
        : 'border-hair/25 text-ink-soft hover:text-ink hover:border-accent/40',
    );

  return (
    <div>
      <AdminHeader title="Обращения" description="Очередь чатов поддержки." />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href="/admin/support" className={chip(!status)}>
          Все
        </Link>
        {TICKET_STATUS.map((t) => (
          <Link key={t.key} href={`/admin/support?status=${t.key}`} className={chip(status === t.key)}>
            {t.label}
          </Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <EmptyState>Обращений нет.</EmptyState>
      ) : (
        <Table head={['Клиент', 'Тема', 'Статус', 'Сообщений', 'Исполнитель', 'Обновлено']}>
          {tickets.map((t) => (
            <Row key={t.id}>
              <Cell className="font-medium">
                <Link href={`/admin/support/${t.id}`} className="hover:text-accent">
                  {t.client.name ?? t.client.email}
                </Link>
              </Cell>
              <Cell className="text-ink-soft">{t.subject ?? 'Поддержка'}</Cell>
              <Cell className="text-ink-soft">{STATUS_RU[t.status]}</Cell>
              <Cell className="tabular-nums">{t._count.messages}</Cell>
              <Cell className="text-ink-soft">{t.assignee?.name ?? '—'}</Cell>
              <Cell className="text-ink-faint">{formatDate(t.updatedAt)}</Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
