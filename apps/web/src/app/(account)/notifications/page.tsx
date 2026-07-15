import Link from 'next/link';
import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';
import { markAllRead } from '@/features/notifications/actions';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Уведомления', robots: { index: false } };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const hasUnread = items.some((n) => !n.readAt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Уведомления</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <Button variant="ghost" type="submit">
              Прочитать все
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-panel mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <Bell className="text-ink-faint" size={32} />
          <p className="text-ink-soft">Уведомлений пока нет.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {items.map((n) => {
            const inner = (
              <div
                className={cn(
                  'rounded-xl border px-4 py-3 transition-colors',
                  n.readAt
                    ? 'border-hair/15 bg-panel'
                    : 'border-accent/30 bg-accent/5',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{n.title}</p>
                  {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </div>
                {n.body && <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-faint">{formatDate(n.createdAt)}</p>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
