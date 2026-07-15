import { z } from 'zod';

// Единая Zod-валидация окружения. Fail-fast при старте, если что-то не так.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('Nebula'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET обязателен (openssl rand -base64 32)'),
  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().default(1_209_600),

  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  PAYMENT_PROVIDER: z.enum(['mock', 'yookassa', 'crypto', 'invoice']).default('mock'),
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),

  NEXT_PUBLIC_REALTIME_URL: z.string().url().default('http://localhost:4000'),
});

// В браузер попадают только NEXT_PUBLIC_*; серверные поля читаем лениво.
function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Некорректное окружение:', parsed.error.flatten().fieldErrors);
    throw new Error('Проверьте переменные окружения (.env).');
  }
  return parsed.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
