import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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

// Карточка проекта портфолио/кейса. Кейсы ведут на страницу кейса,
// обычные работы — на внешнюю ссылку (если есть).
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
      <div className="glass-panel flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          {project.category && (
            <span className="font-mono text-xs uppercase tracking-wide text-accent">
              {project.category}
            </span>
          )}
          <ArrowUpRight
            size={16}
            className="text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </div>
        <h3 className="mt-2 text-lg font-medium tracking-tight">{project.title}</h3>
        {summary && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{summary}</p>}
        {project.techStack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {project.techStack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
