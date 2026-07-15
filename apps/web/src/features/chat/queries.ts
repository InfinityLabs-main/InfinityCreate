import { prisma } from '@nebula/db';

// Получить (или создать) основной тикет поддержки клиента.
// У клиента один общий тикет поддержки; тикеты по заказам — отдельно (Спринт 5+).
export async function getOrCreateSupportTicket(clientId: string) {
  const existing = await prisma.ticket.findFirst({
    where: { clientId, orderId: null },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return existing;

  return prisma.ticket.create({
    data: { clientId, subject: 'Поддержка', status: 'OPEN' },
  });
}

// Сообщения тикета с автором и вложениями. Проверка владения — на уровне
// вызова (передаётся clientId).
export async function getTicketMessages(ticketId: string) {
  return prisma.message.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, role: true } },
      media: { select: { id: true, key: true, mime: true, size: true } },
    },
  });
}

// Тикет с проверкой, что он принадлежит клиенту (рубеж №2).
export async function getClientTicket(clientId: string, ticketId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, clientId },
  });
}
