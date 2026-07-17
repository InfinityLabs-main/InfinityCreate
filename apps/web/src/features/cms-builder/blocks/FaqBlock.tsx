import Link from 'next/link';
import { getVisibleFaq } from '@/features/content/queries';

// Блок FAQ на главной: несколько видимых вопросов (аккордеон).
export async function FaqBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Частые вопросы';
  const limit = (props.limit as number) ?? 5;
  const items = (await getVisibleFaq()).slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <Link href="/faq" className="text-sm text-accent transition-opacity hover:opacity-80">
          Все вопросы →
        </Link>
      </div>
      <div className="divide-y divide-hair/15">
        {items.map((f) => (
          <details key={f.id} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-medium">
              {f.question}
              <span className="text-2xl leading-none text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
