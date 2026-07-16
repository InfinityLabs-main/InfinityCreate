import Link from 'next/link';
import {
  ArrowRight,
  MessageSquare,
  BarChart3,
  FolderKanban,
  MessageCircle,
  ShoppingCart,
  Users,
  Settings,
  Bot,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';

// Hero главной страницы. Слева — тезис и CTA, справа — стеклянный
// мокап «дашборда» (декоративный, чистый CSS/SVG, без внешних картинок).
export function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Создаём digital-продукты';
  const subtitle =
    (props.subtitle as string) ??
    'Разрабатываем сайты, Telegram-ботов, веб-приложения и автоматизируем процессы для роста вашего бизнеса.';
  const cta = (props.cta as string) ?? 'Смотреть услуги';

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        {/* Левая колонка — текст */}
        <div className="animate-fade-up">
          <span className="inline-block rounded-full border border-hair/30 bg-accent/5 px-4 py-1.5 text-xs font-medium text-ink-soft">
            Профессиональная разработка цифровых решений
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Создаём digital-продукты,
            <br />
            которые <span className="text-accent">развивают</span>
            <br />
            ваш бизнес
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">{subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/services">
              <Button className="inline-flex items-center gap-2">
                {cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="outline" className="inline-flex items-center gap-2">
                Обсудить проект <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {['a', 'b', 'c', 'd', 'e'].map((k, i) => (
                <span
                  key={k}
                  className="h-8 w-8 rounded-full border-2 border-ground bg-accent-gradient"
                  style={{ opacity: 0.55 + i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-sm text-ink-soft">
              <b className="text-ink">100+</b> довольных клиентов
            </span>
          </div>
        </div>

        {/* Правая колонка — мокап дашборда */}
        <div className="relative animate-fade-up">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const sidebar = [
    { icon: BarChart3, label: 'Analytics', active: true },
    { icon: FolderKanban, label: 'Projects' },
    { icon: MessageCircle, label: 'Messages' },
    { icon: ShoppingCart, label: 'Orders' },
    { icon: Users, label: 'Clients' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="relative">
      {/* Свечение под мокапом */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[28px] bg-accent/20 blur-3xl"
      />

      <div className="glass-panel relative overflow-hidden p-3.5">
        <div className="flex gap-3.5">
          {/* Sidebar */}
          <aside className="hidden w-36 shrink-0 flex-col gap-1 rounded-xl bg-ground/40 p-2.5 sm:flex">
            <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
              <span className="h-5 w-5 rounded-md bg-accent-gradient" />
              <span className="text-xs font-semibold">DevCraft</span>
            </div>
            {sidebar.map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                  s.active
                    ? 'bg-accent/15 text-ink'
                    : 'text-ink-faint'
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
            ))}
          </aside>

          {/* Контент дашборда */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Dashboard</span>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink-faint/40" />
                <span className="h-2 w-2 rounded-full bg-ink-faint/40" />
                <span className="h-2 w-2 rounded-full bg-accent/60" />
              </div>
            </div>

            {/* KPI-строка */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Посетители', value: '1,248', hint: '+12.5%' },
                { label: 'Лиды', value: '36', hint: '+8.6%' },
                { label: 'Доход', value: '$24,780', hint: '' },
              ].map((k) => (
                <div key={k.label} className="rounded-lg bg-ground/40 p-2.5">
                  <div className="text-[10px] text-ink-faint">{k.label}</div>
                  <div className="mt-0.5 text-sm font-semibold">{k.value}</div>
                  {k.hint && (
                    <div className="text-[9px] text-ok">{k.hint}</div>
                  )}
                </div>
              ))}
            </div>

            {/* График + прогресс */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              <div className="col-span-2 rounded-lg bg-ground/40 p-2.5">
                <div className="mb-1.5 text-[10px] text-ink-faint">
                  Посетители за неделю
                </div>
                <svg viewBox="0 0 200 70" className="h-20 w-full">
                  <defs>
                    <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 55 L28 48 L56 52 L84 30 L112 38 L140 18 L168 26 L200 10 L200 70 L0 70 Z"
                    fill="url(#area)"
                  />
                  <path
                    d="M0 55 L28 48 L56 52 L84 30 L112 38 L140 18 L168 26 L200 10"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-ground/40 p-2.5">
                <svg viewBox="0 0 40 40" className="h-14 w-14 -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--hair) / 0.2)" strokeWidth="5" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - 0.72)}
                  />
                </svg>
                <div className="mt-1 text-sm font-semibold">72%</div>
                <div className="text-[9px] text-ink-faint">Готовность</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Плавающая карточка «Telegram Bot» */}
      <div className="glass-panel absolute -bottom-5 -left-3 flex items-center gap-2.5 px-3.5 py-2.5 shadow-card sm:-left-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gradient">
          <Bot className="h-4 w-4 text-white" />
        </span>
        <div>
          <div className="text-xs font-semibold">Telegram Bot</div>
          <div className="flex items-center gap-1 text-[10px] text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Подключено
          </div>
        </div>
      </div>
    </div>
  );
}
