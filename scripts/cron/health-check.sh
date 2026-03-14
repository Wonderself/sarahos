#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Service Health Check (Docker/Coolify)
# Runs: every 5 minutes
# Checks containers health via Docker
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
ALERT_FILE="/tmp/freenzy-health-alert"

SERVICES_DOWN=""

# Check PostgreSQL container
PG_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928 2>/dev/null || echo "not_found")
if [ "$PG_HEALTH" != "healthy" ]; then
  SERVICES_DOWN="${SERVICES_DOWN}\n❌ PostgreSQL (${PG_HEALTH})"
fi

# Check Redis container
REDIS_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' freenzy-redis-ewcwwk0wocw0cw0kccsw4kcw-152128112636 2>/dev/null || echo "not_found")
if [ "$REDIS_HEALTH" != "healthy" ]; then
  SERVICES_DOWN="${SERVICES_DOWN}\n❌ Redis (${REDIS_HEALTH})"
fi

# Check Backend container
BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' backend-ewcwwk0wocw0cw0kccsw4kcw-152128124068 2>/dev/null || echo "not_found")
if [ "$BACKEND_HEALTH" != "healthy" ]; then
  SERVICES_DOWN="${SERVICES_DOWN}\n❌ Backend (${BACKEND_HEALTH})"
fi

# Check Dashboard container
DASH_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' dashboard-ewcwwk0wocw0cw0kccsw4kcw-152128170233 2>/dev/null || echo "not_found")
if [ "$DASH_HEALTH" != "healthy" ]; then
  SERVICES_DOWN="${SERVICES_DOWN}\n❌ Dashboard (${DASH_HEALTH})"
fi

if [ -n "$SERVICES_DOWN" ]; then
  if [ ! -f "$ALERT_FILE" ] || [ $(( $(date +%s) - $(stat -c %Y "$ALERT_FILE" 2>/dev/null || echo 0) )) -gt 900 ]; then
    bash "$NOTIFY" "🔴 <b>SERVICES DOWN — Freenzy</b>
$(echo -e "$SERVICES_DOWN")

Verifiez: <code>docker ps</code>
Restart: <code>docker restart [container]</code>"
    touch "$ALERT_FILE"
  fi
else
  if [ -f "$ALERT_FILE" ]; then
    bash "$NOTIFY" "🟢 <b>Tous les services Freenzy sont OK</b>

✅ PostgreSQL
✅ Redis
✅ Backend
✅ Dashboard"
    rm -f "$ALERT_FILE"
  fi
fi
