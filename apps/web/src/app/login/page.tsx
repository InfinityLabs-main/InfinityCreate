import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signIn, auth } from '@/shared/auth/auth';
import { Button } from '@/shared/ui/Button';

// Ошибка, брошенная redirect() из next/navigation, несёт digest
// "NEXT_REDIRECT" — её нужно пробросить, а не глотать.
function isNextRedirect(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'digest' in e &&
    typeof (e as { digest: unknown }).digest === 'string' &&
    (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

// Логин через Credentials. Поддерживает 2FA-челлендж админа: при ошибке
// two_factor_required страница показывает поле для TOTP-кода.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; twofa?: string }>;
}) {
  const session = await auth();
  if (session) redirect('/dashboard');
  const sp = await searchParams;
  const needCode = sp.twofa === '1';

  async function login(formData: FormData) {
    'use server';
    const callbackUrl = sp.callbackUrl ?? '/dashboard';
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const code = String(formData.get('code') ?? '');

    try {
      await signIn('credentials', { email, password, code, redirectTo: callbackUrl });
    } catch (e) {
      // Редирект NextAuth при успехе — пробрасываем.
      if (isNextRedirect(e)) throw e;
      // 2FA нужен → показываем поле кода (сохраняем email в query).
      const err = e as { code?: string };
      const params = new URLSearchParams();
      if (sp.callbackUrl) params.set('callbackUrl', sp.callbackUrl);
      if (err?.code === 'two_factor_required') {
        params.set('twofa', '1');
        params.set('email', email);
      } else {
        params.set('error', '1');
      }
      redirect(`/login?${params.toString()}`);
    }
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
        {needCode && (
          <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink-soft">
            Введите код из приложения-аутентификатора.
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            defaultValue={needCode ? undefined : undefined}
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
          {needCode && (
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-значный код"
              className="rounded-xl border border-accent/40 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            />
          )}
          <Button type="submit" className="mt-1 w-full">
            Войти
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/register" className="text-accent hover:opacity-80">
            Создать аккаунт
          </Link>
          <Link href="/forgot-password" className="text-ink-soft hover:text-ink">
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  );
}
