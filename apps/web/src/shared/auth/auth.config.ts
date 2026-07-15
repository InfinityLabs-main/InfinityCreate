import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@nebula/db';

// Edge-безопасная конфигурация: НИКАКИХ импортов Prisma / Node-крипто.
// Используется в middleware (Edge runtime) и расширяется в auth.ts
// провайдерами, работающими в Node-runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
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
