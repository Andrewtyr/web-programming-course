# LR10: quiz-backend простыми словами



Проект: `lessons/lr8/quiz-backend`

---

## 1) Что это вообще за backend

`quiz-backend` - это сервер для квиза (теста), который:
- авторизует пользователя (через GitHub callback или test-код);
- создает сессии прохождения теста;
- принимает ответы;
- завершает сессию и считает баллы;
- дает админу отдельные endpoints для управления вопросами и проверки эссе.

Стек:
- `Hono` - web framework (маршруты и обработка запросов);
- `Prisma + SQLite` - работа с базой;
- `Zod` - проверка входящих данных;
- `Vitest` - unit/feature тесты и coverage.

---

## 2) Полная структура проекта и роль файлов

```text
quiz-backend/
├── package.json
├── tsconfig.json
├── prisma.config.ts
├── vitest.config.ts
├── scripts/
│   └── verify-integration.mjs     ← опционально: цепочка запросов как у фронта (LR9)
├── .env
├── prisma/
│   ├── schema.prisma              ← Session.questionIds и др.
│   ├── migrations/
│   └── test.db                    ← для Vitest (gitignore)
├── src/
│   ├── index.ts                   ← только serve; порт по умолчанию 3001
│   ├── app.ts                     ← Hono + CORS + маршруты (то же app в тестах)
│   ├── lib/
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── auth.ts                ← JWT для /api/sessions (LR9)
│   │   └── admin.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── sessions.ts
│   │   ├── admin.ts
│   │   ├── auth.feature.test.ts
│   │   ├── sessions.feature.test.ts
│   │   └── admin.feature.test.ts
│   ├── services/
│   │   ├── scoringService.ts
│   │   ├── sessionService.ts
│   │   ├── github.ts
│   │   ├── scoringService.unit.test.ts
│   │   └── sessionService.unit.test.ts
│   └── utils/
│       ├── validation.ts
│       ├── validation.unit.test.ts
│       ├── questionBank.ts        ← разбор correctAnswer (LR9)
│       ├── sessionApiMappers.ts   ← JSON под OpenAPI LR5
│       └── userApiMapper.ts
└── tests/
    └── setup/
        ├── global-setup.ts
        ├── vitest-setup.ts
        ├── test-db.ts
        └── test-app.ts
```

### Корневые файлы

- `package.json`  
  Скрипты запуска (`dev`, `test`, `test:coverage`) и зависимости.

- `tsconfig.json`  
  Настройки TypeScript.

- `prisma.config.ts`  
  Настройки Prisma CLI: где схема и миграции, откуда брать `DATABASE_URL`.

- `vitest.config.ts`  
  Настройка тестов: какие файлы запускать, тестовые env-переменные, coverage, setup.

- `.env`  
  Локальные переменные (`DATABASE_URL`, `JWT_SECRET`, OAuth ключи). Не коммитится.

### Папка `prisma`

- `schema.prisma`  
  Описание таблиц: `User`, `Category`, `Question`, `Session`, `Answer`.

- `migrations/*`  
  История изменений схемы БД.

- `test.db`  
  Отдельная SQLite-база для автотестов.

### Папка `src` (основной код backend)

- `index.ts`  
  Точка входа процесса. Поднимает HTTP-сервер (`serve`); порт из `PORT` или **3001** по умолчанию.

- `app.ts`  
  Собирает Hono-приложение: **CORS** (для фронта на другом порту), `/health`, `/api/auth`, `/api/sessions`, `/api/admin`. Тот же объект `app` используют feature-тесты.

- `lib/prisma.ts`  
  Создает и экспортирует единый клиент Prisma.

- `middleware/auth.ts`  
  Проверяет Bearer JWT для защищённых маршрутов (например `/api/sessions`), кладёт `userId` в контекст.

- `middleware/admin.ts`  
  Проверяет JWT и роль admin для админских маршрутов.

- `routes/auth.ts`  
  Логин/авторизация: GitHub callback, выдача JWT, `GET /api/auth/me`.

- `routes/sessions.ts`  
  Работа с сессиями квиза: создать, получить, отправить ответ, завершить.

- `routes/admin.ts`  
  Админка: вопросы, batch загрузка, оценка эссе, статистика.

- `services/scoringService.ts`  
  Чистая логика подсчета баллов.

- `services/sessionService.ts`  
  Бизнес-логика с Prisma (транзакции, проверки владельца сессии, статусы).

- `utils/validation.ts`  
  Zod-схемы для проверки payload.

- `utils/questionBank.ts`, `sessionApiMappers.ts`, `userApiMapper.ts`  
  Совместимость с OpenAPI LR5: разбор `correctAnswer`, форматы `SessionResponse` / `User`.

### Папка `tests/setup`

- `global-setup.ts`  
  Перед тестами применяет миграции к `prisma/test.db`.

- `vitest-setup.ts`  
  После тестов закрывает Prisma-подключение.

- `test-db.ts`  
  Сбрасывает тестовые данные и seed'ит минимальный набор (student/admin/question/token).

- `test-app.ts`  
  Реэкспорт `app` для feature-тестов.

