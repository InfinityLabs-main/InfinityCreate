'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma, type OrderStatus } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';
import { can } from '@/shared/rbac/policy';
import { canTransition, STATUS_LABELS } from '@/domain/orders/status';

// ── Создание заявки на услугу ───────────────────────────────
const createSchema = z.object({
  serviceId: z.string().min(1),
  details: z.string().max(4000).optional(),
});

export type CreateOrderState = { ok: boolean; error?: string; orderId?: string };

export async function createOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    serviceId: formData.get('serviceId'),
    details: formData.get('details') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'Проверьте данные заявки.' };

  const service = await prisma.service.findFirst({
    where: { id: parsed.data.serviceId, isHidden: false, deletedAt: null },
  });
  if (!service) return { ok: false, error: 'Услуга не найдена.' };

  // Транзакция: заказ + первое событие таймлайна + уведомление.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        amount: service.priceFrom, // фиксируем цену на момент заявки
        details: parsed.data.details,
        status: 'NEW',
        timeline: { create: { to: 'NEW', actorId: user.id, comment: 'Заявка создана' } },
      },
    });
    await tx.notification.create({
      data: {
        userId: user.id,
        type: 'order.created',
        title: 'Заявка принята',
        body: `Заявка №${created.number} на «${service.title}» создана.`,
        link: `/orders/${created.id}`,
      },
    });
    return created;
  });

  revalidatePath('/dashboard');
  revalidatePath('/orders');
  return { ok: true, orderId: order.id };
}

// ── Смена статуса (manager+) ────────────────────────────────
const updateSchema = z.object({
  orderId: z.string().min(1),
  to: z.string().min(1),
  comment: z.string().max(1000).optional(),
});

export type UpdateStatusState = { ok: boolean; error?: string };

export async function updateOrderStatus(
  _prev: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const user = await requireUser();
  if (!can(user.role, 'order.updateStatus')) {
    return { ok: false, error: 'Недостаточно прав.' };
  }

  const parsed = updateSchema.safeParse({
    orderId: formData.get('orderId'),
    to: formData.get('to'),
    comment: formData.get('comment') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'Некорректные данные.' };
  const to = parsed.data.to as OrderStatus;

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return { ok: false, error: 'Заказ не найден.' };

  // Доменное правило: допустим ли переход.
  if (!canTransition(order.status, to)) {
    return {
      ok: false,
      error: `Нельзя перейти из «${STATUS_LABELS[order.status]}» в «${STATUS_LABELS[to]}».`,
    };
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: to } }),
    prisma.orderEvent.create({
      data: {
        orderId: order.id,
        from: order.status,
        to,
        actorId: user.id,
        comment: parsed.data.comment,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'order.status',
        target: `Order:${order.id}`,
        meta: { from: order.status, to },
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order.status',
        title: 'Статус заказа изменён',
        body: `Заказ №${order.number}: ${STATUS_LABELS[to]}.`,
        link: `/orders/${order.id}`,
      },
    }),
  ]);

  revalidatePath(`/orders/${order.id}`);
  revalidatePath('/orders');
  return { ok: true };
}
