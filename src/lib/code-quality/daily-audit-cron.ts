import * as dotenv from 'dotenv';
import path from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { CodeAuditor } from './CodeAuditor';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'] || '';
const TELEGRAM_ADMIN_CHAT_ID = process.env['TELEGRAM_ADMIN_CHAT_ID'] || '';
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const LOG_DIR = process.platform === 'win32'
  ? path.join(PROJECT_ROOT, 'logs', 'audit')
  : '/root/logs';

async function sendTelegramMessage(
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.error(
      '[audit-cron] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID'
    );
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const body: Record<string, unknown> = {
    chat_id: TELEGRAM_ADMIN_CHAT_ID,
    text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    body['reply_markup'] = replyMarkup;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[audit-cron] Telegram API error: ${response.status} ${errorText}`);
      return false;
    }

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[audit-cron] Failed to send Telegram message: ${message}`);
    return false;
  }
}

function getDateStamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function main(): Promise<void> {
  console.log('[audit-cron] Starting daily code quality audit...');
  console.log(`[audit-cron] Project root: ${PROJECT_ROOT}`);

  const auditor = new CodeAuditor();

  try {
    const result = await auditor.runFullAudit(PROJECT_ROOT);

    // Save JSON report
    const dateStamp = getDateStamp();
    mkdirSync(LOG_DIR, { recursive: true });
    const reportPath = path.join(LOG_DIR, `audit-${dateStamp}.json`);
    writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`[audit-cron] Report saved to ${reportPath}`);

    // Print full report to stdout
    const fullReport = auditor.generateReport(result);
    console.log(fullReport);

    // Send Telegram message
    const telegramText = auditor.generateTelegramReport(result);
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '\uD83D\uDCCA Rapport complet', callback_data: 'audit_full_report' },
          { text: '\uD83D\uDD27 Corriger maintenant', callback_data: 'audit_fix_now' },
        ],
      ],
    };

    const sent = await sendTelegramMessage(telegramText, replyMarkup);
    if (sent) {
      console.log('[audit-cron] Telegram report sent successfully');
    } else {
      console.error('[audit-cron] Failed to send Telegram report');
    }

    // Exit with non-zero if critical failures
    const criticalFailures = result.checks.filter(
      (c) => c.status === 'fail' && c.category === 'security'
    );
    if (criticalFailures.length > 0) {
      console.warn(
        `[audit-cron] ${criticalFailures.length} critical security failure(s) detected`
      );
    }

    console.log(`[audit-cron] Audit complete. Score: ${result.score}/100`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[audit-cron] Audit failed: ${message}`);

    await sendTelegramMessage(
      `\u274C Audit Code Echou\u00E9\n\nErreur: ${message}\n\nV\u00E9rifier les logs sur le serveur.`
    );

    process.exit(1);
  }
}

main();
