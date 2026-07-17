import { prisma } from '@nebula/db';
import { cache } from 'react';

// Страницы рендерятся динамически (force-dynamic) — запросы в рантайме
// при доступной БД, fail-safe не нужен.

// Отзывы — только одобренные модерацией.
export const getApprovedReviews = cache(async () => {
  return prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  });
});

export const getVisibleFaq = cache(async () => {
  return prisma.faq.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' },
  });
});

// Настройки сайта — key-value, возвращаем как объект.
export const getSiteSettings = cache(async () => {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
});
