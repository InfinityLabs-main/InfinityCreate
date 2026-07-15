'use server';

import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { prisma } from '@nebula/db';
import { requireUser } from '@/shared/auth/session';
import { s3, S3_BUCKET } from '@/infra/storage/s3';

// Безопасная загрузка: whitelist MIME, лимит размера, ренейм, приватный бакет.
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'text/plain',
]);
const MAX_SIZE = 15 * 1024 * 1024; // 15 МБ

const presignSchema = z.object({
  mime: z.string().refine((m) => ALLOWED_MIME.has(m), 'Недопустимый тип файла'),
  size: z.number().int().positive().max(MAX_SIZE, 'Файл больше 15 МБ'),
});

export type PresignResult =
  | { ok: true; key: string; uploadUrl: string }
  | { ok: false; error: string };

// Выдаёт presigned PUT URL и создаёт pending-Media (привяжется при отправке).
export async function presignUpload(input: {
  mime: string;
  size: number;
}): Promise<PresignResult> {
  const user = await requireUser();
  const parsed = presignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Некорректный файл.' };
  }

  // Ключ не содержит пользовательского имени — исключаем path-traversal.
  const key = `chat/${user.id}/${randomUUID()}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: parsed.data.mime,
      ContentLength: parsed.data.size,
    }),
    { expiresIn: 120 },
  );

  // Media создаётся заранее, чтобы sendMessage мог connect по key.
  await prisma.media.create({
    data: { key, mime: parsed.data.mime, size: parsed.data.size },
  });

  return { ok: true, key, uploadUrl };
}
