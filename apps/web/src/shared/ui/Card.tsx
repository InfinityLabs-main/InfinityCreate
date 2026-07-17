import { cn } from '@/shared/lib/cn';
import type { HTMLAttributes } from 'react';

// Карточка в стиле макета: тёмная, тонкая рамка, свечение и подъём на hover.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-card border border-hair/[0.07] bg-panel p-6',
        'transition-all duration-200 hover:-translate-y-[3px] hover:border-hair/12',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-[radial-gradient(120%_90%_at_100%_0%,hsl(var(--accent)/0.28),transparent_55%)]',
        'before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
