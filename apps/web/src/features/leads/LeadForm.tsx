'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitLead, type LeadState } from './actions';
import { Button } from '@/shared/ui/Button';

const initial: LeadState = { ok: false };

// Форма заявки на useActionState — прогрессивное улучшение, работает и без JS.
export function LeadForm() {
  const [state, action, pending] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <div className="glass-panel flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="text-ok" size={40} />
        <h3 className="text-lg font-semibold">Заявка отправлена</h3>
        <p className="text-sm text-ink-soft">
          Мы свяжемся с вами по указанному email в ближайшее время.
        </p>
      </div>
    );
  }

  const field =
    'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/60';

  return (
    <form action={action} className="glass-panel flex flex-col gap-3 p-6">
      {state.error && (
        <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
          {state.error}
        </p>
      )}
      <input name="name" placeholder="Ваше имя" required className={field} />
      <input name="email" type="email" placeholder="Email" required className={field} />
      <textarea
        name="message"
        placeholder="Опишите задачу"
        required
        rows={5}
        className={`${field} resize-y`}
      />
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
      <p className="text-center text-xs text-ink-faint">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
      </p>
    </form>
  );
}
