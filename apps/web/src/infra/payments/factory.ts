import type { PaymentProvider } from '@/domain/payments/provider';
import { MockProvider } from './mock-provider';
import { YooKassaProvider } from './yookassa-provider';

// Фабрика провайдера по env. Единая точка выбора реализации —
// бизнес-логика её не знает. Добавление крипты/счетов = ещё один case.
let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  switch (provider) {
    case 'yookassa': {
      const shopId = process.env.YOOKASSA_SHOP_ID;
      const secretKey = process.env.YOOKASSA_SECRET_KEY;
      if (!shopId || !secretKey) {
        throw new Error('PAYMENT_PROVIDER=yookassa, но не заданы YOOKASSA_SHOP_ID/SECRET_KEY');
      }
      cached = new YooKassaProvider(shopId, secretKey);
      break;
    }
    case 'mock':
    default:
      cached = new MockProvider();
      break;
  }

  return cached;
}
