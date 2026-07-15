// Денежные суммы хранятся в копейках (Int). Форматируем для UI.
export function formatPrice(kopecks: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(kopecks / 100);
}

const RU_STATUS: Record<string, string> = {
  NEW: 'Новый',
  DISCUSSION: 'Обсуждение',
  IN_PROGRESS: 'В работе',
  REVIEW: 'На проверке',
  DONE: 'Завершён',
  CANCELLED: 'Отменён',
};

export function orderStatusLabel(status: string): string {
  return RU_STATUS[status] ?? status;
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(d));
}
