// JSON-LD (Schema.org) микроразметка. Рендерится как <script type="ld+json">.
// Данные — доверенные, из нашей БД; сериализуем безопасно.

const BASE = process.env.APP_URL ?? 'http://localhost:3000';
const ORG_NAME = 'Nebula';

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: BASE,
    description: 'Разработка сайтов, ботов, приложений и автоматизация бизнеса.',
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
}

export function serviceLd(s: {
  title: string;
  excerpt: string;
  slug: string;
  priceFrom: number;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.excerpt,
    serviceType: s.category,
    provider: { '@type': 'Organization', name: ORG_NAME, url: BASE },
    url: `${BASE}/services/${s.slug}`,
    offers: {
      '@type': 'Offer',
      price: (s.priceFrom / 100).toFixed(0),
      priceCurrency: 'RUB',
    },
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

export function articleLd(p: {
  title: string;
  excerpt?: string | null;
  slug: string;
  publishedAt?: Date | null;
  cover?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt ?? undefined,
    image: p.cover ?? undefined,
    datePublished: p.publishedAt?.toISOString(),
    author: { '@type': 'Organization', name: ORG_NAME },
    publisher: { '@type': 'Organization', name: ORG_NAME },
    url: `${BASE}/blog/${p.slug}`,
  };
}
