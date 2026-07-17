import Link from 'next/link';
import { getProjects } from '@/features/portfolio/queries';
import { ProjectCard } from '@/features/portfolio/ProjectCard';

// Блок кейсов на главной: развёрнутые кейсы из БД.
export async function CasesBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Кейсы';
  const limit = (props.limit as number) ?? 3;
  const cases = (await getProjects({ isCase: true })).slice(0, limit);

  if (cases.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <Link href="/cases" className="text-sm text-accent transition-opacity hover:opacity-80">
          Все кейсы →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <ProjectCard key={c.id} project={c} />
        ))}
      </div>
    </section>
  );
}
