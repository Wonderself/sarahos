#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Service Health Check (Docker/Coolify)
# Runs: every 5 minutes
# Checks containers health via Docker
# Uses dynamic container name detection (survives Coolify redeploys)
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
ALERT_FILE="/tmp/freenzy-health-alert"

SERVICES_DOWN=""

# Dynamic container name detection (matches partial name)
find_container() {
  docker ps --format '{{.Names}}' --filter "name=$1" 2>/dev/null | head -1
}

check_health() {
  local pattern="$1"
  local label="$2"
  local container=$(find_container "$pattern")
  if [ -z "$container" ]; then
    SERVICES_DOWN="${SERVICES_DOWN}\n❌ ${label} (not_found)"
    return
  fi
  local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
  if [ "$health" != "healthy" ] && [ "$health" != "" ]; then
    # Some containers don't have health checks — check if running
    local state=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
    if [ "$state" != "running" ]; then
      SERVICES_DOWN="${SERVICES_DOWN}\n❌ ${label} (${state})"
    fi
  fi
}

# Check all services with dynamic names
check_health "freenzy-postgres" "PostgreSQL"
check_health "freenzy-redis" "Redis"
check_health "backend-" "Backend"
check_health "dashboard-" "Dashboard"

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
