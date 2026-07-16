'use server';

import { createHash, randomBytes } from 'node:crypto';
import { hash } from '@node-rs/argon2';
import { z } from 'zod';
import { prisma, Role } from '@nebula/db';
import { signIn } from '@/shared/auth/auth';
import { rateLimit, LIMITS } from '@/shared/security/rate-limit';
import { getRequestIp } from '@/shared/security/request-ip';

// Argon2id — те же параметры, что в seed. Хеш паролей.
const ARGON = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

function sha256(v: string) {
  return createHash('sha256').update(v).digest('hex');
}

// ── Регистрация ─────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().min(2, 'Укажите имя').max(120),
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов').max(200),
  });

export type AuthState = { ok: boolean; error?: string };

export async function registerUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ip = await getRequestIp();
  const rl = await rateLimit(`register:${ip}`, LIMITS.register.limit, LIMITS.register.windowSec);
  if (!rl.ok) {
    return { ok: false, error: `Слишком много попыток. Повторите через ${rl.retryAfter} с.` };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Проверьте поля.' };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return { ok: false, error: 'Пользователь с таким email уже существует.' };
  }

  const passwordHash = await hash(password, ARGON);

  // upsert: email мог остаться «гостевым» от лида — доводим до полноценного.
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash, role: Role.CLIENT },
  });

  // Сразу логиним. redirectTo обработается редиректом Auth.js.
  await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  return { ok: true };
}

// ── Запрос восстановления пароля ────────────────────────────
const emailSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = await getRequestIp();
  const rl = await rateLimit(
    `pwreset:${ip}`,
    LIMITS.passwordReset.limit,
    LIMITS.passwordReset.windowSec,
  );
  // При превышении тоже возвращаем «ok» (anti-enumeration).
  if (!rl.ok) return { ok: true };

  const parsed = emailSchema.safeParse({ email: formData.get('email') });
  // Не раскрываем существование email — всегда «ok» (anti-enumeration).
  if (!parsed.success) return { ok: true };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 час
      },
    });
    // TODO(Спринт 4): отправить письмо со ссылкой через BullMQ-воркер.
    // В dev — ссылка в консоль сервера.
    const base = process.env.APP_URL ?? 'http://localhost:3000';
    console.log(`🔑 Сброс пароля для ${user.email}: ${base}/reset-password?token=${token}`);
  }
  return { ok: true };
}

// ── Установка нового пароля по токену ───────────────────────
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Минимум 8 символов').max(200),
});

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Проверьте пароль.' };
  }

  const tokenHash = sha256(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: 'Ссылка недействительна или истекла.' };
  }

  const passwordHash = await hash(parsed.data.password, ARGON);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Инвалидируем прочие активные токены пользователя.
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
