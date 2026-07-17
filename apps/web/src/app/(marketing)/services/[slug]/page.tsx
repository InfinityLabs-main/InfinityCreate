import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Clock } from 'lucide-react';
import {
  getServiceBySlug,
  getRelatedServices,
  getAllServiceSlugs,
} from '@/features/services/queries';
import { parseFaq, parseStringList, parseDescription } from '@/features/services/content';
import { ServiceCard } from '@/features/services/ServiceCard';
import { OrderForm } from '@/features/orders/OrderForm';
import { Badge } from '@/shared/ui/Badge';
import { formatPrice } from '@/shared/lib/format';
import { JsonLd, breadcrumbLd, serviceLd } from '@/shared/seo/jsonld';

export const dynamic = 'force-dynamic';

// ISR: заранее генерируем пути известных услуг.
export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: 'Услуга не найдена' };
  return {
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.excerpt,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.seoTitle ?? service.title,
      description: service.seoDescription ?? service.excerpt,
      images: service.ogImage ? [service.ogImage] : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const related = await getRelatedServices(service.categoryId, service.id);

  const description = parseDescription(service.description);
  const advantages = parseStringList(service.advantages);
  const stages = parseStringList(service.stages);
  const faq = parseFaq(service.faq);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Главная', path: '/' },
            { name: 'Услуги', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          serviceLd({
            title: service.title,
            excerpt: service.excerpt,
            slug: service.slug,
            priceFrom: service.priceFrom,
            category: service.category.title,
          }),
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Хлебные крошки */}
        <nav aria-label="Хлебные крошки" className="mb-8 flex items-center gap-1.5 text-sm text-ink-faint">
          <Link href="/" className="hover:text-ink">Главная</Link>
          <span className="opacity-50">/</span>
          <Link href="/services" className="hover:text-ink">Услуги</Link>
          <span className="opacity-50">/</span>
          <Link href={`/services?category=${service.category.slug}`} className="hover:text-ink">
            {service.category.title}
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Основной контент */}
          <article className="min-w-0">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              {service.category.title}
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight">
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-ink-soft">{service.excerpt}</p>

            {service.techStack.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {service.techStack.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}

            {description && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">Описание</h2>
                {description.split('\n\n').map((p, i) => (
                  <p key={i} className="mt-3 text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
            )}

            {advantages.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">Что вы получите</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {advantages.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 text-ink-soft">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stages.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">Этапы работы</h2>
                <ol className="mt-5 space-y-4">
                  {stages.map((s, i) => (
                    <li key={s} className="flex gap-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-accent/40 bg-accent/5 font-mono text-sm text-accent">
                        {i + 1}
                      </span>
                      <span className="pt-1 text-ink-soft">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {faq.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">Частые вопросы</h2>
                <div className="mt-4 divide-y divide-hair/15">
                  {faq.map((f) => (
                    <details key={f.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                        {f.q}
                        <span className="text-accent transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Липкая панель заказа */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel p-6">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Стоимость</p>
              <p className="mt-1 text-3xl font-semibold">от {formatPrice(service.priceFrom)}</p>

              <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
                <Clock size={16} className="text-accent" />
                Срок: {service.durationDays} дней
              </div>

              <div className="mt-6">
                <OrderForm serviceId={service.id} />
              </div>
              <p className="mt-4 text-center text-xs text-ink-faint">
                Нужен аккаунт — предложим войти. Точную стоимость уточнит менеджер.
              </p>
            </div>
          </aside>
        </div>

        {/* Похожие услуги */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Похожие услуги</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
