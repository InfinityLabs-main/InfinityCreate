import { prisma, type TicketStatus } from '@nebula/db';

// Очередь обращений с фильтром по статусу и поиском по клиенту.
export async function getSupportTickets(opts: { status?: TicketStatus; q?: string } = {}) {
  return prisma.ticket.findMany({
    where: {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.q
        ? {
            client: {
              OR: [
                { name: { contains: opts.q, mode: 'insensitive' } },
                { email: { contains: opts.q, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      client: { select: { name: true, email: true } },
      assignee: { select: { name: true } },
      _count: { select: { messages: true } },
    },
    take: 100,
  });
}

export async function getSupportTicket(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { name: true, role: true } },
          media: { select: { id: true, key: true, mime: true, size: true } },
        },
      },
    },
  });
}
