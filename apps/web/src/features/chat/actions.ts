'use server';

import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';

// Персист сообщений делает web-приложение (единый источник истины).
// Realtime-сервис лишь ретранслирует событие подписчикам комнаты.

const sendSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1, 'Пустое сообщение').max(4000),
  mediaKeys: z.array(z.string()).max(5).optional(),
});

export type SendMessageResult =
  | { ok: true; message: SerializedMessage }
  | { ok: false; error: string };

export type SerializedMessage = {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string | null;
  authorRole: string;
  body: string;
  createdAt: string;
  media: { id: string; key: string; mime: string; size: number }[];
};

export async function sendMessage(input: {
  ticketId: string;
  body: string;
  mediaKeys?: string[];
}): Promise<SendMessageResult> {
  const user = await requireUser();
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Некорректные данные.' };
  }

  // Владение: клиент пишет только в свой тикет; менеджер/админ — в любой.
  const ticket = await prisma.ticket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return { ok: false, error: 'Обращение не найдено.' };
  if (user.role === 'CLIENT' && ticket.clientId !== user.id) {
    return { ok: false, error: 'Нет доступа к обращению.' };
  }

  const created = await prisma.message.create({
    data: {
      ticketId: ticket.id,
      authorId: user.id,
      body: parsed.data.body,
      ...(parsed.data.mediaKeys && parsed.data.mediaKeys.length > 0
        ? {
            media: {
              connect: parsed.data.mediaKeys.map((key) => ({ key })),
            },
          }
        : {}),
    },
    include: {
      author: { select: { name: true, role: true } },
      media: { select: { id: true, key: true, mime: true, size: true } },
    },
  });

  // Тикет, отвеченный поддержкой, снова OPEN для клиента; наоборот — PENDING.
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: user.role === 'CLIENT' ? 'OPEN' : 'PENDING', updatedAt: new Date() },
  });

  // Уведомление второй стороне (клиенту, если ответил не он).
  if (user.role !== 'CLIENT') {
    await prisma.notification.create({
      data: {
        userId: ticket.clientId,
        type: 'message.new',
        title: 'Новое сообщение от поддержки',
        body: parsed.data.body.slice(0, 120),
        link: '/chat',
      },
    });
  }

  return {
    ok: true,
    message: {
      id: created.id,
      ticketId: created.ticketId,
      authorId: created.authorId,
      authorName: created.author.name,
      authorRole: created.author.role,
      body: created.body,
      createdAt: created.createdAt.toISOString(),
      media: created.media,
    },
  };
}

// Отметить сообщения тикета прочитанными (кроме своих).
export async function markTicketRead(ticketId: string): Promise<void> {
  const user = await requireUser();
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;
  if (user.role === 'CLIENT' && ticket.clientId !== user.id) return;

  await prisma.message.updateMany({
    where: { ticketId, authorId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });
}
