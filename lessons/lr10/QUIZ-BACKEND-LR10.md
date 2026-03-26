# LR10: quiz-backend — теория, практика и запуск тестов

Проект с разобранной практикой лежит в репозитории: **`lessons/lr8/quiz-backend`**. Ниже — краткая теория, что именно там сделано по LR10, и как всё запускать.

---

## 1. Структура каталогов `quiz-backend`

Упрощённое дерево (без `node_modules`, сгенерированного `coverage/` и локальных БД):

```text
quiz-backend/
├── package.json              # скрипты npm, зависимости
├── tsconfig.json             # настройки TypeScript
├── prisma.config.ts          # конфиг Prisma CLI (схема, миграции, DATABASE_URL)
├── vitest.config.ts          # Vitest: тестовая БД, JWT, coverage, setup-файлы
├── .env                      # секреты и DATABASE_URL (не коммитится)
├── prisma/
│   ├── schema.prisma         # модели User, Category, Question, Session, Answer
│   ├── migrations/           # история миграций SQLite
│   └── test.db               # SQLite только для автотестов (часто в .gitignore)
├── src/
│   ├── index.ts              # точка входа процесса: поднять HTTP-сервер
│   ├── app.ts                  # собрать Hono: /health + /api/*
│   ├── lib/
│   │   └── prisma.ts           # singleton PrismaClient
│   ├── middleware/
│   │   └── admin.ts            # JWT + роль admin
│   ├── routes/
│   │   ├── auth.ts             # /api/auth — OAuth, /me
│   │   ├── sessions.ts         # /api/sessions — квиз
│   │   ├── admin.ts            # /api/admin — только админ
│   │   ├── *.feature.test.ts   # feature-тесты API
│   ├── services/
│   │   ├── scoringService.ts   # подсчёт баллов (без БД)
│   │   ├── sessionService.ts   # сессия квиза, ответы (Prisma)
│   │   ├── github.ts           # вспомогательный OAuth (опционально)
│   │   └── *.unit.test.ts
│   └── utils/
│       ├── validation.ts       # Zod-схемы
│       └── *.unit.test.ts
└── tests/
    └── setup/
        ├── global-setup.ts     # перед тестами: prisma migrate deploy → test.db
        ├── vitest-setup.ts     # после тестов: prisma.$disconnect()
        ├── test-db.ts          # сид данных и JWT для feature-тестов
        └── test-app.ts         # реэкспорт app из src/app.ts
```

---

## 2. Последовательность запуска приложения (прод: `npm run dev` / `npm start`)

Цепочка выполняется **один раз при старте процесса Node**, затем сервер ждёт HTTP-запросы.

1. **`package.json`** — `tsx` запускает **`src/index.ts`** (или `tsx watch` в dev).

2. **`src/index.ts`**
   - подключает **`dotenv/config`** — переменные из `.env` попадают в `process.env`;
   - импортирует **`app`** из **`src/app.ts`**;
   - вызывает **`serve({ fetch: app.fetch, port: 3000 })`** из `@hono/node-server` — привязывает обработчик запросов к порту.

3. При первом импорте **`src/app.ts`**
   - создаётся экземпляр **Hono**;
   - регистрируется **`GET /health`**;
   - **`app.route('/api/auth', authRoutes)`** и т.д. — подключаются модули из **`src/routes/*.ts`**.

4. При импорте роутов (например **`auth.ts`**, **`sessions.ts`**, **`admin.ts`**) **по цепочке подтягиваются**:
   - **`src/lib/prisma.ts`** — при первом обращении к модулю читается `DATABASE_URL`, создаётся **PrismaClient**;
   - в **`auth.ts`** при загрузке модуля проверяется **`JWT_SECRET`** — если нет, процесс упадёт сразу (fail-fast);
   - **`admin.ts`** вешает **`requireAdmin`** из **`middleware/admin.ts`** на все пути под `/api/admin`.

5. **Готовый сервер** слушает порт **3000**. Дальше каждый запрос обрабатывается **без перезапуска** этой цепочки: Hono выбирает маршрут → middleware (если есть) → handler → при необходимости **Prisma** и **сервисы**.

### Что происходит при одном HTTP-запросе (логически)

1. Запрос попадает в **`app.fetch`** (Hono).
2. Совпадает префикс: `/api/auth/*`, `/api/sessions/*`, `/api/admin/*` или `/health`.
3. Для **`/api/admin/*`** сначала выполняется **`requireAdmin`**: разбор Bearer → **verify JWT** → чтение пользователя из БД → проверка **`role === 'admin'`**.
4. В handler роута: разбор тела (**JSON**), **`Zod.safeParse`** из **`validation.ts`**, вызовы **Prisma** и/или **`sessionService`** / **`scoringService`**, ответ **`c.json(...)`** с нужным статусом.

