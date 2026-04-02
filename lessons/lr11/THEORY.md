# LR11 + quiz-backend: теория и практика (что сделано, термины, Docker, команды)

Документ описывает **проект `lessons/lr8/quiz-backend`**: что реализовано по лабораторным (LR8–11), **словарь терминов**, **структуру файлов**, **роль Docker**, **все основные команды** для проверки и сдачи.

---

## 1. Что мы сделали по лабораторным (кратко)

| Этап | Суть |
|------|------|
| **LR8** | Backend на Hono + Prisma + SQLite/PostgreSQL: пользователи, сессии квиза, ответы, админка, подсчёт баллов. |
| **LR9** | Согласование API с **OpenAPI LR5** (`User`, `SessionResponse`, ответы, итоги), JWT, `questionIds`, mappers, `verify:integration`. |
| **LR10** | **Vitest**: unit + feature тесты, Zod, coverage; `app.ts` отдельно от `index.ts` для тестов без порта. |
| **LR11** | **Docker**: multi-stage `Dockerfile`, **Docker Compose** (backend + Postgres), скрипты healthcheck / local-release / rollback, **GitHub Actions** CI, порт **3000** в compose, **seed** БД для проверок. |

Итог: воспроизводимый backend, который можно запускать локально, в контейнерах и проверять тестами и скриптами.

---

## 2. Словарь терминов

### Общие

| Термин | Простыми словами |
|--------|------------------|
| **Backend** | Серверная программа: принимает HTTP-запросы, работает с БД, отдаёт JSON. |
| **API** | Набор URL и правил: что отправить в теле запроса и что получить в ответе. |
| **OpenAPI / схема** | Формальное описание API (YAML), по которому фронт и бэкенд договариваются о полях (`User`, `SessionResponse` и т.д.). |
| **JWT (JSON Web Token)** | Подписанный токен «кто ты»: после логина клиент шлёт `Authorization: Bearer …`, сервер проверяет подпись и узнаёт `userId`. |
| **Middleware** | Слой «до роута»: например проверка JWT (`auth.ts`) или роль админа (`admin.ts`). |
| **Zod** | Библиотека проверки JSON-тел запросов в рантайме (схемы в `validation.ts`). |
| **Prisma** | ORM: типобезопасные запросы к БД, миграции, `schema.prisma`. |
| **Миграция** | Файл с изменением схемы БД (таблицы, поля), применяется командой Prisma. |

### Тестирование (LR10)

| Термин | Простыми словами |
|--------|------------------|
| **Unit-тест** | Проверка одной функции/модуля изолированно; Prisma часто **мокается**. |
| **Feature-тест** | Проверка цепочки HTTP: реальный `app`, реальная тестовая БД, `app.request(...)`. |
| **Coverage (покрытие)** | Отчёт: какие строки/ветки кода хотя бы раз выполнялись тестами. |
| **Vitest** | Раннер тестов для TypeScript, похож на Jest. |

### Docker и DevOps (LR11)

| Термин | Простыми словами |
|--------|------------------|
| **Docker** | Платформа: упаковываем приложение и зависимости в **образ** и запускаем в **контейнере** — одинаково на разных ПК. |
| **Image (образ)** | Снимок файловой системы + метаданные (команда запуска). Собирается из `Dockerfile` (`docker build`). |
| **Container (контейнер)** | Запущенный экземпляр образа: изолированный процесс с портами и переменными окружения. |
| **Dockerfile** | Рецепт сборки образа: базовый Node, `npm ci`, `prisma generate`, `npm run build`, `CMD` запуска. |
| **Multi-stage build** | Стадия **builder** (сборка, devDependencies) и стадия **runner** (только production-файлы) — меньший размер образа. |
| **Docker Compose** | Файл `docker-compose.yml`: несколько сервисов (например **db** + **backend**), сеть, тома, `depends_on`, healthcheck. |
| **Volume** | Постоянное хранилище данных для контейнера (например файлы Postgres). |
| **Healthcheck** | Проверка «сервис жив»: в compose для Postgres — `pg_isready`, backend ждёт healthy БД. |
| **CI (Continuous Integration)** | Автоматический прогон при push/PR: lint, test, build, иногда `docker build`. |
| **GitHub Actions** | CI на серверах GitHub: workflow в `.github/workflows/*.yml`. |
| **Smoke-check** | Короткая проверка после деплоя: `/health`, иногда один защищённый endpoint. |

