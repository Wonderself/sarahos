import { api } from '@/lib/api-client';
import ExportButton from './ExportButton';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function FinancialPage() {
  let summary: Record<string, unknown> | undefined;
  let costs: Record<string, unknown> | undefined;
  let charity: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [summary, costs, charity] = await Promise.all([
      api.getFinancialSummary(),
      api.getFinancialCosts(),
      api.getFinancialCharity().catch(() => undefined),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load financial data';
  }

  if (error) {
    return (
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Finances</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const revCents = Number(summary?.['totalRevenueCents'] ?? 0);
  const expCents = Number(summary?.['totalExpensesCents'] ?? 0);
  const netCents = Number(summary?.['netProfitCents'] ?? 0);
  const charityCents = Number(summary?.['charityAllocationCents'] ?? 0);
  const currency = String(summary?.['currency'] ?? 'EUR');
  const period = String(summary?.['period'] ?? '');

  const costEntries = costs ? Object.entries(costs).filter(([k]) => k !== 'totalCents' && k !== 'total' && k !== 'currency') : [];
  const totalCostCents = Number(costs?.['totalCents'] ?? costs?.['total'] ?? costEntries.reduce((s, [, v]) => s + Number(v), 0));

  const charityPct = Number(charity?.['percentage'] ?? 20);
  const charityAllocated = Number(charity?.['totalAllocatedCents'] ?? charityCents);
  const charityDisbursed = Number(charity?.['totalDisbursedCents'] ?? 0);
  const charityPending = Number(charity?.['pendingCents'] ?? charityAllocated - charityDisbursed);

  // P&L calculation
  const grossMargin = revCents - expCents;
  const grossMarginPct = revCents > 0 ? ((grossMargin / revCents) * 100).toFixed(1) : '0';

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finances</h1>
          <p className="page-subtitle">Resume financier — {period || 'Periode courante'}</p>
        </div>
        <ExportButton />
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Revenu</span>
          <span className="stat-value stat-value-sm text-success">{(revCents / 100).toFixed(2)}</span>
          <span className="text-xs text-muted">{currency}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Depenses</span>
          <span className="stat-value stat-value-sm text-danger">{(expCents / 100).toFixed(2)}</span>
          <span className="text-xs text-muted">{currency}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Profit Net</span>
          <span className={`stat-value stat-value-sm ${netCents >= 0 ? 'text-success' : 'text-danger'}`}>{(netCents / 100).toFixed(2)}</span>
          <span className="text-xs text-muted">{currency}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Marge Brute</span>
          <span className="stat-value stat-value-sm text-accent">{grossMarginPct}%</span>
          <span className="text-xs text-muted">{(grossMargin / 100).toFixed(2)} {currency}</span>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="card section">
        <div className="text-base font-bold mb-16">Compte de Resultat Simplifie</div>
        <div className="flex flex-col" style={{ gap: 2 }}>
          {[
            { label: 'Revenus bruts', amount: revCents, color: 'var(--text-primary)', bold: true },
            { label: 'Depenses totales', amount: -expCents, color: 'var(--danger)', bold: false },
            { label: 'Resultat brut', amount: grossMargin, color: grossMargin >= 0 ? 'var(--text-primary)' : 'var(--danger)', bold: true },
            { label: `Allocation charite (${charityPct}%)`, amount: -charityCents, color: 'var(--text-primary)', bold: false },
            { label: 'Resultat net', amount: netCents, color: netCents >= 0 ? 'var(--text-primary)' : 'var(--danger)', bold: true },
          ].map((row, i) => (
            <div key={i} className={`flex flex-between items-center ${row.bold ? 'bg-secondary rounded-sm' : ''}`} style={{
              padding: '10px 12px',
              borderTop: i === 2 || i === 4 ? '2px solid var(--border-primary)' : 'none',
            }}>
              <span className={`text-md ${row.bold ? 'font-bold' : ''}`}>{row.label}</span>
              <span className="text-base font-bold text-mono" style={{ color: row.color }}>
                {row.amount >= 0 ? '' : '-'}{(Math.abs(row.amount) / 100).toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 section">
        {/* Cost Breakdown */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Ventilation des Couts</div>
          {costEntries.length > 0 ? costEntries.map(([key, value]) => {
            const pct = totalCostCents > 0 ? (Number(value) / totalCostCents) * 100 : 0;
            return (
              <div key={key} className="mb-12">
                <div className="flex flex-between" style={{ marginBottom: 4 }}>
                  <span className="text-md" style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                  <span className="text-md font-semibold">{(Number(value) / 100).toFixed(2)} {currency}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                </div>
                <div className="text-muted text-right" style={{ fontSize: 10, marginTop: 2 }}>
                  {pct.toFixed(1)}% du total
                </div>
              </div>
            );
          }) : (
            <div className="text-md text-muted" style={{ fontStyle: 'italic' }}>
              Aucune ventilation de couts disponible. Les couts seront detailles une fois le LLM connecte.
            </div>
          )}
          {totalCostCents > 0 && (
            <div className="flex flex-between" style={{ padding: '10px 0', borderTop: '2px solid var(--border-primary)' }}>
              <span className="text-base font-bold">Total couts</span>
              <span className="text-base font-bold text-danger">{(totalCostCents / 100).toFixed(2)} {currency}</span>
            </div>
          )}
        </div>

        {/* Charity Module */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Module Charite</div>
          <div className="flex flex-col gap-16">
            <div>
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md">Alloue</span>
                <span className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>{(charityAllocated / 100).toFixed(2)} {currency}</span>
              </div>
              <div className="progress-bar progress-bar-lg">
                <div className="progress-bar-fill" style={{ width: '100%', background: '#1A1A1A' }} />
              </div>
            </div>
            <div>
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md">Distribue</span>
                <span className="text-md font-semibold text-success">{(charityDisbursed / 100).toFixed(2)} {currency}</span>
              </div>
              <div className="progress-bar progress-bar-lg">
                <div className="progress-bar-fill" style={{ width: charityAllocated > 0 ? `${(charityDisbursed / charityAllocated) * 100}%` : '0%', background: 'var(--text-primary)' }} />
              </div>
            </div>
            <div>
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md">En attente</span>
                <span className="text-md font-semibold text-warning">{(charityPending / 100).toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>

          <div className="separator" />
          <div className="text-sm text-tertiary">
            {charityPct}% du profit net est alloue automatiquement a la charite.
          </div>
        </div>
      </div>
    </div>
  );
}
