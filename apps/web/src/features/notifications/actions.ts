'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';

// Пометить все свои уведомления прочитанными. Владение — через userId.
export async function markAllRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}
