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
      {/* Page Header */}
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>{PAGE_META.agents.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={CU.pageTitle}>{PAGE_META.agents.title}</h1>
          <p style={CU.pageSubtitle}>{PAGE_META.agents.subtitle}</p>
        </div>
        <HelpBubble text={PAGE_META.agents.helpText} />
        <Link href="/client/agents/create" style={{ ...CU.btnPrimary, textDecoration: 'none' }}>
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

      {/* ─── Stat cards ─── */}
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 24, marginTop: 20 }}>
        {[
          { emoji: '✨', value: customAgents.length, label: 'Personnalisés' },
          { emoji: '💼', value: businessAgents.length, label: 'Business' },
          { emoji: '👤', value: personalAgents.length, label: 'Personnels' },
        ].map(s => (
          <div key={s.label} style={{
            ...CU.card, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={emojiIcon(22)}>{s.emoji}</span>
            <div>
              <div style={CU.statValue}>{s.value}</div>
              <div style={CU.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Mes agents personnalisés ─── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={emojiIcon(16)}>✨</span>
          <h2 style={CU.sectionTitle}>Mes assistants personnalisés</h2>
          <span style={{ ...CU.badge, background: `${CU.accent}18`, color: CU.accent }}>
            {customAgents.length}
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/client/agents/create" style={{
            ...CU.btnPrimary, textDecoration: 'none',
            fontSize: 12, height: isMobile ? 40 : 30, padding: '0 10px',
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
                Créez votre premier <span className="fz-logo-word">assistant IA</span> sur mesure en quelques minutes
              </div>
              <Link href="/client/agents/create" style={{
                ...CU.btnPrimary, textDecoration: 'none', padding: '0 20px',
              }}>
                ✨ Créer mon premier assistant
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                ...CU.card, display: 'flex', flexDirection: 'column' as const, gap: 10,
                borderTop: `3px solid ${CU.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, background: CU.accentLight,
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
                    <span style={{ ...CU.badge, background: CU.accentLight, color: CU.textSecondary }}>
                      {DOMAIN_LABELS[agent.domain] ?? agent.domain}
                    </span>
                  )}
                  <span style={{
                    ...CU.badge,
                    background: agent.is_active ? CU.accentLight : CU.accentLight,
                    color: agent.is_active ? CU.text : CU.textMuted,
                  }}>
                    {agent.is_active ? '✅ Actif' : '⬜ Inactif'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                    ...CU.btnGhost, flex: 1, height: isMobile ? 44 : 32,
                    fontSize: 12, textDecoration: 'none',
                  }}>
                    ✏️ Éditer
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id, agent.name)}
                    disabled={deleting === agent.id}
                    style={{
                      ...CU.btnSmall, height: isMobile ? 44 : 32,
                      color: CU.danger,
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
          <span style={emojiIcon(16)}>💼</span>
          <h2 style={CU.sectionTitle}>Assistants business Freenzy</h2>
          <span style={CU.badge}>{businessAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={emojiIcon(20)}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                ...CU.btnSmall, textDecoration: 'none',
                height: isMobile ? 36 : 28,
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
          <span style={emojiIcon(16)}>👤</span>
          <h2 style={CU.sectionTitle}>Assistants personnels Freenzy</h2>
          <span style={CU.badge}>{personalAgents.length}</span>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              ...CU.card, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={emojiIcon(20)}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, color: CU.text }}>{agent.name}</div>
                <div style={{ fontSize: 11, color: CU.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                ...CU.btnSmall, textDecoration: 'none',
                height: isMobile ? 36 : 28,
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
