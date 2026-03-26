/**
 * Маршруты `/api/auth`: OAuth GitHub (обмен code на пользователя, upsert в БД, выдача JWT),
 * и `GET /me` — текущий пользователь по Bearer-токену.
 * Коды с префиксом `test_` обходят GitHub API для локальных/тестовых сценариев.
 */
/// <reference types="node" />
import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'                  // sign — создаёт токен, verify — проверяет токен
import { prisma } from '../lib/prisma.js'                 // связь с базой данных
import { githubCallbackSchema } from '../utils/validation.js'  // проверка, что пришёл правильный код от GitHub

const authRoutes = new Hono()  // группа маршрутов для /api/auth

// Секретный ключ для наших токенов — обязательно должен быть в .env
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in .env')
}

// Типы данных, которые приходят от GitHub (чтобы код понимал структуру)
type GitHubTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type GitHubUserResponse = {
  id: number
  login: string
  name: string | null
  email: string | null
}

type GitHubEmailResponse = {
  email: string
  primary: boolean
  verified: boolean
}

// Маленькая функция: вытаскивает токен из заголовка Authorization: Bearer ...
function getBearerToken(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

// POST /api/auth/github/callback — сюда приходит код после нажатия "Войти через GitHub"
authRoutes.post('/github/callback', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  // Проверяем, что пришёл нормальный код
  const parsed = githubCallbackSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const { code } = parsed.data

  let githubId = ''
  let email = ''
  let name = ''

  // Специальный режим для тестов: если код начинается с test_ — создаём фейкового пользователя
  if (code.startsWith('test_')) {
    const suffix = code.slice(5) || 'student'
    githubId = `test_${suffix}`
    email = `${suffix}@example.com`
    name = `Test User ${suffix}`
  } else {
    // Настоящий вход через GitHub
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return c.json({ error: 'GitHub OAuth is not configured' }, 500)
    }

    // Меняем временный код на постоянный токен доступа
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenRes.ok) {
      return c.json({ error: 'Failed to exchange code with GitHub' }, 400)
    }

    const tokenData = (await tokenRes.json()) as GitHubTokenResponse
    const accessToken = tokenData.access_token
    if (!accessToken) {
      return c.json({ error: tokenData.error_description ?? 'Invalid GitHub code' }, 401)
    }

    // Получаем основную информацию о пользователе
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'quiz-backend',
      },
    })

    if (!userRes.ok) {
      return c.json({ error: 'Failed to fetch GitHub user' }, 400)
    }

    const ghUser = (await userRes.json()) as GitHubUserResponse

    githubId = String(ghUser.id)
    name = ghUser.name || ghUser.login || `github_${ghUser.id}`
    email = ghUser.email ?? ''

    // Если email не пришёл сразу — запрашиваем список email'ов
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'quiz-backend',
        },
      })

      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmailResponse[]
        const selected =
          emails.find((e) => e.primary && e.verified) ??
          emails.find((e) => e.verified) ??
          emails[0]

        if (selected?.email) email = selected.email
      }
    }

    // Последний резервный вариант email'а от GitHub
    if (!email) {
      email = `${ghUser.id}+github@users.noreply.github.com`
    }
  }

  // Создаём или находим пользователя в нашей базе по githubId
  const user = await prisma.user.upsert({
    where: { githubId },
    update: { email, name },
    create: { githubId, email, name },
  })

  // Создаём наш собственный токен на 7 дней
  const token = await sign(
    {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    JWT_SECRET,
    'HS256'
  )

  // Возвращаем токен и основные данные пользователя
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      githubId: user.githubId,
      createdAt: user.createdAt,
    },
  })
})

// GET /api/auth/me — "кто я сейчас?" (показывает данные по токену)
authRoutes.get('/me', async (c) => {
  const token = getBearerToken(c.req.header('Authorization'))
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let userId: string | null = null
  try {
    const payload = (await verify(token, JWT_SECRET, 'HS256')) as Record<string, unknown>
    userId = typeof payload.userId === 'string' ? payload.userId : null
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  if (!userId) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      githubId: user.githubId,
      createdAt: user.createdAt,
    },
  })
})

export default authRoutes