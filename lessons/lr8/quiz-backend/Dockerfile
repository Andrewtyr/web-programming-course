# syntax=docker/dockerfile:1
#
# Сборка production-образа backend (multi-stage):
#   1) builder — ставим зависимости, prisma generate, компилируем TS → dist/
#   2) runner — только runtime: node_modules без devDeps, dist, prisma-схемы; мало слоёв = меньше размер образа
#
# Запуск: CMD внизу — миграции к реальной БД, затем node dist/index.js.
# Порт внутри контейнера: 3000 (см. EXPOSE). С хоста порт задаётся в docker-compose (-p или ports:).

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Устойчивее к обрывам сети при `npm ci` (ECONNRESET / registry timeout внутри Docker)
ENV NPM_CONFIG_FETCH_RETRIES=10
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
ENV NPM_CONFIG_FETCH_TIMEOUT=600000

COPY package.json package-lock.json ./
# --ignore-scripts: иначе сработает postinstall (prisma generate) до COPY prisma/ — файлов схемы ещё нет
RUN npm ci --ignore-scripts

# OpenSSL — нужен Prisma и нативным модулям на slim-образе
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# prisma generate только генерирует клиент; реальная БД не нужна, но нужна синтаксически валидная DATABASE_URL
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/prisma_generate_dummy"

RUN npx prisma generate
RUN npm run build
# Убираем devDependencies — в финальном образе не нужны tsx, vitest и т.д.
RUN npm prune --omit=dev

# --- Финальный слой: только то, что нужно в рантайме ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./

# Порт процесса Node внутри контейнера (снаружи может быть 18080:3000 в compose)
EXPOSE 3000

# Сначала применяем миграции к БД из DATABASE_URL, потом стартуем сервер (см. docker-compose environment)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
