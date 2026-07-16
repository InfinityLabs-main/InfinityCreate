import { prisma, type OrderStatus } from '@nebula/db';

// Список заказов для админки с фильтром по статусу.
export async function getAdminOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { title: true } },
      user: { select: { name: true, email: true } },
      assignee: { select: { name: true } },
    },
  });
}

export async function getAdminOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { title: true, slug: true } },
      user: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      payments: { orderBy: { createdAt: 'desc' } },
      timeline: { orderBy: { createdAt: 'asc' } },
      documents: true,
    },
  });
}

// Менеджеры для назначения исполнителя.
export async function getAssignees() {
  return prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'ADMIN'] }, deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}
