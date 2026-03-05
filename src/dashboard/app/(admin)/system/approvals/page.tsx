import { api, type ApprovalEntry } from '@/lib/api-client';
import { ApprovalActions, BatchApproveButton } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const statusBadge: Record<string, string> = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  DENIED: 'badge-danger',
  EXPIRED: 'badge-neutral',
};

const levelBadge: Record<string, string> = {
  LOW: 'badge-info',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
  CRITICAL: 'badge-danger',
};

export default async function ApprovalsPage() {
  let approvals: ApprovalEntry[] = [];
  let error: string | undefined;

  try {
    approvals = await api.getApprovals();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load approvals';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Approbations</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const pending = approvals.filter(a => a.status === 'PENDING');
  const decided = approvals.filter(a => a.status !== 'PENDING');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approbations</h1>
          <p className="page-subtitle">Human Override Queue — {pending.length} en attente</p>
        </div>
        {pending.length > 0 && (
          <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-warning">{pending.length} en attente</span>
            <BatchApproveButton pendingIds={pending.map(a => a.id)} />
          </div>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 ? (
        <div className="section">
          <div className="section-title text-warning">En attente de decision</div>
          <div className="flex flex-col gap-12">
            {pending.map(approval => (
              <div key={approval.id} className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
                <div className="flex flex-between mb-8" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="font-semibold mb-4" style={{ fontSize: 15 }}>{approval.title}</div>
                    <p className="text-md text-secondary leading-relaxed" style={{ margin: 0 }}>{approval.description}</p>
                  </div>
                  <span className={`badge ${levelBadge[approval.overrideLevel] ?? 'badge-neutral'}`}>
                    {approval.overrideLevel}
                  </span>
                </div>
                <div className="flex items-center flex-between mt-12">
                  <div className="text-sm text-tertiary">
                    Agent: <strong className="text-secondary">{approval.requestingAgent}</strong>
                    <span style={{ margin: '0 8px' }}>|</span>
                    {new Date(approval.createdAt).toLocaleString('fr-FR')}
                  </div>
                  <ApprovalActions approvalId={approval.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card section">
          <div className="empty-state">
            <div className="empty-state-icon">◐</div>
            <div className="empty-state-text">Aucune approbation en attente</div>
            <div className="empty-state-sub">Le systeme fonctionne de maniere autonome</div>
          </div>
        </div>
      )}

      {/* Decided */}
      {decided.length > 0 && (
        <div className="section">
          <div className="section-title">Historique des decisions</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Niveau</th>
                  <th>Agent</th>
                  <th className="text-center">Decision</th>
                  <th>Par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {decided.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.title}</td>
                    <td><span className={`badge ${levelBadge[a.overrideLevel] ?? 'badge-neutral'}`}>{a.overrideLevel}</span></td>
                    <td className="text-sm">{a.requestingAgent}</td>
                    <td className="text-center"><span className={`badge ${statusBadge[a.status] ?? 'badge-neutral'}`}>{a.status}</span></td>
                    <td className="text-sm text-tertiary">{a.decidedBy ?? '—'}</td>
                    <td className="text-sm text-tertiary">{a.decidedAt ? new Date(a.decidedAt).toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: GET /approvals/pending | POST /approvals/:id/decide (APPROVED / DENIED)
      </div>
    </div>
  );
}
