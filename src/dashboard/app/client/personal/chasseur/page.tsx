'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';
import HelpBubble from '../../../../components/HelpBubble';

// ─── Types ────────────────────────────────────────────────────────────────────

type MissionStatus = 'draft' | 'applied' | 'interview' | 'offered' | 'rejected';
type MissionType = 'cdi' | 'cdd' | 'freelance' | 'stage' | 'mission';

interface Mission {
  id: string;
  title: string;
  company: string;
  type: MissionType;
  status: MissionStatus;
  tjm?: number;
  salary_k?: number;
  location?: string;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MissionStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'À candidater', color: '#6b7280', icon: '✍️' },
  applied: { label: 'Candidaté', color: '#3b82f6', icon: '📤' },
  interview: { label: 'Entretien', color: '#f59e0b', icon: '🎯' },
  offered: { label: 'Offre reçue', color: '#22c55e', icon: '🎉' },
  rejected: { label: 'Refusé', color: '#ef4444', icon: '❌' },
};

const TYPE_LABELS: Record<MissionType, string> = {
  cdi: 'CDI', cdd: 'CDD', freelance: 'Freelance', stage: 'Stage', mission: 'Mission',
};

const STATUSES: MissionStatus[] = ['draft', 'applied', 'interview', 'offered', 'rejected'];

