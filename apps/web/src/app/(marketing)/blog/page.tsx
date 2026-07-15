import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts } from '@/features/blog/queries';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Badge } from '@/shared/ui/Badge';
import { formatDate } from '@/shared/lib/format';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Статьи о разработке, автоматизации, продуктах и технологиях.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Блог', path: '/blog' },
        ])}
      />
      <PageHeader
        eyebrow="Журнал"
        title="Блог"
        description="Разбираем разработку, продукты и автоматизацию — по делу."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Блог', path: '/blog' },
        ]}
      />
      <div className="mx-auto max-w-4xl px-6 pb-20">
        {posts.length === 0 ? (
          <div className="glass-panel p-10 text-center text-ink-soft">
            Статьи появятся здесь после публикации.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-hair/15">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group py-7 first:pt-0">
                <div className="flex items-center gap-3 text-sm text-ink-faint">
                  {p.publishedAt && <time>{formatDate(p.publishedAt)}</time>}
                  {p.tags.slice(0, 2).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <h2 className="mt-2 text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                {p.excerpt && <p className="mt-2 text-ink-soft">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
