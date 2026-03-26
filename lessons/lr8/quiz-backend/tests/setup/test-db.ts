/**
 * Сброс тестовой БД и минимальный сид: пользователи (студент, второй студент, админ),
 * категория, вопрос, JWT для заголовка Authorization в feature-тестах.
 */
import { sign } from 'hono/jwt'
import { prisma } from '../../src/lib/prisma.js'

export type TestSeed = {
  student: { id: string; email: string | null; name: string | null }
  otherStudent: { id: string; email: string | null; name: string | null }
  admin: { id: string; email: string | null; name: string | null }
  studentToken: string
  otherStudentToken: string
  adminToken: string
  categoryId: string
}

export async function resetAndSeed(): Promise<TestSeed> {
  await prisma.answer.deleteMany()
  await prisma.session.deleteMany()
  await prisma.question.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const category = await prisma.category.create({
    data: { name: 'Test', slug: 'test-cat' },
  })

  await prisma.question.create({
    data: {
      text: 'Pick A',
      type: 'single-select',
      categoryId: category.id,
      correctAnswer: ['A'],
      points: 1,
    },
  })

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Student',
      githubId: 'gh_student_seed',
      role: 'student',
    },
  })

  const otherStudent = await prisma.user.create({
    data: {
      email: 'other@example.com',
      name: 'Other',
      githubId: 'gh_other_seed',
      role: 'student',
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      githubId: 'gh_admin_seed',
      role: 'admin',
    },
  })

  const secret = process.env.JWT_SECRET!
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24

  const studentToken = await sign(
    { userId: student.id, email: student.email, exp },
    secret,
    'HS256'
  )
  const otherStudentToken = await sign(
    { userId: otherStudent.id, email: otherStudent.email, exp },
    secret,
    'HS256'
  )
  const adminToken = await sign(
    { userId: admin.id, email: admin.email, exp },
    secret,
    'HS256'
  )

  return {
    student,
    otherStudent,
    admin,
    studentToken,
    otherStudentToken,
    adminToken,
    categoryId: category.id,
  }
}
