/**
 * Сборка HTTP-приложения на Hono без запуска сервера.
 * Feature-тесты (LR10) импортируют тот же `app` и вызывают `app.request(...)` без TCP-порта.
 * `index.ts` только оборачивает `app.fetch` в `@hono/node-server` `serve`.
 * CORS `origin: '*'` — запросы с другого origin (например Vite dev server).
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
