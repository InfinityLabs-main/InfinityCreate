import { prisma } from '@nebula/db';
import { cache } from 'react';

// Только опубликованные посты (publishedAt в прошлом). Fail-safe при сборке.
export const getPublishedPosts = cache(async () => {
  try {
    return await prisma.post.findMany({
      where: { deletedAt: null, publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
    });
  } catch {
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug, deletedAt: null, publishedAt: { not: null, lte: new Date() } },
  });
});

// Fail-safe: при недоступной БД (напр. во время docker build) возвращаем [],
// чтобы generateStaticParams не ронял сборку. Страницы отрендерятся по запросу.
export const getAllPostSlugs = cache(async () => {
  try {
    const rows = await prisma.post.findMany({
      where: { deletedAt: null, publishedAt: { not: null } },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
});
