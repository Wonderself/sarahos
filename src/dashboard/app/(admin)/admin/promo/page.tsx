import { api, type PromoCode } from '@/lib/api-client';
import { CreatePromoButton, DeletePromoButton } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const effectLabels: Record<string, string> = {
  tier_upgrade: 'Upgrade Tier',
  extend_demo: 'Extension Demo',
  bonus_calls: 'Bonus Appels',
};

const effectBadge: Record<string, string> = {
  tier_upgrade: 'badge-accent',
  extend_demo: 'badge-warning',
  bonus_calls: 'badge-success',
};

export default async function PromoPage() {
  let codes: PromoCode[] = [];
  let error: string | undefined;

  try {
    codes = await api.getPromoCodes();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load promo codes';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Codes Promo</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Handle different API response shapes
  const codeList = Array.isArray(codes) ? codes : ((codes as unknown as Record<string, unknown>)?.['codes'] as PromoCode[]) ?? [];

  const active = codeList.filter(c => c.isActive);
  const inactive = codeList.filter(c => !c.isActive);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Codes Promo</h1>
          <p className="page-subtitle">{active.length} actifs — {codeList.length} total</p>
        </div>
        <div className="page-actions">
          <CreatePromoButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 section">
        <div className="stat-card">
          <span className="stat-label">Total Codes</span>
          <span className="stat-value stat-value-sm">{codeList.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Actifs</span>
          <span className="stat-value stat-value-sm text-success">{active.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Redemptions</span>
          <span className="stat-value stat-value-sm text-accent">
            {codeList.reduce((s, c) => s + (c.currentRedemptions ?? 0), 0)}
          </span>
        </div>
      </div>

      {/* Active Codes */}
      {active.length > 0 && (
        <div className="section">
          <div className="section-title">Codes Actifs</div>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Effet</th>
                  <th className="text-center">Valeur</th>
                  <th className="text-center">Utilise / Max</th>
                  <th>Expiration</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.map((code) => (
                  <tr key={code.code}>
                    <td>
                      <code className="text-mono text-md font-semibold">
                        {code.code}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${effectBadge[code.effect] ?? 'badge-neutral'}`}>
                        {effectLabels[code.effect] ?? code.effect}
                      </span>
                    </td>
                    <td className="text-center font-semibold">{code.value ?? '-'}</td>
                    <td className="text-center">
                      <span className="font-semibold">{code.currentRedemptions ?? 0}</span>
                      <span className="text-muted"> / {code.maxRedemptions ?? '∞'}</span>
                    </td>
                    <td className="text-sm text-tertiary">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString('fr-FR') : 'Illimite'}
                    </td>
                    <td className="text-center">
                      <DeletePromoButton code={code.code} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div className="section">
          <div className="section-title">Codes Expires / Desactives</div>
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Effet</th>
                  <th className="text-center">Utilise / Max</th>
                  <th>Cree le</th>
                </tr>
              </thead>
              <tbody>
                {inactive.map((code) => (
                  <tr key={code.code} style={{ opacity: 0.5 }}>
                    <td><code className="text-mono text-md">{code.code}</code></td>
                    <td><span className="badge badge-neutral">{effectLabels[code.effect] ?? code.effect}</span></td>
                    <td className="text-center">{code.currentRedemptions ?? 0} / {code.maxRedemptions ?? '∞'}</td>
                    <td className="text-sm text-tertiary">{new Date(code.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {codeList.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◇</div>
            <div className="empty-state-text">Aucun code promo</div>
            <div className="empty-state-sub">Creez votre premier code avec le bouton ci-dessus</div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-16">
        API: POST /admin/promo-codes (creer) | GET /admin/promo-codes (lister) | DELETE /admin/promo-codes/:code (desactiver) | POST /promo/redeem (utiliser) | GET /promo/validate/:code (valider)
      </div>
    </div>
  );
}
