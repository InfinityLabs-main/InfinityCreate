import Link from 'next/link';
import { requireUser } from '@/shared/auth/session';
import { signOut } from '@/shared/auth/auth';
import { AccountNav } from '@/features/account/AccountNav';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

// Layout кабинета. requireUser — редирект на /login, если не авторизован
// (дублирует middleware, но гарантирует user для серверных детей).
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  async function logout() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-hair/15 bg-ground/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-accent-gradient" />
            <b className="text-[15px] tracking-tight">
              Nebula<span className="text-accent">.</span>
            </b>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:inline">
              {user.name ?? user.email}
            </span>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-hair/30 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-8 md:self-start">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
