'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resetPassword, type AuthState } from './actions';
import { authField } from './AuthShell';
import { Button } from '@/shared/ui/Button';

const initial: AuthState = { ok: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);

  if (state.ok) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-ok/30 bg-ok/10 px-3 py-3 text-sm text-ink-soft">
          Пароль обновлён. Теперь можно войти.
        </p>
        <Link href="/login" className="mt-3 block">
          <Button className="w-full">Перейти ко входу</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
          {state.error}
        </p>
      )}
      <input
        name="password"
        type="password"
        placeholder="Новый пароль (мин. 8 символов)"
        required
        minLength={8}
        className={authField}
      />
      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? 'Сохраняем…' : 'Установить пароль'}
      </Button>
    </form>
  );
}
