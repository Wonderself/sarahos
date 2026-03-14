#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Disk & Docker Monitor
# Runs: every hour
# Alerts via Telegram if disk > 80%
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
THRESHOLD=80

# Check main disk usage
DISK_USAGE=$(df / | awk 'NR==2 {gsub("%",""); print $5}')
DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}')
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')

# Check Docker disk usage
DOCKER_SIZE="N/A"
if command -v docker &> /dev/null; then
  DOCKER_SIZE=$(docker system df --format '{{.Size}}' 2>/dev/null | head -1 || echo "N/A")
fi

if [ "$DISK_USAGE" -ge "$THRESHOLD" ]; then
  bash "$NOTIFY" "🚨 <b>ALERTE DISK FREENZY</b>

Utilisation: <b>${DISK_USAGE}%</b> (seuil: ${THRESHOLD}%)
Disponible: ${DISK_AVAIL} / ${DISK_TOTAL}
Docker: ${DOCKER_SIZE}

⚠️ Risque de crash PostgreSQL si le disque est plein.
Action: <code>docker system prune -f</code>"
fi

# Also check Docker specifically
if command -v docker &> /dev/null; then
  DOCKER_RECLAIMABLE=$(docker system df --format '{{.Reclaimable}}' 2>/dev/null | head -1 || echo "0B")
  # Alert if more than 5GB reclaimable
  RECLAIM_BYTES=$(echo "$DOCKER_RECLAIMABLE" | grep -oP '[\d.]+' | head -1)
  RECLAIM_UNIT=$(echo "$DOCKER_RECLAIMABLE" | grep -oP '[A-Z]+' | head -1)
  if [ "$RECLAIM_UNIT" = "GB" ] && [ "$(echo "$RECLAIM_BYTES > 5" | bc 2>/dev/null)" = "1" ]; then
    bash "$NOTIFY" "🐳 <b>Docker cache volumineux</b>

Recuperable: ${DOCKER_RECLAIMABLE}
Action: <code>docker system prune -f</code>"
  fi
fi
