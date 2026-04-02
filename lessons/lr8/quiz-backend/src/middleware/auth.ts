/// <reference types="node" />
import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'

/**
 * Тип контекста Hono:
 * после успешной проверки токена middleware сохраняет userId,
 * и роуты получают его через c.get('userId').
 */
export type AuthEnv = {
  Variables: {
    userId: string
  }
}

const JWT_SECRET: string = (() => {
  const v = process.env.JWT_SECRET
  if (!v) throw new Error('JWT_SECRET is not set in .env')
  return v
})()

function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

/**
 * Общая проверка Bearer JWT.
 * Если токен валиден:
 * 1) извлекаем payload;
 * 2) берём userId;
 * 3) кладём userId в контекст (c.set('userId', ...));
 * 4) передаём управление в следующий handler.
 *
 * Если токен отсутствует/битый — сразу 401 и дальше цепочка не идёт.
 */
export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getBearerToken(c.req.header('Authorization'))
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    if (!userId) return c.json({ error: 'Invalid token' }, 401)

    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

