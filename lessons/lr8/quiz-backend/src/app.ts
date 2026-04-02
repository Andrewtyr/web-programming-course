/**
 * Сборка HTTP-приложения на Hono без запуска сервера.
 * Нужна для LR10: feature-тесты вызывают `app.request(...)` без открытого порта.
 * Точка входа процесса — `index.ts`, который поднимает Node-сервер поверх `app.fetch`.
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import adminRoutes from './routes/admin.js'

export function createApp() {
  const app = new Hono({ strict: false })

  app.use('*', cors({ origin: '*' }))

  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.route('/api/auth', authRoutes)
  app.route('/api/sessions', sessionsRoutes)
  app.route('/api/admin', adminRoutes)

  return app
}

export const app = createApp()
