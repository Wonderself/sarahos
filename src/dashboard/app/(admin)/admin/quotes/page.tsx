import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const statusLabels: Record<string, string> = {
  new: 'Nouvelle',
  contacted: 'Contacte',
  negotiation: 'Negociation',
  accepted: 'Accepte',
  declined: 'Decline',
};

const statusColors: Record<string, string> = {
  new: '#6B6B6B',
  contacted: '#9B9B9B',
  negotiation: '#1A1A1A',
  accepted: '#1A1A1A',
  declined: '#DC2626',
};

export default async function QuotesPage() {
  let quotes: Record<string, unknown>[] = [];
  let total = 0;
  let error: string | undefined;

  try {
    const result = await api.getEnterpriseQuotes();
    quotes = result?.quotes ?? [];
    total = result?.total ?? 0;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load quotes';
  }

  if (error) {
    return (
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Devis Entreprise</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const newCount = quotes.filter(q => q['status'] === 'new').length;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Devis Entreprise</h1>
          <p className="page-subtitle">{newCount} nouvelle{newCount > 1 ? 's' : ''} demande{newCount > 1 ? 's' : ''} — {total} total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Nouvelles', count: quotes.filter(q => q['status'] === 'new').length, color: '#6B6B6B' },
          { label: 'Contactees', count: quotes.filter(q => q['status'] === 'contacted').length, color: '#9B9B9B' },
          { label: 'En negociation', count: quotes.filter(q => q['status'] === 'negotiation').length, color: '#1A1A1A' },
          { label: 'Acceptees', count: quotes.filter(q => q['status'] === 'accepted').length, color: '#1A1A1A' },
        ].map(s => (
          <div key={s.label} className="card p-16 text-center">
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quotes list */}
      {quotes.length === 0 ? (
        <div className="card p-32 text-center text-muted">
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1F3E2;</div>
          <p>Aucune demande de devis pour le moment.</p>
          <p className="text-sm mt-8">Les demandes apparaitront ici quand des entreprises soumettront le formulaire sur la page tarifs.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Contact</th>
                <th>Secteur</th>
                <th className="text-center">Utilisateurs</th>
                <th className="text-center">Budget</th>
                <th className="text-center">Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const status = (q['status'] as string) ?? 'new';
                const createdAt = q['created_at'] ? new Date(q['created_at'] as string).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short', year: 'numeric',
                }) : '-';

                return (
                  <tr key={q['id'] as string}>
                    <td>
                      <div className="font-semibold">{q['company_name'] as string}</div>
                      <div className="text-xs text-muted">{q['email'] as string}</div>
                    </td>
                    <td>
                      <div>{String(q['contact_name'] ?? '')}</div>
                      {q['phone'] ? <div className="text-xs text-muted">{String(q['phone'])}</div> : null}
                    </td>
                    <td className="text-sm">{String(q['industry'] ?? '-')}</td>
                    <td className="text-center font-semibold">{q['estimated_users'] ? `~${q['estimated_users']}` : '-'}</td>
                    <td className="text-center text-sm">{String(q['budget_range'] ?? '-')}</td>
                    <td className="text-center">
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 600,
                        background: `${statusColors[status]}18`,
                        color: statusColors[status],
                      }}>
                        {statusLabels[status] ?? status}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Needs detail */}
      {quotes.filter(q => q['needs']).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="font-bold mb-12">Besoins detailles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quotes.filter(q => q['needs']).map(q => (
              <div key={q['id'] as string} className="card p-16">
                <div className="flex items-center gap-8 mb-8">
                  <span className="font-semibold">{q['company_name'] as string}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 8,
                    background: `${statusColors[(q['status'] as string) ?? 'new']}18`,
                    color: statusColors[(q['status'] as string) ?? 'new'],
                    fontWeight: 600,
                  }}>
                    {statusLabels[(q['status'] as string) ?? 'new']}
                  </span>
                </div>
                <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{String(q['needs'] ?? '')}</p>
                {q['admin_notes'] ? (
                  <div style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 8,
                    background: 'var(--bg-secondary, #F7F7F7)', fontSize: 13,
                    borderLeft: '3px solid #1A1A1A',
                  }}>
                    <strong>Notes admin :</strong> {String(q['admin_notes'])}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
