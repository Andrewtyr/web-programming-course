/**
 * Точка входа процесса: загружает `.env`, поднимает HTTP-сервер.
 * Маршруты собраны в `app.ts`; здесь только `serve(...)`.
 */
import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.js'

const port = Number(process.env.PORT) || 3001

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log(`Server running on http://localhost:${port}`)
  }
)
