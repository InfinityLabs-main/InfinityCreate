import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { updateService } from '@/features/admin/service-actions';
import { ServiceForm } from '@/features/admin/ServiceForm';
import { AdminHeader } from '@/features/admin/ui';

export const metadata: Metadata = { title: 'Админка · Услуга', robots: { index: false } };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('ADMIN');
  const { id } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
      select: { id: true, title: true },
    }),
  ]);
  if (!service || service.deletedAt) notFound();

  return (
    <div>
      <Link href="/admin/services" className="text-sm text-ink-soft hover:text-ink">
        ← К услугам
      </Link>
      <AdminHeader title="Редактирование услуги" description={service.title} />
      <ServiceForm action={updateService} categories={categories} service={service} />
    </div>
  );
}
