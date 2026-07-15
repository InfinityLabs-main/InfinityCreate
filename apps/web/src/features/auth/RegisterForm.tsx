'use client';

import { useActionState } from 'react';
import { registerUser, type AuthState } from './actions';
import { authField } from './AuthShell';
import { Button } from '@/shared/ui/Button';

const initial: AuthState = { ok: false };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      {state.error && (
        <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
          {state.error}
        </p>
      )}
      <input name="name" placeholder="Ваше имя" required className={authField} />
      <input name="email" type="email" placeholder="Email" required className={authField} />
      <input
        name="password"
        type="password"
        placeholder="Пароль (мин. 8 символов)"
        required
        minLength={8}
        className={authField}
      />
      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? 'Создаём…' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
