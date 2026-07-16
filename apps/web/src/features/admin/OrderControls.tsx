'use client';

import { useActionState } from 'react';
import type { OrderStatus } from '@nebula/db';
import { updateOrderStatus, type UpdateStatusState } from '@/features/orders/actions';
import { assignOrder } from './order-actions';
import { nextStatuses, STATUS_LABELS } from '@/domain/orders/status';
import { Button } from '@/shared/ui/Button';

const initial: UpdateStatusState = { ok: false };

// Смена статуса — только допустимые переходы из state-machine.
export function StatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [state, action, pending] = useActionState(updateOrderStatus, initial);
  const options = nextStatuses(current);

  if (options.length === 0) {
    return <p className="text-sm text-ink-faint">Заказ в терминальном статусе.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && <p className="text-sm text-risk">{state.error}</p>}
      <label className="font-mono text-xs uppercase tracking-wide text-ink-faint">
        Перевести в статус
      </label>
      <select
        name="to"
        className="rounded-xl border border-hair/30 bg-panel px-3 py-2 text-sm outline-none focus:border-accent/60"
        defaultValue={options[0]}
      >
        {options.map((st) => (
          <option key={st} value={st}>
            {STATUS_LABELS[st]}
          </option>
        ))}
      </select>
      <input
        name="comment"
        placeholder="Комментарий (необязательно)"
        className="rounded-xl border border-hair/30 bg-panel px-3 py-2 text-sm outline-none focus:border-accent/60"
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Сохраняем…' : 'Изменить статус'}
      </Button>
    </form>
  );
}

export function AssignControl({
  orderId,
  currentAssigneeId,
  assignees,
}: {
  orderId: string;
  currentAssigneeId: string | null;
  assignees: { id: string; name: string | null; email: string }[];
}) {
  return (
    <form action={assignOrder} className="flex flex-col gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="font-mono text-xs uppercase tracking-wide text-ink-faint">
        Исполнитель
      </label>
      <select
        name="assigneeId"
        defaultValue={currentAssigneeId ?? ''}
        className="rounded-xl border border-hair/30 bg-panel px-3 py-2 text-sm outline-none focus:border-accent/60"
      >
        <option value="">— не назначен —</option>
        {assignees.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name ?? a.email}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline">
        Назначить
      </Button>
    </form>
  );
}
