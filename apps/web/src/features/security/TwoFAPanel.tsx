'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import {
  beginTwoFASetup,
  confirmTwoFA,
  disableTwoFA,
  type TwoFAState,
} from './twofa-actions';
import { Button } from '@/shared/ui/Button';

const initial: TwoFAState = { ok: false };
const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';

// Панель управления 2FA. Если выключена — мастер настройки (QR + код).
// Если включена — отключение по коду.
export function TwoFAPanel({ enabled }: { enabled: boolean }) {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [confirmState, confirmAction, confirming] = useActionState(confirmTwoFA, initial);
  const [disableState, disableAction, disabling] = useActionState(disableTwoFA, initial);

  async function startSetup() {
    const res = await beginTwoFASetup();
    setQr(res.qrDataUrl);
    setSecret(res.secret);
  }

  if (enabled && !confirmState.ok) {
    return (
      <div className="rounded-card border border-hair/15 bg-panel p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2 text-ok">
          <ShieldCheck size={20} />
          <h2 className="text-lg font-semibold text-ink">Двухфакторная аутентификация включена</h2>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          Для отключения введите текущий код из приложения-аутентификатора.
        </p>
        <form action={disableAction} className="flex max-w-xs flex-col gap-2">
          {disableState.error && <p className="text-sm text-risk">{disableState.error}</p>}
          <input name="code" inputMode="numeric" placeholder="6-значный код" className={field} />
          <Button type="submit" variant="outline" disabled={disabling}>
            Отключить 2FA
          </Button>
        </form>
      </div>
    );
  }

  if (confirmState.ok) {
    return (
      <div className="rounded-card border border-ok/30 bg-ok/10 p-6 shadow-card">
        <div className="flex items-center gap-2 text-ok">
          <ShieldCheck size={20} />
          <p className="font-medium text-ink">2FA успешно включена. Обновите страницу.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-hair/15 bg-panel p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2 text-warn">
        <ShieldAlert size={20} />
        <h2 className="text-lg font-semibold text-ink">Двухфакторная аутентификация выключена</h2>
      </div>
      <p className="mb-4 text-sm text-ink-soft">
        Рекомендуется для админ-аккаунтов. Отсканируйте QR в Google Authenticator / 1Password и
        подтвердите кодом.
      </p>

      {!qr ? (
        <Button onClick={startSetup}>Настроить 2FA</Button>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {/* data-URL QR; unoptimized — это инлайн-картинка */}
            <Image
              src={qr}
              alt="QR для 2FA"
              width={168}
              height={168}
              unoptimized
              className="rounded-xl border border-hair/20 bg-white p-2"
            />
            {secret && (
              <p className="mt-2 break-all font-mono text-[11px] text-ink-faint">{secret}</p>
            )}
          </div>
          <form action={confirmAction} className="flex max-w-xs flex-1 flex-col gap-2">
            {confirmState.error && <p className="text-sm text-risk">{confirmState.error}</p>}
            <label className="font-mono text-xs uppercase tracking-wide text-ink-faint">
              Код из приложения
            </label>
            <input name="code" inputMode="numeric" placeholder="6-значный код" className={field} />
            <Button type="submit" disabled={confirming}>
              Подтвердить и включить
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
