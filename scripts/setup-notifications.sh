#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Setup Notification System
# Run this once to apply migration + install crons
# Usage: bash scripts/setup-notifications.sh
# ═══════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"

echo "═══════════════════════════════════════"
echo "Freenzy.io — Notification System Setup"
echo "═══════════════════════════════════════"

# ── Step 1: Apply SQL Migration ──
echo ""
echo "[1/3] Applying SQL migration..."
docker exec -i "$PG_CONTAINER" psql -U freenzy -d freenzy < "$SCRIPT_DIR/migrate-email-sequence.sql"
echo "  OK: Tables email_sequence_log + user_notification_preferences created"

# ── Step 2: Verify tables ──
echo ""
echo "[2/3] Verifying tables..."
docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -c "\dt email_sequence_log"
docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -c "\dt user_notification_preferences"

# ── Step 3: Install cron entries ──
echo ""
echo "[3/3] Installing cron entries..."

# Check if already installed
if crontab -l 2>/dev/null | grep -q "email-sequence.sh"; then
    echo "  SKIP: email-sequence.sh already in crontab"
else
    (crontab -l 2>/dev/null; printf "\n# Email sequence — toutes les heures\n30 * * * * /root/projects/freenzy/sarahos/scripts/cron/email-sequence.sh\n") | crontab -
    echo "  OK: email-sequence.sh added (every hour at :30)"
fi

if crontab -l 2>/dev/null | grep -q "user-reports.sh"; then
    echo "  SKIP: user-reports.sh already in crontab"
else
    (crontab -l 2>/dev/null; printf "\n# User reports — chaque jour a 9h\n0 9 * * * /root/projects/freenzy/sarahos/scripts/cron/user-reports.sh\n") | crontab -
    echo "  OK: user-reports.sh added (daily at 09:00)"
fi

echo ""
echo "═══════════════════════════════════════"
echo "Setup complete! Current crontab:"
echo "═══════════════════════════════════════"
crontab -l

echo ""
echo "To test manually:"
echo "  bash /root/projects/freenzy/sarahos/scripts/cron/email-sequence.sh"
echo "  bash /root/projects/freenzy/sarahos/scripts/cron/user-reports.sh"
