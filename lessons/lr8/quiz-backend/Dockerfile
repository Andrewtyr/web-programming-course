# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Устойчивее к обрывам сети при `npm ci` (ECONNRESET / registry timeout внутри Docker)
ENV NPM_CONFIG_FETCH_RETRIES=10
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
ENV NPM_CONFIG_FETCH_TIMEOUT=600000

COPY package.json package-lock.json ./
# Без --ignore-scripts сработает postinstall (prisma generate), а схемы ещё нет в /app
RUN npm ci --ignore-scripts

# Для Prisma на node:-slim
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# prisma.config.ts читает DATABASE_URL; для generate реальное подключение не нужно — только валидная строка
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/prisma_generate_dummy"

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
