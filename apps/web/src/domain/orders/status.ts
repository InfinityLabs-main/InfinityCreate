import type { OrderStatus } from '@nebula/db';

// ─────────────────────────────────────────────────────────────
// State-machine статусов заказа. Framework-free доменное правило:
// какие переходы допустимы. Валидируется здесь, не в UI и не в БД.
// Каждый разрешённый переход → запись в OrderEvent (аудит) на уровне
// use-case (см. features/orders/actions.ts).
// ─────────────────────────────────────────────────────────────

export const ORDER_STATUSES: OrderStatus[] = [
  'NEW',
  'DISCUSSION',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
  'CANCELLED',
];

// Разрешённые переходы. Ключ — текущий статус, значение — куда можно.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['DISCUSSION', 'IN_PROGRESS', 'CANCELLED'],
  DISCUSSION: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW', 'CANCELLED'],
  REVIEW: ['IN_PROGRESS', 'DONE'],
  DONE: [], // терминальный
  CANCELLED: [], // терминальный
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}

export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

// Русские подписи — единый источник для UI (дублирует format.ts, но
// доменный слой не должен зависеть от shared/lib; UI берёт из format.ts).
export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Новый',
  DISCUSSION: 'Обсуждение',
  IN_PROGRESS: 'В работе',
  REVIEW: 'На проверке',
  DONE: 'Завершён',
  CANCELLED: 'Отменён',
};

// Семантический цвет статуса (для пилюль в UI). Не акцент — статусная палитра.
export const STATUS_TONE: Record<OrderStatus, 'info' | 'warn' | 'ok' | 'risk' | 'muted'> = {
  NEW: 'info',
  DISCUSSION: 'info',
  IN_PROGRESS: 'warn',
  REVIEW: 'warn',
  DONE: 'ok',
  CANCELLED: 'risk',
};
