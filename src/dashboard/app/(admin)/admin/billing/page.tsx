import { api, type BillingStats } from '@/lib/api-client';
import BillingCharts from './BillingCharts';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function BillingPage() {
  let billingStats: BillingStats | undefined;
  let pricing: Record<string, unknown> | undefined;
  let usage: Record<string, unknown> | undefined;
  let tierData: Array<{ tier: string; count: number }> = [];
  let transactions: Array<Record<string, unknown>> = [];
  let error: string | undefined;

  try {
    const [bs, p, u, td, tx] = await Promise.all([
      api.getBillingStats(),
      api.getPricing(),
      api.getUsage().catch(() => undefined),
      api.getTierDistribution().catch(() => []),
      api.getAdminTransactions(50).catch(() => null),
    ]);
    billingStats = bs;
    pricing = p;
    usage = u;
    tierData = td;
    transactions = tx?.transactions ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load billing data';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Facturation</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const revenue = Number(billingStats?.totalRevenue ?? 0);
  const cost = Number(billingStats?.totalCost ?? 0);
  const margin = Number(billingStats?.totalMargin ?? 0);
  const requests = Number(billingStats?.totalRequests ?? 0);
  const byModel = billingStats?.byModel ?? {};

  // Handle various pricing response shapes
  const pricingList = (pricing?.['pricing'] as Array<Record<string, unknown>>)
    ?? (Array.isArray(pricing) ? pricing : []);

  // Parse usage data
  const usageEntries: Array<{ label: string; value: string; color?: string }> = [];
  if (usage) {
    const logs = (usage['logs'] ?? usage['usage'] ?? usage['entries']) as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(logs)) {
      // Aggregate from logs
      let totalInput = 0, totalOutput = 0, totalCalls = 0;
      logs.forEach(log => {
        totalInput += Number(log['inputTokens'] ?? 0);
        totalOutput += Number(log['outputTokens'] ?? 0);
        totalCalls += 1;
      });
      usageEntries.push(
        { label: 'Total appels', value: totalCalls.toLocaleString() },
        { label: 'Input tokens', value: totalInput.toLocaleString(), color: 'var(--accent)' },
        { label: 'Output tokens', value: totalOutput.toLocaleString(), color: 'var(--success)' },
        { label: 'Total tokens', value: (totalInput + totalOutput).toLocaleString() },
      );
    } else {
      // Flat object
      for (const [k, v] of Object.entries(usage)) {
        if (typeof v === 'number' || typeof v === 'string') {
          usageEntries.push({ label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' '), value: typeof v === 'number' ? v.toLocaleString() : v });
        }
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facturation & Billing</h1>
          <p className="page-subtitle">Revenus, couts et utilisation LLM</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-5 section">
        <div className="stat-card">
          <span className="stat-label">Revenu Total</span>
          <span className="stat-value stat-value-sm text-success">{(revenue / 1_000_000).toFixed(2)}</span>
          <span className="text-xs text-muted">credits</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cout Total</span>
          <span className="stat-value stat-value-sm text-danger">{(cost / 1_000_000).toFixed(2)}</span>
          <span className="text-xs text-muted">credits</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Marge (20%)</span>
          <span className="stat-value stat-value-sm text-accent">{(margin / 1_000_000).toFixed(2)}</span>
          <span className="text-xs text-muted">credits</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Appels LLM</span>
          <span className="stat-value stat-value-sm">{requests.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Marge %</span>
          <span className="stat-value stat-value-sm text-warning">
            {revenue > 0 ? ((margin / revenue) * 100).toFixed(1) : '20'}%
          </span>
        </div>
      </div>

      {/* By Model */}
      {Object.keys(byModel).length > 0 && (
        <div className="section">
          <div className="section-title">Usage par Modele</div>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modele</th>
                  <th className="text-right">Requetes</th>
                  <th className="text-right">Cout (cr)</th>
                  <th className="text-right">Facture (cr)</th>
                  <th className="text-right">Marge (cr)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byModel).map(([model, data]) => {
                  const d = data as { requests: number; cost: number; billed: number };
                  return (
                    <tr key={model}>
                      <td className="font-medium">{model}</td>
                      <td className="text-right">{(d.requests ?? 0).toLocaleString()}</td>
                      <td className="text-right text-danger">{((d.cost ?? 0) / 1_000_000).toFixed(4)}</td>
                      <td className="text-right text-success">{((d.billed ?? 0) / 1_000_000).toFixed(4)}</td>
                      <td className="text-right text-accent">{(((d.billed ?? 0) - (d.cost ?? 0)) / 1_000_000).toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing + Usage side by side */}
      <div className="grid-2 section">
        <div className="card">
          <div className="text-md font-semibold mb-16">Grille Tarifaire</div>
          {pricingList.length > 0 ? pricingList.map((p, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-md font-medium">{String(p['model'] ?? p['name'] ?? `Model ${i}`)}</span>
                <span className="badge badge-accent">{String(p['provider'] ?? p['tier'] ?? 'anthropic')}</span>
              </div>
              <div className="flex gap-16 text-sm text-tertiary">
                {p['inputCostPerMillion'] !== undefined && <span>Input: {(Number(p['inputCostPerMillion']) / 1_000_000).toFixed(2)} cr/1M</span>}
                {p['outputCostPerMillion'] !== undefined && <span>Output: {(Number(p['outputCostPerMillion']) / 1_000_000).toFixed(2)} cr/1M</span>}
                {p['marginPercent'] !== undefined && <span>Marge: {String(p['marginPercent'])}%</span>}
              </div>
            </div>
          )) : (
            <div className="text-md text-muted" style={{ fontStyle: 'italic' }}>
              Aucune grille tarifaire configuree. Configurez via POST /billing/pricing.
            </div>
          )}
        </div>

        <div className="card">
          <div className="text-md font-semibold mb-16">
            {usageEntries.length > 0 ? 'Consommation LLM' : 'Endpoints Billing'}
          </div>
          {usageEntries.length > 0 ? (
            <div className="flex flex-col gap-8">
              {usageEntries.map((entry, i) => (
                <div key={i} className="flex flex-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <span className="text-md text-secondary" style={{ textTransform: 'capitalize' }}>{entry.label}</span>
                  <span className="text-md font-semibold" style={{ color: entry.color ?? 'var(--text-primary)' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {[
                { method: 'POST', path: '/billing/deposit', desc: 'Deposer des credits' },
                { method: 'GET', path: '/billing/wallet', desc: 'Voir un wallet' },
                { method: 'GET', path: '/billing/transactions', desc: 'Historique transactions' },
                { method: 'GET', path: '/billing/usage', desc: 'Consommation LLM' },
                { method: 'GET', path: '/billing/pricing', desc: 'Grille tarifaire' },
                { method: 'POST', path: '/billing/llm', desc: 'Appel LLM facture' },
                { method: 'GET', path: '/billing/admin/stats', desc: 'Stats admin' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center" style={{ gap: 10, padding: '6px 0' }}>
                  <span className={`badge text-mono ${ep.method === 'POST' ? 'badge-warning' : 'badge-info'}`} style={{ minWidth: 44, textAlign: 'center' }}>
                    {ep.method}
                  </span>
                  <code className="text-sm text-mono">{ep.path}</code>
                  <span className="text-sm text-tertiary" style={{ marginLeft: 'auto' }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts section */}
      <div className="section">
        <div className="section-title">Visualisations</div>
        <BillingCharts tierData={tierData} />
      </div>

      {/* Recent Transactions */}
      <div className="section">
        <div className="section-title">Transactions récentes (50 dernières)</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Type</th>
                <th className="text-right">Montant (μcr)</th>
                <th className="text-right">Solde après (μcr)</th>
                <th className="hide-mobile">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    Aucune transaction
                  </td>
                </tr>
              ) : transactions.map((tx, i) => {
                const amount = Number(tx['amount'] ?? 0);
                const isCredit = amount > 0;
                return (
                  <tr key={String(tx['id'] ?? i)}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {tx['created_at'] ? new Date(String(tx['created_at'])).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{String(tx['email'] ?? tx['user_id'] ?? '—')}</td>
                    <td><span className={`badge ${isCredit ? 'badge-success' : 'badge-danger'}`}>{String(tx['type'] ?? '—')}</span></td>
                    <td className="text-right font-semibold" style={{ color: isCredit ? 'var(--success)' : 'var(--danger)', fontSize: 12 }}>
                      {isCredit ? '+' : ''}{amount.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {Number(tx['balance_after'] ?? 0).toLocaleString()}
                    </td>
                    <td className="hide-mobile" style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(tx['description'] ?? '—')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-muted">
        1 credit = 1,000,000 micro-credits. Marge configurable via TOKEN_MARGIN_PERCENT (actuellement 20%).
      </div>
    </div>
  );
}
