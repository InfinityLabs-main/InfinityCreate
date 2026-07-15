import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verify } from '@node-rs/argon2';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { authConfig } from './auth.config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Полная конфигурация (Node runtime): базовый edge-safe authConfig +
// Credentials-провайдер, которому нужны Prisma и Argon2.
// Refresh-ротация и 2FA-челлендж админа — Спринт 2 (модель RefreshToken готова).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash || user.deletedAt) return null;

        const ok = await verify(user.passwordHash, parsed.data.password);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
