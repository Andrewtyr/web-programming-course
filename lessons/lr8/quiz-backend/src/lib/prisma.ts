/**
 * Единый клиент Prisma для SQLite через адаптер better-sqlite3.
 * `DATABASE_URL` задаёт путь к файлу БД (см. `.env`). Используется во всех роутерах и сервисах.
 */
/// <reference types="node" />
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env')
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl })

export const prisma = new PrismaClient({ adapter })