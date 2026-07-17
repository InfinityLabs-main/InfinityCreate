import { getVisibleFaq } from '@/features/content/queries';
import { SectionHead } from '@/shared/ui/SectionHead';

// FAQ на главной: строки с разделителями и «+», стиль макета.
export async function FaqBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Частые вопросы';
  const limit = (props.limit as number) ?? 5;
  const items = (await getVisibleFaq()).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-7 py-20">
      <SectionHead eyebrow="Частые вопросы" title={title} moreHref="/faq" moreLabel="все вопросы" />
      <div className="border-t border-hair/[0.07]">
        {items.map((f) => (
          <details key={f.id} className="group border-b border-hair/[0.07]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-[19px] font-medium">
              {f.question}
              <span className="shrink-0 text-2xl leading-none text-accent-2 transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-6 text-[15px] text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
