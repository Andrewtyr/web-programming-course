# ЛР 6 — фронт квиза + реальный API

Копия учебного фронта (на базе lr5) для проверки интеграции с **`lessons/lr8/quiz-backend`**.

## Запуск

1. **Бэкенд** (из `lessons/lr8/quiz-backend`):

   ```bash
   cp .env.example .env   # при необходимости
   npx prisma migrate deploy
   npx prisma generate
   npm run dev
   ```

   По умолчанию сервер: `http://localhost:3001`.

2. **Фронт** (эта папка):

   ```bash
   cp .env.example .env
   npm install
   npm run dev
   ```

3. Войти через GitHub OAuth (или тестовый код `test_student` в callback, если так настроен бэкенд). Токен должен оказаться в `localStorage` как **`auth_token`** (как ожидает `@course/auth-component` и `gameStore`).

### Как убедиться, что бэкенд «как фронт» и схема сходится

1. **Автоматическая цепочка** (без браузера): нужны **два** терминала. Сначала запустите сервер и дождитесь `Server running on...`, **потом** в другом окне:

   ```bash
   cd lessons/lr8/quiz-backend
   npm run verify:integration
   ```

   Если видите `fetch failed` — сервер не слушает этот адрес: не запущен `npm run dev` или другой порт (задайте `BASE_URL`, см. вывод скрипта).

   Скрипт проверяет `GET /health`, тестовый `POST /api/auth/github/callback`, формат **`User`** на `GET /api/auth/me`, создание сессии (**`SessionResponse`**), при наличии вопросов в БД — **`/answers`** и **`/submit`** (**`SessionResults`**).

2. **Вручную в браузере** (фронт `npm run dev` на порту Vite, например 5173): открой DevTools → **Network**, пройди игру и убедись, что запросы идут на `VITE_API_URL`, статусы **201** на создание сессии, **200/202** на ответы, **200** на финальный submit; в ответах есть поля из схемы (`sessionId`, `questions`, `pointsEarned` и т.д.).

3. **Схема YAML** — сверка «на бумаге»: `lessons/lr5/quiz-api-schema.yaml` рядом с ответами в Network.

## Соответствие OpenAPI (`lr5/quiz-api-schema.yaml`)

| Действие | Схема | Бэкенд |
|----------|--------|--------|
| Создать сессию | `POST /api/sessions` + `CreateSessionRequest` → `SessionResponse` | ✅ |
| Ответ на вопрос | `POST .../answers` + `SubmitAnswerRequest` → `AnswerResult` / `AnswerPending` | ✅ |
| Завершить | `POST .../submit` → `SessionResults` | ✅ |
| Профиль | `GET /api/auth/me` → `User` | ✅ |
| Callback | `POST /api/auth/github/callback` + `{ code }` | ✅ |

Ограничения: фильтр **`difficulty`** при выборе вопросов на бэкенде не применяется, пока у модели `Question` нет поля сложности в БД. Вопросы с вариантами должны хранить **`correctAnswer`** в формате `{ "options": [...], "correct": ... }`, иначе `selectedOptions` (индексы) не к чему привязать.

Подробнее про контракт — в `lr8/quiz-backend` и в `lr5/quiz-api-schema.yaml`.
