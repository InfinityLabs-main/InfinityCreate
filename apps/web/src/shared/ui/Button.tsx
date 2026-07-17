import { cn } from '@/shared/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

// Кнопки в стиле макета: сплошной violet (primary), линия (outline), тихая (ghost).
const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-glow hover:bg-accent-2 hover:-translate-y-px',
  outline:
    'border border-hair/12 bg-hair/[0.02] text-ink hover:border-hair/25 hover:bg-hair/[0.05]',
  ghost: 'text-ink-soft hover:text-ink',
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-[18px] py-2.5 text-sm font-medium',
        'border border-transparent transition-all duration-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
