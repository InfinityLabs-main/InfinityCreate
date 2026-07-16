import type { Metadata } from 'next';
import { Trash2 } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { createProject, deleteProject } from '@/features/admin/portfolio-actions';
import { AdminHeader, Table, Row, Cell } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';

export const metadata: Metadata = { title: 'Админка · Портфолио', robots: { index: false } };

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';

export default async function AdminPortfolioPage() {
  await requireRole('ADMIN');
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div>
      <AdminHeader title="Портфолио" description="Работы и развёрнутые кейсы." />

      <details className="mb-8 rounded-card border border-hair/15 bg-panel p-5 shadow-card">
        <summary className="cursor-pointer text-sm font-semibold">Новый проект</summary>
        <form action={createProject} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="title" required placeholder="Название" className={field} />
          <input
            name="slug"
            required
            pattern="[a-z0-9\-]+"
            placeholder="slug"
            className={field}
          />
          <input name="category" placeholder="Категория" className={field} />
          <input name="techStack" placeholder="Технологии через запятую" className={field} />
          <input name="link" type="url" placeholder="Ссылка (необязательно)" className={field} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="isCase" /> Это развёрнутый кейс
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Описание (для кейса: задача / решение / результат через пустую строку)"
            className={`${field} resize-y sm:col-span-2`}
          />
          <div className="sm:col-span-2">
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </details>

      <Table head={['Название', 'Категория', 'Тип', '']}>
        {projects.map((p) => (
          <Row key={p.id}>
            <Cell className="font-medium">{p.title}</Cell>
            <Cell className="text-ink-soft">{p.category ?? '—'}</Cell>
            <Cell className="text-ink-soft">{p.isCase ? 'кейс' : 'работа'}</Cell>
            <Cell className="text-right">
              <form action={deleteProject}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  title="Удалить"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-risk/50 hover:text-risk"
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
