/**
 * Единый клиент Prisma для PostgreSQL (Prisma 7: обязателен driver adapter).
 * `DATABASE_URL` — строка подключения (см. `.env.example`).
 */
/// <reference types="node" />
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in .env')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })

export const prisma = new PrismaClient({ adapter })