### Запуск тестов (`npm run test`) — отдельная цепочка

1. Читает **`vitest.config.ts`**: тестовые **`DATABASE_URL`**, **`JWT_SECRET`**, список файлов `*.unit.test.ts` / `*.feature.test.ts`.
2. **`global-setup.ts`** — миграции на **`prisma/test.db`**.
3. Загружаются тестовые модули: unit мокают Prisma; feature импортируют **`app`** и вызывают **`resetAndSeed()`** в **`beforeAll`**.
4. После всех тестов — **`vitest-setup.ts`** отключает Prisma.

Приложение **как HTTP-сервер в тестах не поднимается** — используется тот же **`app`**, но запросы идут через **`app.request()`** без порта.

---

## 3. Справочник: какой файл за что отвечает

| Файл | Роль |
|------|------|
| **`package.json`** | Скрипты (`dev`, `start`, `test`, Prisma), список пакетов. |
| **`tsconfig.json`** | Компиляция TypeScript (в т.ч. тесты и `vitest.config.ts`). |
| **`prisma.config.ts`** | Где схема Prisma и миграции; откуда брать `DATABASE_URL` для CLI. |
| **`prisma/schema.prisma`** | Модели БД: пользователи, категории, вопросы, сессии, ответы. |
| **`prisma/migrations/**`** | SQL-миграции; `migrate deploy` применяет их к файлу БД. |
| **`src/index.ts`** | Единственная точка входа **процесса сервера**: `serve` + порт 3000. |
| **`src/app.ts`** | Сборка **Hono**: маршруты `/health`, `/api/auth`, `/api/sessions`, `/api/admin`. |
| **`src/lib/prisma.ts`** | Один **PrismaClient** на SQLite через адаптер **better-sqlite3**. |
| **`src/middleware/admin.ts`** | Проверка JWT и роли **admin** для `/api/admin`. |
| **`src/routes/auth.ts`** | GitHub callback (или `test_*` код), выдача JWT, **`GET /me`**. |
| **`src/routes/sessions.ts`** | Создание сессии, ответы, завершение; вызывает **`sessionService`**. |
| **`src/routes/admin.ts`** | Админские CRUD вопросов, оценка эссе, статистика. |
| **`src/services/scoringService.ts`** | Чистая математика баллов (multiple-select, эссе по рубрике). |
| **`src/services/sessionService.ts`** | Транзакции Prisma: ответ на вопрос, завершение сессии, **`ServiceError`**. |
| **`src/services/github.ts`** | Отдельная обёртка OAuth (при необходимости; основной поток — в `auth.ts`). |
| **`src/utils/validation.ts`** | **Zod**-схемы тел запросов для всех роутов. |
| **`vitest.config.ts`** | Режим тестов, env, coverage, какие файлы считать тестами. |
| **`tests/setup/global-setup.ts`** | Перед тестами: применить миграции к **test.db**. |
| **`tests/setup/vitest-setup.ts`** | После тестов: отключить Prisma. |
| **`tests/setup/test-db.ts`** | Очистка и сид БД + JWT для feature-тестов. |
| **`tests/setup/test-app.ts`** | Удобный импорт **`app`** в feature-тестах. |
| **`src/**/*.unit.test.ts`** | Unit: логика и Zod без реальной БД (где Prisma — мок). |
| **`src/**/*.feature.test.ts`** | Feature: полный HTTP-цикл через **`app.request`** и тестовую БД. |

---

## 4. Теория: зачем слои тестов

### Unit-тесты

- Проверяют **одну единицу логики** (функцию, класс, схему) **в изоляции**.
- Внешние зависимости **подменяются моками** (в нашем случае Prisma в unit-тестах сервисов — мок).
- Плюсы: быстро, стабильно, легко локализовать баг.
- В проекте: файлы `*.unit.test.ts` рядом с модулями (`scoringService`, `validation`, `sessionService`).

### Feature-тесты (интеграционные по API)

- Гоняют **реальное приложение Hono** без открытия порта: `app.request(...)` (или `testClient(app)`).
- **Prisma не мокается** — используется отдельная **тестовая БД** (`prisma/test.db`), данные сидятся в `beforeAll`.
- Плюсы: проверяются маршруты, middleware, валидация и ответы как у настоящего HTTP.

### Что не делаем в LR10

