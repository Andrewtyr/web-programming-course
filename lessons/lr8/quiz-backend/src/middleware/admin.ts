/**
 * Middleware для админских маршрутов: Bearer JWT → userId → пользователь в БД → только `role === 'admin'`.
 * Иначе 401 (нет/битый токен), 404 (нет пользователя), 403 (не админ).
 */
/// <reference types="node" />
import type { MiddlewareHandler } from 'hono'   // тип для middleware в Hono (промежуточная функция)
import { verify } from 'hono/jwt'               // проверяет JWT-токен
import { prisma } from '../lib/prisma.js'       // связь с базой данных

// Секретный ключ для токенов — берём из .env (обязательно должен быть!)
const JWT_SECRET: string = (() => {
  const v = process.env.JWT_SECRET
  if (!v) throw new Error('JWT_SECRET is not set in .env')
  return v
})()

// Маленькая функция: вытаскивает токен из заголовка Authorization: Bearer ...
function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

// Это middleware — "охранник", который проверяет: админ ли ты?
// Используется так: adminRoutes.use('*', requireAdmin)
// Если не админ — сразу останавливает запрос и отвечает ошибкой
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const token = getBearerToken(c.req.header('Authorization'))
  
  // Нет токена → сразу 401 Unauthorized
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    // Проверяем токен и берём из него userId
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    
    if (!userId) return c.json({ error: 'Invalid token' }, 401)

    // Ищем пользователя в базе, берём только id и role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    // Пользователь не найден → 404
    if (!user) return c.json({ error: 'User not found' }, 404)
    
    // Роль не админ → 403 Forbidden
    if (user.role !== 'admin') return c.json({ error: 'Forbidden: admin only' }, 403)

    // Всё ок — пропускаем дальше (вызываем next())
    await next()
  } catch {
    // Токен сломан, просрочен или подделан → 401
    return c.json({ error: 'Invalid token' }, 401)
  }
}