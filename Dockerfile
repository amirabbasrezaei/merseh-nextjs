# Builds the Next.js app on the server with Yarn. Migrations run when the
# container starts, so the image build does not need a reachable database.

FROM node:22-bookworm-slim AS builder

WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# prisma.config.ts requires DATABASE_URL to load. Generate does not connect.
ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/mehrnil
ENV NEXT_TELEMETRY_DISABLED=1

# Public values are inlined into the client bundle. Pass them from the server .env.
ARG BASE_URL
ARG NEXT_PUBLIC_FILES_ENDPOINT
ARG NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
ARG NEXT_PUBLIC_MAPBOX_SECRET_TOKEN
ENV BASE_URL=$BASE_URL
ENV NEXT_PUBLIC_FILES_ENDPOINT=$NEXT_PUBLIC_FILES_ENDPOINT
ENV NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN=$NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
ENV NEXT_PUBLIC_MAPBOX_SECRET_TOKEN=$NEXT_PUBLIC_MAPBOX_SECRET_TOKEN

RUN yarn prisma generate \
  && yarn next build \
  && yarn install --frozen-lockfile --production --ignore-scripts

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --home-dir /app --shell /bin/sh nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/app

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --chown=nextjs:nodejs docker/entrypoint.sh /entrypoint.sh

RUN chmod 755 /entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
