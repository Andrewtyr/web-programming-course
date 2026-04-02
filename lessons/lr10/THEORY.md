# LR10: теория и практика (полная сводка)

Документ описывает **что сделано в `lessons/lr8/quiz-backend` по цепочке LR8 → LR9 → LR10**, как устроены **тесты**, как **согласован API с фронтом (OpenAPI LR5)** и как **проверять** работу перед сдачей.

---

## 1. Что мы сделали по этапам

### LR8 (базовый backend)

- Модели Prisma (`User`, `Category`, `Question`, `Session`, `Answer`), маршруты auth / sessions / admin.
- Бизнес-логика подсчёта баллов вынесена в `scoringService`, работа с сессией — в `sessionService`.
- Валидация входа через Zod (`validation.ts`).

### LR9 (продвинутый backend + контракт с фронтом)

- Ответы API приведены к **`lessons/lr5/quiz-api-schema.yaml`**: плоский **`User`**, **`SessionResponse`**, ответы на вопросы, итог сессии.
- Добавлены **`middleware/auth.ts`** (JWT для `/api/sessions`), **`userApiMapper.ts`**, **`questionBank.ts`**, **`sessionApiMappers.ts`**.
- В схеме БД у **`Session`** — поле **`questionIds`** (фиксированный набор вопросов попытки).
- **`CORS`** и порт по умолчанию **`3001`** (удобно для Vite-фронта на другом порту).
- Скрипт **`npm run verify:integration`** (`scripts/verify-integration.mjs`) — проверка цепочки запросов «как у клиента» (нужен запущенный `npm run dev`).

### LR10 (тестирование и качество)

- **Vitest**: unit-тесты рядом с модулями (`*.unit.test.ts`), feature-тесты у роутов (`*.feature.test.ts`).
- **`vitest.config.ts`**: тестовая БД `prisma/test.db`, `JWT_SECRET` для тестов, `globalSetup` (миграции), `setupFiles` (отключение Prisma после прогона), **coverage (v8)**.
- **`src/app.ts`**: приложение собирается отдельно от **`index.ts`**, чтобы feature-тесты вызывали **`app.request(...)`** без открытого TCP-порта.
- Покрыты типичные **negative cases**: нет токена / битый токен / не тот пользователь / неверный JSON / ошибки Zod.

Итог: backend не только «работает вручную», но и **воспроизводимо проверяется** командами `npm test` и `npm run test:coverage`.

---

## 2. Архитектура: кто за что отвечает

| Слой | Файлы | Задача |
|------|--------|--------|
| Вход процесса | `src/index.ts` | Только `serve(...)`: порт из `PORT` или **3001**. |
| HTTP-приложение | `src/app.ts` | Сборка Hono: **CORS**, `/health`, маршруты `/api/*`. То же приложение используют тесты. |
| Роуты | `routes/auth.ts`, `sessions.ts`, `admin.ts` | Разбор JSON, Zod, вызов сервисов, коды ответов. |
| Защита | `middleware/auth.ts`, `middleware/admin.ts` | JWT: обычный пользователь / только админ. |
| Домен | `services/sessionService.ts`, `scoringService.ts` | Транзакции, правила сессии, формулы баллов (без «лишней» работы роутов). |
| Контракт API | `utils/sessionApiMappers.ts`, `userApiMapper.ts`, `questionBank.ts` | JSON в форме OpenAPI: превью вопросов, результаты, пользователь. |
| Валидация | `utils/validation.ts` | Zod-схемы для тел запросов. |
| Данные | `lib/prisma.ts`, `prisma/schema.prisma` | Доступ к SQLite и схема таблиц. |

---

## 3. Тесты: зачем два слоя

### Unit (`*.unit.test.ts`)

- Проверяют **одну функцию/класс** изолированно.
- **Prisma не используется по-настоящему** — подменяется через `vi.mock` / `vitest-mock-extended`, чтобы не зависеть от БД и ускорить прогон.
- Примеры в проекте:
  - **`scoringService.unit.test.ts`** — математика multiple-select и эссе по рубрике.
  - **`validation.unit.test.ts`** — корректные и некорректные payload для Zod.
  - **`sessionService.unit.test.ts`** — доменные ошибки (`Session not found`, `Forbidden`, …) при подставных вызовах Prisma.

### Feature (`*.feature.test.ts`)

- Проверяют **полный HTTP-сценарий**: тот же **`app`**, что и в проде, реальная тестовая БД.
- Запросы: **`app.request(url, { method, headers, body })`** (Hono).
- Примеры:
  - **`auth.feature.test.ts`** — `/me` без токена (401), битый токен (401), успех (200), callback с `test_*` кодом.
  - **`sessions.feature.test.ts`** — создание сессии (**201** и тело в форме **SessionResponse**), чужая сессия (**403**).
  - **`admin.feature.test.ts`** — доступ к админке только с ролью admin.

