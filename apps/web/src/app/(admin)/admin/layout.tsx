import Link from 'next/link';
import { requireRole } from '@/shared/auth/session';
import { signOut } from '@/shared/auth/auth';
import { AdminNav } from '@/features/admin/AdminNav';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';

// Вся админ-зона доступна с роли MANAGER; отдельные разделы гейтятся
// на своих страницах через requireRole('ADMIN'). middleware уже проверил
// префикс /admin (ADMIN)… но менеджеру тоже нужен доступ — см. примечание.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('MANAGER');

  async function logout() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-hair/15 bg-ground/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-accent-gradient" />
            <b className="text-[15px] tracking-tight">
              Nebula<span className="text-accent">.</span>
              <span className="ml-1 font-mono text-xs font-normal text-ink-faint">admin</span>
            </b>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-ink-faint hover:text-ink">
              На сайт ↗
            </Link>
            <span className="hidden text-sm text-ink-soft sm:inline">
              {user.name} · {user.role === 'ADMIN' ? 'админ' : 'менеджер'}
            </span>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-hair/30 px-3.5 py-2 text-sm text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[210px_1fr]">
        <aside className="md:sticky md:top-8 md:self-start">
          <AdminNav role={user.role} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
