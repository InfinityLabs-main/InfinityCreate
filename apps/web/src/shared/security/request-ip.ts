import { headers } from 'next/headers';

// IP клиента из заголовков прокси (Nginx выставляет X-Forwarded-For /
// X-Real-IP). Берём первый адрес из XFF. Фолбэк — "unknown".
export async function getRequestIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? 'unknown';
}
