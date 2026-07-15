import Link from 'next/link';
import { prisma } from '@nebula/db';
import { Card } from '@/shared/ui/Card';
import { formatPrice } from '@/shared/lib/format';

// Server Component: тянет закреплённые/видимые услуги из БД.
export async function ServicesBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Услуги';
  const limit = (props.limit as number) ?? 8;

  const services = await prisma.service.findMany({
    where: { isHidden: false, deletedAt: null },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: { category: true },
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {services.length === 0 ? (
        <p className="text-ink-soft">
          Услуги пока не добавлены. Запустите{' '}
          <code className="font-mono text-accent">pnpm db:seed</code>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`}>
              <Card className="h-full">
                <p className="font-mono text-xs uppercase tracking-wide text-accent">
                  {s.category.title}
                </p>
                <h3 className="mt-2 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium">от {formatPrice(s.priceFrom)}</span>
                  <span className="text-ink-faint">{s.durationDays} дн.</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
