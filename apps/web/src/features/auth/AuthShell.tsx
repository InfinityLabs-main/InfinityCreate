import Link from 'next/link';

// Общая обёртка страниц авторизации: центр, лого, стеклянная карточка.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-lg bg-accent-gradient" />
          <b className="tracking-tight">
            Nebula<span className="text-accent">.</span>
          </b>
        </Link>
        <div className="glass-panel p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}

export const authField =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/60';