---

## 3. Зачем Docker в этом проекте

1. **Одинаковое окружение** — Node 22, системные библиотеки (OpenSSL для Prisma), не «у меня работает, у преподавателя нет».  
2. **Postgres рядом с backend** — в compose поднимается БД с теми же параметрами, что ожидает `DATABASE_URL` через имя сервиса `db`.  
3. **Похоже на прод** — отдельный процесс сервера, переменные из `.env`, миграции при старте.  
4. **LR11** — учебная цель: научиться собирать образ, поднимать стек, смотреть логи, не привязываясь к облачному деплою.

**Локальный `npm run dev`** остаётся для разработки (быстрый перезапуск, отладка). **Docker** — для проверки «как в контейнере» и для сценариев compose/CI.

---

## 4. Как мы используем Docker в `quiz-backend`

| Файл | Назначение |
|------|------------|
| `Dockerfile` | Сборка образа: `npm ci --ignore-scripts` → копирование исходников → `DATABASE_URL` заглушка для `prisma generate` → `npm run build` → финальный runner с `node dist/index.js` и `prisma migrate deploy`. |
| `.dockerignore` | Исключает лишнее из контекста сборки (ускорение, меньше мусора). |
| `docker-compose.yml` | Сервис **db** (Postgres), сервис **backend** (образ из Dockerfile), `PORT=3000`, проброс `3000:3000`, `DATABASE_URL` на хост `db`. |
| `docker-compose.dev.yml` | Опционально для другого режима разработки (если есть в репо). |
| `scripts/healthcheck.*` | Проверка `/health` после поднятия стека. |
| `scripts/local-release.*` | Локальный «релиз»: сборка образа, `compose up`, smoke. |
| `scripts/rollback-local.*` | Откат на предыдущий тег образа локально. |

**Порты:** в контейнере задаётся **`PORT=3000`**, чтобы совпадало с `3000:3000`. Локально без Docker по умолчанию часто **3001** (`src/index.ts`).

---

## 5. Структура проекта `quiz-backend` (важное)

```text
quiz-backend/
├── Dockerfile                 # сборка образа backend
├── .dockerignore
├── docker-compose.yml         # backend + Postgres
├── docker-compose.dev.yml     # опционально
├── package.json               # скрипты: dev, test, build, docker:*, compose:*, db:seed, verify:integration
├── prisma.config.ts           # схема, миграции, seed-команда
├── prisma/
│   ├── schema.prisma          # модели User, Category, Question, Session, Answer
│   ├── migrations/            # история изменений БД
│   └── seed.ts                # демо-категория + вопрос для verify / пустой БД
├── scripts/
│   ├── verify-integration.mjs # цепочка как у фронта (OpenAPI LR5)
│   ├── healthcheck.ps1 / .sh
│   ├── local-release.ps1 / .sh
│   └── rollback-local.ps1 / .sh
├── src/
│   ├── index.ts               # только serve(); порт из PORT или 3001
│   ├── app.ts                 # Hono + CORS + маршруты (то же app в тестах)
│   ├── lib/prisma.ts          # PrismaClient + adapter PostgreSQL
│   ├── middleware/            # auth.ts, admin.ts
│   ├── routes/                # auth, sessions, admin + *.feature.test.ts
│   ├── services/              # sessionService, scoringService + *.unit.test.ts
│   └── utils/                 # validation, questionBank, sessionApiMappers, userApiMapper
├── tests/setup/               # Vitest: global-setup, test-db, test-app, test-database-url
├── vitest.config.ts
└── .env / .env.example        # не коммитить секреты; DATABASE_URL, JWT_SECRET, PORT
```

Корень репозитория курса: **`.github/workflows/quiz-backend-ci.yml`** — CI для этой папки.

---

## 6. Команды: разработка и база данных

Выполняй из папки `lessons/lr8/quiz-backend`:

| Команда | Назначение |
|---------|------------|
| `npm install` | Зависимости; после — `postinstall` → `prisma generate`. |
| `npx prisma generate` | Пересобрать клиент Prisma после смены схемы. |
| `npx prisma migrate deploy` | Применить миграции к БД из `DATABASE_URL`. |
| `npm run db:seed` или `npx prisma db seed` | Добавить демо-вопрос (если БД пустая — нужно для `verify:integration`). |
| `npm run dev` | Разработка: `tsx watch`, обычно порт **3001**. |
| `npm run prisma:studio` | GUI к таблицам БД. |

