/**
 * Точка входа процесса: загружает `.env`, поднимает HTTP-сервер на порту 3000.
 * Маршруты и логика живут в `app.ts`; здесь только `serve(...)`.
 */
import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  () => {
    console.log('Server running on http://localhost:3000')
  }
)
