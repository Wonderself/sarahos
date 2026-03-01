import { ledger } from './ledger';
import type { BudgetSummary, CostBreakdown } from './financial.types';

export class BudgetTracker {
  getSummary(period: string = new Date().toISOString().slice(0, 7)): BudgetSummary {
    const revenue = ledger.getTotalRevenue();
    const expenses = ledger.getTotalExpenses();
    const netProfit = revenue - expenses;
    const charityPercentage = parseInt(process.env['CHARITY_PERCENTAGE'] ?? '20', 10);
    const charityAllocation = netProfit > 0 ? Math.floor(netProfit * (charityPercentage / 100)) : 0;

    return {
      totalRevenueCents: revenue,
      totalExpensesCents: expenses,
      netProfitCents: netProfit,
      charityAllocationCents: charityAllocation,
      currency: 'EUR',
      period,
    };
  }

  getCostBreakdown(): CostBreakdown {
    const entries = ledger.getEntriesByType('EXPENSE');

    const breakdown: CostBreakdown = {
      apiTokens: 0,
      infrastructure: 0,
      saas: 0,
      salaries: 0,
      other: 0,
      totalCents: 0,
    };

    for (const entry of entries) {
      if (entry.approvalStatus !== 'APPROVED') continue;

      switch (entry.category) {
        case 'api_tokens':
          breakdown.apiTokens += entry.amountCents;
          break;
        case 'infrastructure':
          breakdown.infrastructure += entry.amountCents;
          break;
        case 'saas':
          breakdown.saas += entry.amountCents;
          break;
        case 'salaries':
          breakdown.salaries += entry.amountCents;
          break;
        default:
          breakdown.other += entry.amountCents;
      }

      breakdown.totalCents += entry.amountCents;
    }

    return breakdown;
  }

  isWithinBudget(budgetCents: number): boolean {
    const expenses = ledger.getTotalExpenses();
    return expenses <= budgetCents;
  }
}

export const budgetTracker = new BudgetTracker();
