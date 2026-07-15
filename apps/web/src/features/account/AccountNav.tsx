'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const ITEMS = [
  { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { href: '/orders', label: 'Заказы', icon: Package },
  { href: '/chat', label: 'Чат', icon: MessageSquare },
  { href: '/notifications', label: 'Уведомления', icon: Bell },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {ITEMS.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + '/');
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition-colors',
              active
                ? 'bg-accent/10 text-ink'
                : 'text-ink-soft hover:bg-accent/5 hover:text-ink',
            )}
          >
            <it.icon size={17} className={active ? 'text-accent' : ''} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
