import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { formatPrice } from '@/shared/lib/format';

export type ServiceCardData = {
  slug: string;
  title: string;
  excerpt: string;
  priceFrom: number;
  durationDays: number;
  techStack: string[];
  category: { title: string };
};

// Единая карточка услуги — используется в каталоге, «похожих» и блоке главной.
export function ServiceCard({ service }: { service: ServiceCardData }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-wide text-accent">
            {service.category.title}
          </p>
          <ArrowUpRight
            size={16}
            className="text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </div>
        <h3 className="mt-2 text-lg font-medium tracking-tight">{service.title}</h3>
        <p className="mt-2 text-sm text-ink-soft">{service.excerpt}</p>

        {service.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {service.techStack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-hair/15 pt-4 text-sm">
          <span className="font-medium">от {formatPrice(service.priceFrom)}</span>
          <span className="text-ink-faint">{service.durationDays} дней</span>
        </div>
      </Card>
    </Link>
  );
}
