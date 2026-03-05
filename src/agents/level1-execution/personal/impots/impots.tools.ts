// ═══════════════════════════════════════════════════════
// ImpotsAgent — Helper Functions & Tools
// ═══════════════════════════════════════════════════════

import { logger } from '../../../../utils/logger';
import type { TaxBracket, FiscalDate } from './impots.types';

/**
 * Mandatory fiscal disclaimer appended to every response.
 */
export const FISCAL_DISCLAIMER = `⚠️ Ceci est un guide informatif uniquement. Consultez un expert-comptable ou rendez-vous sur impots.gouv.fr pour une validation officielle.`;

/**
 * Get the current fiscal year (for income tax, it's the previous calendar year).
 * E.g., in 2026 you declare 2025 income.
 */
export function getCurrentFiscalYear(): { declarationYear: number; incomeYear: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  return {
    declarationYear: currentYear,
    incomeYear: currentYear - 1,
  };
}

/**
 * Get key fiscal dates for a given year.
 * These are approximate standard dates — actual dates may vary by department.
 */
export function getKeyDates(year: number): FiscalDate[] {
  logger.debug('Getting key fiscal dates', { year });

  return [
    {
      date: `${year}-01-01`,
      description: `Ouverture du prelevement a la source pour les revenus ${year}`,
      category: 'payment',
      mandatory: true,
    },
    {
      date: `${year}-01-15`,
      description: `Date limite de paiement de la taxe fonciere (si mensualisee, reprise des prelevements)`,
      category: 'payment',
      mandatory: false,
    },
    {
      date: `${year}-04-10`,
      description: `Ouverture de la declaration en ligne des revenus ${year - 1}`,
      category: 'declaration',
      mandatory: true,
    },
    {
      date: `${year}-05-22`,
      description: `Date limite declaration papier des revenus ${year - 1}`,
      category: 'declaration',
      mandatory: true,
    },
    {
      date: `${year}-05-28`,
      description: `Date limite declaration en ligne — departements 01 a 19`,
      category: 'declaration',
      mandatory: true,
    },
    {
      date: `${year}-06-04`,
      description: `Date limite declaration en ligne — departements 20 a 54`,
      category: 'declaration',
      mandatory: true,
    },
    {
      date: `${year}-06-11`,
      description: `Date limite declaration en ligne — departements 55 a 976`,
      category: 'declaration',
      mandatory: true,
    },
    {
      date: `${year}-07-31`,
      description: `Reception des avis d'imposition sur les revenus ${year - 1}`,
      category: 'other',
      mandatory: false,
    },
    {
      date: `${year}-09-15`,
      description: `Date limite de paiement du solde d'impot sur le revenu`,
      category: 'payment',
      mandatory: true,
    },
    {
      date: `${year}-10-15`,
      description: `Date limite de paiement de la taxe fonciere`,
      category: 'payment',
      mandatory: true,
    },
    {
      date: `${year}-11-15`,
      description: `Date limite de paiement de la taxe d'habitation (residences secondaires)`,
      category: 'payment',
      mandatory: false,
    },
    {
      date: `${year}-12-15`,
      description: `Regularisation du prelevement a la source si changement de situation`,
      category: 'regularization',
      mandatory: false,
    },
  ];
}

/**
 * Get the French income tax brackets for a given year.
 * Returns the progressive scale (bareme progressif).
 * NOTE: These are indicative brackets. Actual brackets are updated annually by the Loi de Finances.
 */
export function getTaxBrackets(incomeYear: number): TaxBracket[] {
  logger.debug('Getting tax brackets', { incomeYear });

  // 2025 brackets (approximate — updated in Loi de Finances 2026)
  if (incomeYear >= 2025) {
    return [
      { min: 0, max: 11_294, rate: 0 },
      { min: 11_294, max: 28_797, rate: 11 },
      { min: 28_797, max: 82_341, rate: 30 },
      { min: 82_341, max: 177_106, rate: 41 },
      { min: 177_106, max: null, rate: 45 },
    ];
  }

  // 2024 brackets
  return [
    { min: 0, max: 11_294, rate: 0 },
    { min: 11_294, max: 28_797, rate: 11 },
    { min: 28_797, max: 82_341, rate: 30 },
    { min: 82_341, max: 177_106, rate: 41 },
    { min: 177_106, max: null, rate: 45 },
  ];
}

/**
 * Calculate the marginal tax rate (TMI) for a given taxable income per part.
 */
export function getMarginalTaxRate(taxableIncomePerPart: number, incomeYear: number): number {
  const brackets = getTaxBrackets(incomeYear);
  let tmi = 0;
  for (const bracket of brackets) {
    if (taxableIncomePerPart > bracket.min) {
      tmi = bracket.rate;
    }
  }
  return tmi;
}

/**
 * Find the next upcoming fiscal deadline from today.
 */
export function getNextDeadline(year: number): FiscalDate | null {
  const dates = getKeyDates(year);
  const now = new Date();
  const mandatory = dates.filter((d) => d.mandatory);
  const upcoming = mandatory.filter((d) => new Date(d.date) > now);
  return upcoming.length > 0 ? upcoming[0]! : null;
}
