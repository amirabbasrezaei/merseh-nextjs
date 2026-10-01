#!/bin/sh
# Daily pg_dump of the compose Postgres service. Keeps BACKUP_RETAIN_DAYS dumps.
set -eu
set -o pipefail

retain_days="${BACKUP_RETAIN_DAYS:-14}"
mkdir -p /backups

seconds_until_three_am() {
  now_h=$(date +%H)
  now_m=$(date +%M)
  now_s=$(date +%S)
  now_h=$((10#$now_h))
  now_m=$((10#$now_m))
  now_s=$((10#$now_s))
  now_secs=$((now_h * 3600 + now_m * 60 + now_s))
  target=$((3 * 3600))
  if [ "$now_secs" -lt "$target" ]; then
    echo $((target - now_secs))
  else
    echo $((86400 - now_secs + target))
  fi
}

backup() {
  stamp=$(date +%Y%m%d-%H%M%S)
  file="/backups/mehrnil-${stamp}.sql.gz"
  partial="${file}.partial"
  echo "Writing ${file}"
  if pg_dump --no-owner --no-acl | gzip -c > "$partial"; then
    mv "$partial" "$file"
  else
    rm -f "$partial"
    echo "Backup failed"
    return 1
  fi
  find /backups -name 'mehrnil-*.sql.gz' -type f -mtime +"$retain_days" -delete
  find /backups -name 'mehrnil-*.sql.gz.partial' -type f -mtime +1 -delete
}

# One dump shortly after the container starts, then every day at 03:00 (BACKUP_TZ).
sleep 20
backup
while true; do
  sleep "$(seconds_until_three_am)"
  backup
done
