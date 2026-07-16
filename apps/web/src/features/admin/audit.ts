import { prisma } from '@nebula/db';

// Единый хелпер журналирования админ-действий (append-only AuditLog).
// Вызывается из каждой мутации админки: кто, что, над чем.
export async function writeAudit(input: {
  actorId: string;
  action: string; // "service.update", "order.status", ...
  target: string; // "Service:cuid"
  meta?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      target: input.target,
      meta: (input.meta ?? {}) as object,
    },
  });
}