**Правило курса:** в unit не смешивать проверку «всего API», а в feature не мокать Prisma целиком — иначе теряется смысл слоёв.

---

## 4. Как устроена тестовая инфраструктура

| Файл | Назначение |
|------|------------|
| `vitest.config.ts` | Какие тесты включать, `DATABASE_URL` на `prisma/test.db`, секрет JWT, **однопоточный** прогон (`poolOptions.threads.singleThread`), отчёт coverage. |
| `tests/setup/global-setup.ts` | Перед тестами: **`prisma migrate deploy`** на тестовую БД. |
| `tests/setup/vitest-setup.ts` | После всех тестов: **`prisma.$disconnect()`**, чтобы процесс не зависал. |
| `tests/setup/test-db.ts` | **`resetAndSeed()`**: чистит таблицы, создаёт студентов, админа, категорию, вопрос, подписывает **JWT** для заголовков в feature-тестах. |
| `tests/setup/test-app.ts` | Реэкспорт **`app`** из `src/app.ts` — короткий импорт в тестах. |

Команды из `package.json`:

- `npm test` — все unit + feature (через `vitest run`, список файлов задаёт `vitest.config.ts`).
- `npm run test:unit` / `npm run test:feature` — только нужный слой.
- `npm run test:coverage` — то же + отчёт v8 (папка `coverage/`, в `.gitignore`).

---

## 5. Что именно проверяют тесты (смысл, не только имена файлов)

- **Бизнес-логика** не ломается при рефакторинге (unit на `scoringService` и негативные ветки `sessionService`).
- **Контракт входа** стабилен: Zod отсекает мусор (unit на `validation`).
- **Безопасность** предсказуема: без токена и с чужим токеном нужные статусы (**401** / **403**).
- **Сессии** после LR9: создание возвращает **201** и поля **`sessionId`**, **`userId`**, **`totalQuestions`**, а не старый формат с вложенным `session`.

Feature-тесты обновлены под **OpenAPI LR5**, иначе они бы «требовали» старый JSON и ломались бы при правильном бэкенде.

---

## 6. Coverage (покрытие): как читать отчёт

После `npm run test:coverage` смотри таблицу:

- **Statements / Lines** — дошли ли тесты до строки кода.
- **Branches** — проверены ли ветки `if` / `catch`.
- **Funcs** — вызывались ли функции.

Типичная картина учебного проекта:

- Высокое покрытие у **`scoringService`**, **`validation`**.
- Ниже у **`routes/auth.ts`** — большая ветка реального **OAuth** к GitHub в проде; в тестах чаще используется код **`test_*`**.
- Ниже у **`routes/admin.ts`**, если не все CRUD-ручки покрыты feature-тестами.

Это **не ошибка**, если чекпоинты LR10 выполнены: тесты стабильны, есть unit + feature и negative cases. Отчёт нужен, чтобы **осознанно** видеть «дыры» и при желании добить сценарии.

---

## 7. Связка с фронтом и интеграционная проверка

- Спецификация: **`lessons/lr5/quiz-api-schema.yaml`**.
- Локально фронт (например LR6) указывает **`VITE_API_URL=http://localhost:3001`**.
- **`npm run verify:integration`** (с отдельно запущенным `npm run dev`) прогоняет типичную цепочку и проверяет формы JSON (см. `scripts/verify-integration.mjs`).

---

## 8. Слияние веток LR9 и LR10

Если ветка с LR10 создана отдельно от LR9, при **`git merge`** могут конфликтовать:

- `package.json` / lock-файл — объединить скрипты тестов и **`verify:integration`**.
- `index.ts` vs `app.ts` — оставить разделение **LR10** (тесты импортируют `app`), порт и CORS — из **LR9**.
- `sessions.ts` / `sessionService.ts` — сохранить логику LR9 (OpenAPI, `questionIds`) и тесты LR10.

После слияния обязательно: **`npm run typecheck`**, **`npm test`**.

---

## 9. Соответствие чекпоинтам `lr10/README.md`

| Чекпоинт | Суть | Где смотреть |
|----------|------|----------------|
| 0 | Vitest, скрипты, `vitest.config`, `tests/setup` | `package.json`, `vitest.config.ts`, `tests/setup/*` |
| 1 | Unit + мок Prisma, ≥5 тестов | `*.unit.test.ts` |
| 2 | Feature, `app.request`, ≥3 теста | `*.feature.test.ts` |
| 3 | 401 / 403 / 400, Zod negative | feature + validation unit |
| 4 | `test:coverage`, ручной smoke | отчёт + Postman/curl |

---

## 10. Быстрый чеклист перед сдачей

```bash
cd lessons/lr8/quiz-backend
npm install
npm run typecheck
npm test
npm run test:coverage
# опционально, второй терминал с npm run dev:
npm run verify:integration
```

Если всё зелёное — практическая часть LR10 и связка с LR9 в рабочем состоянии.
