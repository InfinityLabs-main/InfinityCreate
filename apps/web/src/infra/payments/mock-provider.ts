import type {
  PaymentProvider,
  PaymentIntent,
  CreatedPayment,
  PaymentEvent,
  RefundResult,
} from '@/domain/payments/provider';

// Dev-провайдер: не ходит наружу. createPayment ведёт на локальную
// мок-страницу подтверждения (/dev/pay), которая эмулирует вебхук.
// Позволяет проверить весь поток без боевых реквизитов.
export class MockProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPayment(intent: PaymentIntent): Promise<CreatedPayment> {
    const externalId = `mock_${intent.orderId}_${Date.now()}`;
    const base = process.env.APP_URL ?? 'http://localhost:3000';
    const url = new URL('/dev/pay', base);
    url.searchParams.set('externalId', externalId);
    url.searchParams.set('amount', String(intent.amount));
    url.searchParams.set('return', intent.returnUrl);
    return { externalId, redirectUrl: url.toString() };
  }

  // Мок-вебхук: тело — уже нормализованное событие (доверяем только в dev).
  async verifyWebhook(req: Request): Promise<PaymentEvent> {
    const body = (await req.json()) as {
      externalId: string;
      status: PaymentEvent['status'];
      amount: number;
    };
    return {
      externalId: body.externalId,
      status: body.status,
      amount: body.amount,
      raw: body,
    };
  }

  async refund(externalId: string, _amount: number): Promise<RefundResult> {
    return { refundId: `refund_${externalId}`, status: 'succeeded' };
  }
}
