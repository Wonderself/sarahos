import { api } from '@/lib/api-client';

interface Quote {
  id: string;
  user_id: string;
  contact_name: string;
  email: string;
  phone?: string;
  project_type: string;
  description: string;
  budget_range?: string;
  urgency: string;
  status: string;
  admin_notes?: string;
  quoted_price?: number;
  created_at: string;
}

const PROJECT_LABELS: Record<string, string> = {
  software: 'Logiciel sur mesure',
  website: 'Site web & Application',
  crm: 'CRM personnalise',
  api_zapier: 'Integration API Zapier',
  mobile_app: 'Application mobile',
  automation: 'Systeme automatise',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#F7F7F7', text: '#1A1A1A' },
  reviewing: { bg: '#F7F7F7', text: '#1A1A1A' },
  quoted: { bg: '#E5E5E5', text: '#1A1A1A' },
  accepted: { bg: '#F7F7F7', text: '#1A1A1A' },
  declined: { bg: '#fee2e2', text: '#991b1b' },
  in_progress: { bg: '#E5E5E5', text: '#1A1A1A' },
  completed: { bg: '#F7F7F7', text: '#1A1A1A' },
};

export default async function AdminCustomCreationPage() {
  let quotes: Quote[] = [];
  let error = '';

  try {
    const res = await api.getCustomCreationQuotes();
    quotes = (res.quotes ?? []) as unknown as Quote[];
  } catch {
    error = 'Route non disponible. Verifiez que le backend est lance.';
  }

  return (
    <div className="admin-page-scrollable">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
        Creation sur mesure — Demandes
      </h1>
      <p style={{ fontSize: 13, color: '#9B9B9B', marginBottom: 24 }}>
        Gerez les demandes de devis pour les creations sur mesure (logiciels, sites, CRM, API, apps, automatisations).
      </p>

      {/* Stats overview */}
      <div className="fz-grid-4" style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total demandes', value: String(quotes.length), color: '#1A1A1A' },
          { label: 'Nouvelles', value: String(quotes.filter(q => q.status === 'new').length), color: '#9B9B9B' },
          { label: 'En cours', value: String(quotes.filter(q => ['reviewing', 'quoted', 'in_progress'].includes(q.status)).length), color: '#1A1A1A' },
          { label: 'Terminees', value: String(quotes.filter(q => ['accepted', 'completed'].includes(q.status)).length), color: '#1A1A1A' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px', background: '#F7F7F7', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9B9B9B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '16px 20px', borderRadius: 8, background: '#F7F7F7', color: '#1A1A1A', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Quotes table */}
      {quotes.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Contact</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Projet</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Budget</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Urgence</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Statut</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const statusStyle = STATUS_COLORS[q.status] ?? STATUS_COLORS['new'];
                return (
                  <tr key={q.id} style={{ borderBottom: '1px solid #F7F7F7' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: 600 }}>{q.contact_name}</div>
                      <div style={{ fontSize: 11, color: '#9B9B9B' }}>{q.email}</div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {PROJECT_LABELS[q.project_type] ?? q.project_type}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B' }}>{q.budget_range ?? '-'}</td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: q.urgency === 'critical' ? '#fee2e2' : q.urgency === 'high' ? '#F7F7F7' : '#F7F7F7',
                        color: q.urgency === 'critical' ? '#991b1b' : q.urgency === 'high' ? '#1A1A1A' : '#9B9B9B',
                      }}>
                        {q.urgency}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: statusStyle.bg, color: statusStyle.text,
                      }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', color: '#9B9B9B', fontSize: 11 }}>
                      {new Date(q.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !error ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9B9B9B' }}>
          Aucune demande de creation sur mesure pour le moment.
        </div>
      ) : null}
    </div>
  );
}
