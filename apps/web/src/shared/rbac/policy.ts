import type { Role } from '@nebula/db';

// Декларативный RBAC. Проверка на двух рубежах:
//   1) middleware — доступ к сегменту маршрутов (см. middleware.ts)
//   2) use-case — доступ к конкретному ресурсу (владение)
// Здесь — рубеж №1: иерархия ролей и разрешения на действия.

export const ROLE_RANK: Record<Role, number> = {
  CLIENT: 1,
  MANAGER: 2,
  ADMIN: 3,
};

// Роль удовлетворяет требованию, если её ранг не ниже требуемого.
export function hasRole(role: Role | undefined, required: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

// Какие сегменты маршрутов доступны какой минимальной роли.
export const ROUTE_GUARDS: { prefix: string; required: Role }[] = [
  // /admin доступен с MANAGER; admin-only разделы гейтятся на страницах.
  { prefix: '/admin', required: 'MANAGER' },
  { prefix: '/dashboard', required: 'CLIENT' },
  { prefix: '/orders', required: 'CLIENT' },
  { prefix: '/chat', required: 'CLIENT' },
  { prefix: '/notifications', required: 'CLIENT' },
];

export function requiredRoleForPath(pathname: string): Role | null {
  const match = ROUTE_GUARDS.find((g) => pathname.startsWith(g.prefix));
  return match ? match.required : null;
}

// Точечные разрешения на действия (рубеж use-case — грубый уровень).
export type Action =
  | 'order.updateStatus'
  | 'order.assign'
  | 'service.manage'
  | 'cms.manage'
  | 'review.moderate'
  | 'ticket.close';

const ACTION_MIN_ROLE: Record<Action, Role> = {
  'order.updateStatus': 'MANAGER',
  'order.assign': 'MANAGER',
  'ticket.close': 'MANAGER',
  'service.manage': 'ADMIN',
  'cms.manage': 'ADMIN',
  'review.moderate': 'ADMIN',
};

export function can(role: Role | undefined, action: Action): boolean {
  return hasRole(role, ACTION_MIN_ROLE[action]);
}
