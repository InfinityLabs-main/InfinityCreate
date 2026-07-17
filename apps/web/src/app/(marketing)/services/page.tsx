import type { Metadata } from 'next';
import { getCategories, getServices } from '@/features/services/queries';
import { ServiceCard } from '@/features/services/ServiceCard';
import { CategoryFilter } from '@/features/services/CategoryFilter';
import { SearchBar } from '@/features/services/SearchBar';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Все услуги',
  description:
    'Каталог услуг: разработка сайтов, Telegram-боты, веб- и мобильные приложения, автоматизация, CRM, DevOps, SaaS и сопровождение.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [categories, services] = await Promise.all([
    getCategories(),
    getServices({ category: sp.category, q: sp.q }),
  ]);

  const activeCategory = categories.find((c) => c.slug === sp.category);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Услуги', path: '/services' },
        ])}
      />
      <PageHeader
        eyebrow="Каталог"
        title={activeCategory ? activeCategory.title : 'Все услуги'}
        description={
          activeCategory?.description ??
          'Одиннадцать направлений — от лендинга до SaaS-продукта под ключ. Выберите категорию или найдите нужное.'
        }
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Услуги', path: '/services' },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter categories={categories} active={sp.category} q={sp.q} />
          <SearchBar q={sp.q} category={sp.category} />
        </div>

        {services.length === 0 ? (
          <div className="glass-panel p-10 text-center">
            <p className="text-ink-soft">
              {sp.q
                ? `По запросу «${sp.q}» ничего не найдено.`
                : 'В этой категории пока нет услуг.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-faint">
              Найдено услуг: {services.length}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
