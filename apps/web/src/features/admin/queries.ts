import { prisma } from '@nebula/db';

// Метрики дашборда админки.
export async function getDashboardStats() {
  const [orders, activeOrders, clients, revenue, newClients, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['NEW', 'DISCUSSION', 'IN_PROGRESS', 'REVIEW'] } } }),
    prisma.user.count({ where: { role: 'CLIENT', deletedAt: null } }),
    // Доход — сумма успешных платежей (копейки).
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
    prisma.user.count({
      where: {
        role: 'CLIENT',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    orders,
    activeOrders,
    clients,
    newClients,
    revenue: revenue._sum.amount ?? 0,
    recentOrders,
  };
}
