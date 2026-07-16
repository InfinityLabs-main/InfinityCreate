'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

const schema = z.object({
  title: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефис'),
  description: z.string().max(400).optional(),
});

export async function createCategory(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: (formData.get('description') as string) || undefined,
  });
  if (!parsed.success) return;

  const count = await prisma.category.count();
  const created = await prisma.category.create({
    data: { ...parsed.data, order: count },
  });
  await writeAudit({ actorId: user.id, action: 'category.create', target: `Category:${created.id}` });
  revalidatePath('/admin/categories');
  revalidatePath('/services');
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  // Нельзя удалить категорию с услугами.
  const inUse = await prisma.service.count({ where: { categoryId: id, deletedAt: null } });
  if (inUse > 0) return;
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAudit({ actorId: user.id, action: 'category.delete', target: `Category:${id}` });
  revalidatePath('/admin/categories');
  revalidatePath('/services');
}
