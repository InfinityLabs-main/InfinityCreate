import { PrismaClient, Role } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

// Argon2id-параметры (те же, что в приложении).
const ARGON = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

// ── 11 категорий услуг из ТЗ ────────────────────────────────
const CATEGORIES: { slug: string; title: string; description: string; icon: string }[] = [
  { slug: 'websites', title: 'Разработка сайтов', description: 'Лендинги, корпоративные сайты, магазины.', icon: 'globe' },
  { slug: 'telegram-bots', title: 'Telegram-боты', description: 'Боты для продаж, поддержки и автоматизации.', icon: 'bot' },
  { slug: 'web-apps', title: 'Веб-приложения', description: 'SPA, дашборды, личные кабинеты.', icon: 'layout' },
  { slug: 'mobile-apps', title: 'Мобильные приложения', description: 'iOS и Android, кроссплатформа.', icon: 'smartphone' },
  { slug: 'automation', title: 'Автоматизация бизнеса', description: 'Сценарии, интеграции, боты-помощники.', icon: 'workflow' },
  { slug: 'api-integrations', title: 'Интеграции с API', description: 'Связываем сервисы между собой.', icon: 'plug' },
  { slug: 'crm', title: 'Разработка CRM', description: 'Системы под ваши процессы.', icon: 'kanban' },
  { slug: 'servers', title: 'Настройка серверов', description: 'VPS, безопасность, оптимизация.', icon: 'server' },
  { slug: 'devops', title: 'DevOps', description: 'CI/CD, Docker, мониторинг.', icon: 'infinity' },
  { slug: 'saas', title: 'SaaS-проекты', description: 'Продукты с подпиской под ключ.', icon: 'cloud' },
  { slug: 'support', title: 'Сопровождение', description: 'Поддержка и развитие существующих проектов.', icon: 'life-buoy' },
];

