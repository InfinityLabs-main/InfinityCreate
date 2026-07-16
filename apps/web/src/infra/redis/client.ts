import { Redis } from 'ioredis';

// Единый Redis-клиент. В dev переиспользуем через globalThis, чтобы
// hot-reload не плодил соединения. lazyConnect + отсутствие ретраев в
// bootstrap — чтобы недоступность Redis не роняла запрос (fail-open).
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Подключаемся лениво; ошибки логируем, но не пробрасываем в bootstrap.
redis.on('error', (e) => {
  // Точечно, без спама: только первое сообщение важно.
  if ((redis as unknown as { _loggedErr?: boolean })._loggedErr) return;
  (redis as unknown as { _loggedErr?: boolean })._loggedErr = true;
  console.warn('⚠ Redis error (rate-limit degrade to fail-open):', e.message);
});
