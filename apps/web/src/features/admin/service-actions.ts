'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

// Услуги — полный CRUD (ADMIN). Списковые поля приходят строкой через запятую/
// перенос строки; парсим в массивы. Цена — в рублях из формы → копейки.

function toList(v: FormDataEntryValue | null): string[] {
  return String(v ?? '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toFaq(v: FormDataEntryValue | null): { q: string; a: string }[] {
  // Формат ввода: "вопрос | ответ" на строку.
  return String(v ?? '')
    .split('\n')
    .map((line) => line.split('|').map((s) => s.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => ({ q: parts[0]!, a: parts[1]! }));
}

const serviceSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефис'),
  excerpt: z.string().min(2).max(400),
  categoryId: z.string().min(1),
  priceFromRub: z.coerce.number().int().nonnegative(),
  durationDays: z.coerce.number().int().positive(),
});

function parseForm(formData: FormData) {
  return serviceSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    categoryId: formData.get('categoryId'),
    priceFromRub: formData.get('priceFromRub'),
    durationDays: formData.get('durationDays'),
  });
}

export async function createService(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const parsed = parseForm(formData);
  if (!parsed.success) redirect('/admin/services?error=validation');
  const d = parsed.data;

  const created = await prisma.service.create({
    data: {
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      categoryId: d.categoryId,
      priceFrom: d.priceFromRub * 100,
      durationDays: d.durationDays,
      description: { blocks: [{ type: 'text', text: String(formData.get('description') ?? '') }] },
      advantages: toList(formData.get('advantages')),
      stages: toList(formData.get('stages')),
      faq: toFaq(formData.get('faq')),
      techStack: toList(formData.get('techStack')),
      seoTitle: (formData.get('seoTitle') as string) || d.title,
      seoDescription: (formData.get('seoDescription') as string) || d.excerpt,
    },
  });

  await writeAudit({ actorId: user.id, action: 'service.create', target: `Service:${created.id}` });
  revalidateTag('services');
  revalidatePath('/admin/services');
  revalidatePath('/services');
  redirect('/admin/services');
}

export async function updateService(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const parsed = parseForm(formData);
  if (!id || !parsed.success) redirect(`/admin/services/${id}?error=validation`);
  const d = parsed.data;

  await prisma.service.update({
    where: { id },
    data: {
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      categoryId: d.categoryId,
      priceFrom: d.priceFromRub * 100,
      durationDays: d.durationDays,
      description: { blocks: [{ type: 'text', text: String(formData.get('description') ?? '') }] },
      advantages: toList(formData.get('advantages')),
      stages: toList(formData.get('stages')),
      faq: toFaq(formData.get('faq')),
      techStack: toList(formData.get('techStack')),
      seoTitle: (formData.get('seoTitle') as string) || d.title,
      seoDescription: (formData.get('seoDescription') as string) || d.excerpt,
    },
  });

  await writeAudit({ actorId: user.id, action: 'service.update', target: `Service:${id}` });
  revalidateTag('services');
  revalidatePath('/admin/services');
  revalidatePath(`/services/${d.slug}`);
  redirect('/admin/services');
}

// Тумблеры: скрыть/показать, закрепить/открепить.
export async function toggleServiceHidden(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return;
  await prisma.service.update({ where: { id }, data: { isHidden: !svc.isHidden } });
  await writeAudit({
    actorId: user.id,
    action: 'service.toggleHidden',
    target: `Service:${id}`,
    meta: { isHidden: !svc.isHidden },
  });
  revalidatePath('/admin/services');
  revalidatePath('/services');
}

export async function toggleServicePinned(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc) return;
  await prisma.service.update({ where: { id }, data: { isPinned: !svc.isPinned } });
  await writeAudit({
    actorId: user.id,
    action: 'service.togglePinned',
    target: `Service:${id}`,
    meta: { isPinned: !svc.isPinned },
  });
  revalidatePath('/admin/services');
}

// Мягкое удаление.
export async function deleteService(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.service.update({ where: { id }, data: { deletedAt: new Date(), isHidden: true } });
  await writeAudit({ actorId: user.id, action: 'service.delete', target: `Service:${id}` });
  revalidatePath('/admin/services');
  revalidatePath('/services');
}
