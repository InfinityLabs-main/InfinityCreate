import { prisma } from '@nebula/db';
import { BlockRenderer } from '@/features/cms-builder/BlockRenderer';
import type { BlockData } from '@/features/cms-builder/registry';

// Главная собирается из блоков (конструктор). Рендерим динамически, чтобы
// правки в CMS отражались сразу и не залипал пустой ISR-снимок при старте.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fail-safe при недоступной БД во время сборки → фолбэк-hero ниже.
  const blocks = await prisma.pageBlock
    .findMany({ where: { page: 'home' }, orderBy: { order: 'asc' } })
    .catch(() => []);

  const data: BlockData[] = blocks.map((b) => ({
    id: b.id,
    type: b.type,
    props: (b.props as Record<string, unknown>) ?? {},
    isVisible: b.isVisible,
  }));

  // Фолбэк, если БД ещё не засеяна — чтобы страница не была пустой.
  if (data.length === 0) {
    return (
      <BlockRenderer
        blocks={[
          {
            id: 'fallback-hero',
            type: 'hero',
            isVisible: true,
            props: {
              title: 'Цифровые продукты под ключ',
              subtitle: 'Запустите pnpm db:seed, чтобы наполнить главную из конструктора.',
            },
          },
        ]}
      />
    );
  }

  return <BlockRenderer blocks={data} />;
}