// Пара примерных услуг с полным наполнением карточки.
const SERVICES = [
  {
    slug: 'telegram-bot-turnkey',
    category: 'telegram-bots',
    title: 'Telegram-бот под ключ',
    excerpt: 'Бот для продаж, поддержки или автоматизации с админ-панелью.',
    priceFrom: 4500000, // 45 000 ₽
    durationDays: 14,
    techStack: ['Node.js', 'grammY', 'PostgreSQL', 'Redis'],
    advantages: ['Админ-панель', 'Приём оплат', 'Рассылки', 'Аналитика'],
    stages: ['Бриф и сценарий', 'Прототип диалога', 'Разработка', 'Тестирование', 'Запуск'],
    faq: [
      { q: 'Можно принимать оплату в боте?', a: 'Да — ЮKassa, Telegram Payments или крипта.' },
      { q: 'Будет ли админка?', a: 'Да, веб-панель для управления контентом и рассылками.' },
    ],
  },
  {
    slug: 'corporate-website',
    category: 'websites',
    title: 'Корпоративный сайт',
    excerpt: 'Быстрый SSR-сайт с CMS, SEO и адаптивным дизайном.',
    priceFrom: 12000000, // 120 000 ₽
    durationDays: 30,
    techStack: ['Next.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
    advantages: ['SEO из коробки', 'CMS для контента', 'Скорость <2.5s LCP', 'Адаптивность'],
    stages: ['Дизайн', 'Вёрстка', 'CMS', 'Наполнение', 'SEO и запуск'],
    faq: [
      { q: 'Смогу сам менять контент?', a: 'Да, через админ-панель без разработчика.' },
      { q: 'Оптимизирован под поиск?', a: 'Sitemap, OpenGraph, Schema.org, ЧПУ — включены.' },
    ],
  },
];

const FAQ = [
  { question: 'Как начать работу?', answer: 'Оставьте заявку на услугу — менеджер свяжется в чате и уточнит детали.', order: 1 },
  { question: 'Как происходит оплата?', answer: 'Онлайн картой или СБП через ЮKassa. Возможна работа по счёту для юрлиц.', order: 2 },
  { question: 'Даёте ли гарантию?', answer: 'Да, гарантийный период на исправление ошибок включён в каждый проект.', order: 3 },
  { question: 'Можно доработать существующий проект?', answer: 'Да, у нас есть услуга сопровождения и развития.', order: 4 },
];

// Стартовая композиция главной страницы (конструктор).
const HOME_BLOCKS = [
  { type: 'hero', order: 0, props: { title: 'Цифровые продукты под ключ', subtitle: 'Сайты, боты, приложения и автоматизация бизнеса.', cta: 'Смотреть услуги' } },
  { type: 'services', order: 1, props: { title: 'Услуги', limit: 8 } },
  { type: 'cases', order: 2, props: { title: 'Кейсы', limit: 3 } },
  { type: 'reviews', order: 3, props: { title: 'Отзывы' } },
  { type: 'faq', order: 4, props: { title: 'Частые вопросы' } },
  { type: 'cta', order: 5, props: { title: 'Обсудим ваш проект?', cta: 'Оставить заявку' } },
];

async function main() {
  console.log('🌱 Seeding Nebula…');

  // ── Пользователи ──
  const adminPass = await hash('Admin123!', ARGON);
  const managerPass = await hash('Manager123!', ARGON);
  const clientPass = await hash('Client123!', ARGON);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nebula.local' },
    update: {},
    create: { email: 'admin@nebula.local', name: 'Администратор', role: Role.ADMIN, passwordHash: adminPass, twoFAEnabled: false },
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@nebula.local' },
    update: {},
    create: { email: 'manager@nebula.local', name: 'Менеджер', role: Role.MANAGER, passwordHash: managerPass },
  });
  const client = await prisma.user.upsert({
    where: { email: 'client@nebula.local' },
    update: {},
    create: { email: 'client@nebula.local', name: 'Клиент Тестовый', role: Role.CLIENT, passwordHash: clientPass },
  });

  // ── Категории ──
  const categoryBySlug: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, description: c.description, icon: c.icon, order: i },
      create: { ...c, order: i },
    });
    categoryBySlug[c.slug] = cat.id;
  }

  // ── Услуги ──
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        title: s.title,
        excerpt: s.excerpt,
        description: { blocks: [{ type: 'text', text: s.excerpt }] },
        advantages: s.advantages,
        stages: s.stages,
        faq: s.faq,
        priceFrom: s.priceFrom,
        durationDays: s.durationDays,
        techStack: s.techStack,
        categoryId: categoryBySlug[s.category]!,
        isPinned: true,
        seoTitle: s.title,
        seoDescription: s.excerpt,
      },
    });
  }

  // ── FAQ ──
  for (const f of FAQ) {
    await prisma.faq.create({ data: f }).catch(() => {});
  }

  // ── Отзыв (одобренный) ──
  await prisma.review.create({
    data: { clientId: client.id, rating: 5, body: 'Сделали Telegram-бота за две недели, всё чётко.', isApproved: true },
  }).catch(() => {});

  // ── Блоки главной страницы ──
  for (const b of HOME_BLOCKS) {
    await prisma.pageBlock.create({ data: { page: 'home', ...b } }).catch(() => {});
  }

  // ── Настройки сайта ──
  const settings: { key: string; value: unknown }[] = [
    { key: 'general', value: { name: 'Nebula', logo: null, tagline: 'Цифровые продукты под ключ' } },
    { key: 'contacts', value: { email: 'hello@nebula.local', phone: '+7 000 000-00-00', telegram: '@nebula' } },
    { key: 'socials', value: { telegram: '', github: '', vk: '' } },
    { key: 'seo', value: { defaultTitle: 'Nebula — цифровые продукты под ключ', defaultDescription: 'Разработка сайтов, ботов, приложений и автоматизация бизнеса.' } },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value as object }, create: { key: s.key, value: s.value as object } });
  }

  console.log('✅ Seed complete.');
  console.log('   admin@nebula.local / Admin123!');
  console.log('   manager@nebula.local / Manager123!');
  console.log('   client@nebula.local / Client123!');
  console.log(`   users: ${[admin.email, manager.email, client.email].join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
