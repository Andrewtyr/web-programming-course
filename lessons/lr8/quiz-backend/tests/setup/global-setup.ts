/**
 * Выполняется один раз перед тестами: применяет миграции к PostgreSQL (`quiz_test`).
 * Требуется запущенный Postgres (например `docker compose up -d db`).
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getTestDatabaseUrl } from './test-database-url.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default function globalSetup() {
  const databaseUrl = getTestDatabaseUrl()
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: 'test-jwt-secret-for-vitest-min-32-chars!!',
  }
  execSync('npx prisma migrate deploy', { cwd: root, env, stdio: 'inherit' })
}
