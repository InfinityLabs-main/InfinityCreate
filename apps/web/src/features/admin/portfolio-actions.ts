'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

const schema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефис'),
  description: z.string().min(1),
  category: z.string().max(120).optional(),
  techStack: z.string().optional(),
  link: z.string().url().optional().or(z.literal('')),
  isCase: z.boolean(),
});

export async function createProject(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    category: (formData.get('category') as string) || undefined,
    techStack: (formData.get('techStack') as string) || undefined,
    link: (formData.get('link') as string) || '',
    isCase: formData.get('isCase') === 'on',
  });
  if (!parsed.success) return;
  const d = parsed.data;

  const created = await prisma.project.create({
    data: {
      title: d.title,
      slug: d.slug,
      description: { blocks: [{ type: 'text', text: d.description }] },
      category: d.category,
      techStack: (d.techStack ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      link: d.link || null,
      isCase: d.isCase,
    },
  });
  await writeAudit({ actorId: user.id, action: 'project.create', target: `Project:${created.id}` });
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  revalidatePath('/cases');
}

export async function deleteProject(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAudit({ actorId: user.id, action: 'project.delete', target: `Project:${id}` });
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  revalidatePath('/cases');
}
