#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Briefing Matinal Complet
# Runs: every day at 8:00 AM
# Adapte pour Docker/Coolify
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
source "$SCRIPT_DIR/../../.env" 2>/dev/null

# Container names (Coolify)
PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"
REDIS_CONTAINER="freenzy-redis-ewcwwk0wocw0cw0kccsw4kcw-152128112636"
BACKEND_CONTAINER="backend-ewcwwk0wocw0cw0kccsw4kcw-152128124068"
DASH_CONTAINER="dashboard-ewcwwk0wocw0cw0kccsw4kcw-152128170233"

# ── Date en francais ──
DATE_FR=$(date +"%A %d %B %Y" | sed 's/Monday/Lundi/;s/Tuesday/Mardi/;s/Wednesday/Mercredi/;s/Thursday/Jeudi/;s/Friday/Vendredi/;s/Saturday/Samedi/;s/Sunday/Dimanche/;s/January/janvier/;s/February/fevrier/;s/March/mars/;s/April/avril/;s/May/mai/;s/June/juin/;s/July/juillet/;s/August/aout/;s/September/septembre/;s/October/octobre/;s/November/novembre/;s/December/decembre/')
HEURE=$(date +"%Hh%M")

# ═══════════════════════════════════════
# 1. SERVEUR HOST
# ═══════════════════════════════════════
UPTIME=$(uptime -p 2>/dev/null | sed 's/up //' || echo "N/A")
DISK_PCT=$(df / | awk 'NR==2 {gsub("%",""); print $5}')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
RAM_USED=$(free -h | awk 'NR==2 {print $3}')
RAM_TOTAL=$(free -h | awk 'NR==2 {print $2}')
RAM_FREE=$(free -h | awk 'NR==2 {print $4}')
LOAD=$(uptime | awk -F'load average:' '{print $2}' | xargs)
CPU_CORES=$(nproc 2>/dev/null || echo "?")

DISK_EMOJI="✅"
[ "$DISK_PCT" -ge 70 ] && DISK_EMOJI="⚠️"
[ "$DISK_PCT" -ge 85 ] && DISK_EMOJI="🚨"

# ═══════════════════════════════════════
# 2. DOCKER GLOBAL
# ═══════════════════════════════════════
CONTAINERS_TOTAL=$(docker ps -a --format '.' 2>/dev/null | wc -l)
CONTAINERS_RUNNING=$(docker ps --format '.' 2>/dev/null | wc -l)
CONTAINERS_STOPPED=$((CONTAINERS_TOTAL - CONTAINERS_RUNNING))
DOCKER_IMAGES_SIZE=$(docker system df --format '{{.Type}}\t{{.Size}}' 2>/dev/null | grep Images | awk '{print $2}' || echo "N/A")
DOCKER_CONTAINERS_SIZE=$(docker system df --format '{{.Type}}\t{{.Size}}' 2>/dev/null | grep Containers | awk '{print $2}' || echo "N/A")
DOCKER_VOLUMES_SIZE=$(docker system df --format '{{.Type}}\t{{.Size}}' 2>/dev/null | grep Volumes | awk '{print $2}' || echo "N/A")
DOCKER_RECLAIMABLE=$(docker system df 2>/dev/null | awk 'NR>1 {print $NF}' | paste -sd', ' || echo "N/A")

# ═══════════════════════════════════════
# 3. SERVICES FREENZY (via Docker)
# ═══════════════════════════════════════
get_status() {
  local container=$1
  local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
  local running=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null)
  local uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container" 2>/dev/null | cut -dT -f1)

  if [ "$health" = "healthy" ]; then
    echo "✅ Healthy (depuis $uptime)"
  elif [ "$running" = "true" ]; then
    echo "⚠️ Running (no healthcheck)"
  else
    echo "❌ DOWN"
  fi
}

PG_STATUS=$(get_status "$PG_CONTAINER")
REDIS_STATUS=$(get_status "$REDIS_CONTAINER")
BACKEND_STATUS=$(get_status "$BACKEND_CONTAINER")
DASH_STATUS=$(get_status "$DASH_CONTAINER")

# ═══════════════════════════════════════
# 4. BASE DE DONNEES (via docker exec)
# ═══════════════════════════════════════
DB_SECTION=""
DB_SIZE=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
  "SELECT pg_size_pretty(pg_database_size('freenzy'));" 2>/dev/null | xargs)

if [ -n "$DB_SIZE" ] && [ "$DB_SIZE" != "" ]; then
  USER_COUNT=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs || echo "N/A")
  USER_24H=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours';" 2>/dev/null | xargs || echo "0")
  CONV_COUNT=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM conversations WHERE created_at > NOW() - INTERVAL '24 hours';" 2>/dev/null | xargs || echo "N/A")
  CONV_TOTAL=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM conversations;" 2>/dev/null | xargs || echo "N/A")
  CREDIT_TOTAL=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COALESCE(SUM(credits_balance), 0) FROM users;" 2>/dev/null | xargs || echo "N/A")
  ACTIVE_CONN=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='freenzy';" 2>/dev/null | xargs || echo "N/A")
  TABLE_COUNT=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs || echo "N/A")

  DB_SECTION="
