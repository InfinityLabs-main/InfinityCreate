import type { ComponentType } from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { ServicesBlock } from './blocks/ServicesBlock';
import { GenericBlock } from './blocks/GenericBlock';

// Реестр блоков конструктора: type → компонент.
// Неизвестные типы игнорируются рендерером (forward-compat), см. BlockRenderer.
export const BLOCK_REGISTRY: Record<string, ComponentType<{ props: Record<string, unknown> }>> = {
  hero: HeroBlock,
  services: ServicesBlock,
  // Остальные типы пока рендерятся заглушкой-секцией; заменяются в Спринте 1.
  cases: GenericBlock,
  reviews: GenericBlock,
  faq: GenericBlock,
  cta: GenericBlock,
};

export type BlockData = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  isVisible: boolean;
};
