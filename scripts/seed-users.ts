/**
 * Seed script: creates 7 test accounts + 2 sample promo codes.
 * Idempotent — uses upsertByEmail for users and ON CONFLICT for promo codes.
 *
 * Usage: npx tsx scripts/seed-users.ts
 */
import { dbClient } from '../src/infra';
import { userRepository } from '../src/users/user.repository';
import { hashPassword } from '../src/utils/password';
import { logger } from '../src/utils/logger';

// ── Real admin account ──
const ADMIN_USER = {
  email: 'smadja99@gmail.com',
  displayName: 'Admin Freenzy.io',
  role: 'admin' as const,
  tier: 'paid' as const,
  apiKey: 'admin-key-change-me', // matches default DASHBOARD_API_KEY
};
const ADMIN_PASSWORD = 'Polmpolm1$';

// ── Test accounts (strengthened passwords) ──
const TEST_PASSWORDS: Record<string, string> = {
  'admin@freenzy.test': 'FreenzyAdmin2024!Test',
  'operator@freenzy.test': 'FreenzyOperator2024!Test',
  'viewer@freenzy.test': 'FreenzyViewer2024!Test',
  'guest@freenzy.test': 'FreenzyGuest2024!Test',
  'demo@freenzy.test': 'FreenzyDemo2024!Test',
  'free@freenzy.test': 'FreenzyFree2024!Test',
  'paid@freenzy.test': 'FreenzyPaid2024!Test',
};

const TEST_USERS = [
  { email: 'admin@freenzy.test', displayName: 'Test Admin', role: 'admin' as const, tier: 'paid' as const, apiKey: 'test-admin-key-2024' },
  { email: 'operator@freenzy.test', displayName: 'Test Operator', role: 'operator' as const, tier: 'paid' as const, apiKey: 'test-operator-key-2024' },
  { email: 'viewer@freenzy.test', displayName: 'Test Viewer', role: 'viewer' as const, tier: 'free' as const, apiKey: 'test-viewer-key-2024' },
  { email: 'guest@freenzy.test', displayName: 'Test Guest', role: 'viewer' as const, tier: 'guest' as const, apiKey: 'test-guest-key-2024' },
  { email: 'demo@freenzy.test', displayName: 'Test Demo', role: 'viewer' as const, tier: 'demo' as const, apiKey: 'test-demo-key-2024' },
  { email: 'free@freenzy.test', displayName: 'Test Free', role: 'viewer' as const, tier: 'free' as const, apiKey: 'test-free-key-2024' },
  { email: 'paid@freenzy.test', displayName: 'Test Paid', role: 'operator' as const, tier: 'paid' as const, apiKey: 'test-paid-key-2024' },
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

    // ── Seed real admin first ──
    const existingAdmin = await userRepository.findByEmail(ADMIN_USER.email);
    if (existingAdmin) {
      await userRepository.update(existingAdmin.id, { role: 'admin', tier: 'paid', isActive: true });
      const hash = hashPassword(ADMIN_PASSWORD);
      await userRepository.setPasswordHash(existingAdmin.id, hash);
      logger.info('Admin user updated: ' + ADMIN_USER.email);
    } else {
      const newAdmin = await userRepository.create(ADMIN_USER);
      const hash = hashPassword(ADMIN_PASSWORD);
      await userRepository.setPasswordHash(newAdmin.id, hash);
      logger.info('Admin user created: ' + ADMIN_USER.email);
    }

    // ── Seed test users ──
    let created = 0;
    let updated = 0;
    for (const userDef of TEST_USERS) {
      const pw = TEST_PASSWORDS[userDef.email] ?? 'FreenzyDefault2024!Test';
      const existing = await userRepository.findByEmail(userDef.email);
      if (existing) {
        await userRepository.update(existing.id, { role: userDef.role, tier: userDef.tier, isActive: true });
        const hash = hashPassword(pw);
        await userRepository.setPasswordHash(existing.id, hash);
        updated++;
      } else {
        const newUser = await userRepository.create(userDef);
        const hash = hashPassword(pw);
        await userRepository.setPasswordHash(newUser.id, hash);
        created++;
      }
    }
    logger.info(`Users seeded: ${created} created, ${updated} updated`);

    // Set demo expiry for demo user
    const demoUser = await userRepository.findByEmail('demo@freenzy.test');
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

    console.log('\nSeed complete!');
    console.log('──────────────────────────────────────────────────────────');
    console.log('  Admin account:');
    console.log(`  ${ADMIN_USER.email.padEnd(30)} | admin      | paid   | ***`);
    console.log('──────────────────────────────────────────────────────────');
    console.log('  Test accounts:');
    for (const u of TEST_USERS) {
      const pw = TEST_PASSWORDS[u.email] ?? 'FreenzyDefault2024!Test';
      console.log(`  ${u.email.padEnd(30)} | ${u.role.padEnd(10)} | ${u.tier.padEnd(6)} | pw: ${pw}`);
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
