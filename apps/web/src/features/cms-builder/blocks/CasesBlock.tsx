import { getProjects } from '@/features/portfolio/queries';
import { ProjectCard } from '@/features/portfolio/ProjectCard';
import { SectionHead } from '@/shared/ui/SectionHead';

// Кейсы на главной: развёрнутые кейсы из БД (две колонки).
export async function CasesBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Кейсы';
  const limit = (props.limit as number) ?? 2;
  const cases = (await getProjects({ isCase: true })).slice(0, limit);
  if (cases.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-7 py-20">
      <SectionHead eyebrow="Портфолио" title={title} moreHref="/cases" moreLabel="все кейсы" />
      <div className="grid gap-[18px] md:grid-cols-2">
        {cases.map((c) => (
          <ProjectCard key={c.id} project={c} />
        ))}
      </div>
    </section>
  );
}
