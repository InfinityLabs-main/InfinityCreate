'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type AuthState } from './actions';
import { authField } from './AuthShell';
import { Button } from '@/shared/ui/Button';

const initial: AuthState = { ok: false };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.ok) {
    return (
      <p className="mt-6 rounded-lg border border-ok/30 bg-ok/10 px-3 py-3 text-sm text-ink-soft">
        Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.
        Проверьте почту.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input name="email" type="email" placeholder="Email" required className={authField} />
      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? 'Отправляем…' : 'Отправить ссылку'}
      </Button>
    </form>
  );
}
