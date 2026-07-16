'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  excerpt: z.string().max(400).optional(),
  body: z.string().min(1),
  tags: z.string().optional(),
});

export async function createPost(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    body: formData.get('body'),
    tags: (formData.get('tags') as string) || undefined,
  });
  if (!parsed.success) redirect('/admin/blog?error=validation');
  const d = parsed.data;
  const publish = formData.get('publish') === 'on';

  const created = await prisma.post.create({
    data: {
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      body: { blocks: [{ type: 'text', text: d.body }] },
      tags: (d.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      seoTitle: d.title,
      seoDescription: d.excerpt,
      publishedAt: publish ? new Date() : null,
    },
  });
  await writeAudit({ actorId: user.id, action: 'post.create', target: `Post:${created.id}` });
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function togglePostPublished(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  await prisma.post.update({
    where: { id },
    data: { publishedAt: post.publishedAt ? null : new Date() },
  });
  await writeAudit({ actorId: user.id, action: 'post.togglePublish', target: `Post:${id}` });
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

export async function deletePost(formData: FormData): Promise<void> {
  const user = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAudit({ actorId: user.id, action: 'post.delete', target: `Post:${id}` });
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}
