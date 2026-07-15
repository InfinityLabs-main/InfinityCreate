import type { MetadataRoute } from 'next';
import { prisma } from '@nebula/db';

const base = process.env.APP_URL ?? 'http://localhost:3000';

// Динамический sitemap: статические маршруты + услуги + опубликованные посты.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([
    prisma.service.findMany({
      where: { isHidden: false, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { publishedAt: { not: null }, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = ['', '/services', '/portfolio', '/cases', '/blog', '/reviews', '/faq', '/contacts'].map(
    (path) => ({ url: `${base}${path}`, lastModified: new Date() }),
  );

  return [
    ...staticRoutes,
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
