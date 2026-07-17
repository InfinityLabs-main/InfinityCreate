import type { Metadata } from 'next';
import { getVisibleFaq } from '@/features/content/queries';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JsonLd, breadcrumbLd, faqLd } from '@/shared/seo/jsonld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Вопросы и ответы',
  description: 'Ответы на частые вопросы о заказе, оплате, сроках и гарантиях.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const items = await getVisibleFaq();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Главная', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          faqLd(items.map((i) => ({ question: i.question, answer: i.answer }))),
        ]}
      />
      <PageHeader
        eyebrow="Помощь"
        title="Частые вопросы"
        description="Если не нашли ответ — напишите нам, поможем."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 pb-20">
        {items.length === 0 ? (
          <div className="glass-panel p-10 text-center text-ink-soft">
            Вопросы появятся здесь после наполнения.
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
}