📊 <b>Base de donnees</b>
Taille: ${DB_SIZE}
Tables: ${TABLE_COUNT}
Connexions: ${ACTIVE_CONN}
Utilisateurs: ${USER_COUNT} (${USER_24H} nouveaux 24h)
Conversations: ${CONV_TOTAL} total (${CONV_COUNT} en 24h)
Credits en circulation: ${CREDIT_TOTAL}"
fi

# ═══════════════════════════════════════
# 5. REDIS STATS (via docker exec)
# ═══════════════════════════════════════
REDIS_SECTION=""
REDIS_KEYS=$(docker exec "$REDIS_CONTAINER" redis-cli DBSIZE 2>/dev/null | awk '{print $2}' || echo "N/A")
REDIS_MEM=$(docker exec "$REDIS_CONTAINER" redis-cli INFO memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r' || echo "N/A")
if [ "$REDIS_KEYS" != "N/A" ]; then
  REDIS_SECTION="
🔴 <b>Redis</b>
Cles: ${REDIS_KEYS}
Memoire: ${REDIS_MEM}"
fi

# ═══════════════════════════════════════
# 6. BACKUPS
# ═══════════════════════════════════════
BACKUP_SECTION="💾 Backups: Aucun configure"
if ls /root/backups/freenzy/*.sql.gz 1>/dev/null 2>&1; then
  LAST_BACKUP_FILE=$(ls -t /root/backups/freenzy/*.sql.gz | head -1)
  LAST_BACKUP_DATE=$(stat -c '%y' "$LAST_BACKUP_FILE" 2>/dev/null | cut -d. -f1)
  LAST_BACKUP_SIZE=$(du -h "$LAST_BACKUP_FILE" 2>/dev/null | cut -f1)
  BACKUP_COUNT=$(ls /root/backups/freenzy/*.sql.gz 2>/dev/null | wc -l)
  BACKUP_SECTION="💾 <b>Backups</b>
Dernier: ${LAST_BACKUP_DATE} (${LAST_BACKUP_SIZE})
Total: ${BACKUP_COUNT} sauvegardes"
fi

# ═══════════════════════════════════════
# 7. PURGE RGPD
# ═══════════════════════════════════════
PURGE_SECTION=""
OLD_CONV=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c \
  "SELECT COUNT(*) FROM conversations WHERE created_at < NOW() - INTERVAL '90 days';" 2>/dev/null | xargs || echo "0")
if [ -n "$OLD_CONV" ] && [ "$OLD_CONV" != "0" ] && [ "$OLD_CONV" != "" ]; then
  PURGE_SECTION="
🧹 <b>RGPD</b>: ${OLD_CONV} conversations > 90j a purger"
fi

# ═══════════════════════════════════════
# 8. SECURITE
# ═══════════════════════════════════════
FAILED_SSH=$(grep -c "Failed password" /var/log/auth.log 2>/dev/null || echo "N/A")
LAST_LOGIN=$(last -1 -R 2>/dev/null | head -1 | awk '{print $3, $4, $5, $6}' || echo "N/A")

# ═══════════════════════════════════════
# 9. CRONS & COOLIFY
# ═══════════════════════════════════════
CRON_COUNT=$(crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | wc -l)
COOLIFY_STATUS=$(docker inspect --format='{{.State.Health.Status}}' coolify 2>/dev/null || echo "N/A")

# ═══════════════════════════════════════
# ENVOI
# ═══════════════════════════════════════

MSG="☀️ <b>Briefing Freenzy — ${DATE_FR}</b>
<i>${HEURE} — Rapport automatique</i>

━━━━━━━━━━━━━━━━━━

🖥 <b>Serveur</b>
Uptime: ${UPTIME}
CPU: ${CPU_CORES} cores | Charge: ${LOAD}
RAM: ${RAM_USED} / ${RAM_TOTAL} (${RAM_FREE} libre)
${DISK_EMOJI} Disque: ${DISK_PCT}% | ${DISK_AVAIL} libre / ${DISK_TOTAL}

🐳 <b>Docker</b>
Containers: ${CONTAINERS_RUNNING} actifs / ${CONTAINERS_STOPPED} stoppes
Images: ${DOCKER_IMAGES_SIZE} | Volumes: ${DOCKER_VOLUMES_SIZE}
Recuperable: ${DOCKER_RECLAIMABLE}

━━━━━━━━━━━━━━━━━━

🔍 <b>Services Freenzy</b>
PostgreSQL: ${PG_STATUS}
Redis: ${REDIS_STATUS}
Backend: ${BACKEND_STATUS}
Dashboard: ${DASH_STATUS}
Coolify: ${COOLIFY_STATUS}
${DB_SECTION}
${REDIS_SECTION}

━━━━━━━━━━━━━━━━━━

${BACKUP_SECTION}
${PURGE_SECTION}

🔒 <b>Securite</b>
SSH echoues: ${FAILED_SSH}
Derniere connexion: ${LAST_LOGIN}
Crons actifs: ${CRON_COUNT}

━━━━━━━━━━━━━━━━━━

Bonne journee ! 🚀"

bash "$NOTIFY" "$MSG"
