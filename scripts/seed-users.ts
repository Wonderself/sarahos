/**
 * Seed script: creates 7 test accounts + 2 sample promo codes.
 * Idempotent — uses upsertByEmail for users and ON CONFLICT for promo codes.
 *
 * Usage: npx tsx scripts/seed-users.ts
 */
import { dbClient } from '../src/infra';
import { userRepository } from '../src/users/user.repository';
import { logger } from '../src/utils/logger';

const TEST_USERS = [
  { email: 'admin@sarah-os.test', displayName: 'Test Admin', role: 'admin' as const, tier: 'paid' as const, apiKey: 'test-admin-key-2024' },
  { email: 'operator@sarah-os.test', displayName: 'Test Operator', role: 'operator' as const, tier: 'paid' as const, apiKey: 'test-operator-key-2024' },
  { email: 'viewer@sarah-os.test', displayName: 'Test Viewer', role: 'viewer' as const, tier: 'free' as const, apiKey: 'test-viewer-key-2024' },
  { email: 'guest@sarah-os.test', displayName: 'Test Guest', role: 'viewer' as const, tier: 'guest' as const, apiKey: 'test-guest-key-2024' },
  { email: 'demo@sarah-os.test', displayName: 'Test Demo', role: 'viewer' as const, tier: 'demo' as const, apiKey: 'test-demo-key-2024' },
  { email: 'free@sarah-os.test', displayName: 'Test Free', role: 'viewer' as const, tier: 'free' as const, apiKey: 'test-free-key-2024' },
  { email: 'paid@sarah-os.test', displayName: 'Test Paid', role: 'operator' as const, tier: 'paid' as const, apiKey: 'test-paid-key-2024' },
];

const PROMO_CODES = [
  {
    code: 'WELCOME2024',
    description: 'Welcome offer — upgrade to free tier',
    effect_type: 'tier_upgrade',
    effect_value: 'free',
    max_uses: 100,
    created_by: 'seed-script',
  },
  {
    code: 'DEMO30',
    description: 'Extend demo by 30 days',
    effect_type: 'extend_demo',
    effect_value: '30',
    max_uses: 50,
    created_by: 'seed-script',
  },
];

async function main() {
  try {
    await dbClient.connect();
    logger.info('Connected to database');

    // Seed users
    let created = 0;
    let updated = 0;
    for (const user of TEST_USERS) {
      const existing = await userRepository.findByEmail(user.email);
      if (existing) {
        // Update existing
        await userRepository.update(existing.id, { role: user.role, tier: user.tier, isActive: true });
        updated++;
      } else {
        await userRepository.create(user);
        created++;
      }
    }
    logger.info(`Users seeded: ${created} created, ${updated} updated`);

    // Set demo expiry for demo user
    const demoUser = await userRepository.findByEmail('demo@sarah-os.test');
    if (demoUser) {
      const demoExpiry = new Date();
      demoExpiry.setDate(demoExpiry.getDate() + 7);
      await userRepository.update(demoUser.id, { demoExpiresAt: demoExpiry });
    }

    // Seed promo codes
    for (const promo of PROMO_CODES) {
      await dbClient.query(
        `INSERT INTO promo_codes (id, code, description, effect_type, effect_value, max_uses, created_by)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO UPDATE SET description = $2, effect_type = $3, effect_value = $4, max_uses = $5`,
        [promo.code, promo.description, promo.effect_type, promo.effect_value, promo.max_uses, promo.created_by],
      );
    }
    logger.info(`Promo codes seeded: ${PROMO_CODES.length} upserted`);

    console.log('\nSeed complete! Test accounts:');
    console.log('──────────────────────────────────────────────────────────');
    for (const u of TEST_USERS) {
      console.log(`  ${u.email.padEnd(30)} | ${u.role.padEnd(10)} | ${u.tier.padEnd(6)} | ${u.apiKey}`);
    }
    console.log('\nPromo codes:');
    for (const p of PROMO_CODES) {
      console.log(`  ${p.code.padEnd(15)} | ${p.effect_type.padEnd(15)} | ${p.effect_value}`);
    }

    await dbClient.disconnect();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
