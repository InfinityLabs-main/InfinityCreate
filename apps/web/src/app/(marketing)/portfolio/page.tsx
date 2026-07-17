import type { Metadata } from 'next';
import { getProjects } from '@/features/portfolio/queries';
import { ProjectCard } from '@/features/portfolio/ProjectCard';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Портфолио',
  description: 'Реализованные проекты: сайты, боты, приложения, автоматизация и SaaS.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Портфолио', path: '/portfolio' },
        ])}
      />
      <PageHeader
        eyebrow="Работы"
        title="Портфолио"
        description="Проекты, которые мы спроектировали, собрали и запустили."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Портфолио', path: '/portfolio' },
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 pb-20">
        {projects.length === 0 ? (
          <div className="glass-panel p-10 text-center text-ink-soft">
            Проекты появятся здесь. Запустите <code className="font-mono text-accent">pnpm db:seed</code>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
