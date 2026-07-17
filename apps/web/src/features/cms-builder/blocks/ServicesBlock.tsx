import { getServices } from '@/features/services/queries';
import { ServiceCard } from '@/features/services/ServiceCard';
import { SectionHead } from '@/shared/ui/SectionHead';

// Услуги на главной. Сетка карточек в едином стиле.
export async function ServicesBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Услуги';
  const limit = (props.limit as number) ?? 6;

  const services = (await getServices()).slice(0, limit);
  if (services.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-7 py-20">
      <SectionHead eyebrow="Что мы делаем" title={title} moreHref="/services" moreLabel="все услуги" />
      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
}
