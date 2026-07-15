import Link from 'next/link';
import { Button } from '@/shared/ui/Button';

// Hero — тезис страницы. Серифный акцент в заголовке, стеклянный фон.
export function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Цифровые продукты под ключ';
  const subtitle = (props.subtitle as string) ?? '';
  const cta = (props.cta as string) ?? 'Смотреть услуги';

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="inline-block rounded-full border border-hair/30 bg-accent/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-accent animate-fade-up">
          Студия разработки
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl animate-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft animate-fade-up">
            {subtitle}
          </p>
        )}
        <div className="mt-9 flex justify-center gap-3 animate-fade-up">
          <Link href="/services">
            <Button>{cta}</Button>
          </Link>
          <Link href="/contacts">
            <Button variant="outline">Обсудить проект</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
