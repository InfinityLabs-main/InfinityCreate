import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Package } from 'lucide-react';
import { requireUser } from '@/shared/auth/session';
import { getUserOrders } from '@/features/orders/queries';
import { Card } from '@/shared/ui/Card';
import { StatusPill } from '@/shared/ui/StatusPill';
import { Button } from '@/shared/ui/Button';
import { formatPrice, formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Мои заказы', robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Мои заказы</h1>
      <p className="mt-1 text-ink-soft">История и статусы всех ваших заказов.</p>

      {orders.length === 0 ? (
        <div className="glass-panel mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <Package className="text-ink-faint" size={32} />
          <p className="text-ink-soft">Заказов пока нет.</p>
          <Link href="/services">
            <Button>
              Выбрать услугу <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-faint">№{o.number}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="mt-1 truncate font-medium">{o.service.title}</p>
                  <p className="text-xs text-ink-faint">Создан {formatDate(o.createdAt)}</p>
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
