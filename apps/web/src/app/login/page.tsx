import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signIn, auth } from '@/shared/auth/auth';
import { Button } from '@/shared/ui/Button';

// Логин через Credentials (Server Action). Полноценный UX формы
// (ошибки, восстановление пароля, 2FA) — Спринт 2.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session) redirect('/dashboard');
  const sp = await searchParams;

  async function login(formData: FormData) {
    'use server';
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: sp.callbackUrl ?? '/dashboard',
    });
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="glass-panel w-full max-w-sm p-8">
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-lg bg-accent-gradient" />
          <b className="tracking-tight">
            Nebula<span className="text-accent">.</span>
          </b>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Вход в кабинет</h1>
        <p className="mt-1 text-sm text-ink-soft">Демо: client@nebula.local / Client123!</p>

        {sp.error && (
          <p className="mt-4 rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
            Неверный email или пароль.
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
            className="rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60"
          />
          <Button type="submit" className="mt-1 w-full">
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
