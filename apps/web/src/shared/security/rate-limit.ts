import { redis } from '@/infra/redis/client';

// Фиксированное окно на Redis: INCR + EXPIRE при первом хите.
// Fail-open: если Redis недоступен — пропускаем (не блокируем бизнес).
// Для критичных путей (оплата) можно ужесточить до fail-closed отдельно.

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number };

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }
    if (count > limit) {
      const ttl = await redis.ttl(redisKey);
      return { ok: false, remaining: 0, retryAfter: ttl > 0 ? ttl : windowSec };
    }
    return { ok: true, remaining: Math.max(0, limit - count), retryAfter: 0 };
  } catch {
    // Redis недоступен — не блокируем запрос.
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}

// Преднастроенные лимиты для разных действий.
export const LIMITS = {
  login: { limit: 10, windowSec: 300 }, // 10 попыток / 5 мин
  register: { limit: 5, windowSec: 3600 }, // 5 / час
  passwordReset: { limit: 5, windowSec: 3600 },
  message: { limit: 30, windowSec: 60 }, // 30 сообщений / мин
  upload: { limit: 20, windowSec: 300 },
  lead: { limit: 5, windowSec: 3600 },
  twoFA: { limit: 10, windowSec: 300 },
} as const;
