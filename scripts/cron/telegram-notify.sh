#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Telegram Notification Helper
# Usage: ./telegram-notify.sh "Message here"
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../.env" 2>/dev/null

CHAT_ID="6238804698"
BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"

if [ -z "$BOT_TOKEN" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN not set in .env"
  exit 1
fi

MESSAGE="$1"
PARSE_MODE="${2:-HTML}"

curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"${CHAT_ID}\", \"text\": \"${MESSAGE}\", \"parse_mode\": \"${PARSE_MODE}\"}" \
  > /dev/null 2>&1
