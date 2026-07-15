'use server';

import { z } from 'zod';
import { prisma, Role } from '@nebula/db';

// Заявка с контактной страницы. Если email уже есть — привязываем к клиенту,
// иначе создаём «гостевого» клиента-заглушку (без пароля). Полноценная
// регистрация/вход — в кабинете; здесь задача — не потерять лид.
const leadSchema = z.object({
  name: z.string().min(2, 'Укажите имя').max(120),
  email: z.string().email('Некорректный email'),
  message: z.string().min(5, 'Опишите задачу').max(4000),
});

export type LeadState = { ok: boolean; error?: string };

export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const parsed = leadSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Проверьте поля формы.' };
  }

  const { name, email, message } = parsed.data;

  try {
    const client = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, role: Role.CLIENT },
    });

    await prisma.ticket.create({
      data: {
        subject: 'Заявка с сайта',
        clientId: client.id,
        status: 'OPEN',
        messages: { create: { authorId: client.id, body: message } },
      },
    });

    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось отправить заявку. Попробуйте позже.' };
  }
}
