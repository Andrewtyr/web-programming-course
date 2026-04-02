/**
 * Единый клиент Prisma для SQLite через адаптер better-sqlite3.
 * `DATABASE_URL` в `process.env` (в рантайме сервера задаётся через `dotenv` в `index.ts`, в тестах — в `vitest.config`).
 * Не импортируем `dotenv` здесь: иначе `.env` перезапишет URL тестовой БД до подстановки Vitest.
 */
/// <reference types="node" />
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Этот файл создаёт один общий экземпляр Prisma-клиента.
// Дальше весь backend работает с БД через экспорт `prisma`.
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env')
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl })

export const prisma = new PrismaClient({ adapter })