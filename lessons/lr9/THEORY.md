# LR9 Theory (простыми словами)



- добавил модели для викторины в базу данных;
- добавил бизнес-логику подсчёта баллов;
- разделил код на слои (`routes`, `services`, `middleware`);
- добавил валидацию входных данных;
- сделал админские endpoint'ы;
- добавил оптимизации (индексы, пагинация, выбор только нужных полей);
- **согласовал ответы API с фронтом** по `lessons/lr5/quiz-api-schema.yaml` (форматы `User`, `SessionResponse`, ответы на вопросы, итог сессии), см. раздел ниже;
- добавил **`npm run verify:integration`** и скрипт проверки цепочки как у клиента.

Если очень коротко: теперь сервер не просто "принимает запросы", а умеет правильно проверять, считать, хранить и защищать данные.

---

## Идея backend 

Представь школу:

- `routes` — это **вход в школу** (куда пришёл запрос);
- `middleware` — это **охранник** (проверяет токен, роль);
- `services` — это **учителя и правила** (как считать баллы, когда тест закрывать);
- `prisma` и `schema.prisma` — это **журнал и база школы** (где всё хранится);
- `index.ts` — это **главный вход и расписание кабинетов**.

---

## Структура проекта

Ниже структура именно того, что важно для LR9:

```text
quiz-backend/
├─ src/
│  ├─ index.ts
│  ├─ lib/
│  │  └─ prisma.ts
│  ├─ middleware/
│  │  ├─ admin.ts
│  │  └─ auth.ts          ← JWT для /api/sessions и GET /me
│  ├─ routes/
│  │  ├─ auth.ts
│  │  ├─ sessions.ts      ← сессии + ответы + submit + форматы OpenAPI
│  │  └─ admin.ts
│  ├─ services/
│  │  ├─ scoringService.ts
│  │  ├─ scoringService.test.ts
│  │  └─ sessionService.ts
│  └─ utils/
│     ├─ validation.ts    ← Zod, в т.ч. CreateSession / SubmitAnswer (LR5)
│     ├─ questionBank.ts  ← разбор correctAnswer → options + correct
│     ├─ sessionApiMappers.ts  ← SessionResponse, AnswerResult, SessionResults
│     └─ userApiMapper.ts      ← объект User как в схеме (githubUsername, role…)
├─ prisma/
│  └─ schema.prisma       ← Session.questionIds (вопросы этой попытки)
├─ scripts/
│  └─ verify-integration.mjs   ← автопроверка цепочки как у фронта
├─ package.json
└─ .env
```

### Кто за что отвечает

- `src/index.ts`  
  Точка входа backend: создаёт Hono-приложение, подключает роуты, поднимает сервер.

- `src/routes/auth.ts`  
  Логин через GitHub OAuth, выдача JWT, endpoint "кто я" (`/me`).

- `src/routes/sessions.ts`  
  Работа с сессией теста: старт, ответ на вопрос, просмотр, завершение.

- `src/routes/admin.ts`  
  Админская часть: вопросы, проверка эссе, статистика студентов.

- `src/middleware/admin.ts`  
  Проверяет, что пользователь действительно админ.

- `src/services/scoringService.ts`  
  Формулы подсчёта баллов:
  - multiple-select;
  - essay по рубрике.

- `src/services/sessionService.ts`  
  Главная бизнес-логика сессий: проверка сроков, прав, подсчёта и сохранения.

- `src/utils/validation.ts`  
  Zod-схемы (что считается правильным JSON от клиента).

- `src/middleware/auth.ts`  
  Проверка JWT для маршрутов `/api/sessions` и т.п.

- `src/utils/questionBank.ts` и `sessionApiMappers.ts`  
  Разбор `correctAnswer` и сбор JSON в форме OpenAPI (`QuestionPreview`, `SessionResponse`, …).

- `src/lib/prisma.ts`  
  Подключение Prisma к SQLite.

- `prisma/schema.prisma`  
  Описание таблиц и связей базы данных.

---

## Что запускается при `npm run dev`

Смотри `package.json`:

- скрипт `dev` = `tsx watch src/index.ts`.

Это значит:

