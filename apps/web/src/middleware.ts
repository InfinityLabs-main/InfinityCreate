import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/shared/auth/auth.config';
import { hasRole, requiredRoleForPath } from '@/shared/rbac/policy';

// Edge-инстанс: только authConfig (без Prisma/Argon2), чтобы middleware
// работал в Edge runtime. Полный auth (с провайдером) живёт в Node-runtime.
const { auth } = NextAuth(authConfig);

// Рубеж №1 RBAC: доступ к сегментам маршрутов.
// Ресурсное владение («свой ли заказ») проверяется в use-case (рубеж №2).
// Явный тип middleware — чтобы default-экспорт был нейменуемым под pnpm (TS2742).
// Тело обёрнуто auth(); приводим к нейменуемой сигнатуре обработчика запроса.
const middleware = auth((req) => {
  const { pathname } = req.nextUrl;
  const required = requiredRoleForPath(pathname);
  if (!required) return NextResponse.next();

  // Не авторизован → на логин с возвратом.
  if (!req.auth) {
    const url = new URL('/login', req.nextUrl.origin);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Авторизован, но роли не хватает → 403-страница.
  if (!hasRole(req.auth.user?.role, required)) {
    return NextResponse.redirect(new URL('/403', req.nextUrl.origin));
  }

  return NextResponse.next();
});

// Нейменуемая сигнатура для default-экспорта (обход TS2742 под pnpm).
const handler = middleware as (req: Request) => Promise<Response>;
export default handler;

export const config = {
  // Исключаем статику и внутренние пути Next.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
