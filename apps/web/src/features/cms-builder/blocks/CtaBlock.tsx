import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

// Блок призыва к действию на главной. Декоративный градиентный фон.
export function CtaBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Обсудим ваш проект?';
  const subtitle =
    (props.subtitle as string) ?? 'Оставьте заявку — расскажем, как решим вашу задачу.';
  const cta = (props.cta as string) ?? 'Оставить заявку';

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel relative overflow-hidden p-10 text-center sm:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 bg-accent/10 blur-3xl"
        />
        <div className="relative">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">{subtitle}</p>
          <Link href="/contacts" className="mt-8 inline-block">
            <Button className="inline-flex items-center gap-2">
              {cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
