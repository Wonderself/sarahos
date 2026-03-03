import { z } from 'zod';

// ═══════════════════════════════════════════════════
//   SARAH OS — Zod Validation Utility
//   Common schemas & validateBody helper for dashboard
// ═══════════════════════════════════════════════════

// ── Primitive Schemas ──

export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .min(1, 'Email requis')
  .max(255, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

export const tokenSchema = z
  .string()
  .min(1, 'Token requis')
  .max(4096, 'Token trop long');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  offset: z.coerce.number().int().min(0).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ── Company Profile Schema ──

export const companyProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de l\'entreprise est requis')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  url: z
    .string()
    .url('URL invalide')
    .max(2048, 'URL trop longue')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .or(z.literal('')),
});

// ── Agent Config Schema ──

export const agentConfigSchema = z.object({
  agentId: z
    .string()
    .min(1, 'ID de l\'agent requis'),
  instructions: z
    .string()
    .max(10000, 'Les instructions ne peuvent pas dépasser 10000 caractères')
    .optional()
    .or(z.literal('')),
  personality: z.object({
    formality: z.number().min(0).max(100).default(50),
    responseLength: z.number().min(0).max(100).default(50),
    creativity: z.number().min(0).max(100).default(50),
    proactivity: z.number().min(0).max(100).default(50),
    expertiseLevel: z.number().min(0).max(100).default(50),
    humor: z.number().min(0).max(100).default(30),
  }).optional(),
  rules: z.object({
    alwaysDo: z.array(z.string().max(500)).max(20).default([]),
    neverDo: z.array(z.string().max(500)).max(20).default([]),
    responseFormat: z.enum(['bullets', 'paragraphs', 'structured', 'mixed']).default('mixed'),
  }).optional(),
});

// ── Chat Message Schema ──

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(32000, 'Le message ne peut pas dépasser 32000 caractères'),
  agentId: z
    .string()
    .min(1, 'ID de l\'agent requis'),
  model: z
    .string()
    .min(1)
    .max(100)
    .default('claude-sonnet-4-20250514'),
});

// ── Wallet Deposit Schema ──

export const walletDepositSchema = z.object({
  amount: z
    .number()
    .int('Le montant doit être un nombre entier')
    .min(1, 'Le montant minimum est 1 EUR')
    .max(10000, 'Le montant maximum est 10 000 EUR'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'paypal', 'crypto'], {
    errorMap: () => ({ message: 'Méthode de paiement invalide' }),
  }),
});

// ── Validate Body Helper ──

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationError = { success: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validates an unknown body against a Zod schema.
 * Returns a discriminated union with either the parsed data or an error message.
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Flatten Zod errors into a human-readable string
  const messages = result.error.errors.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });

  return { success: false, error: messages.join('; ') };
}
