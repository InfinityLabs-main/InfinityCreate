import { prisma, Prisma, type PaymentStatus } from '@nebula/db';
import type { PaymentEvent } from '@/domain/payments/provider';

// raw приходит как unknown из провайдера; для Json-колонки нормализуем
// к JSON-значению (провайдеры отдают сериализуемые объекты).
function toJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

// Идемпотентная обработка платёжного события. Ключ идемпотентности —
// externalId. Повторная доставка того же события не меняет состояние.
// При успехе: платёж → SUCCEEDED, заказ (если был NEW/DISCUSSION) → IN_PROGRESS,
// клиенту — уведомление. Всё в одной транзакции.

const STATUS_MAP: Record<PaymentEvent['status'], PaymentStatus> = {
  succeeded: 'SUCCEEDED',
  canceled: 'CANCELLED',
  pending: 'PENDING',
};

export async function processPaymentEvent(event: PaymentEvent): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { externalId: event.externalId },
    include: { order: true },
  });

  // Неизвестный платёж — молча игнорируем (не наш / уже удалён).
  if (!payment) return;

  const newStatus = STATUS_MAP[event.status];

  // Идемпотентность: если статус уже финальный и совпадает — выходим.
  if (payment.status === newStatus) return;
  if (payment.status === 'SUCCEEDED') return; // не откатываем успешный

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: newStatus, raw: toJson(event.raw) },
    });

    if (event.status === 'succeeded') {
      // Двигаем заказ в работу, если он ещё на ранних стадиях.
      if (payment.order.status === 'NEW' || payment.order.status === 'DISCUSSION') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'IN_PROGRESS' },
        });
        await tx.orderEvent.create({
          data: {
            orderId: payment.orderId,
            from: payment.order.status,
            to: 'IN_PROGRESS',
            comment: 'Оплата получена',
          },
        });
      }
      await tx.notification.create({
        data: {
          userId: payment.order.userId,
          type: 'payment.succeeded',
          title: 'Оплата получена',
          body: `Заказ №${payment.order.number} оплачен.`,
          link: `/orders/${payment.orderId}`,
        },
      });
    }
  });
}
