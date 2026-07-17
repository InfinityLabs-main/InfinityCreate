import { cn } from '@/shared/lib/cn';
import type { HTMLAttributes } from 'react';

// Чип технологии — моно-шрифт, тонкая рамка (стиль макета).
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-hair/12 bg-hair/[0.02] px-2.5 py-1',
        'font-mono text-[11.5px] text-ink-soft',
        className,
      )}
      {...props}
    />
  );
}
