import Link from 'next/link';
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

// Карточка услуги в стиле макета: tag (моно) / заголовок / описание /
// чипы / футер с ценой и сроком.
export function ServiceCard({ service }: { service: ServiceCardData }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-2">
          {service.category.title}
        </span>
        <h3 className="mt-3.5 font-display text-xl font-semibold tracking-tight">
          {service.title}
        </h3>
        <p className="mt-2.5 flex-1 text-[14.5px] text-ink-soft">{service.excerpt}</p>

        {service.techStack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {service.techStack.slice(0, 5).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-hair/[0.07] pt-4 font-mono text-[13px]">
          <span className="font-medium text-ink">от {formatPrice(service.priceFrom)}</span>
          <span className="text-ink-faint">{service.durationDays} дней</span>
        </div>
      </Card>
    </Link>
  );
}
