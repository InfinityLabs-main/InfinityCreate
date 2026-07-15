import { cn } from '@/shared/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent-gradient text-white shadow-card hover:brightness-110 active:brightness-95',
  ghost: 'text-ink-soft hover:text-ink hover:bg-accent/5',
  outline: 'border border-hair/30 text-ink hover:border-accent/50 hover:bg-accent/5',
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium',
        'transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
