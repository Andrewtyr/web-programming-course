/**
 * Выполняется один раз перед тестами: применяет миграции к `prisma/test.db`.
 * Нужен, чтобы feature-тесты видели актуальную схему без ручного `migrate`.
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default function globalSetup() {
  const databaseUrl =
    'file:' + path.join(root, 'prisma', 'test.db').replace(/\\/g, '/')
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: 'test-jwt-secret-for-vitest-min-32-chars!!',
  }
  execSync('npx prisma migrate deploy', { cwd: root, env, stdio: 'inherit' })
}
