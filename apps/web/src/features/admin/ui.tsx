import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// Компактный UI-кит админки: заголовок раздела, таблица, статистика.

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-hair/15 bg-panel p-5 shadow-card">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-card border border-hair/15 bg-panel shadow-card">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-hair/15">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('border-b border-hair/10 last:border-0 hover:bg-accent/5', className)}>
      {children}
    </tr>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-hair/15 bg-panel p-10 text-center text-ink-soft shadow-card">
      {children}
    </div>
  );
}
