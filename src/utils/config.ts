import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // PostgreSQL
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('freenzy'),
  DB_USER: z.string().default('freenzy'),
  DB_PASSWORD: z.string().default('freenzy_secret'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  CLAUDE_MODEL_FAST: z.string().default('claude-sonnet-4-20250514'),
  CLAUDE_MODEL_STANDARD: z.string().default('claude-sonnet-4-20250514'),
  CLAUDE_MODEL_ADVANCED: z.string().default('claude-opus-4-6'),

  // Avatar Pipeline
  AVATAR_PYTHON_URL: z.string().default('http://localhost:8000'),
  DID_API_KEY: z.string().optional(),
  ASSEMBLYAI_API_KEY: z.string().optional(),
  TELNYX_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional().default(''),
  TWILIO_WEBHOOK_URL: z.string().optional().default(''),

  // Embeddings
  OPENAI_API_KEY: z.string().optional(),
  EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),

  // Security
  JWT_SECRET: z.string().min(16).default('change-me-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ENCRYPTION_KEY: z.string().min(16).default('change-me-32-byte-key-here!!!!!'),

  // API Keys (comma-separated per role)
  API_KEYS_ADMIN: z.string().min(8).default('admin-key-change-me'),
  API_KEYS_OPERATOR: z.string().min(8).default('operator-key-change-me'),
  API_KEYS_VIEWER: z.string().min(8).default('viewer-key-change-me'),
  API_KEYS_SYSTEM: z.string().min(8).default('system-key-change-me'),

  // Dashboard & Rate Limiting
  DASHBOARD_ORIGIN: z.string().default('http://localhost:3001'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),

  // User Tiers
  DEMO_DEFAULT_DAYS: z.coerce.number().default(7),
  GUEST_DAILY_LIMIT: z.coerce.number().default(10),
  FREE_DAILY_LIMIT: z.coerce.number().default(100),
  PAID_DAILY_LIMIT: z.coerce.number().default(10000),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Freenzy.io <noreply@freenzy.io>'),
  APP_URL: z.string().default('http://localhost:3001'),

  // Financial
  CHARITY_PERCENTAGE: z.coerce.number().min(0).max(100).default(20),

  // WhatsApp Cloud API (Meta)
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().default('freenzy-webhook-verify-2026'),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default('v18.0'),
  WEBHOOK_BASE_URL: z.string().default('http://localhost:3010'),

  // Deepgram (TTS/STT)
  DEEPGRAM_API_KEY: z.string().optional(),

  // Autopilot — Admin governance via WhatsApp
  ADMIN_WHATSAPP_PHONE: z.string().optional(),
  AUTOPILOT_ENABLED: z.string().default('true'),
  AUTOPILOT_MAX_PROPOSALS_PER_DAY: z.coerce.number().default(20),
  AUTOPILOT_MAX_URGENT_PER_HOUR: z.coerce.number().default(5),
  AUTOPILOT_PROPOSAL_EXPIRY_HOURS: z.coerce.number().default(24),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateProductionSecrets(env: EnvConfig): void {
  if (env.NODE_ENV !== 'production') return;

  const errors: string[] = [];

  if (env.JWT_SECRET.includes('change-me') || env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 chars and not contain "change-me" in production');
  }
  if (env.ENCRYPTION_KEY.includes('change-me') || env.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 chars and not contain "change-me" in production');
  }
  if (env.DB_PASSWORD.includes('freenzy_secret') || env.DB_PASSWORD.length < 12) {
    errors.push('DB_PASSWORD must be at least 12 chars and not be the default value in production');
  }

  const apiKeyFields = ['API_KEYS_ADMIN', 'API_KEYS_OPERATOR', 'API_KEYS_VIEWER', 'API_KEYS_SYSTEM'] as const;
  for (const field of apiKeyFields) {
    if (env[field].includes('change-me') || env[field].length < 16) {
      errors.push(`${field} must be at least 16 chars and not contain "change-me" in production`);
    }
  }

  if (env.WHATSAPP_VERIFY_TOKEN === 'freenzy-webhook-verify-2026') {
    errors.push('WHATSAPP_VERIFY_TOKEN must be changed from default in production');
  }

  if (errors.length > 0) {
    console.error('FATAL: Production security validation failed:');
    errors.forEach(e => console.error(`  - ${e}`));
    throw new Error('Insecure configuration detected in production. Fix your .env file.');
  }
}

function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('Environment validation failed:');
    console.error(JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment configuration. Check your .env file.');
  }

  validateProductionSecrets(result.data);

  // Block default secrets in non-development/test environments
  if (result.data.NODE_ENV !== 'development' && result.data.NODE_ENV !== 'test') {
    if (result.data.JWT_SECRET.includes('change-me')) {
      throw new Error('JWT_SECRET must be changed from default in non-development environments');
    }
    if (result.data.ENCRYPTION_KEY.includes('change-me')) {
      throw new Error('ENCRYPTION_KEY must be changed from default in non-development environments');
    }
  }

  // Always warn if defaults are used (even in dev)
  if (result.data.JWT_SECRET.includes('change-me')) {
    console.warn('WARNING: Using default JWT_SECRET — change before deploying.');
  }
  if (result.data.ENCRYPTION_KEY.includes('change-me')) {
    console.warn('WARNING: Using default ENCRYPTION_KEY — change before deploying.');
  }

  return result.data;
}

export const config = loadConfig();

export function getDatabaseUrl(): string {
  return config.DATABASE_URL ?? `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
}

export function getRedisUrl(): string {
  if (config.REDIS_URL) return config.REDIS_URL;
  const auth = config.REDIS_PASSWORD ? `:${config.REDIS_PASSWORD}@` : '';
  return `redis://${auth}${config.REDIS_HOST}:${config.REDIS_PORT}`;
}
