import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@nebula/db';
import { auth } from '@/shared/auth/auth';
import { s3, S3_BUCKET } from '@/infra/storage/s3';

export const runtime = 'nodejs';

// Выдаёт короткий presigned GET и редиректит на него. Приватный бакет:
// прямого публичного доступа нет. Проверяем, что запрашивающий имеет право
// на вложение (владелец тикета или сотрудник).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // key приходит url-encoded (содержит слэши).
  const { key: raw } = await params;
  const key = decodeURIComponent(raw);

  const media = await prisma.media.findUnique({
    where: { key },
    include: { message: { include: { ticket: { select: { clientId: true } } } } },
  });
  if (!media) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Доступ: сотрудник — всегда; клиент — только к вложению своего тикета.
  const isStaff = session.user.role !== 'CLIENT';
  const isOwner = media.message?.ticket?.clientId === session.user.id;
  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn: 120 },
  );

  return NextResponse.redirect(url);
}
