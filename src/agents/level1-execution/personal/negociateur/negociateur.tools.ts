// ═══════════════════════════════════════════════════════
// NegociateurAgent — Helper Functions & Tools
// ═══════════════════════════════════════════════════════

import { logger } from '../../../../utils/logger';
import type { NegotiationScript, CounterArgument } from './negociateur.types';

/**
 * Format a structured negotiation script from raw components.
 * Used to present scripts in a clear, actionable format.
 */
export function formatNegotiationScript(
  opening: string,
  args: string[],
  closingPhrase: string,
  fallbackPhrase: string,
): NegotiationScript {
  logger.debug('Formatting negotiation script', { argsCount: args.length });

  return {
    opening: opening.trim(),
    arguments: args.map((a) => a.trim()).filter(Boolean),
    closingPhrase: closingPhrase.trim(),
    fallbackPhrase: fallbackPhrase.trim(),
  };
}

/**
 * Build a structured list of counter-arguments from raw objection/response pairs.
 * Helps the user prepare for the most likely pushback scenarios.
 */
export function buildCounterArguments(
  pairs: Array<{ objection: string; response: string; technique?: string }>,
): CounterArgument[] {
  logger.debug('Building counter-arguments', { count: pairs.length });

  return pairs.map((pair) => ({
    objection: pair.objection.trim(),
    response: pair.response.trim(),
    technique: pair.technique?.trim() ?? 'reframe',
  }));
}

/**
 * Calculate a salary negotiation anchor based on target and market data.
 * The anchor is typically 10-20% above the real target to leave room.
 */
export function calculateSalaryAnchor(
  targetSalary: number,
  marginPercent: number = 15,
): { anchor: number; target: number; floor: number } {
  const anchor = Math.round(targetSalary * (1 + marginPercent / 100));
  const floor = Math.round(targetSalary * 0.95); // Minimum acceptable
  return { anchor, target: targetSalary, floor };
}

/**
 * Format a monetary amount in French locale (e.g., "45 000 EUR").
 */
export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
}

/**
 * Get recommended negotiation techniques based on context.
 */
export function getRecommendedTechniques(
  type: 'salary' | 'rent' | 'contract' | 'roleplay',
): string[] {
  const techniques: Record<string, string[]> = {
    salary: [
      'Ancrage haut (proposer 15-20% au-dessus de votre cible)',
      'Silence strategique apres votre demande',
      'Reframe : parler de valeur ajoutee, pas de cout',
      'BATNA : mentionner vos alternatives sans bluffer',
      'Package global : negocier au-dela du salaire (teletravail, formation, titre)',
    ],
    rent: [
      'Recherche de comparables dans le quartier',
      'Engagement de duree en echange de reduction',
      'Prise en charge de petits travaux',
      'Paiement anticipe comme levier',
      'Reference a l\'encadrement des loyers si applicable',
    ],
    contract: [
      'Clauses de sortie flexibles',
      'Engagement volume contre tarif preferentiel',
      'Benchmark concurrentiel documente',
      'Echeancier de paiement favorable',
      'Clause de revision annuelle plafonnee',
    ],
    roleplay: [
      'Ecoute active et reformulation',
      'Mirroring (repeter les derniers mots)',
      'Labeling (nommer les emotions)',
      'Questions calibrees (comment, que)',
      'Silence tactique',
    ],
  };

  return (techniques[type] ?? techniques['contract']) as string[];
}
