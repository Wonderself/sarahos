'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, PERSONAL_AGENTS } from '../../../lib/agent-config';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';
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
    <div className="client-page-scrollable" style={pageContainer(isMobile)}>
      {/* Page Header — compact */}
      <div style={headerRow()}>
        <span style={emojiIcon(18)}>{PAGE_META.agents.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...CU.pageTitle, fontSize: 18 }}>🤖 Assistants</h1>
          <p style={{ ...CU.pageSubtitle, fontSize: 12 }}>Votre équipe de 150+ assistants</p>
        </div>
        <HelpBubble text={PAGE_META.agents.helpText} />
        <Link href="/client/agents/create" style={{ ...CU.btnPrimary, textDecoration: 'none', fontSize: 12, height: 30, padding: '0 12px' }}>
          ➕ Créer
        </Link>
      </div>
      <PageExplanation pageId="agents" text={PAGE_META.agents?.helpText} />

      {error && (
        <div style={{
          ...CU.card, padding: '10px 14px', borderLeft: `3px solid ${CU.danger}`,
          fontSize: 13, color: CU.danger, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* ─── Stat cards — compact inline ─── */}
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 16, marginTop: 12 }}>
        {[
          { emoji: '✨', value: customAgents.length, label: 'Personnalisés' },
          { emoji: '💼', value: businessAgents.length, label: 'Business' },
          { emoji: '👤', value: personalAgents.length, label: 'Personnels' },
        ].map(s => (
          <div key={s.label} style={{
            ...CU.card, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          }}>
            <span style={{ fontSize: 16 }}>{s.emoji}</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9B9B9B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Mes assistants personnalisés ─── */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <h2 style={{ ...CU.sectionTitle, fontSize: 14 }}>Mes assistants personnalisés</h2>
          <span style={{ ...CU.badge, background: `${CU.accent}18`, color: CU.accent, fontSize: 10 }}>
            {customAgents.length}
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/client/agents/create" style={{
            ...CU.btnPrimary, textDecoration: 'none',
            fontSize: 11, height: isMobile ? 36 : 28, padding: '0 10px',
          }}>
            ➕ Nouveau
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: CU.textMuted, fontSize: 13 }}>Chargement...</div>
        ) : customAgents.length === 0 ? (
          <div style={{
            ...CU.card, border: `2px dashed ${CU.border}`,
          }}>
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>🤖</div>
              <div style={CU.emptyTitle}>Aucun assistant personnalisé</div>
              <div style={CU.emptyDesc}>
                Créez votre premier <span className="fz-logo-word">assistant</span> sur mesure en quelques minutes
              </div>
              <Link href="/client/agents/create" style={{
                ...CU.btnPrimary, textDecoration: 'none', padding: '0 20px',
              }}>
                ✨ Créer mon premier assistant
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                ...CU.card, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                borderLeft: `3px solid ${CU.border}`,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {agent.role ?? 'Assistant personnalisé'}
                    {agent.domain && <span style={{ ...CU.badge, fontSize: 9, padding: '0 4px', background: CU.accentLight, color: CU.textSecondary }}>{DOMAIN_LABELS[agent.domain] ?? agent.domain}</span>}
                    <span style={{ fontSize: 9, color: agent.is_active ? '#1A1A1A' : CU.textMuted }}>{agent.is_active ? '✅' : '⬜'}</span>
                  </div>
                </div>
                <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                  ...CU.btnGhost, height: isMobile ? 36 : 26, padding: '0 8px',
                  fontSize: 11, textDecoration: 'none',
                }}>
                  ✏️
                </Link>
                <button
                  onClick={() => deleteAgent(agent.id, agent.name)}
                  disabled={deleting === agent.id}
                  style={{
                    ...CU.btnSmall, height: isMobile ? 36 : 26, padding: '0 6px',
                    color: CU.danger, fontSize: 11,
                  }}
                >
                  {deleting === agent.id ? '...' : '🗑️'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Assistants business Freenzy — compact rows ─── */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>💼</span>
          <h2 style={{ ...CU.sectionTitle, fontSize: 14 }}>Assistants business</h2>
          <span style={{ ...CU.badge, fontSize: 10 }}>{businessAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            }}>
              <span style={{ fontSize: 16 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: '#1A1A1A' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: '#9B9B9B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                ...CU.btnSmall, textDecoration: 'none', fontSize: 10,
                height: isMobile ? 32 : 24, padding: '0 6px',
              }}>
                ⚙️
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Assistants personnels — compact rows ─── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>👤</span>
          <h2 style={{ ...CU.sectionTitle, fontSize: 14 }}>Assistants personnels</h2>
          <span style={{ ...CU.badge, fontSize: 10 }}>{personalAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            }}>
              <span style={{ fontSize: 16 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: '#1A1A1A' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: '#9B9B9B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                ...CU.btnSmall, textDecoration: 'none', fontSize: 10,
                height: isMobile ? 32 : 24, padding: '0 6px',
              }}>
                ⚙️
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
