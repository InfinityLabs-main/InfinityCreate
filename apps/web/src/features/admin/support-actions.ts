'use server';

import { revalidatePath } from 'next/cache';
import { prisma, type TicketStatus } from '@nebula/db';
import { requireRole } from '@/shared/auth/session';
import { writeAudit } from './audit';

// Назначить обращение на себя.
export async function assignTicketToMe(formData: FormData): Promise<void> {
  const user = await requireRole('MANAGER');
  const ticketId = String(formData.get('ticketId') ?? '');
  if (!ticketId) return;
  await prisma.ticket.update({ where: { id: ticketId }, data: { assigneeId: user.id } });
  await writeAudit({ actorId: user.id, action: 'ticket.assign', target: `Ticket:${ticketId}` });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath('/admin/support');
}

// Сменить статус обращения (OPEN | PENDING | CLOSED).
export async function setTicketStatus(formData: FormData): Promise<void> {
  const user = await requireRole('MANAGER');
  const ticketId = String(formData.get('ticketId') ?? '');
  const status = String(formData.get('status') ?? '') as TicketStatus;
  if (!ticketId || !['OPEN', 'PENDING', 'CLOSED'].includes(status)) return;
  await prisma.ticket.update({ where: { id: ticketId }, data: { status } });
  await writeAudit({
    actorId: user.id,
    action: 'ticket.status',
    target: `Ticket:${ticketId}`,
    meta: { status },
  });
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath('/admin/support');
}
