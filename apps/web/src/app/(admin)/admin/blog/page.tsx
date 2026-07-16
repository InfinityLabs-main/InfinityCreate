import type { Metadata } from 'next';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { createPost, togglePostPublished, deletePost } from '@/features/admin/blog-actions';
import { AdminHeader, Table, Row, Cell } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Админка · Блог', robots: { index: false } };

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';

export default async function AdminBlogPage() {
  await requireRole('ADMIN');
  const posts = await prisma.post.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <AdminHeader title="Блог" description="Публикации журнала." />

      <details className="mb-8 rounded-card border border-hair/15 bg-panel p-5 shadow-card">
        <summary className="cursor-pointer text-sm font-semibold">Новая статья</summary>
        <form action={createPost} className="mt-4 flex flex-col gap-3">
          <input name="title" required placeholder="Заголовок" className={field} />
          <input
            name="slug"
            required
            pattern="[a-z0-9\-]+"
            placeholder="slug (напр. kak-vybrat-stek)"
            className={field}
          />
          <input name="excerpt" placeholder="Краткое описание" className={field} />
          <textarea name="body" required rows={6} placeholder="Текст статьи" className={`${field} resize-y`} />
          <input name="tags" placeholder="Теги через запятую" className={field} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="publish" /> Опубликовать сразу
          </label>
          <div>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </details>

      <Table head={['Заголовок', 'Статус', 'Создана', '']}>
        {posts.map((p) => (
          <Row key={p.id}>
            <Cell className="font-medium">{p.title}</Cell>
            <Cell>
              {p.publishedAt ? (
                <span className="text-xs text-ok">опубликована</span>
              ) : (
                <span className="text-xs text-ink-faint">черновик</span>
              )}
            </Cell>
            <Cell className="text-ink-faint">{formatDate(p.createdAt)}</Cell>
            <Cell className="text-right">
              <div className="flex justify-end gap-1.5">
                <form action={togglePostPublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    title={p.publishedAt ? 'Снять с публикации' : 'Опубликовать'}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
                  >
                    {p.publishedAt ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </form>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    title="Удалить"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-risk/50 hover:text-risk"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>
            </Cell>
          </Row>
        ))}
      </Table>
    </div>
  );
}
