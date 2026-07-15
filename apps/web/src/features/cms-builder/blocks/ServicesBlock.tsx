import Link from 'next/link';
import { getServices } from '@/features/services/queries';
import { ServiceCard } from '@/features/services/ServiceCard';

// Server Component: закреплённые/видимые услуги из БД в единых карточках.
export async function ServicesBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Услуги';
  const limit = (props.limit as number) ?? 8;

  const services = (await getServices()).slice(0, limit);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <Link href="/services" className="text-sm text-accent transition-opacity hover:opacity-80">
          Все услуги →
        </Link>
      </div>
      {services.length === 0 ? (
        <p className="text-ink-soft">
          Услуги пока не добавлены. Запустите{' '}
          <code className="font-mono text-accent">pnpm db:seed</code>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </section>
  );
}
