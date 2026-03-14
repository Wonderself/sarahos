#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — PostgreSQL Backup (Docker)
# Runs: every night at 2:00 AM
# Keeps last 7 backups
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"

PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"
BACKUP_DIR="/root/backups/freenzy"
DB_NAME="freenzy"
DB_USER="freenzy"
KEEP_DAYS=7
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

if docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_FILE"; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete -print | wc -l)
  TOTAL=$(ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)

  bash "$NOTIFY" "💾 <b>Backup PostgreSQL OK</b>

Fichier: ${DB_NAME}_${DATE}.sql.gz
Taille: ${BACKUP_SIZE}
Conserves: ${TOTAL} (${KEEP_DAYS} derniers jours)
Supprimes: ${DELETED}"
else
  bash "$NOTIFY" "🚨 <b>ECHEC Backup PostgreSQL</b>

Base: ${DB_NAME}
Date: ${DATE}

Action requise !"
  rm -f "$BACKUP_FILE"
fi
