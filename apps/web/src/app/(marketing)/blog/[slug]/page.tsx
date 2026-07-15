import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/features/blog/queries';
import { parseDescription } from '@/features/services/content';
import { Badge } from '@/shared/ui/Badge';
import { formatDate } from '@/shared/lib/format';
import { JsonLd, breadcrumbLd, articleLd } from '@/shared/seo/jsonld';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Статья не найдена' };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images: post.ogImage ?? post.cover ? [(post.ogImage ?? post.cover)!] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const body = parseDescription(post.body);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Главная', path: '/' },
            { name: 'Блог', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          articleLd({
            title: post.title,
            excerpt: post.excerpt,
            slug: post.slug,
            publishedAt: post.publishedAt,
            cover: post.cover,
          }),
        ]}
      />
      <article className="mx-auto max-w-2xl px-6 py-14">
        <nav aria-label="Хлебные крошки" className="mb-8 flex items-center gap-1.5 text-sm text-ink-faint">
          <Link href="/" className="hover:text-ink">Главная</Link>
          <span className="opacity-50">/</span>
          <Link href="/blog" className="hover:text-ink">Блог</Link>
        </nav>

        <div className="flex items-center gap-3 text-sm text-ink-faint">
          {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
          {post.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>}

        <div className="mt-10 leading-relaxed">
          {body.split('\n\n').map((p, i) => (
            <p key={i} className="mt-4 text-ink-soft first:mt-0">
              {p}
            </p>
          ))}
        </div>
      </article>
    </>
  );
}