// ─── API helper ───────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChasseurPage() {
  const { showError, showSuccess } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', type: 'freelance' as MissionType, status: 'draft' as MissionStatus,
    tjm: '', salary_k: '', location: '', next_action: '', next_action_date: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalCall<{ missions: Mission[] }>('/personal/chasseur/missions');
      setMissions(res.missions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const applied = missions.filter(m => m.status !== 'draft').length;
  const interviews = missions.filter(m => m.status === 'interview').length;
  const responseRate = applied > 0 ? Math.round((missions.filter(m => m.status === 'interview' || m.status === 'offered').length / applied) * 100) : 0;
  const offers = missions.filter(m => m.status === 'offered').length;

  async function handleMove(id: string, currentStatus: MissionStatus, direction: 'forward' | 'back') {
    const idx = STATUSES.indexOf(currentStatus);
    const newIdx = direction === 'forward' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= STATUSES.length) return;
    const newStatus = STATUSES[newIdx];
    try {
      await portalCall(`/personal/chasseur/missions/${id}`, 'PATCH', { status: newStatus });
      setMissions(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedMission?.id === id) setSelectedMission(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors du déplacement'); }
  }

  async function handleAdd() {
    if (!form.title || !form.company) return;
    setSaving(true);
    try {
      await portalCall('/personal/chasseur/missions', 'POST', {
        title: form.title,
        company: form.company,
        type: form.type,
        status: form.status,
        ...(form.tjm && { tjm: parseInt(form.tjm) }),
        ...(form.salary_k && { salary_k: parseInt(form.salary_k) }),
        ...(form.location && { location: form.location }),
        ...(form.next_action && { next_action: form.next_action }),
        ...(form.next_action_date && { next_action_date: form.next_action_date }),
        ...(form.notes && { notes: form.notes }),
      });
      setShowModal(false);
      setForm({ title: '', company: '', type: 'freelance', status: 'draft', tjm: '', salary_k: '', location: '', next_action: '', next_action_date: '', notes: '' });
      showSuccess('Mission ajoutée');
      await load();
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette mission ?')) return;
    try {
      await portalCall(`/personal/chasseur/missions/${id}`, 'DELETE');
      setMissions(prev => prev.filter(m => m.id !== id));
      if (selectedMission?.id === id) setSelectedMission(null);
      showSuccess('Mission supprimée');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors de la suppression'); }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>🎯</div>
        <div className="text-md text-tertiary animate-pulse">Chargement du pipeline...</div>
      </div>
    );
  }

  // ── Mission detail side panel ──
  const MissionDetail = ({ m }: { m: Mission }) => (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{m.title}</div>
          <div style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>🏢 {m.company}</div>
        </div>
        <button onClick={() => setSelectedMission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--fz-text-muted, #94A3B8)' }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Type</span>
          <span style={{ fontWeight: 600 }}>{TYPE_LABELS[m.type]}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Statut</span>
          <span style={{ fontWeight: 700, color: STATUS_CONFIG[m.status].color }}>{STATUS_CONFIG[m.status].icon} {STATUS_CONFIG[m.status].label}</span>
        </div>
        {m.tjm && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>TJM</span>
            <span style={{ fontWeight: 600 }}>{m.tjm} €/j</span>
          </div>
        )}
        {m.salary_k && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Salaire</span>
            <span style={{ fontWeight: 600 }}>{m.salary_k}k€</span>
          </div>
        )}
        {m.location && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Localisation</span>
            <span style={{ fontWeight: 600 }}>📍 {m.location}</span>
          </div>
        )}
      </div>

      {m.next_action && (
        <div style={{ padding: '10px 14px', background: 'var(--accent)10', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>PROCHAINE ACTION</div>
          <div style={{ fontSize: 13 }}>{m.next_action}</div>
          {m.next_action_date && (
            <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>
              📅 {new Date(m.next_action_date).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      )}

      {m.notes && (
        <div style={{ fontSize: 12, color: 'var(--fz-text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{m.notes}</div>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STATUSES.indexOf(m.status) > 0 && (
          <button onClick={() => handleMove(m.id, m.status, 'back')} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            ← Retour
          </button>
        )}
        {STATUSES.indexOf(m.status) < STATUSES.length - 1 && (
          <button onClick={() => handleMove(m.id, m.status, 'forward')} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
            Avancer →
          </button>
        )}
        <Link href={`/client/chat?agent=fz-chasseur&context=${encodeURIComponent(`Mission: ${m.title} chez ${m.company} (${TYPE_LABELS[m.type]})`)}`} className="btn btn-ghost btn-sm" style={{ fontSize: 11, textDecoration: 'none' }}>
          💬 Conseil
        </Link>
        <button onClick={() => handleDelete(m.id)} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: '#ef4444' }}>🗑️</button>
      </div>
    </div>
  );

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 4 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', textDecoration: 'none' }}>← Agents personnels</Link>
          </div>
          <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{PAGE_META.chasseur.emoji} {PAGE_META.chasseur.title}</h1>
          <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{PAGE_META.chasseur.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <HelpBubble text={PAGE_META.chasseur.helpText} />
          <button onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')} className="btn btn-ghost btn-sm">
            {view === 'kanban' ? <>📋 Liste</> : <>📊 Kanban</>}
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Ajouter</button>
        </div>
      </div>
      <PageExplanation pageId="chasseur" text={PAGE_META.chasseur?.helpText} />

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Missions', value: missions.length, icon: '📋', color: 'var(--accent)' },
          { label: 'Candidatures', value: applied, icon: '📤', color: '#3b82f6' },
          { label: 'Entretiens', value: interviews, icon: '🎯', color: '#f59e0b' },
          { label: 'Taux de réponse', value: `${responseRate}%`, icon: '📈', color: responseRate >= 30 ? '#22c55e' : '#f59e0b' },
          { label: 'Offres', value: offers, icon: '🎉', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedMission ? '1fr 320px' : '1fr', gap: 20 }}>
        <div>
          {missions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Aucune mission en cours</div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 20 }}>
                Ajoutez vos opportunités et suivez chaque étape jusqu&apos;à l&apos;offre
              </div>
              <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Ajouter une mission</button>
            </div>
          ) : view === 'kanban' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {STATUSES.map(status => {
                const col = missions.filter(m => m.status === status);
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: cfg.color }}>{cfg.label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                        background: cfg.color + '20', color: cfg.color,
                      }}>{col.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                      {col.map(m => (
                        <div
                          key={m.id}
                          className="card"
                          onClick={() => setSelectedMission(m)}
                          style={{
                            padding: '12px 14px', cursor: 'pointer',
                            borderLeft: `3px solid ${cfg.color}`,
                            background: selectedMission?.id === m.id ? 'var(--fz-bg-secondary, #F8FAFC)' : undefined,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>🏢 {m.company}</div>
                          {m.tjm && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>{m.tjm}€/j</div>}
                          {m.next_action_date && (
                            <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                              📅 {new Date(m.next_action_date).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {missions.map(m => {
                const cfg = STATUS_CONFIG[m.status];
                return (
                  <div
                    key={m.id}
                    className="card"
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderLeft: `3px solid ${cfg.color}` }}
                    onClick={() => setSelectedMission(m)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>🏢 {m.company} · {TYPE_LABELS[m.type]}</div>
                    </div>
                    {m.tjm && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{m.tjm}€/j</div>}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: cfg.color + '20', color: cfg.color, flexShrink: 0 }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {STATUSES.indexOf(m.status) > 0 && (
                        <button onClick={e => { e.stopPropagation(); handleMove(m.id, m.status, 'back'); }} style={{ background: 'none', border: '1px solid var(--fz-border, #E2E8F0)', borderRadius: 4, cursor: 'pointer', fontSize: 12, padding: '2px 6px', color: 'var(--fz-text-muted, #94A3B8)' }}>←</button>
                      )}
                      {STATUSES.indexOf(m.status) < STATUSES.length - 1 && (
                        <button onClick={e => { e.stopPropagation(); handleMove(m.id, m.status, 'forward'); }} style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, padding: '2px 6px', color: '#fff' }}>→</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedMission && <MissionDetail m={selectedMission} />}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🎯 Nouvelle mission</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Poste / Mission</label>
                  <input className="input" placeholder="Ex: Développeur React..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Entreprise</label>
                  <input className="input" placeholder="Nom de l'entreprise" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as MissionType }))}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Statut initial</label>
                  <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as MissionStatus }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>TJM (€/jour)</label>
                  <input className="input" type="number" placeholder="600" value={form.tjm} onChange={e => setForm(p => ({ ...p, tjm: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Salaire (k€/an)</label>
                  <input className="input" type="number" placeholder="55" value={form.salary_k} onChange={e => setForm(p => ({ ...p, salary_k: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Prochaine action</label>
                <input className="input" placeholder="Ex: Relancer le recruteur..." value={form.next_action} onChange={e => setForm(p => ({ ...p, next_action: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date de l&apos;action</label>
                <input className="input" type="date" value={form.next_action_date} onChange={e => setForm(p => ({ ...p, next_action_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea className="input" rows={2} placeholder="Remarques, liens, contacts..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
              <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
