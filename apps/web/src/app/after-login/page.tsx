import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/shared/auth/session';

// Маршрутизатор после входа: админов и менеджеров ведём в /admin,
// клиентов — в кабинет. Прямые заходы на /dashboard и /admin остаются
// доступны обоим (без принудительного редиректа), это только точка входа.
export default async function AfterLoginPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'MANAGER' || user.role === 'ADMIN') redirect('/admin');
  redirect('/dashboard');
}
