import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import {
  getProjectBySlug,
  getAllProjectSlugs,
} from '@/features/portfolio/queries';
import { parseDescription } from '@/features/services/content';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Кейс не найден' };
  const summary = parseDescription(project.description).slice(0, 160);
  return {
    title: project.title,
    description: summary,
    alternates: { canonical: `/cases/${project.slug}` },
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.isCase) notFound();

  const body = parseDescription(project.description);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Кейсы', path: '/cases' },
          { name: project.title, path: `/cases/${project.slug}` },
        ])}
      />
      <article className="mx-auto max-w-3xl px-6 py-14">
        <nav aria-label="Хлебные крошки" className="mb-8 flex items-center gap-1.5 text-sm text-ink-faint">
          <Link href="/" className="hover:text-ink">Главная</Link>
          <span className="opacity-50">/</span>
          <Link href="/cases" className="hover:text-ink">Кейсы</Link>
        </nav>

        {project.category && (
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            {project.category}
          </span>
        )}
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight">{project.title}</h1>

        {project.techStack.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}

        <div className="mt-10">
          {body.split('\n\n').map((p, i) => (
            <p key={i} className="mt-4 text-ink-soft first:mt-0">
              {p}
            </p>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block"
          >
            <Button variant="outline">
              Открыть проект <ExternalLink size={15} />
            </Button>
          </a>
        )}

        <div className="mt-14 glass-panel flex flex-col items-start gap-3 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Хотите похожий результат?</h2>
            <p className="text-sm text-ink-soft">Обсудим задачу и предложим решение.</p>
          </div>
          <Link href="/contacts">
            <Button>Обсудить проект</Button>
          </Link>
        </div>
      </article>
    </>
  );
}
