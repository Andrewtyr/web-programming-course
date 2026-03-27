import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { PrismaClient } from '@prisma/client'
import { githubCallbackSchema } from '../utils/validation'

const authRoutes = new Hono()
const prisma = new PrismaClient()

type GithubUser = {
  id: string
  email: string
  name: string
}

const githubApiHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'lr8-backend',
})

const buildMockGithubUser = (code: string): GithubUser => {
  const suffix = code.replace(/^test_/, '') || 'user'

  return {
    id: `test_${suffix}`,
    email: `test_${suffix}@example.com`,
    name: `Test User ${suffix}`,
  }
}

const resolveGithubEmail = async (
  accessToken: string,
  fallbackEmail: string
): Promise<string> => {
  const emailsResponse = await fetch('https://api.github.com/user/emails', {
    headers: githubApiHeaders(accessToken),
  })

  if (!emailsResponse.ok) {
    return fallbackEmail
  }

  const emails = (await emailsResponse.json()) as Array<{
    email: string
    verified: boolean
    primary: boolean
  }>

  const primaryVerified = emails.find((item) => item.primary && item.verified)

  return primaryVerified?.email ?? emails[0]?.email ?? fallbackEmail
}

const getRealGithubUser = async (code: string): Promise<GithubUser> => {
  const githubClientId = process.env.GITHUB_CLIENT_ID
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!githubClientId || !githubClientSecret) {
    throw new Error('Missing GitHub OAuth credentials')
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for access token')
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenPayload.access_token) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'Missing access token')
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: githubApiHeaders(tokenPayload.access_token),
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch GitHub user data')
  }

  const userPayload = (await userResponse.json()) as {
    id: number
    login: string
    email: string | null
    name: string | null
  }

  const fallbackEmail = `${userPayload.id}+${userPayload.login}@users.noreply.github.com`
  const email =
    userPayload.email ?? (await resolveGithubEmail(tokenPayload.access_token, fallbackEmail))

  return {
    id: String(userPayload.id),
    email,
    name: userPayload.name || userPayload.login,
  }
}

authRoutes.post('/github/callback', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = githubCallbackSchema.safeParse(body)

    if (!parsed.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten(),
        },
        400
      )
    }

    const { code } = parsed.data
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return c.json({ error: 'JWT_SECRET is not configured' }, 500)
    }

    const githubUser = code.startsWith('test_')
      ? buildMockGithubUser(code)
      : await getRealGithubUser(code)

    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        email: githubUser.email,
        name: githubUser.name,
      },
      create: {
        githubId: githubUser.id,
        email: githubUser.email,
        name: githubUser.name,
      },
    })

    const token = await sign(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      jwtSecret
    )

    return c.json({
      token,
      user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return c.json({ error: message }, 500)
  }
})

export default authRoutes
