import { getApprovedReviews } from '@/features/content/queries';
import { SectionHead } from '@/shared/ui/SectionHead';

// Отзывы на главной: крупная цитата (стиль макета).
export async function ReviewsBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Отзывы';
  const reviews = await getApprovedReviews();
  if (reviews.length === 0) return null;
  const r = reviews[0]!;

  return (
    <section className="mx-auto max-w-6xl px-7 py-20">
      <SectionHead eyebrow="Клиенты" title={title} moreHref="/reviews" moreLabel="все отзывы" />
      <div className="max-w-3xl rounded-[20px] border border-hair/[0.07] bg-panel p-10">
        <div className="mb-5 tracking-[3px] text-accent-2" aria-label={`Оценка ${r.rating} из 5`}>
          {'★'.repeat(r.rating)}
          <span className="text-ink-faint/40">{'★'.repeat(5 - r.rating)}</span>
        </div>
        <blockquote className="font-display text-[26px] font-medium leading-[1.35] tracking-tight">
          «{r.body}»
        </blockquote>
        <div className="mt-6 font-mono text-[13px] text-ink-faint">
          — {r.authorName ?? r.client.name ?? 'Клиент'}
        </div>
      </div>
    </section>
  );
}
