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
  DB_NAME: z.string().default('sarah_os'),
  DB_USER: z.string().default('sarah'),
  DB_PASSWORD: z.string().default('sarah_secret'),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

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

  // Embeddings
  OPENAI_API_KEY: z.string().optional(),
  EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),

  // Security
  JWT_SECRET: z.string().min(16).default('change-me-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ENCRYPTION_KEY: z.string().min(16).default('change-me-32-byte-key-here!!!!!'),

  // API Keys (comma-separated per role)
  API_KEYS_ADMIN: z.string().default('admin-key-change-me'),
  API_KEYS_OPERATOR: z.string().default('operator-key-change-me'),
  API_KEYS_VIEWER: z.string().default('viewer-key-change-me'),
  API_KEYS_SYSTEM: z.string().default('system-key-change-me'),

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
  EMAIL_FROM: z.string().default('SARAH OS <noreply@sarah-os.com>'),
  APP_URL: z.string().default('http://localhost:3001'),

  // Financial
  CHARITY_PERCENTAGE: z.coerce.number().min(0).max(100).default(20),

  // WhatsApp Cloud API (Meta)
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().default('sarah-os-webhook-verify-2026'),
  WHATSAPP_API_VERSION: z.string().default('v18.0'),
  WEBHOOK_BASE_URL: z.string().default('http://localhost:3010'),

  // Deepgram (TTS/STT)
  DEEPGRAM_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('Environment validation failed:');
    console.error(JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment configuration. Check your .env file.');
  }

  return result.data;
}

export const config = loadConfig();

export function getDatabaseUrl(): string {
  return config.DATABASE_URL ?? `postgresql://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
}

export function getRedisUrl(): string {
  return config.REDIS_URL ?? `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`;
}
