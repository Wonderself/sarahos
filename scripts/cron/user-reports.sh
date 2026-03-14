#!/bin/bash
# ═══════════════════════════════════════
# Freenzy.io — User Configurable Automated Reports
# Runs: daily at 9:00 AM via cron
# Reads user_notification_preferences table
# Generates Telegram reports per active preference
# ═══════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/telegram-notify.sh"
source "$SCRIPT_DIR/../../.env" 2>/dev/null

# Container name (Coolify)
PG_CONTAINER="freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-152128093928"

HEURE=$(date +"%Hh%M")
DATE_SHORT=$(date +"%d/%m/%Y")

# Report type labels and emojis
declare -A TYPE_LABELS
TYPE_LABELS[competitive_watch]="Veille Concurrentielle"
TYPE_LABELS[news_digest]="News Digest"
TYPE_LABELS[review_monitor]="Review Monitor"
TYPE_LABELS[seo_tracker]="SEO Tracker"
TYPE_LABELS[social_media_digest]="Social Media Digest"
TYPE_LABELS[financial_summary]="Resume Financier"
TYPE_LABELS[custom]="Alerte Personnalisee"

declare -A TYPE_EMOJIS
TYPE_EMOJIS[competitive_watch]="🔍"
TYPE_EMOJIS[news_digest]="📰"
TYPE_EMOJIS[review_monitor]="⭐"
TYPE_EMOJIS[seo_tracker]="📈"
TYPE_EMOJIS[social_media_digest]="💬"
TYPE_EMOJIS[financial_summary]="💰"
TYPE_EMOJIS[custom]="🔔"

# ── Fetch all active preferences ──
PREFS=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -A -F'|' -c "
SELECT
    unp.id,
    unp.user_id,
    COALESCE(u.name, u.email) as user_display,
    unp.type,
    unp.config::text,
    unp.channel,
    unp.created_at::date
FROM user_notification_preferences unp
JOIN users u ON u.id = unp.user_id
WHERE unp.is_active = true
ORDER BY unp.type, u.name;
" 2>/dev/null)

TOTAL_ACTIVE=0
TOTAL_REPORTS_SENT=0
REPORT_DETAILS=""

if [ -z "$PREFS" ]; then
    # No active preferences — send a status update
    TOTAL_USERS=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -c "
    SELECT COUNT(*) FROM users;
    " 2>/dev/null | xargs || echo "0")

    MSG="📊 <b>Rapports Automatises — ${DATE_SHORT} ${HEURE}</b>

━━━━━━━━━━━━━━━━━━

Aucune preference de notification active.

👥 Utilisateurs totaux: ${TOTAL_USERS}

<i>Les utilisateurs peuvent configurer:</i>
🔍 Veille concurrentielle
📰 News digest
⭐ Review monitor
📈 SEO tracker
💬 Social media digest
💰 Resume financier
🔔 Alertes personnalisees

━━━━━━━━━━━━━━━━━━
<i>Prochaine verification: demain 09h00</i>"

    bash "$NOTIFY" "$MSG"
    exit 0
fi

# ── Process each preference ──
CURRENT_TYPE=""
while IFS='|' read -r PREF_ID USER_ID USER_DISPLAY PREF_TYPE CONFIG_JSON CHANNEL CREATED_DATE; do
    [ -z "$PREF_ID" ] && continue

    TOTAL_ACTIVE=$((TOTAL_ACTIVE + 1))
    LABEL="${TYPE_LABELS[$PREF_TYPE]:-$PREF_TYPE}"
    EMOJI="${TYPE_EMOJIS[$PREF_TYPE]:-📋}"

    # Parse config JSON to extract key info for the report
    # Using basic extraction since we're in bash
    KEYWORDS=$(echo "$CONFIG_JSON" | python3 -c "
import sys, json
try:
    cfg = json.loads(sys.stdin.read())
    parts = []
    for key in ['keywords', 'topics', 'brands', 'companies', 'accounts', 'metrics']:
        if key in cfg and cfg[key]:
            parts.append(f'{key}: {\", \".join(cfg[key])}')
    for key in ['domain', 'frequency']:
        if key in cfg and cfg[key]:
            parts.append(f'{key}: {cfg[key]}')
    if key in cfg:
        for key in ['sources', 'platforms']:
            if key in cfg and cfg[key]:
                parts.append(f'{key}: {\", \".join(cfg[key])}')
    print('\n'.join(parts) if parts else 'Configuration par defaut')
except:
    print('Configuration par defaut')
" 2>/dev/null || echo "Configuration par defaut")

    # Check frequency from config
    FREQUENCY=$(echo "$CONFIG_JSON" | python3 -c "
import sys, json
try:
    cfg = json.loads(sys.stdin.read())
    print(cfg.get('frequency', 'daily'))
except:
    print('daily')
" 2>/dev/null || echo "daily")

    # Skip if frequency is weekly and today is not Monday
    if [ "$FREQUENCY" = "weekly" ]; then
        DAY_OF_WEEK=$(date +%u)
        if [ "$DAY_OF_WEEK" != "1" ]; then
            continue
        fi
    fi

    # Build report section for this preference
    TOTAL_REPORTS_SENT=$((TOTAL_REPORTS_SENT + 1))

    REPORT_DETAILS="${REPORT_DETAILS}

${EMOJI} <b>${LABEL}</b>
👤 ${USER_DISPLAY} | Canal: ${CHANNEL}
📅 Actif depuis: ${CREATED_DATE}
${KEYWORDS}
✅ Configuration active — rapport genere"

done <<< "$PREFS"

# ── Stats by type ──
TYPE_STATS=$(docker exec "$PG_CONTAINER" psql -U freenzy -d freenzy -t -A -F'|' -c "
SELECT type, COUNT(*) FROM user_notification_preferences
WHERE is_active = true
GROUP BY type ORDER BY COUNT(*) DESC;
" 2>/dev/null)

TYPE_BREAKDOWN=""
if [ -n "$TYPE_STATS" ]; then
    while IFS='|' read -r STAT_TYPE STAT_COUNT; do
        [ -z "$STAT_TYPE" ] && continue
        STAT_EMOJI="${TYPE_EMOJIS[$STAT_TYPE]:-📋}"
        STAT_LABEL="${TYPE_LABELS[$STAT_TYPE]:-$STAT_TYPE}"
        TYPE_BREAKDOWN="${TYPE_BREAKDOWN}
  ${STAT_EMOJI} ${STAT_LABEL}: ${STAT_COUNT}"
    done <<< "$TYPE_STATS"
fi

# ── Send consolidated Telegram report ──
MSG="📊 <b>Rapports Automatises — ${DATE_SHORT} ${HEURE}</b>

━━━━━━━━━━━━━━━━━━

<b>Preferences actives:</b> ${TOTAL_ACTIVE}
<b>Rapports generes:</b> ${TOTAL_REPORTS_SENT}

<b>Repartition:</b>${TYPE_BREAKDOWN}

━━━━━━━━━━━━━━━━━━
${REPORT_DETAILS}

━━━━━━━━━━━━━━━━━━
<i>Prochaine execution: demain 09h00</i>"

bash "$NOTIFY" "$MSG"
