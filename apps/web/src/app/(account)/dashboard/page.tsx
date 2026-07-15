import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Package } from 'lucide-react';
import { requireUser } from '@/shared/auth/session';
import { getUserOrders, getUserOrderStats } from '@/features/orders/queries';
import { Card } from '@/shared/ui/Card';
import { StatusPill } from '@/shared/ui/StatusPill';
import { Button } from '@/shared/ui/Button';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Кабинет', robots: { index: false } };

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, orders] = await Promise.all([
    getUserOrderStats(user.id),
    getUserOrders(user.id),
  ]);
  const recent = orders.slice(0, 4);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Здравствуйте, {user.name ?? 'клиент'}
      </h1>
      <p className="mt-1 text-ink-soft">Обзор ваших заказов и активности.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Всего заказов</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.total}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Активных</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.active}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Новых уведомлений
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.unreadNotifications}</p>
        </Card>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Последние заказы</h2>
        <Link href="/orders" className="text-sm text-accent hover:opacity-80">
          Все заказы →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="glass-panel mt-4 flex flex-col items-center gap-3 p-10 text-center">
          <Package className="text-ink-faint" size={32} />
          <p className="text-ink-soft">У вас пока нет заказов.</p>
          <Link href="/services">
            <Button>
              Выбрать услугу <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {recent.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-faint">№{o.number}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="mt-1 truncate font-medium">{o.service.title}</p>
                  <p className="text-xs text-ink-faint">{formatDate(o.createdAt)}</p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">{formatPrice(o.amount)}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
