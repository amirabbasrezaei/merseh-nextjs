#!/usr/bin/env bash
# Build the app image on this Ubuntu server, start the stack, then remove
# stopped containers from this project, unused images on the host, and the
# Docker build cache.
#
# First-time server setup:
#   Install Docker Engine and the Compose plugin, then:
#   cp .env.example .env
#   # set https public URLs, CADDY_EMAIL, and secrets
#   # point DNS for the site and files hosts at this server
#   bash scripts/deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "The Docker Compose plugin is not installed (docker compose)."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.example to .env and fill production values."
  exit 1
fi

read_var() {
  local key="$1"
  local raw value
  raw="$(grep -E "^${key}=" .env | tail -n 1 || true)"
  raw="${raw#"${key}="}"
  raw="${raw#"${raw%%[![:space:]]*}"}"
  raw="${raw%"${raw##*[![:space:]]}"}"
  value="${raw%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

require_var() {
  local key="$1"
  local value
  value="$(read_var "$key")"
  if [[ -z "${value}" ]]; then
    echo "Set ${key} in .env before deploying."
    exit 1
  fi
  printf '%s' "$value"
}

host_from_url() {
  local url="$1"
  url="${url#*://}"
  url="${url%%/*}"
  url="${url%%:*}"
  printf '%s' "$url"
}

require_https() {
  local key="$1"
  local value="$2"
  if [[ "${value}" != https://* ]]; then
    echo "${key} must be an https URL so Caddy can obtain a certificate."
    exit 1
  fi
}

reject_local_host() {
  local key="$1"
  local host="$2"
  if [[ "${host}" == "localhost" || "${host}" == "127.0.0.1" || -z "${host}" ]]; then
    echo "${key} must be a public hostname, not ${host:-empty}."
    exit 1
  fi
}

base_url="$(require_var BASE_URL)"
files_url="$(require_var NEXT_PUBLIC_FILES_ENDPOINT)"
require_https BASE_URL "$base_url"
require_https NEXT_PUBLIC_FILES_ENDPOINT "$files_url"
require_var JWT_PRIVATE_KEY >/dev/null
require_var POSTGRES_USER >/dev/null
require_var POSTGRES_PASSWORD >/dev/null
require_var POSTGRES_DB >/dev/null
require_var MINIO_ROOT_USER >/dev/null
require_var MINIO_ROOT_PASSWORD >/dev/null
require_var MINIO_ACCESS_KEY >/dev/null
require_var MINIO_SECRET_KEY >/dev/null
require_var CADDY_EMAIL >/dev/null

site_host="$(read_var CADDY_SITE_HOST)"
files_host="$(read_var CADDY_FILES_HOST)"
if [[ -z "${site_host}" ]]; then
  site_host="$(host_from_url "$base_url")"
fi
if [[ -z "${files_host}" ]]; then
  files_host="$(host_from_url "$files_url")"
fi
reject_local_host BASE_URL "$site_host"
reject_local_host NEXT_PUBLIC_FILES_ENDPOINT "$files_host"
if [[ "${site_host}" == "${files_host}" ]]; then
  echo "The site host and files host must differ so Caddy can route each one."
  exit 1
fi

export CADDY_SITE_HOST="$site_host"
export CADDY_FILES_HOST="$files_host"
export CADDY_EMAIL="$(read_var CADDY_EMAIL)"

compose=(docker compose -f docker-compose.prod.yml)

echo "Building the app image on this server..."
"${compose[@]}" build app

echo "Starting the stack..."
"${compose[@]}" up -d --remove-orphans --force-recreate app caddy postgres-backup

echo "Removing stopped containers for the mehrnil project..."
docker container prune -f --filter "label=com.docker.compose.project=mehrnil"

echo "Removing unused images on this host..."
docker image prune -af

echo "Removing the Docker build cache..."
docker builder prune -af

echo "Deploy finished."
echo "Site:  https://${site_host}"
echo "Files: https://${files_host}"
echo "Backups: ${ROOT}/backups"
"${compose[@]}" ps
