import { redirect } from 'next/navigation';
import { auth } from './auth';
import type { Role } from '@nebula/db';

// Хелперы сессии для серверного кода. requireUser — рубеж №2 RBAC:
// гарантирует авторизацию и (опционально) минимальную роль перед use-case.

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

const ROLE_RANK: Record<Role, number> = { CLIENT: 1, MANAGER: 2, ADMIN: 3 };

export async function requireRole(required: Role) {
  const user = await requireUser();
  if (ROLE_RANK[user.role] < ROLE_RANK[required]) redirect('/403');
  return user;
}
