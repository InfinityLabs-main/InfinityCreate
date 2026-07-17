import { prisma } from '@nebula/db';
import { cache } from 'react';

// Только опубликованные посты (publishedAt в прошлом).
export const getPublishedPosts = cache(async () => {
  return prisma.post.findMany({
    where: { deletedAt: null, publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
  });
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
