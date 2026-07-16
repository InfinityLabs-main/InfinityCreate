'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Image,
  Newspaper,
  Users,
  MessageSquare,
  Star,
  HelpCircle,
  Settings,
  Blocks,
  ShieldCheck,
} from 'lucide-react';
import type { Role } from '@nebula/db';
import { cn } from '@/shared/lib/cn';

// Пункты меню с минимальной ролью. Менеджер видит операционные разделы,
// админ — всё, включая CMS и настройки.
const ITEMS: { href: string; label: string; icon: typeof Package; min: Role }[] = [
  { href: '/admin', label: 'Обзор', icon: LayoutDashboard, min: 'MANAGER' },
  { href: '/admin/orders', label: 'Заказы', icon: Package, min: 'MANAGER' },
  { href: '/admin/support', label: 'Обращения', icon: MessageSquare, min: 'MANAGER' },
  { href: '/admin/clients', label: 'Клиенты', icon: Users, min: 'MANAGER' },
  { href: '/admin/services', label: 'Услуги', icon: Boxes, min: 'ADMIN' },
  { href: '/admin/categories', label: 'Категории', icon: FolderTree, min: 'ADMIN' },
  { href: '/admin/portfolio', label: 'Портфолио', icon: Image, min: 'ADMIN' },
  { href: '/admin/blog', label: 'Блог', icon: Newspaper, min: 'ADMIN' },
  { href: '/admin/reviews', label: 'Отзывы', icon: Star, min: 'ADMIN' },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle, min: 'ADMIN' },
  { href: '/admin/builder', label: 'Главная', icon: Blocks, min: 'ADMIN' },
  { href: '/admin/settings', label: 'Настройки', icon: Settings, min: 'ADMIN' },
  { href: '/admin/security', label: 'Безопасность', icon: ShieldCheck, min: 'ADMIN' },
];

const RANK: Record<Role, number> = { CLIENT: 1, MANAGER: 2, ADMIN: 3 };

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ITEMS.filter((it) => RANK[role] >= RANK[it.min]);

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((it) => {
        const active =
          it.href === '/admin' ? pathname === '/admin' : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm transition-colors',
              active ? 'bg-accent/10 text-ink' : 'text-ink-soft hover:bg-accent/5 hover:text-ink',
            )}
          >
            <it.icon size={16} className={active ? 'text-accent' : ''} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
