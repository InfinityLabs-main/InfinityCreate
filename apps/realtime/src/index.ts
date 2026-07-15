import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { Server, type Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { jwtVerify } from 'jose';
import { prisma } from '@nebula/db';

// Загружаем .env (локально tsx его не подхватывает). Ищем в пакете и в корне
// монорепо. В Docker переменные приходят из окружения — файла не будет, это ок.
for (const p of ['.env', '../../.env']) {
  if (existsSync(p)) {
    try {
      process.loadEnvFile(p);
      break;
    } catch {
      /* Node < 20.12 — переменные должны прийти из окружения */
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Realtime-сервис Nebula (Socket.IO).
// Отдельный процесс: долгоживущие сокеты не занимают воркеры SSR.
// Presence/комнаты — в Redis → горизонтальное масштабирование (redis-adapter).
//
// Аутентификация: web-приложение выдаёт короткий HS256-JWT (mintSocketToken)
// с тем же AUTH_SECRET. Realtime его верифицирует. Персист сообщений — в web;
// realtime только ретранслирует и проверяет доступ к комнате.
// ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.REALTIME_PORT ?? 4000);
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? '');

interface SocketUser {
  id: string;
  role: 'CLIENT' | 'MANAGER' | 'ADMIN';
}

// Расширяем сокет данными пользователя после аутентификации.
type AuthedSocket = Socket & { data: { user: SocketUser } };

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'realtime' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: APP_URL, credentials: true },
  path: '/socket.io',
});

// Redis-adapter — pub/sub между инстансами.
try {
  const pub = new Redis(REDIS_URL);
  const sub = pub.duplicate();
  io.adapter(createAdapter(pub, sub));
  console.log('✓ Redis adapter подключён');
} catch (e) {
  console.warn('⚠ Redis недоступен — работаем в single-node режиме', e);
}

// Аутентификация рукопожатия: токен из auth.token.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('no token'));
    const { payload } = await jwtVerify(token, SECRET);
    const user: SocketUser = {
      id: String(payload.sub),
      role: (payload.role as SocketUser['role']) ?? 'CLIENT',
    };
    (socket as AuthedSocket).data.user = user;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

// Проверка доступа к комнате тикета: клиент — только к своим тикетам,
// менеджер/админ — к любым.
async function canJoinTicket(user: SocketUser, ticketId: string): Promise<boolean> {
  if (user.role !== 'CLIENT') return true;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { clientId: true },
  });
  return !!ticket && ticket.clientId === user.id;
}

io.on('connection', (rawSocket) => {
  const socket = rawSocket as AuthedSocket;
  const user = socket.data.user;

  socket.on('ticket:join', async (ticketId: string, ack?: (ok: boolean) => void) => {
    if (typeof ticketId !== 'string') return ack?.(false);
    const allowed = await canJoinTicket(user, ticketId);
    if (!allowed) return ack?.(false);
    socket.join(`ticket:${ticketId}`);
    ack?.(true);
  });

  // Ретрансляция нового сообщения (персист уже сделан web-приложением).
  socket.on('message:new', (payload: { ticketId: string }) => {
    if (!payload?.ticketId) return;
    socket.to(`ticket:${payload.ticketId}`).emit('message:new', payload);
  });

  // «Печатает…» — только другим в комнате.
  socket.on('typing', (payload: { ticketId: string }) => {
    if (!payload?.ticketId) return;
    socket.to(`ticket:${payload.ticketId}`).emit('typing', {
      ticketId: payload.ticketId,
      userId: user.id,
    });
  });

  // Статус прочтения.
  socket.on('message:read', (payload: { ticketId: string }) => {
    if (!payload?.ticketId) return;
    socket.to(`ticket:${payload.ticketId}`).emit('message:read', {
      ticketId: payload.ticketId,
      userId: user.id,
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🔌 Realtime-сервис слушает :${PORT}`);
});
