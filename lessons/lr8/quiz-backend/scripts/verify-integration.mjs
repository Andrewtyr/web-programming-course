#!/usr/bin/env node
/**
 * Проверка связки «как фронт»: health → OAuth test code → /me → сессия → ответ → submit.
 *
 * Важно: сначала в ДРУГОМ терминале запустите сервер:
 *   npm run dev
 *
 *   node scripts/verify-integration.mjs
 *   BASE_URL=http://localhost:3001 node scripts/verify-integration.mjs
 */

const BASE = process.env.BASE_URL || 'http://localhost:3001'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function checkUserShape(u, label) {
  assert(typeof u?.id === 'string', `${label}: user.id string`)
  assert(typeof u?.githubUsername === 'string', `${label}: user.githubUsername`)
  assert(typeof u?.avatarUrl === 'string', `${label}: user.avatarUrl`)
  assert(u?.role === 'student' || u?.role === 'admin', `${label}: user.role`)
  assert(typeof u?.createdAt === 'string', `${label}: user.createdAt`)
  assert('githubId' in u && typeof u.githubId === 'number', `${label}: user.githubId number`)
}

function printConnectionHelp(err) {
  const code = err?.cause?.code || err?.code || ''
  console.error('\n──────── Нет связи с сервером ────────')
  console.error('Ошибка:', err.message, code ? `(${code})` : '')
  console.error(`
Скрипт ходит на: ${BASE}

Что сделать:
  1. Откройте ВТОРОЙ терминал и запустите бэкенд:
       cd lessons/lr8/quiz-backend
       npm run dev

  2. Дождитесь строки вроде: Server running on http://localhost:3001

  3. Убедитесь, что в браузере открывается: ${BASE}/health  (должен быть JSON {"status":"ok"})

  4. Если порт не 3001 — смотрите .env (PORT=...) и задайте BASE_URL, например:
     PowerShell:  $env:BASE_URL="http://localhost:ВАШ_ПОРТ"; npm run verify:integration
     cmd:          set BASE_URL=http://localhost:ВАШ_ПОРТ && npm run verify:integration

  5. На Windows иногда помогает: BASE_URL=http://127.0.0.1:3001 npm run verify:integration
`)
}

async function req(url, init) {
  try {
    return await fetch(url, init)
  } catch (e) {
    printConnectionHelp(e)
    process.exit(1)
  }
}

/** Не читать body в assert() — иначе при успехе тело уже прочитано и .json() падает. */
async function requireOk(res, label) {
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`${label} ${res.status} ${t}`)
  }
}

async function main() {
  console.log('Проверка API на:', BASE)
  console.log('(сервер должен быть уже запущен: npm run dev)')
  console.log('Если POST /api/sessions вернёт 400 про вопросы — один раз выполни: npx prisma db seed\n')

  const h = await req(`${BASE}/health`)
  assert(h.ok, `/health ${h.status}`)
  const hj = await h.json()
  assert(hj.status === 'ok', 'health body.status')
  console.log('✓ GET /health')

  const authRes = await req(`${BASE}/api/auth/github/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'test_verify_integration' }),
  })
  await requireOk(authRes, 'callback')
  const authJson = await authRes.json()
  assert(typeof authJson.token === 'string', 'AuthResponse.token')
  assert(authJson.user, 'AuthResponse.user')
  checkUserShape(authJson.user, 'AuthResponse')
  const token = authJson.token
  console.log('✓ POST /api/auth/github/callback (test code)')

  const meRes = await req(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert(meRes.ok, `/me ${meRes.status}`)
  const me = await meRes.json()
  checkUserShape(me, 'GET /me')
  assert(!me.user, 'GET /me must be flat User, not { user }')
  console.log('✓ GET /api/auth/me')

  const sessionRes = await req(`${BASE}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // Без questionCount бэкенд берёт min(10, число вопросов в пуле) — не падаем при < 10 вопросов в БД
    body: JSON.stringify({ difficulty: 'medium' }),
  })
  await requireOk(sessionRes, 'POST sessions')
  const session = await sessionRes.json()
  assert(sessionRes.status === 201, 'sessions status 201')
  assert(typeof session.sessionId === 'string', 'SessionResponse.sessionId')
  assert(Array.isArray(session.questions), 'SessionResponse.questions[]')
  assert(typeof session.totalQuestions === 'number', 'SessionResponse.totalQuestions')
  assert(session.mode === 'game', 'SessionResponse.mode')
  const sid = session.sessionId
  console.log('✓ POST /api/sessions → SessionResponse')

  if (session.questions.length === 0) {
    console.log('⚠ В БД нет вопросов — пропуск answers/submit. Добавьте вопросы (admin или сид).')
    console.log('\nЦепочка контракта до сессии проверена.')
    return
  }

  const q0 = session.questions[0]
  const qid = q0.id
  const isEssay = q0.type === 'essay'
  const body = isEssay
    ? { questionId: qid, text: 'Проверочный ответ для интеграции.' }
    : { questionId: qid, selectedOptions: [0] }

  const ansRes = await req(`${BASE}/api/sessions/${sid}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const ansText = await ansRes.text()
  assert(ansRes.ok || ansRes.status === 202, `answers ${ansRes.status} ${ansText}`)
  const ans = JSON.parse(ansText)
  if (isEssay) {
    assert(ans.status === 'pending', 'AnswerPending.status')
  } else {
    assert(typeof ans.answerId === 'string', 'AnswerResult.answerId')
    assert(typeof ans.pointsEarned === 'number', 'AnswerResult.pointsEarned')
    assert(['correct', 'incorrect', 'partial', 'pending'].includes(ans.status), 'AnswerResult.status')
  }
  console.log(`✓ POST .../answers (${isEssay ? '202 pending' : '200 result'})`)

  const subRes = await req(`${BASE}/api/sessions/${sid}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  })
  const subText = await subRes.text()
  assert(subRes.ok, `submit ${subRes.status} ${subText}`)
  const results = JSON.parse(subText)
  assert(results.sessionId === sid, 'SessionResults.sessionId')
  assert(results.score && typeof results.score.earned === 'number', 'SessionResults.score.earned')
  console.log('✓ POST .../submit → SessionResults')

  console.log('\nВсе шаги пройдены: бэкенд отвечает в формате, ожидаемом фронтом (OpenAPI LR5).')
}

main().catch((e) => {
  console.error('\nОшибка:', e.message)
  process.exit(1)
})
