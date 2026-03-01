import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import type { LedgerEntry, AccountType, Currency } from './financial.types';

export class Ledger {
  private entries: LedgerEntry[] = [];

  record(
    accountType: AccountType,
    category: string,
    description: string,
    amountCents: number,
    debitAccount: string,
    creditAccount: string,
    currency: Currency = 'EUR',
    referenceId?: string
  ): LedgerEntry {
    const entry: LedgerEntry = {
      id: uuidv4(),
      entryDate: new Date().toISOString().split('T')[0]!,
      accountType,
      category,
      description,
      amountCents,
      currency,
      debitAccount,
      creditAccount,
      referenceId,
      approvalStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.entries.push(entry);

    logger.debug('Ledger entry recorded', {
      id: entry.id,
      type: accountType,
      category,
      amount: amountCents,
    });

    return entry;
  }

  getBalance(account: string): number {
    let balance = 0;
    for (const entry of this.entries) {
      if (entry.approvalStatus !== 'APPROVED') continue;
      if (entry.debitAccount === account) balance += entry.amountCents;
      if (entry.creditAccount === account) balance -= entry.amountCents;
    }
    return balance;
  }

  getEntriesByCategory(category: string): LedgerEntry[] {
    return this.entries.filter((e) => e.category === category);
  }

  getEntriesByType(type: AccountType): LedgerEntry[] {
    return this.entries.filter((e) => e.accountType === type);
  }

  getTotalRevenue(): number {
    return this.entries
      .filter((e) => e.accountType === 'REVENUE' && e.approvalStatus === 'APPROVED')
      .reduce((sum, e) => sum + e.amountCents, 0);
  }

  getTotalExpenses(): number {
    return this.entries
      .filter((e) => e.accountType === 'EXPENSE' && e.approvalStatus === 'APPROVED')
      .reduce((sum, e) => sum + e.amountCents, 0);
  }

  getNetProfit(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }

  getAllEntries(): LedgerEntry[] {
    return [...this.entries];
  }
}

export const ledger = new Ledger();
