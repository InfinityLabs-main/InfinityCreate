import { BLOCK_REGISTRY, type BlockData } from './registry';

// Рендерит упорядоченный список блоков страницы.
// Скрытые и неизвестные типы пропускаются.
export function BlockRenderer({ blocks }: { blocks: BlockData[] }) {
  return (
    <>
      {blocks
        .filter((b) => b.isVisible)
        .map((b) => {
          const Component = BLOCK_REGISTRY[b.type];
          if (!Component) return null;
          return <Component key={b.id} props={b.props} />;
        })}
    </>
  );
}
