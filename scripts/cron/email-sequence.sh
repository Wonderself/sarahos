#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — Email Onboarding Sequence
# Runs: every hour via cron
# Checks users due for next email step
# Steps: J+0, J+2, J+5, J+10, J+15, J+21, J+30
# Sends summary via Telegram (admin)
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
source "$SCRIPT_DIR/../../.env" 2>/dev/null

# Container name (Coolify)
PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"

# Email step schedule: step_name:days_after_signup
STEPS=("j0:0" "j2:2" "j5:5" "j10:10" "j15:15" "j21:21" "j30:30")

# Email template subjects
declare -A STEP_SUBJECTS
STEP_SUBJECTS[j0]="Bienvenue sur Freenzy"
STEP_SUBJECTS[j2]="Premiers pas avec vos agents IA"
STEP_SUBJECTS[j5]="Cas d'usage concrets"
STEP_SUBJECTS[j10]="Fonctionnalites avancees"
STEP_SUBJECTS[j15]="Temoignages utilisateurs"
STEP_SUBJECTS[j21]="Offre speciale"
STEP_SUBJECTS[j30]="On ne vous oublie pas"

# Email template files (in /emails/)
declare -A STEP_FILES
STEP_FILES[j0]="email-j0-bienvenue.html"
STEP_FILES[j2]="email-j2-premiers-pas.html"
STEP_FILES[j5]="email-j5-cas-usage.html"
STEP_FILES[j10]="email-j10-fonctionnalites.html"
STEP_FILES[j15]="email-j15-temoignages.html"
STEP_FILES[j21]="email-j21-offre.html"
STEP_FILES[j30]="email-j30-relance.html"

HEURE=$(date +"%Hh%M")
DATE_SHORT=$(date +"%d/%m/%Y")
TOTAL_SENT=0
DETAILS=""

for STEP_DEF in "${STEPS[@]}"; do
    STEP_NAME="${STEP_DEF%%:*}"
    STEP_DAYS="${STEP_DEF##*:}"

    # Find users due for this step who haven't received it yet
    if [ "$STEP_NAME" = "j0" ]; then
        # j0: users who signed up in the last hour
        QUERY="
        SELECT u.id, u.email, COALESCE(u.name, '') as name
        FROM users u
        WHERE u.created_at > NOW() - INTERVAL '1 hour'
          AND NOT EXISTS (
              SELECT 1 FROM email_sequence_log esl
              WHERE esl.user_id = u.id
                AND esl.email_step = 'j0'
                AND esl.status IN ('sent', 'pending')
          )
        ORDER BY u.created_at ASC
        LIMIT 100;
        "
    else
        # j2..j30: users who signed up exactly N days ago (1h window)
        QUERY="
        SELECT u.id, u.email, COALESCE(u.name, '') as name
        FROM users u
        WHERE u.created_at <= NOW() - INTERVAL '${STEP_DAYS} days'
          AND u.created_at > NOW() - INTERVAL '${STEP_DAYS} days' - INTERVAL '1 hour'
          AND NOT EXISTS (
              SELECT 1 FROM email_sequence_log esl
              WHERE esl.user_id = u.id
                AND esl.email_step = '${STEP_NAME}'
                AND esl.status IN ('sent', 'pending')
          )
        ORDER BY u.created_at ASC
        LIMIT 100;
        "
    fi

    USERS=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -A -F'|' -c "$QUERY" 2>/dev/null)

    if [ -z "$USERS" ]; then
        continue
    fi

    while IFS='|' read -r USER_ID USER_EMAIL USER_NAME; do
        [ -z "$USER_ID" ] && continue

        # Log the send in email_sequence_log
        INSERT_QUERY="
        INSERT INTO email_sequence_log (user_id, email_step, channel, status, sent_at)
        VALUES ('${USER_ID}', '${STEP_NAME}', 'telegram', 'sent', NOW())
        ON CONFLICT (user_id, email_step, channel) DO NOTHING;
        "
        docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -c "$INSERT_QUERY" > /dev/null 2>&1

        TOTAL_SENT=$((TOTAL_SENT + 1))
        DISPLAY_NAME="${USER_NAME:-${USER_EMAIL}}"
        SUBJECT="${STEP_SUBJECTS[$STEP_NAME]}"
        DETAILS="${DETAILS}
  ${STEP_NAME^^} → ${DISPLAY_NAME} (${SUBJECT})"

    done <<< "$USERS"
done

# ── Sequence stats ──
TOTAL_LOGGED=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c "
SELECT COUNT(*) FROM email_sequence_log;
" 2>/dev/null | xargs || echo "0")

SENT_TODAY=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c "
SELECT COUNT(*) FROM email_sequence_log WHERE sent_at > CURRENT_DATE;
" 2>/dev/null | xargs || echo "0")

OVERDUE_COUNT=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c "
SELECT COUNT(DISTINCT u.id) FROM users u
WHERE u.created_at < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
      SELECT 1 FROM email_sequence_log esl
      WHERE esl.user_id = u.id AND esl.email_step = 'j30'
  );
" 2>/dev/null | xargs || echo "0")

# Per-step breakdown
STEP_BREAKDOWN=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -A -F'|' -c "
SELECT email_step, COUNT(*) FROM email_sequence_log
WHERE status = 'sent'
GROUP BY email_step ORDER BY email_step;
" 2>/dev/null)

BREAKDOWN_TEXT=""
if [ -n "$STEP_BREAKDOWN" ]; then
    while IFS='|' read -r BSTEP BCOUNT; do
        [ -z "$BSTEP" ] && continue
        BREAKDOWN_TEXT="${BREAKDOWN_TEXT}
  ${BSTEP}: ${BCOUNT} envoyes"
    done <<< "$STEP_BREAKDOWN"
fi

# ── Send Telegram summary ──
# Only send if there's activity or it's the 9am hourly run
CURRENT_HOUR=$(date +"%H")
if [ "$TOTAL_SENT" -gt 0 ] || [ "$CURRENT_HOUR" = "09" ]; then

    if [ "$TOTAL_SENT" -gt 0 ]; then
        ACTIVITY_SECTION="<b>Envois cette execution:</b> ${TOTAL_SENT}
${DETAILS}"
    else
        ACTIVITY_SECTION="Aucun envoi cette heure."
    fi

    MSG="📧 <b>Email Sequence — ${DATE_SHORT} ${HEURE}</b>

━━━━━━━━━━━━━━━━━━

${ACTIVITY_SECTION}

📊 <b>Stats globales</b>
Total logs: ${TOTAL_LOGGED}
Envoyes aujourd'hui: ${SENT_TODAY}
Utilisateurs en retard (>30j sans j30): ${OVERDUE_COUNT:-0}
${BREAKDOWN_TEXT}

━━━━━━━━━━━━━━━━━━
<i>Sequence: j0→j2→j5→j10→j15→j21→j30</i>
<i>Prochaine execution dans 1h</i>"

    bash "$NOTIFY" "$MSG"
fi
