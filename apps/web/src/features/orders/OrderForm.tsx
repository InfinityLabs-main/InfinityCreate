'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { createOrder, type CreateOrderState } from './actions';
import { Button } from '@/shared/ui/Button';

const initial: CreateOrderState = { ok: false };

// Форма заявки на карточке услуги. При успехе редиректит на созданный заказ.
export function OrderForm({ serviceId }: { serviceId: string }) {
  const [state, action, pending] = useActionState(createOrder, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.orderId) router.push(`/orders/${state.orderId}`);
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="serviceId" value={serviceId} />
      {state.error && (
        <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
          {state.error}
        </p>
      )}
      <textarea
        name="details"
        rows={3}
        placeholder="Кратко опишите задачу (необязательно)"
        className="w-full resize-y rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/60"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Отправляем…' : (
          <>
            Оставить заявку <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
