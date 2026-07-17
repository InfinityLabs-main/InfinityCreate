import Link from 'next/link';

// Призыв к действию на главной: центрированный бокс с радиальным свечением.
export function CtaBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Обсудим ваш проект?';
  const subtitle =
    (props.subtitle as string) ?? 'Оставьте заявку — расскажем, как решить вашу задачу.';
  const cta = (props.cta as string) ?? 'Оставить заявку';

  return (
    <section className="mx-auto max-w-6xl px-7 pb-24 pt-10">
      <div
        className="relative overflow-hidden rounded-[26px] border border-hair/12 px-10 py-[70px] text-center"
        style={{
          background:
            'radial-gradient(80% 140% at 50% 0%, hsl(var(--accent) / 0.22), transparent 60%), hsl(var(--panel))',
        }}
      >
        <span className="eyebrow mb-[18px] justify-center">начнём</span>
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight">
          {title}
        </h2>
        <p className="mx-auto mt-3.5 max-w-xl text-[17px] text-ink-soft">{subtitle}</p>
        <Link
          href="/contacts"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-medium text-white shadow-glow transition-all hover:-translate-y-px hover:bg-accent-2"
        >
          {cta} →
        </Link>
      </div>
    </section>
  );
}
