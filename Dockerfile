# Bóveda SINAPSYS — Papermark self-host en Railway.
# Guía completa: docs/BOVEDA-DESPLIEGUE.md en el repo SINAPSYS.
#
# Papermark exige Node >= 24 (package.json, campo "engines").

FROM node:24-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Dependencias ---
# prisma/ se copia antes de npm ci porque el postinstall corre "prisma generate".
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# --- Build ---
# Las variables NEXT_PUBLIC_* quedan horneadas en el build: Railway las
# inyecta durante la construcción, así que deben estar capturadas en el
# servicio ANTES del primer deploy.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app ./
EXPOSE 3000
# Las migraciones corren al arrancar (aquí ya hay acceso a Postgres).
# Railway inyecta PORT; next lo toma con -p.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p ${PORT:-3000}"]
