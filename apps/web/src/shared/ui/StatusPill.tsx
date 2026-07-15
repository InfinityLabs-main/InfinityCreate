import type { OrderStatus } from '@nebula/db';
import { STATUS_LABELS, STATUS_TONE } from '@/domain/orders/status';
import { cn } from '@/shared/lib/cn';

const TONE_CLASS: Record<string, string> = {
  info: 'text-info bg-info/10',
  warn: 'text-warn bg-warn/10',
  ok: 'text-ok bg-ok/10',
  risk: 'text-risk bg-risk/10',
  muted: 'text-ink-faint bg-ink-faint/10',
};

// Пилюля статуса заказа: цвет закодирован семантикой, не акцентом.
export function StatusPill({ status }: { status: OrderStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        TONE_CLASS[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
