/**
 * RGPD Purge Script — Purge data older than 90 days
 * Deterministic SQL queries, no Claude Code dependency
 * Run via: npx ts-node src/scripts/rgpd-purge.ts
 */
import { spawn } from 'child_process';
import * as fs from 'fs';

async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim()));
  });
}

async function notifyEmmanuel(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });
  } catch { /* silent */ }
}

async function main(): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const reportLines: string[] = [`# Rapport Purge RGPD — ${date}`, ''];

  console.log(`[RGPD Purge] Starting purge for data > 90 days...`);

  const tables = [
    { name: 'conversations', column: 'created_at' },
    { name: 'agent_usage_logs', column: 'created_at' },
    { name: 'cron_logs', column: 'created_at' },
    { name: 'credit_usage_log', column: 'created_at' },
    { name: 'notifications', column: 'created_at' },
  ];

  let totalPurged = 0;

  for (const table of tables) {
    try {
      const count = await dbQuery(
        `SELECT COUNT(*) FROM ${table.name} WHERE ${table.column} < NOW() - INTERVAL '90 days'`
      );
      const rowCount = parseInt(count) || 0;

      if (rowCount > 0) {
        await dbQuery(
          `DELETE FROM ${table.name} WHERE ${table.column} < NOW() - INTERVAL '90 days'`
        );
        reportLines.push(`- **${table.name}** : ${rowCount} lignes supprimées`);
        totalPurged += rowCount;
        console.log(`  ✓ ${table.name}: ${rowCount} rows purged`);
      } else {
        reportLines.push(`- ${table.name} : 0 (rien à purger)`);
        console.log(`  ○ ${table.name}: nothing to purge`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      reportLines.push(`- ⚠️ ${table.name} : ERREUR — ${msg}`);
      console.error(`  ✗ ${table.name}: ${msg}`);
    }
  }

  reportLines.push('', `**Total** : ${totalPurged} lignes supprimées`);
  reportLines.push('', `Exécuté le ${new Date().toISOString()}`);

  // Write report
  const reportPath = `/root/logs/purge-${date}.md`;
  try {
    fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
    console.log(`Report saved to ${reportPath}`);
  } catch {
    console.log('Could not write report file (may not be on VPS)');
  }

  // Notify
  await notifyEmmanuel(`🗑️ *Purge RGPD terminée* — ${date}\n\n${totalPurged} lignes supprimées sur ${tables.length} tables`);

  console.log(`[RGPD Purge] Done. ${totalPurged} rows purged total.`);
}

main().catch(err => {
  console.error('[RGPD Purge] Fatal error:', err);
  process.exit(1);
});
