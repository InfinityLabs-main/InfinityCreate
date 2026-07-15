# Nebula

Платформа продажи цифровых услуг под ключ: витрина, кабинет клиента, онлайн-чат, приём оплат и админ-CMS с конструктором главной страницы.

Стек: **Next.js 15 · TypeScript · Prisma · PostgreSQL · Redis · MinIO · Socket.IO · Docker · Nginx**.

> Это результат **Спринта 0** — фундамент. Границы модулей, схема данных, auth+RBAC, дизайн-система и инфраструктура. Витрина, кабинет, чат, платежи и CMS наполняются в следующих спринтах (см. `roadmap`).

---

## Структура

```
apps/
  web/        Next.js: витрина (marketing), кабинет (account), админ (admin)
  realtime/   Socket.IO-сервис (чат, typing, read-receipts)
packages/
  db/         Prisma schema + client + seed
infra/        docker-compose, Nginx, Dockerfile.web, Dockerfile.realtime
```

Внутри `apps/web/src`:

- `app/` — маршруты (route groups: `(marketing)`, `(account)`, `(admin)`)
- `features/` — фичи (feature-sliced): `cms-builder` уже здесь
- `shared/` — `ui`, `lib`, `config` (Zod-env), `auth`, `rbac`

---

## Быстрый старт (локально)

Требуется **Node 20+**, **pnpm 9+**, **Docker**.

```bash
# 1. окружение
cp .env.example .env
#   сгенерируйте секрет:  openssl rand -base64 32  →  AUTH_SECRET
#   Prisma и Next читают .env из своей директории, поэтому продублируйте:
cp .env apps/web/.env
cp .env packages/db/.env
#   (все три .env в .gitignore — секрет не попадёт в репозиторий)

# 2. зависимости
pnpm install

# 3. поднять инфраструктуру (Postgres, Redis, MinIO)
docker compose -f infra/docker-compose.yml up -d postgres redis minio

# 4. схема БД + демо-данные
pnpm db:push       # или db:migrate для версионных миграций
pnpm db:seed

# 5. приложение и realtime (в двух терминалах)
pnpm dev           # http://localhost:3000
pnpm dev:realtime  # http://localhost:4000
```

> **Windows без Docker-инфраструктуры в PATH:** убедитесь, что `pnpm` и
> `docker` доступны в оболочке. Docker Desktop требует WSL2 — при первом
> запуске может понадобиться `wsl --shutdown` и перезапуск Docker Desktop.

### Демо-доступы (после `db:seed`)

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | `admin@nebula.local` | `Admin123!` |
| Manager | `manager@nebula.local` | `Manager123!` |
| Client | `client@nebula.local` | `Client123!` |

---

## Полный стек в Docker (как на VPS)

```bash
docker compose -f infra/docker-compose.yml up -d --build
# сайт через Nginx → http://localhost
```

После первого запуска примените схему и сид внутри сети compose:

```bash
docker compose -f infra/docker-compose.yml exec web sh -lc "cd /app && node -e 'require(\"child_process\")'"
# либо выполните db:push/db:seed с хоста, указав DATABASE_URL на localhost
```

---

## Скрипты

| Команда | Действие |
|---------|----------|
| `pnpm dev` | Next.js dev-сервер |
| `pnpm dev:realtime` | Socket.IO dev-сервер |
| `pnpm build` | production-сборка web |
| `pnpm typecheck` | проверка типов во всех пакетах |
| `pnpm db:push` | синхронизировать схему без миграций (dev) |
| `pnpm db:migrate` | создать/применить миграцию |
| `pnpm db:seed` | наполнить демо-данными |
| `pnpm db:studio` | Prisma Studio |
| `pnpm docker:up` | поднять всё в Docker |

---

## Что уже работает

- ✅ Monorepo (pnpm workspaces), строгий TS, единая Zod-валидация окружения
- ✅ Полная Prisma-схема (User/Service/Order/Ticket/Message/Payment/PageBlock/AuditLog…)
- ✅ Auth.js (Credentials + Argon2id), JWT-сессия, роль в клейме
- ✅ RBAC на двух рубежах: middleware (сегменты) + политики действий
- ✅ Дизайн-система: violet-blue токены, light/dark, glass-панели
- ✅ Главная из блоков (конструктор) + рендерер реестра блоков
- ✅ SEO-каркас: динамические `robots.txt` и `sitemap.xml`
- ✅ Realtime-сервис (комнаты тикетов, typing, read-receipt) + Redis-adapter
- ✅ Docker Compose + Nginx (сжатие, rate-limit, security-заголовки, WS-проксирование)

## Дальше (Спринт 1+)

Витрина (каталог, карточка услуги, портфолио, кейсы, блог, отзывы, контакты) →
кабинет и заказы → платежи (ЮKassa + абстракция) → полноценный чат → админ-CMS и конструктор → харденинг и запуск.
