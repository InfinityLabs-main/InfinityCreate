import { cn } from '@/shared/lib/cn';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass-panel p-6 transition-transform duration-200 hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  );
}
