import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/features/auth/AuthShell';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Новый пароль', robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title="Ссылка недействительна"
        subtitle="Токен не найден. Запросите восстановление заново."
        footer={
          <Link href="/forgot-password" className="text-accent hover:opacity-80">
            Восстановить пароль
          </Link>
        }
      >
        <span />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Новый пароль" subtitle="Придумайте новый пароль для входа.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
