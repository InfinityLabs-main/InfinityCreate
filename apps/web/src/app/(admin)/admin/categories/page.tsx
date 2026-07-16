import type { Metadata } from 'next';
import { Trash2 } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { createCategory, deleteCategory } from '@/features/admin/category-actions';
import { AdminHeader, Table, Row, Cell } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';

export const metadata: Metadata = { title: 'Админка · Категории', robots: { index: false } };

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';

export default async function AdminCategoriesPage() {
  await requireRole('ADMIN');
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
    include: { _count: { select: { services: { where: { deletedAt: null } } } } },
  });

  return (
    <div>
      <AdminHeader title="Категории" description="Категории каталога услуг." />

      <div className="mb-8 rounded-card border border-hair/15 bg-panel p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold">Добавить категорию</h2>
        <form action={createCategory} className="grid gap-3 sm:grid-cols-3">
          <input name="title" required placeholder="Название" className={field} />
          <input
            name="slug"
            required
            pattern="[a-z0-9\-]+"
            placeholder="slug (напр. crm)"
            className={field}
          />
          <input name="description" placeholder="Описание (необязательно)" className={field} />
          <div className="sm:col-span-3">
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </div>

      <Table head={['Название', 'Slug', 'Услуг', '']}>
        {categories.map((c) => (
          <Row key={c.id}>
            <Cell className="font-medium">{c.title}</Cell>
            <Cell className="font-mono text-xs text-ink-soft">{c.slug}</Cell>
            <Cell className="tabular-nums">{c._count.services}</Cell>
            <Cell className="text-right">
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  disabled={c._count.services > 0}
                  title={
                    c._count.services > 0
                      ? 'Нельзя удалить: есть услуги'
                      : 'Удалить'
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-risk/50 hover:text-risk disabled:opacity-30 disabled:hover:border-hair/25 disabled:hover:text-ink-soft"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </Cell>
          </Row>
        ))}
      </Table>
    </div>
  );
}
