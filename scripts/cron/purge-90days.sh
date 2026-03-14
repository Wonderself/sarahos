#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Data Purge RGPD (Docker)
# Runs: every night at 3:00 AM
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"

PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"
DB_NAME="freenzy"
DB_USER="freenzy"

PURGE_REPORT=""
TOTAL_PURGED=0

run_purge() {
  local table=$1
  local label=$2
  local count=$(docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "DELETE FROM ${table} WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id;" 2>/dev/null | grep -c ".")
  if [ "$count" -gt 0 ]; then
    PURGE_REPORT="${PURGE_REPORT}\n🗑 ${label}: ${count}"
    TOTAL_PURGED=$((TOTAL_PURGED + count))
  fi
}

run_purge "conversations" "Conversations"
run_purge "audit_logs" "Audit logs"
run_purge "events" "Events"
run_purge "token_usage" "Token usage"

# Temp files on host
TEMP_COUNT=$(find /tmp/freenzy-* -mtime +90 -delete -print 2>/dev/null | wc -l)
if [ "$TEMP_COUNT" -gt 0 ]; then
  PURGE_REPORT="${PURGE_REPORT}\n🗑 Fichiers temp: ${TEMP_COUNT}"
  TOTAL_PURGED=$((TOTAL_PURGED + TEMP_COUNT))
fi

if [ "$TOTAL_PURGED" -gt 0 ]; then
  bash "$NOTIFY" "🧹 <b>Purge RGPD (90 jours)</b>
$(echo -e "$PURGE_REPORT")

Total: ${TOTAL_PURGED} elements purges"
else
  if [ "$(date +%u)" = "1" ]; then
    bash "$NOTIFY" "🧹 <b>Purge RGPD</b> — RAS, rien a purger cette semaine."
  fi
fi
