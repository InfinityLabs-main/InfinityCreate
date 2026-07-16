import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import {
  toggleServiceHidden,
  toggleServicePinned,
  deleteService,
} from '@/features/admin/service-actions';
import { AdminHeader, Table, Row, Cell, EmptyState } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';
import { formatPrice } from '@/shared/lib/format';
import { Pin, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

export const metadata: Metadata = { title: 'Админка · Услуги', robots: { index: false } };

export default async function AdminServicesPage() {
  await requireRole('ADMIN');
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: { category: { select: { title: true } } },
  });

  return (
    <div>
      <AdminHeader
        title="Услуги"
        description="Каталог услуг: цены, категории, видимость, SEO."
        action={
          <Link href="/admin/services/new">
            <Button>Добавить услугу</Button>
          </Link>
        }
      />

      {services.length === 0 ? (
        <EmptyState>Услуг пока нет.</EmptyState>
      ) : (
        <Table head={['Название', 'Категория', 'Цена', 'Статус', 'Действия']}>
          {services.map((s) => (
            <Row key={s.id}>
              <Cell className="font-medium">
                {s.isPinned && <Pin size={12} className="mr-1 inline text-accent" />}
                {s.title}
              </Cell>
              <Cell className="text-ink-soft">{s.category.title}</Cell>
              <Cell className="tabular-nums">от {formatPrice(s.priceFrom)}</Cell>
              <Cell>
                {s.isHidden ? (
                  <span className="text-xs text-ink-faint">скрыта</span>
                ) : (
                  <span className="text-xs text-ok">видна</span>
                )}
              </Cell>
              <Cell>
                <div className="flex items-center gap-1">
                  <form action={toggleServicePinned}>
                    <input type="hidden" name="id" value={s.id} />
                    <IconBtn title={s.isPinned ? 'Открепить' : 'Закрепить'}>
                      <Pin size={15} className={s.isPinned ? 'text-accent' : ''} />
                    </IconBtn>
                  </form>
                  <form action={toggleServiceHidden}>
                    <input type="hidden" name="id" value={s.id} />
                    <IconBtn title={s.isHidden ? 'Показать' : 'Скрыть'}>
                      {s.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </IconBtn>
                  </form>
                  <Link href={`/admin/services/${s.id}`}>
                    <IconBtn title="Редактировать">
                      <Pencil size={15} />
                    </IconBtn>
                  </Link>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <IconBtn title="Удалить" danger>
                      <Trash2 size={15} />
                    </IconBtn>
                  </form>
                </div>
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}

function IconBtn({
  children,
  title,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="submit"
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-hair/25 text-ink-soft transition-colors hover:border-accent/50 hover:text-ink ${
        danger ? 'hover:border-risk/50 hover:text-risk' : ''
      }`}
    >
      {children}
    </button>
  );
}
