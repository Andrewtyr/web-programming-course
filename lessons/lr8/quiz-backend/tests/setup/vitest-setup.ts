/**
 * Глобальный хук после всех тестов: закрывает соединение Prisma (иначе процесс Vitest может зависнуть).
 */
import { afterAll } from 'vitest'
import { prisma } from '../../src/lib/prisma.js'

afterAll(async () => {
  await prisma.$disconnect()
})
