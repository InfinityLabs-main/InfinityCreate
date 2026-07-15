import { prisma } from '@nebula/db';

// Заказы конкретного пользователя (рубеж №2 — фильтр по владельцу).
export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { service: { select: { title: true, slug: true } } },
  });
}

// Один заказ с проверкой владения. Возвращает null, если не его.
export async function getUserOrder(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      service: { select: { title: true, slug: true } },
      assignee: { select: { name: true } },
      documents: { orderBy: { createdAt: 'desc' } },
      timeline: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
}

// Метрики для дашборда.
export async function getUserOrderStats(userId: string) {
  const [total, active, unreadNotifications] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({
      where: { userId, status: { in: ['NEW', 'DISCUSSION', 'IN_PROGRESS', 'REVIEW'] } },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { total, active, unreadNotifications };
}
