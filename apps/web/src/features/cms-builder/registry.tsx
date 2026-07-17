import type { ComponentType } from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { ServicesBlock } from './blocks/ServicesBlock';
import { CasesBlock } from './blocks/CasesBlock';
import { ReviewsBlock } from './blocks/ReviewsBlock';
import { FaqBlock } from './blocks/FaqBlock';
import { CtaBlock } from './blocks/CtaBlock';

// Реестр блоков конструктора: type → компонент.
// Неизвестные типы игнорируются рендерером (forward-compat), см. BlockRenderer.
export const BLOCK_REGISTRY: Record<string, ComponentType<{ props: Record<string, unknown> }>> = {
  hero: HeroBlock,
  services: ServicesBlock,
  cases: CasesBlock,
  reviews: ReviewsBlock,
  faq: FaqBlock,
  cta: CtaBlock,
};

export type BlockData = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  isVisible: boolean;
};
