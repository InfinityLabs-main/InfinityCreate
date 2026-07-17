import { prisma } from '@nebula/db';
import { cache } from 'react';

// Запросы каталога. Обёрнуты в React cache() — дедупликация в пределах запроса.
// Страницы рендерятся динамически (force-dynamic), поэтому запросы выполняются
// в рантайме при доступной БД — fail-safe не нужен (ошибку лучше показать).

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
  });
});

export const getServices = cache(
  async (opts: { category?: string; q?: string } = {}) => {
    return prisma.service.findMany({
      where: {
        isHidden: false,
        deletedAt: null,
        ...(opts.category ? { category: { slug: opts.category } } : {}),
        ...(opts.q
          ? {
              OR: [
                { title: { contains: opts.q, mode: 'insensitive' } },
                { excerpt: { contains: opts.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    });
  },
);

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findFirst({
    where: { slug, isHidden: false, deletedAt: null },
    include: { category: true, images: true },
  });
});

// Похожие услуги: та же категория, кроме текущей.
export const getRelatedServices = cache(
  async (categoryId: string, excludeId: string, take = 3) => {
    return prisma.service.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        isHidden: false,
        deletedAt: null,
      },
      take,
      include: { category: true },
    });
  },
);

// Все slug'и — для generateStaticParams / ISR.
// Fail-safe при недоступной БД во время сборки (см. blog/queries.ts).
export const getAllServiceSlugs = cache(async () => {
  try {
    const rows = await prisma.service.findMany({
      where: { isHidden: false, deletedAt: null },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
});
