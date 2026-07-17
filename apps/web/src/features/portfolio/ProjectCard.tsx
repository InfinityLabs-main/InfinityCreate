import Link from 'next/link';
import { Badge } from '@/shared/ui/Badge';
import { parseDescription } from '@/features/services/content';

export type ProjectCardData = {
  slug: string;
  title: string;
  description: unknown;
  techStack: string[];
  category: string | null;
  link: string | null;
  isCase: boolean;
};

// Карточка проекта/кейса в стиле макета: мятная пилюля-бейдж, крупный
// заголовок, описание, чипы. Кейсы → на страницу кейса.
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const summary = parseDescription(project.description).split('\n\n')[0] ?? '';
  const href = project.isCase
    ? `/cases/${project.slug}`
    : project.link ?? `/cases/${project.slug}`;
  const external = !project.isCase && !!project.link;

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group block h-full"
    >
      <div
        className="flex h-full flex-col rounded-card border border-hair/[0.07] transition-all duration-200 hover:-translate-y-[3px] hover:border-hair/12"
        style={{
          padding: 30,
          background: 'linear-gradient(180deg, hsl(var(--panel)), hsl(var(--ground)))',
        }}
      >
        {project.category && (
          <span className="inline-flex w-fit items-center rounded-full border border-mint/30 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-mint">
            {project.category}
          </span>
        )}
        <h3 className="mt-[18px] font-display text-[22px] font-semibold tracking-tight">
          {project.title}
        </h3>
        {summary && <p className="mt-3 line-clamp-3 text-[14.5px] text-ink-soft">{summary}</p>}
        {project.techStack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {project.techStack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
