# LR9 Backend Practice: Full Report + Theory + Verification

Этот файл — итоговый конспект по выполненной практике LR9 на базе LR8.

Внутри:
- подробная теория по архитектуре;
- что именно реализовано по Checkpoint 0-6;
- команды запуска и проверки;
- сценарии ручного тестирования;
- типичные проблемы и быстрые решения.

---

## 1) Теория: зачем это всё

## 1.1 Что такое backend в этой работе
В этой лабораторной backend:
- принимает HTTP запросы;
- валидирует входные данные;
- работает с БД через Prisma;
- применяет бизнес-правила (scoring, lifecycle сессии);
- возвращает JSON ответы с правильными статус-кодами.

Стек:
- **Hono** — HTTP framework;
- **TypeScript** — строгая типизация;
- **Prisma + SQLite** — ORM + локальная БД;
- **JWT** — аутентификация;
- **Zod** — runtime-валидация;
- **Vitest** — unit tests.

---

## 1.2 Слои архитектуры (Separation of Concerns)

### `routes/`
Отвечает за HTTP:
- чтение `req`;
- вызов валидации;
- вызов service;
- формирование `res` и HTTP кодов.

### `services/`
Бизнес-логика:
- подсчёт баллов;
- проверка статусов сессии;
- атомарные операции через `transaction`.

### `middleware/`
Сквозные проверки:
- аутентификация;
- авторизация admin.

### `utils/`
Общие схемы и вспомогательные вещи:
- Zod схемы для body/query.

### `prisma/`
Схема данных + миграции:
- модели;
- связи;
- индексы;
- история изменений структуры.

Почему так лучше:
- проще тестировать (service отдельно от HTTP);
- проще читать и поддерживать;
- безопаснее обновлять логику;
- легче масштабировать проект.

---

## 1.3 JWT в этом проекте
Поток:
1. Пользователь проходит `POST /api/auth/github/callback`.
2. Backend выдаёт JWT с `userId`.
3. Клиент отправляет `Authorization: Bearer <token>`.
4. Сервер проверяет подпись через `verify(token, secret, 'HS256')`.

Плюс:
- в admin middleware дополнительно проверяется `user.role === 'admin'`.

---

## 1.4 Работа с Prisma и индексами
Модели связаны отношениями:
- `User 1 -> N Session`;
- `Session 1 -> N Answer`;
- `Question 1 -> N Answer`;
- `Category 1 -> N Question`.

Оптимизация:
- индексы на `Session.userId`, `Session.status`, `[userId, status]`;
- индексы на `Answer.sessionId`, `Answer.questionId`;
- уникальный ключ `@@unique([sessionId, questionId])` — один ответ на вопрос в рамках одной сессии.

---

## 2) Что реализовано по Checkpoint 0-6

## Checkpoint 0: Quiz Models
Реализовано:
- добавлены модели `Category`, `Question`, `Session`, `Answer`;
- обновлена модель `User`:
  - `role` (`student`/`admin`);
  - связь `sessions`;
- добавлены нужные отношения и ограничения;
- миграции применены.

Ключевые особенности:
- `Answer.userAnswer` и `Question.correctAnswer` — `Json`;
- `onDelete: Cascade` для `Answer -> Session`;
- `@@unique([sessionId, questionId])`.

---

## Checkpoint 1: Scoring Service
Реализовано:
- `src/services/scoringService.ts`;
- `ScoringService` с методами:
  - `scoreMultipleSelect(correctAnswers, studentAnswers)`
  - `scoreEssay(grades, rubric)`;
- singleton экспорт:
  - `export const scoringService = new ScoringService()`;
- unit tests: 10 тестов (5 + 5), все проходят.

Логика:
- multiple-select: `+1` за верный, `-0.5` за неверный, минимум `0`;
- essay: оценка по критериям с ограничением диапазона `0..max`.

---

## Checkpoint 2: Prisma Schema Updates
Реализовано:
- индексы на часто используемые поля;
- комбинированный индекс на `[userId, status]`;
- проверены связи в Prisma Studio.

---

## Checkpoint 3: Session & Answer Endpoints
Реализовано:
- `src/services/sessionService.ts`:
  - `submitAnswer(...)`
  - `submitSession(...)`
  - использование `prisma.$transaction(...)`;
  - интеграция со `scoringService`.
- `src/routes/sessions.ts`:
  - `POST /api/sessions`
  - `GET /api/sessions/:id`
  - `POST /api/sessions/:id/answers`
  - `POST /api/sessions/:id/submit`.

Проверено:
- создание сессии;
- отправка ответа;
- завершение сессии;
- корректный расчёт score.

---

## Checkpoint 4: Validation with Zod
Реализовано:
- централизованные схемы в `src/utils/validation.ts`:
  - `AnswerSchema`
  - `SubmitSessionSchema`
  - `GradeSchema`
  - `QuestionSchema`.
- в endpoints добавлены `safeParse` проверки;
- при невалидном вводе возвращается `400` + детали ошибки.

Важно:
- в PowerShell `Invoke-RestMethod` для `400` показывает исключение — это нормальное поведение, не баг API.

---

## Checkpoint 5: Admin Endpoints
Реализовано:
- `src/middleware/admin.ts`:
  - JWT verify;
  - проверка `role === 'admin'`.
- `src/routes/admin.ts`:
  - `GET /api/admin/questions`
  - `POST /api/admin/questions`
  - `PUT /api/admin/questions/:id`
  - `GET /api/admin/answers/pending`
  - `POST /api/admin/answers/:id/grade`
  - `GET /api/admin/students/:userId/stats`.
- `POST /api/admin/answers/:id/grade` использует transaction;
- при завершении проверки essay-ответов пересчитывается score сессии.

