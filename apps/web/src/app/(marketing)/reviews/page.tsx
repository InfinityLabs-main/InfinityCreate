import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { getApprovedReviews } from '@/features/content/queries';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Card } from '@/shared/ui/Card';
import { formatDate } from '@/shared/lib/format';
import { JsonLd, breadcrumbLd } from '@/shared/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Отзывы',
  description: 'Что клиенты говорят о работе с нами.',
  alternates: { canonical: '/reviews' },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Оценка ${rating} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < rating ? 'fill-warn text-warn' : 'text-ink-faint/40'}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Главная', path: '/' },
          { name: 'Отзывы', path: '/reviews' },
        ])}
      />
      <PageHeader
        eyebrow="Доверие"
        title="Отзывы клиентов"
        description="Только проверенные отзывы после завершённых проектов."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Отзывы', path: '/reviews' },
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 pb-20">
        {reviews.length === 0 ? (
          <div className="glass-panel p-10 text-center text-ink-soft">
            Отзывы появятся здесь после первых завершённых проектов.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <Card key={r.id} className="flex flex-col">
                <Stars rating={r.rating} />
                <p className="mt-4 text-ink-soft">«{r.body}»</p>
                <div className="mt-auto pt-4 text-sm">
                  <span className="font-medium">
                    {r.authorName ?? r.client.name ?? 'Клиент'}
                  </span>
                  <span className="ml-2 text-ink-faint">{formatDate(r.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
