'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

// ── Отзывы: модерация ───────────────────────────────────────
export async function approveReview(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.review.update({ where: { id }, data: { isApproved: true } });
  await writeAudit({ actorId: user.id, action: 'review.approve', target: `Review:${id}` });
  revalidatePath('/admin/reviews');
  revalidatePath('/reviews');
}

export async function deleteReview(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.review.delete({ where: { id } });
  await writeAudit({ actorId: user.id, action: 'review.delete', target: `Review:${id}` });
  revalidatePath('/admin/reviews');
  revalidatePath('/reviews');
}

// ── FAQ: CRUD ───────────────────────────────────────────────
const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(2000),
});

export async function createFaq(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const parsed = faqSchema.safeParse({
    question: formData.get('question'),
    answer: formData.get('answer'),
  });
  if (!parsed.success) return;
  const count = await prisma.faq.count();
  const created = await prisma.faq.create({ data: { ...parsed.data, order: count } });
  await writeAudit({ actorId: user.id, action: 'faq.create', target: `Faq:${created.id}` });
  revalidatePath('/admin/faq');
  revalidatePath('/faq');
}

export async function deleteFaq(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.faq.delete({ where: { id } });
  await writeAudit({ actorId: user.id, action: 'faq.delete', target: `Faq:${id}` });
  revalidatePath('/admin/faq');
  revalidatePath('/faq');
}

export async function toggleFaqVisible(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) return;
  await prisma.faq.update({ where: { id }, data: { isVisible: !faq.isVisible } });
  await writeAudit({ actorId: user.id, action: 'faq.toggle', target: `Faq:${id}` });
  revalidatePath('/admin/faq');
  revalidatePath('/faq');
}

// ── Настройки сайта ─────────────────────────────────────────
// Сохраняет группу настроек (general/contacts/socials/seo) как JSON под ключом.
export async function saveSettings(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const key = String(formData.get('__key') ?? '');
  if (!['general', 'contacts', 'socials', 'seo'].includes(key)) return;

  // Собираем все поля формы (кроме служебного __key) в объект.
  const value: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k === '__key') continue;
    value[k] = String(v);
  }

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  await writeAudit({ actorId: user.id, action: 'settings.update', target: `SiteSetting:${key}` });
  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
}
