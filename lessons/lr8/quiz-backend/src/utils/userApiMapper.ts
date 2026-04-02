/**
 * Сборка объекта **User** для ответов API (GET `/api/auth/me`, поле `user` в callback):
 * числовой `githubId`, `githubUsername`, `avatarUrl`, `role`, опционально имя и фамилия.
 * Строковый `githubId` из БД превращается в число для схемы фронта (см. `githubIdToApiNumber`).
 */
import type { User as PrismaUser } from '@prisma/client'

/** Числовой GitHub id для схемы OpenAPI (LR5); для нечисловых строк — стабильный hash */
export function githubIdToApiNumber(githubId: string): number {
  const n = Number(githubId)
  if (!Number.isNaN(n) && Number.isFinite(n) && String(Math.trunc(n)) === githubId) {
    return Math.trunc(n)
  }
  let h = 0
  for (let i = 0; i < githubId.length; i++) h = (Math.imul(31, h) + githubId.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

export function avatarUrlForGithub(githubId: string): string {
  const n = Number(githubId)
  if (!Number.isNaN(n) && Number.isFinite(n) && String(Math.trunc(n)) === githubId && n > 0) {
    return `https://avatars.githubusercontent.com/u/${Math.trunc(n)}?v=4`
  }
  return 'https://avatars.githubusercontent.com/invisible.png?size=64'
}

export type UserApiOpts = {
  /** login с GitHub API — в БД может не храниться */
  githubLogin?: string
}

/**
 * Объект User как в `lessons/lr5/quiz-api-schema.yaml` (для AuthResponse и GET /api/auth/me).
 */
export function mapUserToApi(user: PrismaUser, opts?: UserApiOpts) {
  const role = user.role === 'admin' ? ('admin' as const) : ('student' as const)
  const ghNum = githubIdToApiNumber(user.githubId)
  const githubUsername =
    opts?.githubLogin?.trim() ||
    user.email?.split('@')[0] ||
    user.name?.replace(/\s+/g, '_').toLowerCase() ||
    user.githubId.slice(0, 32)

  const parts = (user.name ?? '').trim().split(/\s+/)
  const firstName = parts[0] || undefined
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined

  return {
    id: user.id,
    githubId: ghNum,
    githubUsername,
    avatarUrl: avatarUrlForGithub(user.githubId),
    role,
    createdAt: user.createdAt.toISOString(),
    email: user.email ?? null,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  }
}
