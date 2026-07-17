import Link from 'next/link';
import { Star } from 'lucide-react';
import { getApprovedReviews } from '@/features/content/queries';
import { Card } from '@/shared/ui/Card';

// Блок отзывов на главной: одобренные отзывы со звёздами.
export async function ReviewsBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Отзывы';
  const limit = (props.limit as number) ?? 3;
  const reviews = (await getApprovedReviews()).slice(0, limit);

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <Link href="/reviews" className="text-sm text-accent transition-opacity hover:opacity-80">
          Все отзывы →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Card key={r.id} className="flex flex-col">
            <div className="flex gap-0.5" aria-label={`Оценка ${r.rating} из 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className={i < r.rating ? 'fill-warn text-warn' : 'text-ink-faint/40'}
                />
              ))}
            </div>
            <p className="mt-4 text-ink-soft">«{r.body}»</p>
            <p className="mt-auto pt-4 text-sm font-medium">
              {r.authorName ?? r.client.name ?? 'Клиент'}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
