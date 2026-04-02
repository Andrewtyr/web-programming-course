# LR8: Backend API (Hono + TypeScript + Prisma + SQLite + JWT)

Этот файл — единый конспект по практике LR8:
- краткая теория;
- что за что отвечает в коде;
- пошаговая реализация;
- команды запуска и проверки;
- типичные ошибки и быстрые фиксы.

---

## 1) Что мы строим

Backend на `localhost:3000`, который:

1. Имеет БД SQLite и модель `User` (Prisma).
2. Принимает GitHub OAuth code в `POST /api/auth/github/callback`.
3. Поддерживает mock-режим (`code` начинается с `test_`).
4. Выдаёт JWT token после авторизации.
5. Защищает `GET /api/auth/me` через Bearer JWT.

---

## 2) Мини-теория (простыми словами)

## 2.1 Hono
Лёгкий web framework. Аналог Express, но проще и быстрее для типизированного TypeScript.

Основные части:
- `new Hono()` — приложение;
- `app.get(...)`, `app.post(...)` — endpoints;
- `app.route('/prefix', router)` — подключение роутера.

## 2.2 Prisma + SQLite
- Prisma — ORM (работа с БД через TS-методы, а не “сырой” SQL).
- SQLite — файловая БД (`dev.db`), идеально для учебной/локальной разработки.
- Миграции фиксируют структуру таблиц в `prisma/migrations`.

## 2.3 JWT
JWT — токен авторизации:
- сервер подписывает payload секретом (`JWT_SECRET`);
- клиент отправляет токен в `Authorization: Bearer <token>`;
- сервер в `verify()` проверяет подпись и извлекает `userId`.

## 2.4 OAuth callback
Поток:
1. фронт получает `code` от GitHub;
2. бэкенд меняет `code` на `access_token`;
3. по token запрашивает профиль GitHub;
4. создаёт/обновляет пользователя;
5. возвращает свой JWT.

---

## 3) Структура проекта

```text
quiz-backend/
├─ src/
│  ├─ index.ts
│  ├─ lib/
│  │  └─ prisma.ts
│  ├─ routes/
│  │  └─ auth.ts
│  └─ utils/
│     └─ validation.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ prisma.config.ts
├─ .env
├─ package.json
└─ tsconfig.json
```

---

## 4) Что в каких файлах

## 4.1 `src/index.ts`
- старт сервера;
- endpoint `GET /health` -> `{ "status": "ok" }`;
- подключение auth-роутов: `app.route('/api/auth', authRoutes)`.

## 4.2 `prisma/schema.prisma`
Модель `User`:
- `id` (cuid, primary key),
- `email` (unique),
- `name`,
- `githubId` (unique),
- `createdAt`, `updatedAt`.

## 4.3 `src/lib/prisma.ts`
Создание Prisma клиента для Prisma 7 + SQLite adapter:
- `PrismaBetterSqlite3`;
- `new PrismaClient({ adapter })`.

## 4.4 `src/utils/validation.ts`
Zod-схема валидации body:
- `code: string`.

## 4.5 `src/routes/auth.ts`
Содержит:
- `POST /github/callback`:
  - валидирует `code`;
  - mock режим для `test_*`;
  - real OAuth режим через GitHub API;
  - `upsert` пользователя по `githubId`;
  - `sign()` JWT;
  - ответ `{ token, user }`.
- `GET /me`:
  - парсит Bearer token;
  - `verify(token, JWT_SECRET, 'HS256')`;
  - ищет пользователя по `id`;
  - возвращает `{ user }` или ошибки `401/404`.

---

## 5) Пошагово (checkpoints)

## Checkpoint 1: Health
1. Сделать `src/index.ts`.
2. Добавить `GET /health`.
3. Запустить сервер и проверить.

## Checkpoint 2: Prisma + User
1. Настроить `schema.prisma`.
2. Запустить миграцию.
3. Открыть Prisma Studio.

## Checkpoint 3: OAuth callback
1. Zod валидация `code`.
2. Route `POST /api/auth/github/callback`.
3. mock + real GitHub flow.
4. upsert + JWT.

## Checkpoint 4: JWT protection
1. Проверка `Authorization: Bearer`.
2. `verify(..., 'HS256')`.
3. 401 при ошибках.

## Checkpoint 5: `/api/auth/me`
1. Достать `userId` из JWT.
2. `findUnique` по `id`.
3. Вернуть user либо 404.

---

## 6) Обязательные команды

## 6.1 Установка
```bash
npm install
npm i hono @hono/node-server zod dotenv @prisma/client prisma
npm i better-sqlite3 @prisma/adapter-better-sqlite3
npm i -D typescript tsx @types/node
```

## 6.2 Prisma
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

## 6.3 Запуск
```bash
npm run dev
```

## 6.4 Type check
```bash
npx tsc --noEmit
```

---

## 7) Готовые проверки API

## 7.1 Health
```bash
curl.exe http://localhost:3000/health
```
Ожидаемо:
```json
{"status":"ok"}
```

## 7.2 Mock login (PowerShell)
```powershell
$resp = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/github/callback" -ContentType "application/json" -Body '{"code":"test_code"}'
$resp
```
Ожидаемо: объект с `token` и `user`.

## 7.3 Проверка /me
```powershell
$token = $resp.token
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/auth/me" -Headers @{ Authorization = "Bearer $token" }
```

## 7.4 Негативные тесты
Без токена:
```bash
curl.exe http://localhost:3000/api/auth/me
```
Ожидаемо: `401 Unauthorized`.

С невалидным токеном:
```bash
curl.exe http://localhost:3000/api/auth/me -H "Authorization: Bearer invalid"
```
Ожидаемо: `401 Invalid token`.

---

## 8) Частые ошибки и фиксы

## `Missing script: dev`
В `package.json` нет scripts. Добавить:
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "typecheck": "tsc --noEmit"
}
```

## `Cannot find module 'hono'`
```bash
npm i hono @hono/node-server
```

## `Cannot find name 'process'`
```bash
npm i -D @types/node
```
и в `tsconfig.json`:
```json
"types": ["node"]
```

## NodeNext: "explicit file extensions"
В ESM-импортах писать `.js`:
```ts
import authRoutes from './routes/auth.js'
import { prisma } from '../lib/prisma.js'
import { githubCallbackSchema } from '../utils/validation.js'
```

## Prisma 7 + SQLite initialization error
Нужен adapter:
```ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

## Prisma Studio: `DATABASE_URL` not found
Проверить `.env` в корне и `prisma.config.ts`:
```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
```

---

## 9) Мини-checklist перед сдачей

- [ ] `npm run dev` запускается без падений  
- [ ] `GET /health` возвращает `{"status":"ok"}`  
- [ ] `POST /api/auth/github/callback` с `test_code` возвращает token+user  
- [ ] `GET /api/auth/me` с Bearer токеном возвращает пользователя  
- [ ] Без токена `/me` возвращает 401  
- [ ] `npx tsc --noEmit` без ошибок  
- [ ] В коде есть mock режим `test_*`  

---

## 10) Что написать в отчёте

Короткий текст:

1. Реализован backend на Hono + TypeScript.  
2. Добавлена БД SQLite через Prisma, модель User.  
3. Реализован OAuth callback `POST /api/auth/github/callback` (mock + real режимы).  
4. Реализована JWT-авторизация и защита endpoint `GET /api/auth/me`.  
5. Проведены ручные проверки через curl/PowerShell, ответы соответствуют ТЗ.