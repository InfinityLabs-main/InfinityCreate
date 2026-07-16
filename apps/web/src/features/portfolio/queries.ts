import { prisma } from '@nebula/db';
import { cache } from 'react';

// isCase=false → работы портфолио; isCase=true → развёрнутые кейсы. Fail-safe.
export const getProjects = cache(async (opts: { isCase?: boolean } = {}) => {
  try {
    return await prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(opts.isCase !== undefined ? { isCase: opts.isCase } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { images: true },
    });
  } catch {
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({
    where: { slug, deletedAt: null },
    include: { images: true },
  });
});

// Fail-safe при недоступной БД во время сборки (см. blog/queries.ts).
export const getAllProjectSlugs = cache(async () => {
  try {
    const rows = await prisma.project.findMany({
      where: { deletedAt: null, isCase: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
});