---

## Checkpoint 6: Optimization
Реализовано:
- в list endpoints используются `select` (минимально необходимые поля);
- добавлена пагинация в admin list endpoints;
- добавлен batch endpoint:
  - `POST /api/admin/questions/batch` с `createMany`;
- используются индексы, добавленные на шаге Checkpoint 2.

Примечание:
- для SQLite в Prisma не используем `skipDuplicates` в `createMany`.

---

## 3) Файлы, которые должны быть в проекте

Минимально:
- `src/index.ts`
- `src/routes/auth.ts`
- `src/routes/sessions.ts`
- `src/routes/admin.ts`
- `src/services/scoringService.ts`
- `src/services/sessionService.ts`
- `src/middleware/admin.ts`
- `src/utils/validation.ts`
- `src/lib/prisma.ts`
- `prisma/schema.prisma`
- `prisma.config.ts`
- `.env`

---

## 4) Полезные команды (Windows / PowerShell)

## 4.1 Базовый запуск
```powershell
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## 4.2 Проверка типов и тестов
```powershell
npm run typecheck
npm test
```

## 4.3 Prisma Studio
```powershell
npx prisma studio
```

## 4.4 Health check
```powershell
curl.exe http://localhost:3000/health
```

---
5.

### 5.1 Получить токен и идентификатор пользователя

```powershell
$auth = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/github/callback" -ContentType "application/json" -Body '{"code":"test_code"}'
$token = $auth.token
$userId = $auth.user.id
```

Что делает:

вызывает ложный обратный вызов GitHub ( test_code);
получает токен JWT;
сохранить userId текущего пользователя для текущих проверок.

---

### 5.2 Ход сессии (создание сессии → ответ → завершение)

```powershell
$sessionResp = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{}'
$sessionId = $sessionResp.session.id
```

Что делает:

создаёт новую викторину-сессию для обычного пользователя;
.sessionId

```powershell
$body = @{ questionId = "1"; userAnswer = "4" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions/$sessionId/answers" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
```

Что делает:

отправляет ответ на вопрос в этой сессии;
серверная часть считает оценку (для автопроверяемых типов).

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions/$sessionId/submit" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{}'
```

Что делает:

завершает сессию;
фиксирует итоговый статус и балл.

---

### 5.3 Проверки валидации (ожидается 400)

```bash
curl.exe -i -X POST "http://localhost:3000/api/sessions/$sessionId/answers" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "{}"
```

Что делает:

отправляет невалидное тело (нет questionId);
наконец, что конечная точка получает 400 Bad Request + подробности.

```powershell
$newSession = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{}'
$newSessionId = $newSession.session.id

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions/$newSessionId/submit" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"sessionId":123}'
```

Что делает:

создаёт новую сессию;
отправляет недопустимый sessionId (число вместо строки) в /submit;
последняя корректная Zod-валидация (400).

---

### 5.4 Административный процесс

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/admin/questions?page=1&limit=20" -Headers @{ Authorization = "Bearer $token" }
```

Что делает:

получает список вопросов как администратор;
после этого пагинация и доступ к конечной точке администратора.

```powershell
$created = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/admin/questions" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"text":"Essay check","type":"essay","categoryId":"1","points":5}'
$essayQuestionId = $created.question.id
```

Что делает:

создаёт новый эссе-вопрос;
сохраните его id для следующего шага.

```powershell
$s2 = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{}'
$s2id = $s2.session.id

$essayBody = @{ questionId = $essayQuestionId; userAnswer = "My essay answer" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sessions/$s2id/answers" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $essayBody
```

Что делает:

создаёт новую сессию;
отправляет эссе-ответ (у него изначально оценка null, нужна ручная оценка).

```powershell
$pending = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/admin/answers/pending?page=1&limit=20" -Headers @{ Authorization = "Bearer $token" }
$answerId = $pending.items[0].id

Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/admin/answers/$answerId/grade" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"score":4}'
```

Что делает:

получить список;
Берёт answerId первый в ожидании;
выставляет ручную оценку (grade).

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/admin/students/$userId/stats" -Headers @{ Authorization = "Bearer $token" }
```

Что делает:

получает статистику студента:

общее количество сессий,
завершенные сессии,
средний балл,
общий балл.
---

## 6) Типичные проблемы и решения

## 6.1 `Missing script: test`
Добавить в `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

## 6.2 Node 24 + better-sqlite3 на Windows
Если падает сборка:
- перейти на Node 22 LTS;
- переустановить зависимости.

## 6.3 ESM import errors (`.js` extension)
При `NodeNext` относительные импорты должны быть с `.js`:
```ts
import adminRoutes from './routes/admin.js'
```

## 6.4 Prisma createMany + SQLite
Не использовать `skipDuplicates`, иначе TypeScript ошибка.

## 6.5 PowerShell и HTTP 400
`Invoke-RestMethod` кидает исключение на 400/401/403/404 — это нормальное поведение клиента.

---

## 7) Финальный чеклист перед сдачей

- [ ] `npm run typecheck` проходит  
- [ ] `npm test` проходит  
- [ ] `/health` работает  
- [ ] auth callback работает (`test_code`)  
- [ ] `sessions` flow работает (create -> answer -> submit)  
- [ ] invalid body даёт `400`  
- [ ] admin endpoints работают под admin ролью  
- [ ] pagination работает на admin list endpoints  
- [ ] batch создание вопросов работает  

---

## 8) Короткий итог

В результате реализован backend с:
- полноценной структурой данных для quiz;
- сервисным слоем бизнес-логики;
- JWT auth + admin authorization;
- валидацией через Zod;
- unit-тестами для scoring;
- оптимизированными запросами и пагинацией.