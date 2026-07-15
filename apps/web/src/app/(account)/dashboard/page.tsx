import { auth, signOut } from '@/shared/auth/auth';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

// Скелет кабинета клиента. Наполняется в Спринте 2
// (заявки, заказы, документы, уведомления, чат).
export default async function DashboardPage() {
  const session = await auth();

  async function logout() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            роль: {session?.user?.role}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Кабинет · {session?.user?.name ?? session?.user?.email}
          </h1>
        </div>
        <form action={logout}>
          <Button variant="ghost" type="submit">
            Выйти
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Заказы</p>
          <p className="mt-2 text-3xl font-semibold">0</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">В работе</p>
          <p className="mt-2 text-3xl font-semibold">0</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Сообщения</p>
          <p className="mt-2 text-3xl font-semibold">0</p>
        </Card>
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        Разделы кабинета (заявки, оплата, документы, чат) подключаются в Спринте 2.
      </p>
    </div>
  );
}
