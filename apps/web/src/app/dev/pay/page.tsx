import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { processPaymentEvent } from '@/features/payments/process-webhook';
import { Button } from '@/shared/ui/Button';
import { formatPrice } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Тестовая оплата', robots: { index: false } };

// Мок-страница подтверждения (только dev + PAYMENT_PROVIDER=mock).
// Эмулирует платёжную форму провайдера: две кнопки вызывают обработку
// события напрямую (как это сделал бы вебхук) и возвращают на заказ.
// Так весь поток проверяется без боевых реквизитов.
export default async function DevPayPage({
  searchParams,
}: {
  searchParams: Promise<{ externalId?: string; amount?: string; return?: string }>;
}) {
  const isMock =
    process.env.NODE_ENV !== 'production' && (process.env.PAYMENT_PROVIDER ?? 'mock') === 'mock';
  if (!isMock) notFound();

  const sp = await searchParams;
  const externalId = sp.externalId ?? '';
  const amount = Number(sp.amount ?? 0);
  const returnUrl = sp.return ?? '/dashboard';

  async function settle(formData: FormData) {
    'use server';
    const status = String(formData.get('status')) as 'succeeded' | 'canceled';
    await processPaymentEvent({ externalId, status, amount, raw: { mock: true, status } });
    redirect(returnUrl);
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="glass-panel w-full max-w-sm p-8">
        <div className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">
          Тестовая касса · dev
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Подтверждение оплаты</h1>
        <p className="mt-2 text-ink-soft">
          К оплате: <span className="font-semibold text-ink">{formatPrice(amount)}</span>
        </p>
        <p className="mt-1 font-mono text-xs text-ink-faint">{externalId}</p>

        <div className="mt-6 flex flex-col gap-2">
          <form action={settle}>
            <input type="hidden" name="status" value="succeeded" />
            <Button type="submit" className="w-full">
              Оплатить успешно
            </Button>
          </form>
          <form action={settle}>
            <input type="hidden" name="status" value="canceled" />
            <Button type="submit" variant="outline" className="w-full">
              Отменить оплату
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-ink-faint">
          Это заглушка для разработки. Боевая оплата идёт через реального провайдера.
        </p>
      </div>
    </div>
  );
}
