import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/features/auth/AuthShell';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Восстановление пароля', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Восстановление пароля"
      subtitle="Укажите email — пришлём ссылку для сброса."
      footer={
        <Link href="/login" className="text-accent hover:opacity-80">
          Вернуться ко входу
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