---

## 3) Как приложение запускается по шагам

Когда ты запускаешь:

```bash
npm run dev
```

происходит цепочка:

1. `tsx watch src/index.ts` запускает `src/index.ts`.
2. `index.ts` импортирует `app` из `src/app.ts`.
3. `app.ts` подключает маршруты:
   - `authRoutes` (`/api/auth`)
   - `sessionsRoutes` (`/api/sessions`)
   - `adminRoutes` (`/api/admin`)
4. Каждый route-файл при необходимости использует:
   - `prisma` для БД
   - `validation` для проверки запроса
   - `sessionService/scoringService` для бизнес-логики
   - `requireAdmin` для защиты админских endpoint
5. `serve({ fetch: app.fetch, port })` начинает слушать порт (часто **3001**).
6. Любой HTTP-запрос проходит:
   `route match -> middleware -> validation -> service -> prisma -> json response`.

---

## 4) Что такое unit и feature тесты в этом проекте

### Unit (`*.unit.test.ts`)

Проверяют отдельную логику:
- `scoringService.unit.test.ts` - формулы подсчета;
- `validation.unit.test.ts` - схемы Zod;
- `sessionService.unit.test.ts` - ошибки сервиса при невалидных условиях.

Важно: в unit Prisma мокается (`vi.mock`, `vi.fn`), в БД не ходим.

### Feature (`*.feature.test.ts`)

Проверяют API-сценарии сквозняком через `app.request(...)`:
- auth flow;
- sessions flow;
- admin access/security.

Здесь Prisma не мокается, работает тестовая БД `prisma/test.db`.

### Какие тесты мы написали в LR10 и что каждый делает

Ниже список по файлам (это то, что мы сделали в этой работе).

#### Unit-тесты

- `src/services/scoringService.unit.test.ts`
  - Проверяет формулы подсчета баллов:
    - за multiple-select (плюс за правильный, штраф за лишний, минимум 0);
    - за эссе по рубрике (ограничение max, округление, ошибка при неверной длине rubric).
  - Зачем: гарантирует, что математика оценивания не "сломается" при правках.

- `src/utils/validation.unit.test.ts`
  - Проверяет Zod-схемы:
    - валидные payload проходят;
    - невалидные (пустые строки, неправильные типы, отрицательные значения и т.п.) отклоняются.
  - Зачем: API заранее отсекает плохие входные данные.

- `src/services/sessionService.unit.test.ts`
  - Проверяет негативные ветки бизнес-логики сервиса:
    - `Session not found` (404),
    - `Forbidden` (403),
    - `Session already completed` (400).
  - Prisma замокан через `vi.mock` + `vi.fn`.
  - Зачем: быстро и точно проверяем доменные ошибки без реальной БД.

#### Feature-тесты

- `src/routes/auth.feature.test.ts`
  - Проверяет `/api/auth/me`:
    - без токена -> 401,
    - невалидный токен -> 401,
    - валидный токен -> 200 и **плоский** объект User (OpenAPI LR5, не `{ user: { … } }`).
  - Проверяет `/api/auth/github/callback`:
    - плохой JSON -> 400,
    - невалидный `code` -> 400,
    - `test_*` code -> 200, токен + `user` с числовым `githubId` (сравнение через `githubIdToApiNumber` в тесте).
  - Зачем: подтверждает рабочий auth flow целиком.

- `src/routes/sessions.feature.test.ts`
  - Проверяет создание сессии:
    - без токена -> 401,
    - некорректный payload -> 400,
    - валидный запрос -> **201** + тело в форме **SessionResponse** (OpenAPI LR5: `sessionId`, `userId`, `totalQuestions`, …).
  - Проверяет доступ к `GET /api/sessions/:id`:
    - чужая сессия -> 403,
    - своя сессия -> 200.
  - Зачем: подтверждает security и корректный session flow.

- `src/routes/admin.feature.test.ts`
  - Проверяет доступ к `/api/admin/questions`:
    - без токена -> 401,
    - student -> 403,
    - admin -> 200.
  - Зачем: гарантирует role-based защиту админки.

### Итого по тестам в нашей работе

- Сделали **unit + feature** слой (как требует LR10).
- Закрыли ключевые **negative cases**: 401, 403, 400.
- Настроили запуск:
  - `npm run test`
  - `npm run test:unit`
  - `npm run test:feature`
  - `npm run test:coverage`

---

## 5) Как запустить и проверить все

Из папки `lessons/lr8/quiz-backend`:

```bash
npm install
npm run test
npm run test:coverage
```

Отдельно:

```bash
npm run test:unit
npm run test:feature
```

---

## 6) Частые ошибки и как чинить

### Ошибка: `ReferenceError: Cannot access '__vi_import_0__' before initialization`

Причина: в `vi.hoisted(...)` вызвали функцию из внешнего импорта (например `mockDeep`).

Решение: внутри `vi.hoisted` использовать только `vi.fn()`/простые объекты.

### Ошибка: `MISSING DEPENDENCY Cannot find dependency '@vitest/coverage-v8'`

Нужно, чтобы версии совпадали с Vitest:

