import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/shared/auth/session';
import { getSupportTicket } from '@/features/admin/support-queries';
import { assignTicketToMe, setTicketStatus } from '@/features/admin/support-actions';
import { ChatWindow } from '@/features/chat/ChatWindow';
import type { SerializedMessage } from '@/features/chat/actions';
import { AdminHeader } from '@/features/admin/ui';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

export const metadata: Metadata = { title: 'Админка · Обращение', robots: { index: false } };

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireRole('MANAGER');
  const { id } = await params;
  const ticket = await getSupportTicket(id);
  if (!ticket) notFound();

  const initialMessages: SerializedMessage[] = ticket.messages.map((m) => ({
    id: m.id,
    ticketId: m.ticketId,
    authorId: m.authorId,
    authorName: m.author.name,
    authorRole: m.author.role,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    media: m.media,
  }));

  const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? 'http://localhost:4000';

  return (
    <div>
      <Link href="/admin/support" className="text-sm text-ink-soft hover:text-ink">
        ← К обращениям
      </Link>
      <AdminHeader
        title={ticket.client.name ?? ticket.client.email}
        description={`Обращение · ${ticket.subject ?? 'Поддержка'}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <ChatWindow
          ticketId={ticket.id}
          currentUserId={staff.id}
          initialMessages={initialMessages}
          realtimeUrl={realtimeUrl}
        />

        <aside className="space-y-4">
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Клиент</p>
            <p className="mt-1 font-medium">{ticket.client.name ?? '—'}</p>
            <p className="text-sm text-ink-soft">{ticket.client.email}</p>
          </Card>

          <Card>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-faint">
              Действия
            </p>
            <form action={assignTicketToMe} className="mb-2">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <Button type="submit" variant="outline" className="w-full">
                Взять на себя
              </Button>
            </form>
            <div className="flex gap-2">
              <form action={setTicketStatus} className="flex-1">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <input type="hidden" name="status" value="CLOSED" />
                <Button type="submit" variant="ghost" className="w-full">
                  Закрыть
                </Button>
              </form>
              <form action={setTicketStatus} className="flex-1">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <input type="hidden" name="status" value="OPEN" />
                <Button type="submit" variant="ghost" className="w-full">
                  Открыть
                </Button>
              </form>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
