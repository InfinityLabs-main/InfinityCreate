import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import {
  getOrCreateSupportTicket,
  getTicketMessages,
} from '@/features/chat/queries';
import { ChatWindow } from '@/features/chat/ChatWindow';
import type { SerializedMessage } from '@/features/chat/actions';

export const metadata: Metadata = { title: 'Чат', robots: { index: false } };

export default async function ChatPage() {
  const user = await requireUser();
  const ticket = await getOrCreateSupportTicket(user.id);
  const rows = await getTicketMessages(ticket.id);

  const initialMessages: SerializedMessage[] = rows.map((m) => ({
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
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Чат с поддержкой</h1>
      <ChatWindow
        ticketId={ticket.id}
        currentUserId={user.id}
        initialMessages={initialMessages}
        realtimeUrl={realtimeUrl}
      />
    </div>
  );
}
