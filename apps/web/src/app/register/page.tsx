import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/auth/auth';
import { AuthShell } from '@/features/auth/AuthShell';
import { RegisterForm } from '@/features/auth/RegisterForm';

export const metadata: Metadata = { title: 'Регистрация', robots: { index: false } };

export default async function RegisterPage() {
  if (await auth()) redirect('/dashboard');
  return (
    <AuthShell
      title="Создать аккаунт"
      subtitle="Регистрируйтесь, чтобы оформлять заказы и общаться с менеджером."
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-accent hover:opacity-80">
            Войти
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
