import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.js'        // всё, что связано с входом/регистрацией/логином
import sessionsRoutes from './routes/sessions.js' // всё про прохождение тестов (сессии, ответы, результат)
import adminRoutes from './routes/admin.js'      // всё, что может делать только админ (добавлять вопросы и т.д.)


const app = new Hono({ strict: false })  
// strict: false → не ругаться, если в адресе есть лишний слеш в конце (удобно)

// Простая проверка: живой ли сервер?

app.get('/health', (c) => c.json({ status: 'ok' }))

// Теперь приклеиваем все наши маршруты к главному пульту
// Это как сказать: "вот дверь auth — иди туда, если хочешь войти"
// Все адреса будут начинаться с /api/...

app.route('/api/auth', authRoutes)       
app.route('/api/sessions', sessionsRoutes) 
app.route('/api/admin', adminRoutes)    

// Запускаем сервер на порту 3000
// Когда запустится — в консоли увидим сообщение
serve(
  { 
    fetch: app.fetch,   // говорим: "используй наш Hono для обработки запросов"
    port: 3000          // номер двери (порта), на котором будет слушать компьютер
  }, 
  () => {
    // Это сообщение появляется, когда сервер успешно запустился
    console.log('Server running on http://localhost:3000')
    // Теперь можно открыть браузер или Postman и стучаться к серверу
  }
)