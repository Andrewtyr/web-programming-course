/**
 * Точка входа процесса: загружает `.env`, поднимает HTTP-сервер.
 * Маршруты собраны в `app.ts` (так же используется в Vitest без `serve`).
 * Порт: переменная `PORT` или по умолчанию **3001** (под фронт на Vite).
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
