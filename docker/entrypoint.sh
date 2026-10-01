#!/bin/sh
set -eu

cd /app

echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec ./node_modules/.bin/next start --hostname "${HOSTNAME:-0.0.0.0}" --port "${PORT:-3000}"
