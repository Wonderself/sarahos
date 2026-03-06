import { api } from '../../../../lib/api-client';
import { ApproveButton, DenyButton, RollbackButton, TriggerAuditButton } from './AutopilotActions';

const SEVERITY_ICON: Record<string, string> = {
  urgent: 'error', critical: 'warning', warning: 'info', info: 'help',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon', pending_review: 'En attente', approved: 'Approuvé', denied: 'Refusé',
  executing: 'En cours', completed: 'Terminé', failed: 'Échoué', rolled_back: 'Annulé', expired: 'Expiré',
};
const STATUS_COLOR: Record<string, string> = {
  pending_review: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-green-500/20 text-green-400',
  denied: 'bg-red-500/20 text-red-400', completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400', rolled_back: 'bg-orange-500/20 text-orange-400',
  expired: 'bg-gray-500/20 text-gray-400', executing: 'bg-blue-500/20 text-blue-400',
  draft: 'bg-gray-500/20 text-gray-400',
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

export default async function AutopilotPage() {
  let stats: Record<string, unknown> = {};
  let pendingProposals: Array<Record<string, unknown>> = [];
  let recentProposals: Array<Record<string, unknown>> = [];
  let reports: Array<Record<string, unknown>> = [];

  try {
    const [statsData, pendingData, recentData, reportsData] = await Promise.allSettled([
      api.getAutopilotStats(),
      api.getAutopilotProposals({ status: 'pending_review', limit: 20 }),
      api.getAutopilotProposals({ limit: 30 }),
      api.getAutopilotReports(10),
    ]);
    if (statsData.status === 'fulfilled') stats = statsData.value;
    if (pendingData.status === 'fulfilled') pendingProposals = pendingData.value.proposals;
    if (recentData.status === 'fulfilled') recentProposals = recentData.value.proposals.filter(
      (p: Record<string, unknown>) => p.status !== 'pending_review',
    );
    if (reportsData.status === 'fulfilled') reports = reportsData.value.reports;
  } catch {
    // fail gracefully
  }

  const statCards = [
    { label: 'En attente', value: stats.pendingCount ?? 0, color: 'text-yellow-400' },
    { label: 'Approuvés (24h)', value: stats.approvedToday ?? 0, color: 'text-green-400' },
    { label: 'Exécutés (24h)', value: stats.executedToday ?? 0, color: 'text-blue-400' },
    { label: 'Échoués (24h)', value: stats.failedToday ?? 0, color: 'text-red-400' },
    { label: 'Rollbacks', value: stats.rolledBackTotal ?? 0, color: 'text-orange-400' },
    { label: 'Temps moyen décision', value: `${stats.avgDecisionTimeMinutes ?? 0}m`, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 admin-page-scrollable">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Autopilot</h1>
          <p className="text-gray-400 mt-1">Gouvernance autonome — Audit, propositions, validation WhatsApp</p>
        </div>
        <TriggerAuditButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 uppercase">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{String(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Pending Queue */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          File d&apos;attente ({pendingProposals.length})
        </h2>
        {pendingProposals.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700/50">
            Aucune proposition en attente
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProposals.map((p) => (
              <div key={String(p.id)} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{SEVERITY_ICON[String(p.severity)] ?? 'circle'}</span>
                      <span className="text-xs text-gray-500 uppercase font-medium">{String(p.category)}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{String(p.agentName)}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{timeAgo(String(p.createdAt))}</span>
                    </div>
                    <h3 className="text-white font-medium">{String(p.title)}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{String(p.description)}</p>
                    {p.rationale ? (
                      <p className="text-gray-500 text-xs mt-2 italic">Rationale: {String(p.rationale).slice(0, 200)}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ApproveButton proposalId={String(p.id)} />
                    <DenyButton proposalId={String(p.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Execution Log */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Journal d&apos;exécution</h2>
        {recentProposals.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700/50">
            Aucune exécution récente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                  <th className="text-left py-3 px-4">Sévérité</th>
                  <th className="text-left py-3 px-4">Titre</th>
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Décidé par</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProposals.slice(0, 20).map((p) => (
                  <tr key={String(p.id)} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4"><span className="material-symbols-rounded" style={{ fontSize: 16 }}>{SEVERITY_ICON[String(p.severity)] ?? 'circle'}</span></td>
                    <td className="py-3 px-4 text-white max-w-xs truncate">{String(p.title)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{String(p.agentName)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[String(p.status)] ?? 'bg-gray-700 text-gray-300'}`}>
                        {STATUS_LABEL[String(p.status)] ?? String(p.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{p.decidedBy ? String(p.decidedBy) : '—'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{timeAgo(String(p.createdAt))}</td>
                    <td className="py-3 px-4">
                      {String(p.status) === 'completed' && Boolean(p.rollbackSnapshot) ? (
                        <RollbackButton proposalId={String(p.id)} />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Audit Reports */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Rapports d&apos;audit</h2>
        {reports.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700/50">
            Aucun rapport — lancez un audit pour commencer
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const findings = (r.findings as Array<Record<string, unknown>>) ?? [];
              return (
                <details key={String(r.id)} className="bg-gray-800 rounded-xl border border-gray-700 group">
                  <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase">
                        {String(r.reportType)}
                      </span>
                      <span className="text-white text-sm">{String(r.summary).slice(0, 100)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{findings.length} findings</span>
                      <span>{String(r.proposalsGenerated ?? 0)} proposals</span>
                      <span>{timeAgo(String(r.createdAt))}</span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 space-y-2">
                    {findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{SEVERITY_ICON[String(f.severity)] ?? 'circle'}</span>
                        <div>
                          <span className="text-white">{String(f.title)}</span>
                          <p className="text-gray-500 text-xs">{String(f.description)}</p>
                        </div>
                      </div>
                    ))}
                    {r.metrics && typeof r.metrics === 'object' && Object.keys(r.metrics as object).length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-500 uppercase mb-1">Métriques</p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(r.metrics as Record<string, unknown>).map(([k, v]) => (
                            <span key={k} className="text-xs bg-gray-700 px-2 py-1 rounded">
                              <span className="text-gray-400">{k}:</span> <span className="text-white">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
