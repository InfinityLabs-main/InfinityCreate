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
//
// TS2742: под pnpm выводимые типы результата NextAuth v5 ссылаются на глубокие
// пути next-auth/@auth-core и не поддаются именованию при declaration-emit
// (@ts-ignore это не подавляет — это не ошибка выражения). Оборачиваем результат
// нашими явными типами: рантайм неизменен, а тип каждого экспорта — нейменуемый.
const nextAuth = NextAuth({
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

// Граница типов: результат NextAuth непортируем под pnpm (TS2742). Приводим к
// локальным нейменуемым сигнатурам — этого достаточно для наших вызовов
// (auth() в RSC/route, signIn/signOut в Server Actions, handlers в route.ts).
type RouteHandler = (req: Request) => Promise<Response>;
type Session = import('next-auth').Session;
// Запрос, который NextAuth прокидывает в middleware-обёртку: NextRequest + auth.
type AuthedRequest = import('next/server').NextRequest & { auth: Session | null };
type MiddlewareReturn =
  | import('next/server').NextResponse
  | Response
  | undefined
  | Promise<import('next/server').NextResponse | Response | undefined>;

interface AuthExports {
  handlers: { GET: RouteHandler; POST: RouteHandler };
  // auth перегружен: получение сессии и обёртка middleware.
  auth: {
    (): Promise<Session | null>;
    (handler: (req: AuthedRequest) => MiddlewareReturn): RouteHandler;
  };
  signIn: (provider?: string, options?: Record<string, unknown>) => Promise<unknown>;
  signOut: (options?: Record<string, unknown>) => Promise<unknown>;
}

const authExports = nextAuth as unknown as AuthExports;
export const handlers = authExports.handlers;
export const auth = authExports.auth;
export const signIn = authExports.signIn;
export const signOut = authExports.signOut;
