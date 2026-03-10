'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, PERSONAL_AGENTS } from '../../../lib/agent-config';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import HelpBubble from '../../../components/HelpBubble';
import PageExplanation from '../../../components/PageExplanation';

interface CustomAgent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  domain: string;
  capabilities: string[];
  tone: string;
  is_active: boolean;
  created_at: string;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

async function fetchPortal<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token, method: (opts.method ?? 'GET').toUpperCase(), data: opts.body ? JSON.parse(opts.body as string) : undefined }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

const DOMAIN_LABELS: Record<string, string> = {
  commercial: 'Commercial', rh: 'RH', marketing: 'Marketing', finance: 'Finance',
  tech: 'Tech', juridique: 'Juridique', support: 'Support', autre: 'Autre',
};

/* ClickUp design tokens */
const CU = {
  card: {
    background: 'var(--fz-bg, #FFFFFF)',
    border: 'none' as const,
    boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
    borderRadius: 8,
    transition: 'all 0.15s',
  },
  heading: { fontSize: 16, fontWeight: 600 as const, color: 'var(--fz-text, #1A1D23)', margin: 0 },
  sectionTitle: { fontSize: 14, fontWeight: 600 as const, color: 'var(--fz-text, #1A1D23)', margin: 0 },
  subtitle: { fontSize: 13, color: 'var(--fz-text-muted, #A1A5AC)' },
  btn: { height: 36, padding: '0 12px', borderRadius: 6, fontWeight: 500 as const, fontSize: 13, border: 'none' as const, cursor: 'pointer' as const, transition: 'all 0.15s' },
  btnPrimary: { background: 'var(--fz-accent, #0EA5E9)', color: '#fff' },
  badge: { fontSize: 11, fontWeight: 600 as const, padding: '2px 8px', borderRadius: 10 },
  text: 'var(--fz-text, #1A1D23)',
  textSec: 'var(--fz-text-secondary, #6B6F76)',
  textMuted: 'var(--fz-text-muted, #A1A5AC)',
  accent: 'var(--fz-accent, #0EA5E9)',
  border: 'var(--fz-border, #E8EAED)',
};

export default function AgentsPage() {
  const isMobile = useIsMobile();
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortal<{ agents: CustomAgent[] }>('/portal/agents/custom')
      .then(d => setCustomAgents(d.agents))
      .catch(() => setCustomAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteAgent = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'assistant "${name}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    try {
      await fetchPortal(`/portal/agents/custom/${id}`, { method: 'DELETE' });
      setCustomAgents(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally { setDeleting(null); }
  };

  const businessAgents = DEFAULT_AGENTS;
  const personalAgents = PERSONAL_AGENTS;

  return (
    <div className="client-page-scrollable" style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 1100 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }}>{PAGE_META.agents.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...CU.heading, fontSize: 16 }}>{PAGE_META.agents.title}</h1>
          <p style={{ ...CU.subtitle, fontSize: 13, margin: '2px 0 0' }}>{PAGE_META.agents.subtitle}</p>
        </div>
        <HelpBubble text={PAGE_META.agents.helpText} />
        <Link href="/client/agents/create" style={{
          ...CU.btn, ...CU.btnPrimary,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          ➕ Créer
        </Link>
      </div>
      <PageExplanation pageId="agents" text={PAGE_META.agents?.helpText} />

      {error && (
        <div style={{
          padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, fontSize: 13, color: '#ef4444', marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* ─── Stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { emoji: '✨', value: customAgents.length, label: 'Personnalisés' },
          { emoji: '💼', value: businessAgents.length, label: 'Business' },
          { emoji: '👤', value: personalAgents.length, label: 'Personnels' },
        ].map(s => (
          <div key={s.label} style={{
            ...CU.card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: CU.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Mes agents personnalisés ─── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <h2 style={{ ...CU.sectionTitle }}>Mes assistants personnalisés</h2>
          <span style={{ ...CU.badge, background: `${CU.accent}18`, color: CU.accent }}>
            {customAgents.length}
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/client/agents/create" style={{
            ...CU.btn, ...CU.btnPrimary,
            fontSize: 12, height: 30, padding: '0 10px',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            ➕ Nouveau
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: CU.textMuted, fontSize: 13 }}>Chargement...</div>
        ) : customAgents.length === 0 ? (
          <div style={{
            ...CU.card, border: `2px dashed ${CU.border}`,
            padding: '40px 32px', textAlign: 'center' as const, boxShadow: 'none',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: CU.text, marginBottom: 6 }}>Aucun assistant personnalisé</div>
            <div style={{ fontSize: 13, color: CU.textMuted, marginBottom: 20 }}>
              Créez votre premier <span className="fz-logo-word">assistant IA</span> sur mesure en quelques minutes
            </div>
            <Link href="/client/agents/create" style={{
              ...CU.btn, ...CU.btnPrimary,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0 20px',
            }}>
              ✨ Créer mon premier assistant
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                ...CU.card, padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 10,
                borderTop: `3px solid ${agent.color ?? CU.accent}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, background: `${agent.color ?? CU.accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.role ?? 'Assistant personnalisé'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {agent.domain && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: `${CU.border}`, color: CU.textSec, fontWeight: 600 }}>
                      {DOMAIN_LABELS[agent.domain] ?? agent.domain}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                    background: agent.is_active ? 'rgba(16,185,129,0.12)' : `${CU.border}`,
                    color: agent.is_active ? '#10b981' : CU.textMuted,
                  }}>
                    {agent.is_active ? '✅ Actif' : '⬜ Inactif'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                    flex: 1, height: 32, borderRadius: 6, border: 'none',
                    boxShadow: CU.card.boxShadow, background: 'var(--fz-bg, #FFFFFF)', color: CU.textSec,
                    fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    ✏️ Éditer
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id, agent.name)}
                    disabled={deleting === agent.id}
                    style={{
                      height: 32, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)',
                      background: 'var(--fz-bg, #FFFFFF)', color: '#ef4444', fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {deleting === agent.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Agents Freenzy — Business ─── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>💼</span>
          <h2 style={{ ...CU.sectionTitle }}>Assistants business Freenzy</h2>
          <span style={{ ...CU.badge, background: `${CU.border}`, color: CU.textSec }}>{businessAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                height: 28, padding: '0 8px', borderRadius: 6, border: 'none',
                boxShadow: CU.card.boxShadow, background: 'var(--fz-bg, #FFFFFF)',
                fontSize: 11, fontWeight: 500, color: CU.textSec, textDecoration: 'none', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', transition: 'all 0.15s',
              }}>
                ⚙️ Config
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Agents personnels ─── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>👤</span>
          <h2 style={{ ...CU.sectionTitle }}>Assistants personnels Freenzy</h2>
          <span style={{ ...CU.badge, background: `${CU.border}`, color: CU.textSec }}>{personalAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                height: 28, padding: '0 8px', borderRadius: 6, border: 'none',
                boxShadow: CU.card.boxShadow, background: 'var(--fz-bg, #FFFFFF)',
                fontSize: 11, fontWeight: 500, color: CU.textSec, textDecoration: 'none', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', transition: 'all 0.15s',
              }}>
                ⚙️ Config
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
