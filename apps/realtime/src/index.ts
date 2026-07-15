import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

// ─────────────────────────────────────────────────────────────
// Realtime-сервис Nebula (Socket.IO).
// Отдельный процесс: долгоживущие сокеты не занимают воркеры SSR.
// Состояние (presence, комнаты) — в Redis → горизонтальное масштабирование
// через redis-adapter. Аутентификация — по тому же JWT, что и HTTP.
//
// Это скелет Спринта 0: комнаты тикетов, typing, read-receipt.
// Полная логика (вложения через S3, офлайн-уведомления) — Спринт 4.
// ─────────────────────────────────────────────────────────────

const PORT = Number(process.env.REALTIME_PORT ?? 4000);
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

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

// TODO(Спринт 4): верификация JWT из httpOnly cookie в io.use(...).
io.on('connection', (socket) => {
  // Подписка на комнату тикета.
  socket.on('ticket:join', (ticketId: string) => {
    socket.join(`ticket:${ticketId}`);
  });

  // Новое сообщение → в комнату (персист в БД делает web-приложение).
  socket.on('message:send', (payload: { ticketId: string; body: string }) => {
    io.to(`ticket:${payload.ticketId}`).emit('message:new', payload);
  });

  // Индикатор «печатает…».
  socket.on('typing', (payload: { ticketId: string; userId: string }) => {
    socket.to(`ticket:${payload.ticketId}`).emit('typing', payload);
  });

  // Статус прочтения.
  socket.on('message:read', (payload: { ticketId: string; messageId: string }) => {
    io.to(`ticket:${payload.ticketId}`).emit('message:read', payload);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🔌 Realtime-сервис слушает :${PORT}`);
});
