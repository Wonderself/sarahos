#!/bin/bash
# ═══════════════════════════════════════════════════════
# Freenzy.io — Telegram /claude Command Handler
# Polls Telegram for /claude commands and executes them
# via Claude Code CLI in the background
#
# Usage: bash claude-bot.sh (runs as daemon)
# Stop: kill $(cat /tmp/freenzy-claude-bot.pid)
# ═══════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/root/projects/freenzy/sarahos"
LOG_DIR="/root/logs"
PID_FILE="/tmp/freenzy-claude-bot.pid"
OFFSET_FILE="/tmp/freenzy-claude-bot-offset"

source "$PROJECT_DIR/.env" 2>/dev/null

BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
ADMIN_CHAT_ID="6238804698"
POLL_INTERVAL=3

if [ -z "$BOT_TOKEN" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN not set"
  exit 1
fi

# Write PID
echo $$ > "$PID_FILE"

# Get last offset (to not reprocess old messages)
OFFSET=0
[ -f "$OFFSET_FILE" ] && OFFSET=$(cat "$OFFSET_FILE")

send_message() {
  local chat_id="$1"
  local text="$2"
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\": \"${chat_id}\", \"text\": $(echo "$text" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'), \"parse_mode\": \"HTML\"}" \
    > /dev/null 2>&1
}

process_claude_command() {
  local instruction="$1"
  local msg_id="$2"
  local timestamp=$(date +%Y%m%d_%H%M%S)
  local log_file="${LOG_DIR}/telegram-task-${timestamp}.log"

  # Acknowledge
  send_message "$ADMIN_CHAT_ID" "⏳ <b>Claude Code lance la tache...</b>

📝 <code>${instruction}</code>

⏱ En cours — je te previens quand c'est fini."

  # Execute Claude Code CLI
  cd "$PROJECT_DIR"
  source ~/.nvm/nvm.sh 2>/dev/null

  # Run claude with the instruction, capture output
  timeout 600 claude -p "$instruction" --no-input > "$log_file" 2>&1
  EXIT_CODE=$?

  # Get summary (last 30 lines)
  SUMMARY=$(tail -30 "$log_file" | head -2000)
  LINE_COUNT=$(wc -l < "$log_file")

  if [ $EXIT_CODE -eq 0 ]; then
    # Check if files changed
    cd "$PROJECT_DIR"
    CHANGED_FILES=$(git diff --name-only 2>/dev/null)
    UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)
    ALL_CHANGES="${CHANGED_FILES}${UNTRACKED}"

    if [ -n "$ALL_CHANGES" ]; then
      FILE_COUNT=$(echo "$ALL_CHANGES" | grep -c "." || echo "0")

      # Auto commit and push
      git add -A
      COMMIT_MSG="telegram: ${instruction}"
      # Truncate commit msg if too long
      [ ${#COMMIT_MSG} -gt 72 ] && COMMIT_MSG="${COMMIT_MSG:0:69}..."
      git commit -m "$COMMIT_MSG" > /dev/null 2>&1

      PUSH_RESULT=""
      if git push origin main 2>&1; then
        PUSH_RESULT="
🚀 Git push OK — deploy Coolify en cours"
      else
        PUSH_RESULT="
⚠️ Git push echoue (verifier manuellement)"
      fi

      send_message "$ADMIN_CHAT_ID" "✅ <b>Tache terminee</b>

📝 <code>${instruction}</code>
📁 ${FILE_COUNT} fichiers modifies
📄 Log : ${LINE_COUNT} lignes
${PUSH_RESULT}

<b>Fichiers :</b>
<code>$(echo "$ALL_CHANGES" | head -15)</code>"

    else
      # No file changes (analysis, question, etc.)
      send_message "$ADMIN_CHAT_ID" "✅ <b>Tache terminee</b> (pas de modif fichiers)

📝 <code>${instruction}</code>
📄 Log : ${LINE_COUNT} lignes

<b>Resultat :</b>
<code>$(echo "$SUMMARY" | head -500)</code>"
    fi

  elif [ $EXIT_CODE -eq 124 ]; then
    send_message "$ADMIN_CHAT_ID" "⏰ <b>Timeout (10 min)</b>

📝 <code>${instruction}</code>
La tache a depasse 10 minutes.
Log partiel dans : ${log_file}"

  else
    send_message "$ADMIN_CHAT_ID" "❌ <b>Erreur (code ${EXIT_CODE})</b>

📝 <code>${instruction}</code>

<b>Dernières lignes :</b>
<code>$(tail -10 "$log_file" | head -500)</code>"
  fi
}

process_status_command() {
  local uptime=$(uptime -p 2>/dev/null | sed 's/up //')
  local disk=$(df -h / | awk 'NR==2 {print $5 " (" $4 " libre)"}')
  local containers=$(docker ps --format '{{.Names}}: {{.Status}}' 2>/dev/null | grep freenzy | head -5)
  local crons=$(crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | wc -l)
  local running_tasks=$(ls /tmp/freenzy-claude-task-* 2>/dev/null | wc -l)

  send_message "$ADMIN_CHAT_ID" "📊 <b>Status Freenzy</b>

🖥 Uptime: ${uptime}
💾 Disque: ${disk}
🐳 Containers:
<code>${containers}</code>
⏰ Crons actifs: ${crons}
🔄 Taches en cours: ${running_tasks}"
}

process_logs_command() {
  local last_logs=$(ls -t ${LOG_DIR}/telegram-task-*.log 2>/dev/null | head -5)
  if [ -z "$last_logs" ]; then
    send_message "$ADMIN_CHAT_ID" "📋 Aucun log de tache trouve."
    return
  fi

  local msg="📋 <b>5 dernières taches</b>\n"
  while IFS= read -r logfile; do
    local fname=$(basename "$logfile")
    local size=$(du -h "$logfile" | cut -f1)
    local first_line=$(head -1 "$logfile" | cut -c1-60)
    msg="${msg}\n📄 ${fname} (${size})\n<code>${first_line}...</code>\n"
  done <<< "$last_logs"

  send_message "$ADMIN_CHAT_ID" "$(echo -e "$msg")"
}

echo "🤖 Freenzy Claude Bot started (PID $$, polling every ${POLL_INTERVAL}s)"
send_message "$ADMIN_CHAT_ID" "🤖 <b>Claude Bot demarre</b>

Commandes disponibles :
/claude [instruction] — Execute une tache
/status — Status serveur
/logs — Dernières taches
/help — Aide"

# Main polling loop
while true; do
  # Get updates
  RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${OFFSET}&timeout=30" 2>/dev/null)

  if [ -z "$RESPONSE" ]; then
    sleep "$POLL_INTERVAL"
    continue
  fi

  # Parse updates with python3
  UPDATES=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if not data.get('ok') or not data.get('result'):
        sys.exit(0)
    for update in data['result']:
        uid = update['update_id']
        msg = update.get('message', {})
        chat_id = str(msg.get('chat', {}).get('id', ''))
        text = msg.get('text', '')
        msg_id = msg.get('message_id', '')
        print(f'{uid}|{chat_id}|{msg_id}|{text}')
except:
    pass
" 2>/dev/null)

  while IFS='|' read -r update_id chat_id msg_id text; do
    [ -z "$update_id" ] && continue

    # Update offset
    OFFSET=$((update_id + 1))
    echo "$OFFSET" > "$OFFSET_FILE"

    # Security: only process admin messages
    if [ "$chat_id" != "$ADMIN_CHAT_ID" ]; then
      send_message "$chat_id" "⛔ Acces refuse. Ce bot est reserve a l'administrateur."
      continue
    fi

    # Route commands
    case "$text" in
      /claude\ *)
        INSTRUCTION="${text#/claude }"
        # Run in background so bot keeps polling
        process_claude_command "$INSTRUCTION" "$msg_id" &
        ;;
      /status)
        process_status_command
        ;;
      /logs)
        process_logs_command
        ;;
      /help|/start)
        send_message "$ADMIN_CHAT_ID" "🤖 <b>Freenzy Claude Bot</b>

<b>Commandes :</b>
/claude [instruction] — Execute Claude Code
/status — Status serveur et containers
/logs — Dernières taches executees
/help — Cette aide

<b>Exemples :</b>
<code>/claude ajoute un bouton contact sur la homepage</code>
<code>/claude genere 3 articles blog SEO</code>
<code>/claude corrige les bugs TypeScript</code>
<code>/claude analyse les logs d'erreur</code>"
        ;;
      /*)
        send_message "$ADMIN_CHAT_ID" "❓ Commande inconnue. Tape /help"
        ;;
    esac

  done <<< "$UPDATES"

  sleep "$POLL_INTERVAL"
done
