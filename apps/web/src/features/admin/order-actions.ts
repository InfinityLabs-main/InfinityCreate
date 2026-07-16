'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

const assignSchema = z.object({
  orderId: z.string().min(1),
  assigneeId: z.string().min(1).nullable(),
});

// Назначить исполнителя заказа (manager+). Записывает аудит и уведомляет.
export async function assignOrder(formData: FormData): Promise<void> {
  const user = await requireRole('MANAGER');
  const raw = {
    orderId: String(formData.get('orderId') ?? ''),
    assigneeId: (formData.get('assigneeId') as string) || null,
  };
  const parsed = assignSchema.safeParse(raw);
  if (!parsed.success) return;

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { assigneeId: parsed.data.assigneeId },
  });

  await writeAudit({
    actorId: user.id,
    action: 'order.assign',
    target: `Order:${order.id}`,
    meta: { assigneeId: parsed.data.assigneeId },
  });

  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath('/admin/orders');
}
