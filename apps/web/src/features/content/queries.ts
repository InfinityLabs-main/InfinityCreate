import { prisma } from '@nebula/db';
import { cache } from 'react';

// Fail-safe при недоступной БД во время сборки (см. services/queries.ts).

// Отзывы — только одобренные модерацией.
export const getApprovedReviews = cache(async () => {
  try {
    return await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true } } },
    });
  } catch {
    return [];
  }
});

export const getVisibleFaq = cache(async () => {
  try {
    return await prisma.faq.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  } catch {
    return [];
  }
});

// Настройки сайта — key-value, возвращаем как объект.
export const getSiteSettings = cache(async () => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
});