---

## 7. Команды: качество кода и тесты (LR10)

| Команда | Назначение |
|---------|------------|
| `npm run typecheck` | Проверка `tsc --noEmit`. |
| `npm run lint` | ESLint. |
| `npm test` | Все unit + feature тесты (нужен Postgres для `quiz_test` или как в `vitest.config`). |
| `npm run test:unit` | Только `*.unit.test.ts`. |
| `npm run test:feature` | Только `*.feature.test.ts`. |
| `npm run test:coverage` | Тесты + отчёт покрытия v8. |
| `npm run build` | Сборка `dist/` для production. |

---

## 8. Команды: интеграция с контрактом фронта (LR9)

| Команда | Условие |
|---------|---------|
| `npm run verify:integration` | В **другом** терминале уже запущен `npm run dev` (по умолчанию **http://localhost:3001**). |
| Если другой порт | PowerShell: `$env:BASE_URL="http://localhost:3000"; npm run verify:integration` |

Если ошибка про отсутствие вопросов — один раз: **`npx prisma db seed`** на ту же БД, что в `.env`.

---

## 9. Команды: Docker (LR11)

| Команда | Назначение |
|---------|------------|
| `docker build -t quiz-backend:local .` | Сборка образа вручную. |
| `npm run docker:build` | То же через npm-скрипт. |
| `docker compose up --build -d` | Собрать (если нужно) и поднять db + backend в фоне. |
| `docker compose ps` | Статус контейнеров. |
| `docker compose logs -f backend` | Логи backend. |
| `docker compose down` | Остановить и убрать контейнеры (тома БД можно сохранить или `down -v`). |
| `docker compose exec backend npx prisma db seed` | Сид в БД **внутри** compose (если пусто). |
| `npm run ci:local:win` | Скрипт локального «релиза» (Windows). |

Проверка:

```text
curl http://localhost:3000/health
```

(порт **3000** — для compose; при `npm run dev` на хосте — **3001**).

---

## 10. Полный чеклист «всё сделано правильно»

1. `npx prisma generate` — без ошибок.  
2. `npm run typecheck` — без ошибок.  
3. `npm run lint` — нет errors (warnings по `any` допустимы, если не требуют ноль предупреждений).  
4. `npm test` — все тесты зелёные.  
5. `npm run test:coverage` — отчёт строится.  
6. `npm run build` — успешно.  
7. `npx prisma db seed` — один раз при пустой БД `quiz`.  
8. `npm run dev` → `npm run verify:integration` — все шаги пройдены.  
9. `docker compose up -d` → `curl` на **3000**/health — `ok`.  
10. На GitHub: workflow **quiz-backend-ci** зелёный после push.  
11. При необходимости: `npm run ci:local:win` — локальный smoke.

---

## 11. Типичные проблемы

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `EADDRINUSE` порт 3001 | Старый `npm run dev` | Закрыть процесс или сменить `PORT`. |
| Prisma: sqlite vs pg | Старый сгенерированный клиент | `npx prisma generate`. |
| `verify:integration` 400 на сессии | Нет вопросов в БД | `npx prisma db seed`. |
| Docker `npm ci` без схемы | `postinstall` до копирования `prisma/` | В Dockerfile: `npm ci --ignore-scripts` + явный `prisma generate`. |
| Docker `DATABASE_URL` не задан при generate | `prisma.config.ts` | В builder задать заглушку `ENV DATABASE_URL=...`. |
| В контейнере порт 3001, снаружи 3000 | Не задан `PORT` | В `docker-compose` задать `PORT=3000`. |
| Сеть при `npm ci` в Docker | Нестабильный интернет | Повторить, DNS, `NPM_CONFIG_*` в Dockerfile. |

---

## 12. Связь с другими материалами курса

- LR10 теория и тесты: `lessons/lr10/THEORY.md`, `QUIZ-BACKEND-LR10.md`.  
- LR9 OpenAPI и фронт: `lessons/lr9/THEORY.md`, схема `lessons/lr5/quiz-api-schema.yaml`.  
- LR11 чекпоинты по курсу: `lessons/lr11/README.md`.

---

**Итог:** этот документ фиксирует **термины**, **структуру**, **роль Docker**, **все основные команды** и **порядок проверки** для сдачи лабораторной работы по backend и DevOps в рамках курса.
