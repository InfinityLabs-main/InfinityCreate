# Nebula — Runbook (эксплуатация и запуск)

Оперативный документ: как развернуть, обновить, забэкапить и продиагностировать
платформу. Локальная разработка описана в корневом `README.md`.

---

## 1. Production-развёртывание (VPS + Docker)

Требуется: Linux-VPS с Docker и Docker Compose, домен, открытые порты 80/443.

```bash
git clone <repo> nebula && cd nebula

# 1. Окружение
cp .env.example .env
#    Обязательно заполнить:
#    - AUTH_SECRET      (openssl rand -base64 32)
#    - POSTGRES_PASSWORD, MINIO_ROOT_PASSWORD (сильные пароли)
#    - APP_URL          (https://ваш-домен)
#    - PAYMENT_PROVIDER=yookassa + YOOKASSA_SHOP_ID/SECRET_KEY (или mock)
#    - SMTP_*           (для писем; опционально)

# 2. Сборка и запуск всего стека
docker compose -f infra/docker-compose.yml up -d --build

# 3. Применить схему БД (первый раз)
docker compose -f infra/docker-compose.yml exec web \
  node -e "require('child_process').execSync('npx prisma db push', {stdio:'inherit'})" \
  || echo "примените db push с хоста, см. ниже"

# 4. (Опционально) начальные данные
#    Сид рассчитан на dev; в проде наполняйте через админку.
```

> **Схема в проде.** Образ web не содержит Prisma CLI в рантайме. Проще всего
> применить миграции с CI/хоста, указав `DATABASE_URL` на боевую БД:
> `pnpm --filter @nebula/db migrate:deploy`. Для версионных миграций используйте
> `prisma migrate` вместо `db push`.

### TLS

`infra/nginx.conf` слушает 80. Для HTTPS:
1. Поставьте сертификат (Let's Encrypt / certbot или reverse-proxy типа Caddy/Traefik).
2. Раскомментируйте `Strict-Transport-Security` в `nginx.conf`.
3. `APP_URL` и `AUTH_URL` — на `https://`.

---

## 2. Компоненты и порты

| Сервис | Порт | Роль |
|--------|------|------|
| nginx | 80 | reverse-proxy, TLS, сжатие, rate-limit, security-заголовки |
| web (Next.js) | 3000 (internal) | витрина, кабинет, админка, API |
| realtime (Socket.IO) | 4000 (internal) | чат, typing, read-receipts |
| postgres | 5432 | БД |
| redis | 6379 | кеш, rate-limit, pub/sub realtime |
| minio | 9000/9001 | S3-хранилище (вложения, медиа) |

Внешне открыт только nginx (80/443). Остальное — внутри Docker-сети.

---

## 3. Обновление (деплой новой версии)

```bash
git pull
docker compose -f infra/docker-compose.yml up -d --build web realtime
# при изменении схемы:
pnpm --filter @nebula/db migrate:deploy   # с хоста/CI на боевую БД
```

Nginx и БД перезапускать не нужно. Простой минимален (web пересобирается,
старый контейнер работает до готовности нового при `--build`).

---

## 4. Бэкапы

### PostgreSQL (ежедневно, cron)

```bash
# Дамп
docker compose -f infra/docker-compose.yml exec -T postgres \
  pg_dump -U nebula nebula | gzip > backup-$(date +%F).sql.gz

# Восстановление
gunzip -c backup-2026-07-16.sql.gz | \
  docker compose -f infra/docker-compose.yml exec -T postgres psql -U nebula -d nebula
```

Проверяйте восстановление на тестовой БД регулярно — бэкап без проверенного
restore не бэкап.

### MinIO (вложения)

Том `infra/.data/minio` — включите в файловый бэкап VPS, либо настройте
`mc mirror` на внешний S3.

---

## 5. Безопасность (что уже реализовано)

- **Пароли** — Argon2id. **2FA (TOTP)** для админа: `/admin/security`.
- **Rate limiting** (Redis, fail-open): login, регистрация, сброс пароля,
  сообщения, загрузки, лиды. Лимиты — `shared/security/rate-limit.ts`.
- **RBAC** на двух рубежах: middleware (сегменты) + `requireRole` в use-case.
- **Security-заголовки + CSP** — `next.config.mjs` (`headers()`), плюс nginx.
- **Загрузка файлов** — whitelist MIME, лимит 15 МБ, ренейм (анти-traversal),
  приватный бакет, presigned URL с TTL.
- **Вебхуки платежей** — верификация подписи/перепроверкой (провайдер), идемпотентность.
- **Аудит** — все админ-мутации в `AuditLog` (append-only).
- **SQLi** — только параметризованные запросы Prisma. **XSS** — экранирование React.

### Ротация секретов

При компрометации `AUTH_SECRET`: сгенерировать новый → перезапустить web.
Все сессии инвалидируются (JWT перестают верифицироваться) — пользователи
залогинятся заново.

---

## 6. Диагностика

```bash
# Логи
docker compose -f infra/docker-compose.yml logs -f web
docker compose -f infra/docker-compose.yml logs -f realtime

# Здоровье realtime
curl http://localhost:4000/health   # {"status":"ok"}

# Состояние контейнеров
docker compose -f infra/docker-compose.yml ps
```

| Симптом | Проверить |
|---------|-----------|
| 500 на страницах кабинета | `DATABASE_URL`, здоров ли postgres |
| Логин → `error=Configuration` | postgres недоступен (Prisma init) |
| Чат не подключается | realtime запущен? `AUTH_SECRET` одинаковый у web и realtime? WS проксируется nginx? |
| Загрузки падают | бакет `nebula-media` создан в MinIO? `S3_*` заданы? |
| Оплата не подтверждается | вебхук провайдера указывает на `APP_URL/api/webhooks/payment`? |
| Rate-limit не срабатывает | redis доступен? (при недоступности — fail-open, лимит не применяется) |

---

## 7. Что осталось за рамками (follow-up)

Реализуемо, но требует внешних сервисов/решений заказчика:

- **Онлайн-касса 54-ФЗ** (чеки) — на стороне провайдера/оператора фискализации.
- **Sentry** — добавить DSN и `@sentry/nextjs` (переменная `SENTRY_DSN` уже заложена).
- **Полная refresh-ротация** с БД-сессиями (сейчас — скользящий JWT 7 дней;
  модель `RefreshToken` готова под будущую реализацию).
- **CDN** — иммутабельные ассеты Next готовы к раздаче через CDN.
- **Автоскейл realtime** — Redis-adapter заложен; при росте включить sticky-сессии в nginx.
