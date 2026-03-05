import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

const agentNameMap: Record<string, string> = {
  'fz-budget': 'Budget',
  'fz-comptable': 'Comptable',
  'fz-chasseur': 'Chasseur',
  'fz-cv': 'CV',
  'fz-ceremonie': 'Ceremonie',
  'fz-ecrivain': 'Ecrivain',
  'fz-negociateur': 'Negociateur',
  'fz-impots': 'Impots',
  'fz-portfolio': 'Portfolio',
  'fz-contradicteur': 'Contradicteur',
  'fz-cineaste': 'Cineaste',
  'fz-coach': 'Coach',
  'fz-deconnexion': 'Deconnexion',
};

function agentLabel(id: string): string {
  return agentNameMap[id] ?? id;
}

function fmtWords(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k mots`;
  return `${n} mots`;
}

function fmtEuros(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

interface ConfigEntry { agent_id: string; total: number; active: number }
interface ChasseurEntry { status: string; count: number }

interface PersonalAgentsData {
  configs: ConfigEntry[];
  budget: { transactions: number; users: number; income: number; expenses: number };
  comptable: { records: number; users: number };
  chasseur: ChasseurEntry[];
  cv: { total: number };
  events: { total: number; users: number };
  writing: { projects: number; users: number; words: number };
}

export default async function PersonalAgentsPage() {
  let data: PersonalAgentsData = {
    configs: [],
    budget: { transactions: 0, users: 0, income: 0, expenses: 0 },
    comptable: { records: 0, users: 0 },
    chasseur: [],
    cv: { total: 0 },
    events: { total: 0, users: 0 },
    writing: { projects: 0, users: 0, words: 0 },
  };

  try {
    const result = await api.getAdminPersonalAgentsStats();
    data = {
      configs: result?.configs ?? [],
      budget: result?.budget ?? data.budget,
      comptable: result?.comptable ?? data.comptable,
      chasseur: result?.chasseur ?? [],
      cv: result?.cv ?? data.cv,
      events: result?.events ?? data.events,
      writing: result?.writing ?? data.writing,
    };
  } catch { /* empty */ }

  const isEmpty = data.configs.length === 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Agents Personnels</h1>
          <p className="page-subtitle">Adoption et utilisation des agents personnels par les utilisateurs</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="card section" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F464;</div>
          <p className="text-muted">Aucun agent personnel active pour le moment.</p>
        </div>
      ) : (
        <>
          {/* Section 1 — Adoption par agent */}
          <div className="section">
            <div className="section-title">Adoption par agent</div>
            <div className="grid-3">
              {data.configs.map(c => (
                <div key={c.agent_id} className="stat-card">
                  <div className="stat-label">{agentLabel(c.agent_id)}</div>
                  <div className="stat-value">{c.total}</div>
                  <div className="stat-value-sm text-success">{c.active} actifs</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 — Details par agent */}
          <div className="section">
            <div className="section-title">Details par agent</div>
            <div className="grid-3">
              {/* Budget */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>Budget</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Utilisateurs</div>
                    <div className="stat-value-sm">{data.budget.users}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Transactions</div>
                    <div className="stat-value-sm">{data.budget.transactions}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Revenus</div>
                    <div className="stat-value-sm text-success">{fmtEuros(data.budget.income)}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Depenses</div>
                    <div className="stat-value-sm text-warning">{fmtEuros(data.budget.expenses)}</div>
                  </div>
                </div>
              </div>

              {/* Comptable */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>Comptable</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Utilisateurs</div>
                    <div className="stat-value-sm">{data.comptable.users}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Ecritures</div>
                    <div className="stat-value-sm">{data.comptable.records}</div>
                  </div>
                </div>
              </div>

              {/* Chasseur */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>Chasseur</div>
                {data.chasseur.length === 0 ? (
                  <div className="text-sm text-muted">Aucune donnee</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {data.chasseur.map(s => (
                      <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span className="text-muted">{s.status || '—'}</span>
                        <span className="font-semibold">{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CV */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>CV</div>
                <div className="stat-card" style={{ padding: 12 }}>
                  <div className="stat-label">Profils</div>
                  <div className="stat-value-sm">{data.cv.total}</div>
                </div>
              </div>

              {/* Ceremonie */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>Ceremonie</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Evenements</div>
                    <div className="stat-value-sm">{data.events.total}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Utilisateurs</div>
                    <div className="stat-value-sm">{data.events.users}</div>
                  </div>
                </div>
              </div>

              {/* Ecrivain */}
              <div className="card" style={{ padding: 20 }}>
                <div className="font-semibold" style={{ marginBottom: 12 }}>Ecrivain</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Projets</div>
                    <div className="stat-value-sm">{data.writing.projects}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Utilisateurs</div>
                    <div className="stat-value-sm">{data.writing.users}</div>
                  </div>
                  <div className="stat-card" style={{ padding: 12 }}>
                    <div className="stat-label">Mots ecrits</div>
                    <div className="stat-value-sm text-accent">{fmtWords(data.writing.words)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
