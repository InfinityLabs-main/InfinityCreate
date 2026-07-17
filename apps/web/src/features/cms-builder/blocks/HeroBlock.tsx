import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

// Hero главной. Слева — тезис и CTA, справа — панель systems.status
// (метрики, sparkline, лог деплоя) — декоративная, чистый CSS/SVG.
export function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Цифровые продукты, которые развивают ваш бизнес';
  const subtitle =
    (props.subtitle as string) ??
    'Сайты, боты, CRM и автоматизация — от архитектуры до продакшена. Строим системы, которые держат нагрузку и работают без вас.';
  const cta = (props.cta as string) ?? 'Смотреть услуги';

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-7 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
      {/* Левая колонка */}
      <div className="animate-fade-up">
        <span className="eyebrow">Разработка и инфраструктура</span>
        <h1 className="mt-6 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[1.04] tracking-tight">
          Цифровые продукты, которые <span className="text-accent-2">развивают</span> ваш бизнес
        </h1>
        <p className="mt-6 max-w-md text-lg text-ink-soft">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <Link href="/services">
            <Button className="px-6 py-3.5 text-[15px]">{cta}</Button>
          </Link>
          <Link href="/contacts">
            <Button variant="outline" className="px-6 py-3.5 text-[15px]">
              Обсудить проект <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center gap-3.5">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="-ml-2.5 rounded-full border-2 border-ground first:ml-0"
                style={{
                  width: 34,
                  height: 34,
                  background: 'linear-gradient(135deg,#2a2540,#3a3556)',
                }}
              />
            ))}
          </div>
          <div className="text-sm">
            <b className="text-ink">500+</b>{' '}
            <span className="text-ink-soft">проектов в продакшене</span>
            <span className="block font-mono text-[13px] text-ink-faint">
              uptime · поддержка · развитие
            </span>
          </div>
        </div>
      </div>

      {/* Правая колонка — панель статуса */}
      <div className="animate-fade-up">
        <SystemsPanel />
      </div>
    </section>
  );
}

function SystemsPanel() {
  return (
    <div
      className="overflow-hidden rounded-[20px] border border-hair/12 shadow-card"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--panel-2)), hsl(var(--panel)))',
      }}
    >
      {/* Верхняя строка */}
      <div className="flex items-center gap-2.5 border-b border-hair/[0.07] px-[18px] py-3.5 font-mono text-xs text-ink-soft">
        <span className="h-2 w-2 animate-blink rounded-full bg-mint shadow-[0_0_10px_hsl(var(--mint))]" />
        systems.status
        <span className="ml-auto text-mint">● operational</span>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-3 border-b border-hair/[0.07]">
        {[
          { k: 'uptime', v: '99.98%', up: true },
          { k: 'деплоев', v: '1 348', up: false },
          { k: 'отклик', v: '34ms', up: false },
        ].map((m, i) => (
          <div key={m.k} className={i < 2 ? 'border-r border-hair/[0.07] p-[18px]' : 'p-[18px]'}>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {m.k}
            </div>
            <div
              className={`mt-1.5 font-display text-2xl font-semibold ${m.up ? 'text-mint' : 'text-ink'}`}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="px-[18px] pb-1.5 pt-4">
        <svg viewBox="0 0 420 90" width="100%" height="80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
              <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 L40,58 L80,64 L120,40 L160,48 L200,30 L240,36 L280,18 L320,26 L360,12 L420,20 L420,90 L0,90 Z"
            fill="url(#heroSpark)"
          />
          <path
            d="M0,70 L40,58 L80,64 L120,40 L160,48 L200,30 L240,36 L280,18 L320,26 L360,12 L420,20"
            fill="none"
            stroke="hsl(var(--accent-2))"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Лог */}
      <div className="px-[18px] pb-[18px] pt-1.5 font-mono text-xs leading-[1.9] text-ink-soft">
        <div>
          <span className="text-ink-faint">10:24:01</span> <span className="text-mint">✓</span>{' '}
          deploy · <span className="text-accent-2">crm-api</span> → prod
        </div>
        <div>
          <span className="text-ink-faint">10:24:04</span> <span className="text-mint">✓</span>{' '}
          health-check passed · 12 nodes
        </div>
        <div>
          <span className="text-ink-faint">10:24:09</span> <span className="text-mint">✓</span>{' '}
          tg-bot webhook active
        </div>
      </div>
    </div>
  );
}
