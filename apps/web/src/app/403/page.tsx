import Link from 'next/link';
import { Button } from '@/shared/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm uppercase tracking-widest text-accent">403</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Доступ запрещён</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          У вашей роли нет прав на этот раздел. Если это ошибка — обратитесь к администратору.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">На главную</Button>
        </Link>
      </div>
    </div>
  );
}
