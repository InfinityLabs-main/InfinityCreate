import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@nebula/db';

// Edge-безопасная конфигурация: НИКАКИХ импортов Prisma / Node-крипто.
// Используется в middleware (Edge runtime) и расширяется в auth.ts
// провайдерами, работающими в Node-runtime.
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    // Скользящая сессия: живёт 7 дней, продлевается при активности раз в сутки.
    // (Полная refresh-ротация с БД-сессиями — задел на будущее, модель
    // RefreshToken готова; для текущего JWT-режима достаточно скользящего TTL.)
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  // httpOnly + SameSite=Lax cookie по умолчанию; secure — автоматически по HTTPS.
  pages: { signIn: '/login' },
  providers: [], // добавляются в auth.ts (Credentials требует Prisma+Argon2)
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role: Role }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};
