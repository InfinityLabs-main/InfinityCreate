// ─────────────────────────────────────────────────────────────
// Порт платёжного провайдера (Clean Architecture / DIP).
// Бизнес-логика зависит только от этого интерфейса. Реализации
// (mock, ЮKassa, крипта, счета) живут в infra и подменяются фабрикой
// по env PAYMENT_PROVIDER — без правки use-case.
// ─────────────────────────────────────────────────────────────

// Намерение оплатить. amount — минорные единицы (копейки).
export interface PaymentIntent {
  orderId: string;
  orderNumber: number;
  amount: number;
  currency: string; // ISO-4217, напр. "RUB"
  description: string;
  returnUrl: string; // куда вернуть пользователя после оплаты
}

// Результат создания платежа у провайдера.
export interface CreatedPayment {
  externalId: string; // id платежа у провайдера (для идемпотентности)
  redirectUrl: string; // куда редиректить пользователя
}

// Нормализованное событие из вебхука.
export type PaymentEventStatus = 'succeeded' | 'canceled' | 'pending';

export interface PaymentEvent {
  externalId: string;
  status: PaymentEventStatus;
  amount: number; // копейки, как пришло от провайдера
  raw: unknown; // сырой payload для реконсиляции/аудита
}

export interface RefundResult {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
}

export interface PaymentProvider {
  readonly name: string;

  createPayment(intent: PaymentIntent): Promise<CreatedPayment>;

  // Проверяет подпись/подлинность вебхука и нормализует событие.
  // Бросает, если подпись невалидна.
  verifyWebhook(req: Request): Promise<PaymentEvent>;

  refund(externalId: string, amount: number): Promise<RefundResult>;
}
