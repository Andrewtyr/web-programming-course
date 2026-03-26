/**
 * Конфигурация Vitest для LR10: отдельная тестовая БД, JWT, globalSetup миграций,
 * setupFiles для отключения Prisma после прогона, coverage (v8).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

const databaseUrl =
  'file:' + path.join(root, 'prisma', 'test.db').replace(/\\/g, '/')

export default defineConfig({
  test: {
    include: ['src/**/*.unit.test.ts', 'src/**/*.feature.test.ts'],
    env: {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: 'test-jwt-secret-for-vitest-min-32-chars!!',
    },
    globalSetup: ['./tests/setup/global-setup.ts'],
    setupFiles: ['./tests/setup/vitest-setup.ts'],
    fileParallelism: false,
    poolOptions: {
      threads: { singleThread: true },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.unit.test.ts',
        'src/**/*.feature.test.ts',
        'src/index.ts',
      ],
    },
  },
})
