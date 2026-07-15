import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/infra/payments/factory';
import { processPaymentEvent } from '@/features/payments/process-webhook';

// Единая точка вебхуков платежей. Провайдер сам верифицирует подлинность
// (ЮKassa — перепроверкой по API; mock — доверяем только в dev).
// Всегда отвечаем 200 на валидное событие, чтобы провайдер не ретраил
// бесконечно; на невалидную подпись — 400.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const provider = getPaymentProvider();

  let event;
  try {
    event = await provider.verifyWebhook(req);
  } catch (e) {
    console.error('Webhook verification failed:', e);
    return NextResponse.json({ error: 'invalid webhook' }, { status: 400 });
  }

  try {
    await processPaymentEvent(event);
  } catch (e) {
    // Ошибка обработки — 500, чтобы провайдер повторил доставку.
    console.error('Webhook processing failed:', e);
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
