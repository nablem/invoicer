# --- Étape 1 : Dépendances ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# --- Étape 2 : Build ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV DATABASE_URL="file:./build.db"
RUN npx prisma db push
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Étape 3 : Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Création du dossier data pour SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 1. Copie du moteur Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 2. FIX : On force la copie de la CLI Prisma et des moteurs pour que "npx prisma" fonctionne en prod
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# On appelle le binaire directement via son chemin dans node_modules
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js db push --accept-data-loss && node server.js"]