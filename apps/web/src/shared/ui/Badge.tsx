import { cn } from '@/shared/lib/cn';
import type { HTMLAttributes } from 'react';

// Тех-стек / теги. Тонкий indigo-хайрлайн, моно-шрифт.
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-hair/25 bg-accent/5 px-2.5 py-1',
        'font-mono text-xs text-ink-soft',
        className,
      )}
      {...props}
    />
  );
}
