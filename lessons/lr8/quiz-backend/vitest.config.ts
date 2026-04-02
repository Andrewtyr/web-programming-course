/**
 * Конфигурация Vitest для LR10: отдельная тестовая БД, JWT, globalSetup миграций,
 * setupFiles для отключения Prisma после прогона, coverage (v8).
 */
import { defineConfig } from 'vitest/config'
import { getTestDatabaseUrl } from './tests/setup/test-database-url.js'

export default defineConfig({
  test: {
    poolOptions: {
      threads: { singleThread: true },
    },
    include: ['src/**/*.unit.test.ts', 'src/**/*.feature.test.ts'],
    env: {
      DATABASE_URL: getTestDatabaseUrl(),
      JWT_SECRET: 'test-jwt-secret-for-vitest-min-32-chars!!',
    },
    globalSetup: ['./tests/setup/global-setup.ts'],
    setupFiles: ['./tests/setup/vitest-setup.ts'],
    fileParallelism: false,
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
