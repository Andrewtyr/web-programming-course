import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/auth', authRoutes)

const port = 3000

serve({
  fetch: app.fetch,
  port,
})

console.log(`Server is running on http://localhost:${port}`)

export default app
