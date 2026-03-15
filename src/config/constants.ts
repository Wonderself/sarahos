/**
 * BRAND Constants — Single source of truth for all public-facing numbers and terms
 * Import this everywhere instead of hardcoding values
 */
export const BRAND = {
  // TERMES — "Assistants" partout, JAMAIS "Agents IA"
  ASSISTANT_TERM: 'assistant',
  ASSISTANT_TERM_PLURAL: 'assistants',
  ASSISTANT_TERM_LABEL: 'Assistant',
  ASSISTANT_TERM_PLURAL_LABEL: 'Assistants',

  // CHIFFRES PUBLICS — un seul endroit, utilisé partout
  TOTAL_TOOLS_PUBLIC: '150+',
  TOTAL_TOOLS_LABEL: '150+ outils IA',
  BUSINESS_ASSISTANTS: 12,
  PERSONAL_ASSISTANTS: 12,
  DISCUSSION_TEMPLATES: 85,
  MARKETPLACE_TEMPLATES: 50,
  FREE_CREDITS: 50,
  CREDIT_RATE: 100, // 1€ = 100 crédits

  // FAQ
  FAQ_COUNT: 103,

  // SUPPORT
  SUPPORT_EMAIL: 'support@freenzy.io',

  // COMPANY
  COMPANY_NAME: 'Freenzy.io',
  COMPANY_LEGAL_COUNTRY: 'Israël',
  COMPANY_LEGAL_CITY: 'Tel Aviv',
  FOUNDER_NAME: 'Emmanuel Smadja',
  DATA_HOSTING: 'Europe (Hetzner)',
  COMMISSION_RATE: '0%',
  COMMISSION_THRESHOLD: 5000,
} as const;
