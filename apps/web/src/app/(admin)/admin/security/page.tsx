import type { Metadata } from 'next';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { TwoFAPanel } from '@/features/security/TwoFAPanel';
import { AdminHeader } from '@/features/admin/ui';

export const metadata: Metadata = { title: 'Админка · Безопасность', robots: { index: false } };

export default async function SecurityPage() {
  const user = await requireRole('ADMIN');
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFAEnabled: true },
  });

  return (
    <div className="max-w-2xl">
      <AdminHeader title="Безопасность" description="Двухфакторная аутентификация аккаунта." />
      <TwoFAPanel enabled={record?.twoFAEnabled ?? false} />
    </div>
  );
}
