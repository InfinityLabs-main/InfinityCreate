'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';
import { getPaymentProvider } from '@/infra/payments/factory';

// initPayment: создаёт Payment(pending), зовёт провайдера, редиректит
// на страницу оплаты. Владение заказом проверяется здесь (рубеж №2).
export async function initPayment(formData: FormData): Promise<void> {
  const user = await requireUser();
  const orderId = String(formData.get('orderId') ?? '');

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { service: { select: { title: true } } },
  });
  if (!order) redirect('/orders');

  // Уже оплачен? Не создаём повторный платёж.
  const paid = await prisma.payment.findFirst({
    where: { orderId: order.id, status: 'SUCCEEDED' },
  });
  if (paid) redirect(`/orders/${order.id}`);

  const provider = getPaymentProvider();
  const returnUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/orders/${order.id}`;

  const created = await provider.createPayment({
    orderId: order.id,
    orderNumber: order.number,
    amount: order.amount,
    currency: 'RUB',
    description: `Заказ №${order.number}: ${order.service.title}`,
    returnUrl,
  });

  // Фиксируем pending-платёж с externalId для идемпотентной сверки.
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: provider.name,
      status: 'PENDING',
      amount: order.amount,
      currency: 'RUB',
      externalId: created.externalId,
    },
  });

  redirect(created.redirectUrl);
}
