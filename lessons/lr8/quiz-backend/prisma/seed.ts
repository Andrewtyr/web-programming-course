/**
 * Минимальные данные для локальной проверки и `npm run verify:integration`.
 * Запуск: `npx prisma db seed` (нужен `DATABASE_URL` в `.env`).
 */
import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: 'integration-demo' },
    update: {},
    create: { name: 'Integration demo', slug: 'integration-demo' },
  })

  const n = await prisma.question.count({ where: { categoryId: cat.id } })
  if (n > 0) {
    console.log(`Seed: в категории ${cat.slug} уже есть вопросы (${n}), пропуск.`)
    return
  }

  await prisma.question.create({
    data: {
      text: 'Демо: выберите вариант A',
      type: 'single-select',
      categoryId: cat.id,
      correctAnswer: { options: ['A', 'B', 'C'], correct: 'A' },
      points: 1,
    },
  })
  console.log('Seed: добавлена одна демо-категория и один вопрос.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