```bash
npm i -D vitest@3.2.4 @vitest/coverage-v8@3.2.4
```

### Ошибка: `ENOSPC: no space left on device`

Нет места на диске. Что сделать:

1. Очистить npm cache:
```bash
npm cache clean --force
```
2. Удалить тяжелые временные папки (`%TEMP%`, старые логи npm).
3. Удалить `node_modules` и поставить заново:
```bash
rd /s /q node_modules
del package-lock.json
npm install
```
4. Проверить свободное место на диске (желательно хотя бы 2-4 GB).

---

## 7) Мини-чеклист "готово/не готово"

- `npm run test` -> все тесты зеленые.
- `npm run test:coverage` -> отчет строится без ошибок.
- `npm run dev` -> сервер стартует и отвечает на `GET /health`.
- Есть 401/403/400 negative-кейсы в тестах.

Если все пункты зеленые - LR10 практическая часть выполнена корректно.

---

## 8) Как читать твой Coverage-отчёт (разбор по строкам)

Ты видишь таблицу вида:
- `% Stmts` - сколько покрыто обычных строк кода (statements);
- `% Branch` - сколько покрыто ветвлений (`if/else`, `try/catch`, разные пути условий);
- `% Funcs` - сколько функций/методов были вызваны тестами;
- `% Lines` - покрытие строк (похоже на `% Stmts`, но считается по-своему);
- `Uncovered Line #s` - номера строк, куда тесты не дошли.

### Что означает верхняя строка

- `All files: 42.74%`  
  Это **среднее покрытие по всем исходникам** из `src`.
  Для учебной LR10 это нормально, потому что в работе акцент на:
  - раздельные unit/feature-тесты,
  - security/validation negative-cases,
  - воспроизводимый запуск тестов.

### Разбор твоих блоков

- `src/app.ts -> 100%`  
  Отлично: сборка приложения и роутов проверяется полностью.

- `src/lib/prisma.ts -> 77.77%, branch 0%`  
  Непокрыты строки с fail-fast (`DATABASE_URL` отсутствует).  
  Это ожидаемо: в тестах переменная задана специально, чтобы всё стартовало.

- `src/middleware/admin.ts -> 93.54%`  
  Почти полностью покрыт; непокрыты редкие ветки ошибок.

- `src/routes/auth.ts -> 56.86%`  
  Не покрыта большая ветка реального запроса к GitHub OAuth API.  
  Это нормально для локальных тестов, где используем `test_*` code.

- `src/routes/sessions.ts -> 57.26%`  
  Покрыт основной flow, но не все edge-cases submit/answer.

- `src/routes/admin.ts -> 18%`  
  Покрыта только часть админки (доступ/базовый endpoint).  
  Остальные CRUD/grading/stats сценарии пока без тестов.

- `src/services/scoringService.ts -> 100%`  
  Отличный unit coverage для чистой бизнес-логики.

- `src/services/sessionService.ts -> 21.21%`  
  Сейчас покрыты в основном негативные ветки (ошибки).  
  Happy-path и часть транзакционных сценариев ещё без unit-тестов.

- `src/services/github.ts -> 0%`  
  Модуль не тестируется отдельно, и это допустимо, если основной auth flow закрыт в route-тестах.

- `src/utils/validation.ts -> 100%`  
  Отлично: схемы Zod проверены хорошо.

### Вывод по качеству для LR10

По требованиям LR10 у тебя всё ок:
- тесты запускаются стабильно;
- есть unit + feature;
- есть security/validation кейсы;
- coverage-отчёт получен и проанализирован.

Низкий процент у некоторых файлов не означает "плохо" автоматически.
Это означает: какие участки кода ещё можно добить дополнительными тестами, если нужен более высокий quality bar.

### Если хочешь поднять Coverage быстро (приоритет)

1. Добавить feature-тесты на админские endpoint в `routes/admin.ts`:
   - `POST /questions`,
   - `POST /questions/batch`,
   - `PUT /questions/:id`,
   - `GET /answers/pending`,
   - `POST /answers/:id/grade`,
   - `GET /students/:userId/stats`.

2. Добавить unit/feature happy-path для `sessionService`:
   - успешный `submitAnswer` для single/multiple-select,
   - успешный `submitSession` и подсчёт `score`.

3. Если нужно покрыть OAuth-ветку глубже:
   - замокать `fetch` в `auth.ts` и проверить реальный обмен code/token/user.

---

## 9) Интеграция с фронтом и полная теория LR10

- Спецификация API для клиента: `lessons/lr5/quiz-api-schema.yaml`. Порт бэкенда по умолчанию **3001** — задайте тот же URL во фронте (`VITE_API_URL` и т.п.).
- Скрипт **`npm run verify:integration`** (папка `scripts/verify-integration.mjs`) проверяет цепочку health → callback → `/me` → сессия → ответ → submit; сервер должен быть уже запущен (`npm run dev` во втором терминале).
- Развёрнутая сводка по LR8→LR9→LR10, тестам и проверкам: **[THEORY.md](THEORY.md)** в этой же папке `lessons/lr10`.
