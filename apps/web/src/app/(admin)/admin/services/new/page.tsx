import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { createService } from '@/features/admin/service-actions';
import { ServiceForm } from '@/features/admin/ServiceForm';
import { AdminHeader } from '@/features/admin/ui';

export const metadata: Metadata = { title: 'Админка · Новая услуга', robots: { index: false } };

export default async function NewServicePage() {
  await requireRole('ADMIN');
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
    select: { id: true, title: true },
  });

  return (
    <div>
      <Link href="/admin/services" className="text-sm text-ink-soft hover:text-ink">
        ← К услугам
      </Link>
      <AdminHeader title="Новая услуга" />
      <ServiceForm action={createService} categories={categories} />
    </div>
  );
}