1. Запускается `tsx` в режиме наблюдения (`watch`).
2. Главный файл запуска — `src/index.ts`.
3. Если ты меняешь `.ts` файл, сервер автоматически перезапускается.

---

## Что происходит дальше после старта (по шагам)

### Шаг 1. Запуск приложения

`src/index.ts`:

- подгружает переменные из `.env`;
- создаёт `app = new Hono(...)`;
- добавляет `GET /health`;
- подключает роуты:
  - `/api/auth`
  - `/api/sessions`
  - `/api/admin`
- включает **CORS** (чтобы фронт с другого порта Vite мог слать запросы);
- вызывает `serve(...)` и слушает порт из `.env` или **3001** по умолчанию.

### Шаг 2. Приходит HTTP-запрос

Например: `POST /api/sessions/:id/answers`.

- Hono находит нужный route;
- если route защищён, сначала проходит middleware/проверка токена;
- тело запроса валидируется через Zod;
- route вызывает service;
- service обращается к базе через Prisma;
- возвращается JSON-ответ и HTTP-статус.

### Шаг 3. Работа с базой

Prisma использует таблицы из `schema.prisma`:

- `User`
- `Category`
- `Question`
- `Session`
- `Answer`

Для важных операций применяются транзакции (`$transaction`), чтобы данные не "ломались" на середине процесса.

---

## Как работает авторизация (простая схема)

1. Пользователь логинится через GitHub (`/api/auth/github/callback`).
2. Сервер создаёт/обновляет `User` в БД.
3. Сервер выдаёт JWT-токен.
4. Клиент отправляет токен в заголовке:
   `Authorization: Bearer <token>`.
5. Сервер проверяет токен и понимает, кто это.

Для админа есть дополнительная проверка роли (`role === "admin"`).

---

## Как считается результат теста

### `single-select`

- один правильный вариант;
- совпало -> полные баллы;
- не совпало -> 0.

### `multiple-select`

- +1 за каждый правильный выбранный;
- -0.5 за лишний неправильный;
- итог не меньше 0;
- потом масштабируется к `points` вопроса.

### `essay`

- автоматически не проверяется;
- админ ставит оценку;
- когда все эссе проверены, пересчитывается итоговый балл сессии.

---

## Почему это уже "серьёзный backend"

- Есть разделение ответственности (routes/services/middleware).
- Есть защита данных (JWT + admin role).
- Есть валидация входа (Zod).
- Есть безопасные операции с БД (transactions).
- Есть оптимизация (индексы, пагинация, select).
- Есть тесты бизнес-логики (`scoringService.test.ts`).

---

## Краткий сценарий работы пользователя

1. Логин через GitHub -> получает токен.
2. Создаёт сессию теста.
3. Отправляет ответы.
4. Завершает сессию.
5. Получает результат (часть может ждать проверки эссе).

Админ:

1. Управляет вопросами.
2. Проверяет эссе.
3. Смотрит статистику по ученикам.

---

## Согласование с фронтендом (OpenAPI LR5)

В курсе фронт описан спецификацией **`lessons/lr5/quiz-api-schema.yaml`**: какие поля ждать в `User`, `SessionResponse`, `SubmitAnswerRequest`, `AnswerResult`, `SessionResults`.

Чтобы **один и тот же бэкенд** подходил и к лабораторным LR8–LR9, и к проверке с фронтом (например **`lessons/lr6`**), в `quiz-backend` сделано следующее.

### HTTP-контракт

| Действие | Схема | Реализация |
|----------|--------|------------|
| Логин | `POST /api/auth/github/callback` + `{ code }` → `AuthResponse` | `auth.ts` |
| Профиль | `GET /api/auth/me` → плоский **`User`** (не `{ user: {...} }`) | `userApiMapper.ts` + `auth.ts` |
| Создать тест | `POST /api/sessions` → **`SessionResponse`** (201), внутри массив **`questions`** | `sessions.ts` + `sessionApiMappers.ts` |
| Ответ | `POST .../answers` с `questionId` + `selectedOptions` или `text` | `sessions.ts` + `validation.ts` |
| Конец теста | `POST .../submit` → **`SessionResults`** | `sessions.ts` |
| Результаты | `GET .../results` → **`SessionResults`** | `sessions.ts` |

