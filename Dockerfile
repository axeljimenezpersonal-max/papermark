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
# Railway entrega las variables del servicio como build args, pero Docker solo
# las expone al RUN si se declaran con ARG. Sin esto, `next build` truena con
# "Invalid `has` item" (le falta NEXT_PUBLIC_WEBHOOK_BASE_HOST) y con los
# constructores de Hanko y Slack, que exigen valor al cargar el módulo.
# Los defaults son de respaldo: si la variable existe en Railway, Railway gana.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BASE_URL=https://vault.sinapsys.mx
ARG NEXT_PUBLIC_MARKETING_URL=https://sinapsys.mx
ARG NEXT_PUBLIC_APP_BASE_HOST=vault.sinapsys.mx
ARG NEXT_PUBLIC_WEBHOOK_BASE_URL=https://webhooks.sinapsys.mx
ARG NEXT_PUBLIC_WEBHOOK_BASE_HOST=webhooks.sinapsys.mx
ARG NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
ARG NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST=placeholder.r2.cloudflarestorage.com
ARG HANKO_API_KEY=self-host-no-passkeys
ARG NEXT_PUBLIC_HANKO_TENANT_ID=self-host-no-passkeys
ARG SLACK_CLIENT_ID=self-host-unused
ARG SLACK_CLIENT_SECRET=self-host-unused

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_MARKETING_URL=$NEXT_PUBLIC_MARKETING_URL \
    NEXT_PUBLIC_APP_BASE_HOST=$NEXT_PUBLIC_APP_BASE_HOST \
    NEXT_PUBLIC_WEBHOOK_BASE_URL=$NEXT_PUBLIC_WEBHOOK_BASE_URL \
    NEXT_PUBLIC_WEBHOOK_BASE_HOST=$NEXT_PUBLIC_WEBHOOK_BASE_HOST \
    NEXT_PUBLIC_UPLOAD_TRANSPORT=$NEXT_PUBLIC_UPLOAD_TRANSPORT \
    NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST=$NEXT_PRIVATE_UPLOAD_DISTRIBUTION_HOST \
    HANKO_API_KEY=$HANKO_API_KEY \
    NEXT_PUBLIC_HANKO_TENANT_ID=$NEXT_PUBLIC_HANKO_TENANT_ID \
    SLACK_CLIENT_ID=$SLACK_CLIENT_ID \
    SLACK_CLIENT_SECRET=$SLACK_CLIENT_SECRET \
    NEXT_TELEMETRY_DISABLED=1

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
