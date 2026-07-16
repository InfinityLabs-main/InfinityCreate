import Link from 'next/link';
import {
  ArrowRight,
  MessageCircle,
  Globe,
  Bot,
  Zap,
  Check,
} from 'lucide-react';

// Облегчённый лендинг в стиле Nebula: та же тёмно-фиолетовая палитра
// и стеклянные панели, но проще по содержанию и с бОльшим «воздухом».
// Демо-страница, независимая от CMS-конструктора главной.

export const metadata = {
  title: 'Nebula — цифровые продукты под ключ',
};

const NAV = [
  { href: '#services', label: 'Услуги' },
  { href: '#works', label: 'Работы' },
  { href: '#contacts', label: 'Контакты' },
];

const SERVICES = [
  {
    icon: Globe,
    title: 'Сайты',
    desc: 'Адаптивные сайты и лендинги под ваши задачи.',
  },
  {
    icon: Bot,
    title: 'Telegram-боты',
    desc: 'Боты для продаж, поддержки и автоматизации.',
  },
  {
    icon: Zap,
    title: 'Автоматизация',
    desc: 'Связываем сервисы и убираем ручную рутину.',
  },
];

const WORKS = [
  { title: 'Интернет-магазин', tag: 'E-commerce' },
  { title: 'Бот доставки', tag: 'Telegram' },
  { title: 'CRM для продаж', tag: 'SaaS' },
];

export default function LandingSimplePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Шапка */}
      <header className="sticky top-0 z-40 border-b border-hair/15 bg-ground/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-accent-gradient shadow-card" />
            <b className="text-[15px] tracking-tight">
              Nebula<span className="text-accent">.</span>
            </b>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-accent/5 hover:text-ink"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <Link
            href="#contacts"
            className="rounded-xl bg-accent-gradient px-4 py-2 text-sm font-medium text-white shadow-card transition-opacity hover:opacity-90"
          >
            Оставить заявку
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — просто и по делу */}
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center">
          <span className="mb-6 inline-block rounded-full border border-hair/25 bg-accent/5 px-4 py-1.5 text-xs text-ink-soft">
            Разработка цифровых решений
          </span>
          <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Создаём продукты, которые{' '}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              развивают бизнес
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            Сайты, Telegram-боты и автоматизация — под ключ и в срок.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-6 py-3 font-medium text-white shadow-card transition-opacity hover:opacity-90"
            >
              Смотреть услуги <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contacts"
              className="inline-flex items-center gap-2 rounded-xl border border-hair/30 px-6 py-3 font-medium text-ink transition-colors hover:border-accent/50 hover:bg-accent/5"
            >
              Обсудить проект <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Услуги — 3 карточки вместо 5 */}
        <section id="services" className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Наши услуги</h2>
            <p className="mt-3 text-ink-soft">Всё для запуска и роста продукта.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="glass-panel p-7 transition-transform hover:-translate-y-1"
              >
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Работы — сетка-плейсхолдеры без визуального шума */}
        <section id="works" className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Наши работы</h2>
            <p className="mt-3 text-ink-soft">Несколько проектов из практики.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {WORKS.map((w) => (
              <div key={w.title} className="glass-panel overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-accent/15 to-accent-2/10" />
                <div className="p-5">
                  <span className="text-xs text-accent">{w.tag}</span>
                  <h3 className="mt-1 font-semibold">{w.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Статистика — компактная строка */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="glass-panel grid grid-cols-2 gap-6 p-8 text-center sm:grid-cols-4">
            {[
              ['200+', 'Проектов'],
              ['100+', 'Клиентов'],
              ['3+', 'Года опыта'],
              ['24/7', 'Поддержка'],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-bold text-accent">{num}</div>
                <div className="mt-1 text-sm text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — короткий и ясный */}
        <section id="contacts" className="mx-auto max-w-5xl px-6 py-20">
          <div className="glass-panel flex flex-col items-center gap-6 p-12 text-center">
            <h2 className="max-w-lg text-3xl font-bold tracking-tight">
              Готовы обсудить проект?
            </h2>
            <p className="max-w-md text-ink-soft">
              Оставьте заявку — ответим в течение 30 минут. Консультация бесплатна.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent" /> Без предоплаты
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent" /> Договор и гарантия
              </span>
            </div>
            <a
              href="mailto:hello@nebula.ru"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-8 py-3 font-medium text-white shadow-card transition-opacity hover:opacity-90"
            >
              Оставить заявку <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      {/* Подвал — минимальный */}
      <footer className="border-t border-hair/15 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-sm text-ink-faint sm:flex-row">
          <span>© {new Date().getFullYear()} Nebula</span>
          <span>hello@nebula.ru · +7 (999) 123-45-67</span>
        </div>
      </footer>
    </div>
  );
}