Ответы на вопросы нужно слать на **`/answers`**, а не на **`/submit`**: `/submit` только **закрывает** сессию и отдаёт итог.

### Новые/важные файлы (зачем они)

- **`middleware/auth.ts`** — проверка `Authorization: Bearer`, в контекст кладётся `userId` для всех защищённых маршрутов.
- **`utils/questionBank.ts`** — из поля **`Question.correctAnswer`** (JSON) получаем:
  - список **вариантов для превью** (`options` в API);
  - список **правильных ответов** для подсчёта в **`sessionService`**.
  Поддерживается расширенный формат `{ "options": ["...", ...], "correct": "..." или ["..."] }` и старые форматы (строка / массив только правильных).
- **`utils/sessionApiMappers.ts`** — собирает JSON **в форме схемы**: `SessionResponse`, `toQuestionPreview`, `AnswerResult` / итог **`SessionResults`**.
- **`utils/userApiMapper.ts`** — маппит пользователя из Prisma в **`User`** OpenAPI (`githubId` числом, `githubUsername`, `avatarUrl`, `role`, …).
- **`scripts/verify-integration.mjs`** — один скрипт проверяет цепочку «как клиент»: health → тестовый логин → `/me` → создание сессии → ответ → submit (см. ниже).

### Модель данных: `Session.questionIds`

В OpenAPI у сессии есть **фиксированный набор вопросов** в ответе. В БД у **`Session`** добавлено поле **`questionIds`** (JSON-массив id): при **`POST /api/sessions`** сервер случайно выбирает вопросы из пула, сохраняет id и возвращает их же в **`questions`** как **`QuestionPreview`**. Ответ принимается только на вопрос из этого списка.

### Вопросы для фронта: `QuestionPreview`

Схема требует поля вроде **`id`**, **`type`** (`multiple-select` | `essay`), **`question`**, **`difficulty`**, **`maxPoints`**, для выбора — **`options`** (только подписи, без признака правильности).

На бэкенде:

- **`question`** в JSON = поле **`text`** в таблице `Question`.
- Тип **`single-select`** в БД для API приводится к **`multiple-select`** (в схеме LR5 нет отдельного single).
- **`difficulty`** в ответе пока **всегда `medium`**, отдельного поля в таблице нет (фильтр `difficulty` в теле создания сессии принимается, но не влияет на выбор строк из БД, пока не добавят поле в `Question`).
- **`options`**: если в **`correctAnswer`** лежит объект с массивом **`options`**, фронт получает варианты; если в базе только старая заглушка вроде одной строки **`"4"`**, в превью может быть **`["4"]`** — для нормального UI лучше хранить полный набор в **`{ options, correct }`**.

### Как теперь проверять, что «всё хорошо»

1. **Автоматически** (сервер уже запущен: `npm run dev` в отдельном окне):

   ```bash
   npm run verify:integration
   ```

   Скрипт проверяет цепочку и поля ответов. Если в БД нет вопросов, часть шагов пропускается — сначала добавь вопросы (админка или сид).

2. **Вручную в PowerShell** (получить токен и дернуть API):

   ```powershell
   $t = (Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/github/callback" -ContentType "application/json" -Body '{"code":"test_me"}').token
   curl.exe -s -H "Authorization: Bearer $t" -H "Content-Type: application/json" -d "{}" http://localhost:3001/api/sessions
   ```

   В ответе смотри массив **`questions`**: структура должна совпадать с **`QuestionPreview`** в YAML.

3. **С фронтом** (`lessons/lr6`): в `.env` задай **`VITE_API_URL=http://localhost:3001`** (или свой порт), открой DevTools → **Network** и сравни JSON с `quiz-api-schema.yaml`.

**Важно:** в PowerShell используй **`curl.exe`**, а не `curl` (иначе это `Invoke-WebRequest` с другим синтаксисом).

---

## Что проверить перед сдачей

- `npm run dev` запускается без падений;
- `GET /health` отвечает `{ "status": "ok" }`;
- тесты: `npm test`;
- интеграция с контрактом фронта: **`npm run verify:integration`** (второй терминал, сервер уже запущен);
- миграции применены;
- основные endpoint'ы отвечают корректными статусами и JSON.

