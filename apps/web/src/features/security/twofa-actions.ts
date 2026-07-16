'use server';

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { rateLimit, LIMITS } from '@/shared/security/rate-limit';
import { writeAudit } from '@/features/admin/audit';

// 2FA (TOTP) для админа. Секрет хранится в User.twoFASecret; включение —
// после подтверждения первым кодом. otplib проверяет 6-значный код.

const ISSUER = 'Nebula Admin';

export type TwoFAState = { ok: boolean; error?: string };

// Шаг 1: сгенерировать секрет и QR (не включая 2FA).
export async function beginTwoFASetup(): Promise<{ secret: string; qrDataUrl: string }> {
  const user = await requireRole('ADMIN');
  const secret = authenticator.generateSecret();
  // Сохраняем секрет как «ожидающий»; twoFAEnabled пока false.
  await prisma.user.update({ where: { id: user.id }, data: { twoFASecret: secret } });

  const otpauth = authenticator.keyuri(user.email ?? 'admin', ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);
  return { secret, qrDataUrl };
}

// Шаг 2: подтвердить кодом → включить 2FA.
export async function confirmTwoFA(_prev: TwoFAState, formData: FormData): Promise<TwoFAState> {
  const user = await requireRole('ADMIN');
  const code = String(formData.get('code') ?? '').trim();

  const rl = await rateLimit(`2fa:${user.id}`, LIMITS.twoFA.limit, LIMITS.twoFA.windowSec);
  if (!rl.ok) return { ok: false, error: 'Слишком много попыток. Подождите.' };

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record?.twoFASecret) return { ok: false, error: 'Сначала сгенерируйте секрет.' };

  const valid = authenticator.verify({ token: code, secret: record.twoFASecret });
  if (!valid) return { ok: false, error: 'Неверный код. Попробуйте ещё раз.' };

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: true } });
  await writeAudit({ actorId: user.id, action: 'security.2fa.enable', target: `User:${user.id}` });
  return { ok: true };
}

// Отключить 2FA (требует кода).
export async function disableTwoFA(_prev: TwoFAState, formData: FormData): Promise<TwoFAState> {
  const user = await requireRole('ADMIN');
  const code = String(formData.get('code') ?? '').trim();

  const rl = await rateLimit(`2fa:${user.id}`, LIMITS.twoFA.limit, LIMITS.twoFA.windowSec);
  if (!rl.ok) return { ok: false, error: 'Слишком много попыток. Подождите.' };

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record?.twoFASecret || !authenticator.verify({ token: code, secret: record.twoFASecret })) {
    return { ok: false, error: 'Неверный код.' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFAEnabled: false, twoFASecret: null },
  });
  await writeAudit({ actorId: user.id, action: 'security.2fa.disable', target: `User:${user.id}` });
  return { ok: true };
}
