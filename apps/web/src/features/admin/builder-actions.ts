'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

// Конструктор главной: перестановка и скрытие блоков без изменения кода.
// Порядок хранится в PageBlock.order; меняем местами соседей.

export async function moveBlock(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const dir = String(formData.get('dir') ?? ''); // "up" | "down"

  const block = await prisma.pageBlock.findUnique({ where: { id } });
  if (!block) return;

  // Сосед в направлении перемещения.
  const neighbor = await prisma.pageBlock.findFirst({
    where: {
      page: block.page,
      order: dir === 'up' ? { lt: block.order } : { gt: block.order },
    },
    orderBy: { order: dir === 'up' ? 'desc' : 'asc' },
  });
  if (!neighbor) return;

  // Меняем order местами в транзакции.
  await prisma.$transaction([
    prisma.pageBlock.update({ where: { id: block.id }, data: { order: neighbor.order } }),
    prisma.pageBlock.update({ where: { id: neighbor.id }, data: { order: block.order } }),
  ]);

  await writeAudit({ actorId: user.id, action: 'block.move', target: `PageBlock:${id}`, meta: { dir } });
  revalidatePath('/admin/builder');
  revalidatePath('/');
}

export async function toggleBlockVisible(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const block = await prisma.pageBlock.findUnique({ where: { id } });
  if (!block) return;
  await prisma.pageBlock.update({ where: { id }, data: { isVisible: !block.isVisible } });
  await writeAudit({ actorId: user.id, action: 'block.toggle', target: `PageBlock:${id}` });
  revalidatePath('/admin/builder');
  revalidatePath('/');
}
