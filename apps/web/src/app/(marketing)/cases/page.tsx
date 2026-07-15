import type { Metadata } from 'next';
import { getProjects } from '@/features/portfolio/queries';
import { ProjectCard } from '@/features/portfolio/ProjectCard';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Кейсы',
  description: 'Развёрнутые истории проектов: задача, решение, результат.',
  alternates: { canonical: '/cases' },
};

export default async function CasesPage() {
  const cases = await getProjects({ isCase: true });

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Кейсы', path: '/cases' },
        ])}
      />
      <PageHeader
        eyebrow="Истории"
        title="Кейсы"
        description="Как мы решали задачи клиентов — от постановки до результата."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Кейсы', path: '/cases' },
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 pb-20">
        {cases.length === 0 ? (
          <div className="glass-panel p-10 text-center text-ink-soft">
            Кейсы появятся здесь после наполнения.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <ProjectCard key={c.id} project={c} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
