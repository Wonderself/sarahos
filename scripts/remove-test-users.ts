/**
 * Removes all @sarah-os.test accounts and sample promo codes.
 *
 * Usage: npx tsx scripts/remove-test-users.ts
 */
import { dbClient } from '../src/infra';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    await dbClient.connect();
    logger.info('Connected to database');

    // Remove promo redemptions from test users first (FK constraint)
    const testUserIds = await dbClient.query(
      `SELECT id FROM users WHERE email LIKE '%@sarah-os.test'`,
    );
    const ids = testUserIds.rows.map((r) => (r as Record<string, unknown>)['id'] as string);

    if (ids.length > 0) {
      await dbClient.query(
        `DELETE FROM promo_redemptions WHERE user_id = ANY($1::uuid[])`,
        [ids],
      );
    }

    // Remove test users
    const userResult = await dbClient.query(
      `DELETE FROM users WHERE email LIKE '%@sarah-os.test'`,
    );
    const usersRemoved = userResult.rowCount ?? 0;

    // Remove sample promo codes
    const promoResult = await dbClient.query(
      `DELETE FROM promo_codes WHERE created_by = 'seed-script'`,
    );
    const promosRemoved = promoResult.rowCount ?? 0;

    console.log(`Removed ${usersRemoved} test users and ${promosRemoved} seed promo codes.`);

    await dbClient.disconnect();
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

main();
