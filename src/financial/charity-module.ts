import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import type { CharityAllocation, Currency } from './financial.types';

// HARDCODED: 20% of profits go to social impact — this is non-negotiable
const CHARITY_PERCENTAGE = 20;

export class CharityModule {
  private allocations: CharityAllocation[] = [];

  getPercentage(): number {
    return CHARITY_PERCENTAGE;
  }

  calculateAllocation(netProfitCents: number): number {
    if (netProfitCents <= 0) return 0;
    return Math.floor(netProfitCents * (CHARITY_PERCENTAGE / 100));
  }

  allocate(
    amountCents: number,
    beneficiary: string,
    category: string,
    currency: Currency = 'EUR'
  ): CharityAllocation {
    const allocation: CharityAllocation = {
      id: uuidv4(),
      amountCents,
      currency,
      beneficiary,
      category,
      allocatedAt: new Date().toISOString(),
    };

    this.allocations.push(allocation);

    logger.info('Charity allocation created', {
      id: allocation.id,
      amount: amountCents,
      beneficiary,
      category,
    });

    return allocation;
  }

  getTotalAllocated(): number {
    return this.allocations.reduce((sum, a) => sum + a.amountCents, 0);
  }

  getTotalDisbursed(): number {
    return this.allocations
      .filter((a) => a.disbursedAt !== undefined)
      .reduce((sum, a) => sum + a.amountCents, 0);
  }

  getPendingDisbursements(): CharityAllocation[] {
    return this.allocations.filter((a) => !a.disbursedAt);
  }

  getAllAllocations(): CharityAllocation[] {
    return [...this.allocations];
  }
}

export const charityModule = new CharityModule();
