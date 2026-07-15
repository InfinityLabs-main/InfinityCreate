'use server';

import { SignJWT } from 'jose';
import { requireUser } from '@/shared/auth/session';

// Короткоживущий токен для аутентификации сокета в realtime-сервисе.
// Realtime не умеет читать сессию NextAuth (JWE-cookie), поэтому web-приложение
// выдаёт отдельный HS256-JWT с тем же AUTH_SECRET. Срок жизни — 60 секунд:
// достаточно для рукопожатия, при реконнекте клиент запросит новый.
export async function mintSocketToken(): Promise<string> {
  const user = await requireUser();
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(secret);
}
