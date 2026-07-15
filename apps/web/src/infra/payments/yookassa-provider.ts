import { randomUUID } from 'node:crypto';
import type {
  PaymentProvider,
  PaymentIntent,
  CreatedPayment,
  PaymentEvent,
  PaymentEventStatus,
  RefundResult,
} from '@/domain/payments/provider';

// ─────────────────────────────────────────────────────────────
// ЮKassa. API v3, Basic-auth (shopId:secretKey).
// Идемпотентность создания — заголовок Idempotence-Key.
//
// Верификация вебхука: ЮKassa не подписывает уведомления HMAC —
// доверенный способ — ПЕРЕПРОВЕРИТЬ платёж по API по его id
// (плюс IP-allowlist на уровне Nginx). Так подделанный вебхук
// не пройдёт: мы берём статус из ответа API, а не из тела запроса.
// Суммы ЮKassa отдаёт в рублях строкой ("1500.00") → переводим в копейки.
// ─────────────────────────────────────────────────────────────

const API = 'https://api.yookassa.ru/v3';

function toKopecks(value: string): number {
  return Math.round(parseFloat(value) * 100);
}

function mapStatus(s: string): PaymentEventStatus {
  if (s === 'succeeded') return 'succeeded';
  if (s === 'canceled') return 'canceled';
  return 'pending';
}

export class YooKassaProvider implements PaymentProvider {
  readonly name = 'yookassa';

  constructor(
    private readonly shopId: string,
    private readonly secretKey: string,
  ) {}

  private authHeader() {
    const token = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
    return `Basic ${token}`;
  }

  async createPayment(intent: PaymentIntent): Promise<CreatedPayment> {
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Idempotence-Key': randomUUID(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: { value: (intent.amount / 100).toFixed(2), currency: intent.currency },
        capture: true,
        confirmation: { type: 'redirect', return_url: intent.returnUrl },
        description: intent.description,
        metadata: { orderId: intent.orderId, orderNumber: intent.orderNumber },
      }),
    });

    if (!res.ok) {
      throw new Error(`ЮKassa createPayment failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      id: string;
      confirmation?: { confirmation_url?: string };
    };
    const redirectUrl = data.confirmation?.confirmation_url;
    if (!redirectUrl) throw new Error('ЮKassa не вернула confirmation_url');

    return { externalId: data.id, redirectUrl };
  }

  async verifyWebhook(req: Request): Promise<PaymentEvent> {
    const body = (await req.json()) as { object?: { id?: string } };
    const paymentId = body.object?.id;
    if (!paymentId) throw new Error('Некорректный webhook: нет object.id');

    // Перепроверяем платёж по API — источник истины, не тело вебхука.
    const res = await fetch(`${API}/payments/${paymentId}`, {
      headers: { Authorization: this.authHeader() },
    });
    if (!res.ok) {
      throw new Error(`ЮKassa verify failed: ${res.status}`);
    }

    const p = (await res.json()) as {
      id: string;
      status: string;
      amount: { value: string };
    };

    return {
      externalId: p.id,
      status: mapStatus(p.status),
      amount: toKopecks(p.amount.value),
      raw: p,
    };
  }

  async refund(externalId: string, amount: number): Promise<RefundResult> {
    const res = await fetch(`${API}/refunds`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Idempotence-Key': randomUUID(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: externalId,
        amount: { value: (amount / 100).toFixed(2), currency: 'RUB' },
      }),
    });
    if (!res.ok) throw new Error(`ЮKassa refund failed: ${res.status}`);
    const data = (await res.json()) as { id: string; status: string };
    return {
      refundId: data.id,
      status: data.status === 'succeeded' ? 'succeeded' : 'pending',
    };
  }
}