- Полноценный **E2E по сети** (отдельный процесс + реальный порт) — тема следующих шагов; для LR10 достаточно `app.request`.

---

## 5. Инструменты (коротко)

| Инструмент | Роль |
|------------|------|
| **Vitest** | Запуск тестов, watch-режим, coverage (v8). |
| **Hono** | `app` из `src/app.ts` — тот же объект, что и в проде, только без `serve` в тестах. |
| **Zod** | Схемы в `src/utils/validation.ts`; в тестах — успешные и неуспешные `safeParse`. |
| **Prisma** | В feature-тестах — настоящий клиент к SQLite-файлу для тестов. |
| **vi.mock / vi.fn** | Мок Prisma в unit-тестах `sessionService` без обращения к `mockDeep` внутри `vi.hoisted` с внешним импортом (иначе возможна ошибка инициализации модулей). |

---

## 6. Что сделано в `quiz-backend` (по чекпоинтам LR10)

### Инфраструктура

- **`src/app.ts`** — сборка маршрутов и `/health`; импортируется в тестах и в `index.ts`.
- **`src/index.ts`** — только запуск сервера на порту 3000.
- **`vitest.config.ts`** — переменные для тестов (`DATABASE_URL` → `prisma/test.db`, `JWT_SECRET`), `globalSetup`, `setupFiles`, `include` для `*.unit.test.ts` / `*.feature.test.ts`, coverage.
- **`tests/setup/global-setup.ts`** — `prisma migrate deploy` к тестовой БД перед прогоном.
- **`tests/setup/vitest-setup.ts`** — `prisma.$disconnect()` после всех тестов.
- **`tests/setup/test-db.ts`** — `resetAndSeed()`: чистка таблиц, пользователи (студент, второй студент, админ), категория, вопрос, JWT.
- **`tests/setup/test-app.ts`** — реэкспорт `app` для feature-тестов.

### Тесты

- **Unit:** `scoringService.unit.test.ts`, `validation.unit.test.ts`, `sessionService.unit.test.ts` (мок Prisma).
- **Feature:** `auth.feature.test.ts`, `sessions.feature.test.ts`, `admin.feature.test.ts` — сценарии API и проверки 401/403/400 где нужно.

В исходниках добавлены **файловые комментарии** в начале каждого модуля: что это за файл и зачем он нужен.

---

## 7. Как запустить тесты и сервер

Перейти в каталог backend:

```bash
cd lessons/lr8/quiz-backend
npm install
```

### Все автотесты (unit + feature)

```bash
npm run test
```

Ожидается: все файлы тестов прошли, в конце что-то вроде `Test Files N passed`, `Tests 42 passed` (число может меняться).

### Только unit или только feature

```bash
npm run test:unit
npm run test:feature
```

Скрипты перечисляют файлы явно — так надёжнее на Windows, чем одна glob-строка с фигурными скобками.

### Покрытие кода

```bash
npm run test:coverage
```

В консоли — таблица по файлам; при необходимости откройте сгенерированный HTML-отчёт coverage (папка обычно появляется в корне проекта после Vitest — см. вывод).

### Ручной smoke (не автотест)

1. Настройте `.env` в `quiz-backend` (`DATABASE_URL`, `JWT_SECRET`, при необходимости GitHub OAuth).
2. Запуск:

```bash
npm run dev
```

3. Проверьте `GET http://localhost:3000/health` и сценарии API (Postman/curl) — как в LR10 README.

---

## 8. Типичные проблемы

| Симптом | Причина | Что сделать |
|---------|---------|-------------|
| `Cannot access '__vi_import_0__' before initialization` в unit-тесте с Prisma | В `vi.hoisted` вызван импорт из другого пакета (например `mockDeep`) до завершения инициализации модулей | Использовать только `vi.fn()` внутри hoisted или не вызывать внешние импорты в hoisted-колбэке |
| `No test files found` при `npm run test` с фильтром | На Windows glob с `{unit,feature}` в кавычках ведёт себя иначе | Запускать `npm run test` без лишних аргументов или использовать скрипты из `package.json` |
| Падения feature-тестов из-за БД | Нет миграций / другой `DATABASE_URL` | Убедиться, что `globalSetup` отработал; для локали — удалить `prisma/test.db` и перезапустить тесты |

---

## 9. Где читать ещё

- Общие цели и чекпоинты LR10: [README.md](README.md) этого каталога.
- Лекция и шпаргалки: [docs/GUIDE.md](docs/GUIDE.md), [docs/CHEATSHEET.md](docs/CHEATSHEET.md), слайды в `docs/slides-standalone/`.
