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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{PAGE_META.agents.emoji}</span>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.agents.title}</h1>
        <span style={{ fontSize: 12, color: 'var(--fz-text-muted)' }}>{PAGE_META.agents.subtitle}</span>
        <HelpBubble text={PAGE_META.agents.helpText} />
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/client/agents/create" style={{
            padding: '4px 10px', borderRadius: 6, background: 'var(--fz-accent, #0EA5E9)', color: 'white',
            fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            ➕ Créer
          </Link>
        </div>
      </div>
      <PageExplanation pageId="agents" text={PAGE_META.agents?.helpText} />

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Mes agents personnalisés */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--fz-text, #1E293B)' }}>✨ Mes assistants personnalisés</h2>
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--accent-muted)', color: 'var(--fz-accent, #0EA5E9)', padding: '2px 8px', borderRadius: 10 }}>
            {customAgents.length}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: 'var(--fz-text-muted, #94A3B8)', fontSize: 13 }}>Chargement...</div>
        ) : customAgents.length === 0 ? (
          <div style={{
            background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 14, border: '2px dashed var(--fz-border, #E2E8F0)',
            padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 6 }}>Aucun assistant personnalisé</div>
            <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 20 }}>
              Créez votre premier <span className="fz-logo-word">assistant IA</span> sur mesure en quelques minutes
            </div>
            <Link href="/client/agents/create" style={{
              padding: '10px 24px', borderRadius: 10, background: 'var(--fz-accent, #0EA5E9)', color: 'white',
              fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ✨ Créer mon premier assistant
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                background: 'var(--fz-bg, #FFFFFF)', borderRadius: 14, border: '1px solid var(--fz-border, #E2E8F0)',
                padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                borderTop: `3px solid ${agent.color ?? 'var(--fz-accent, #0EA5E9)'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${agent.color ?? 'var(--fz-accent, #0EA5E9)'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fz-text, #1E293B)' }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.role ?? 'Assistant personnalisé'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {agent.domain && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text-secondary, #64748B)', fontWeight: 600 }}>
                      {DOMAIN_LABELS[agent.domain] ?? agent.domain}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                    background: agent.is_active ? 'rgba(16,185,129,0.15)' : 'var(--fz-bg-secondary, #F8FAFC)',
                    color: agent.is_active ? '#10b981' : 'var(--fz-text-muted, #94A3B8)',
                  }}>
                    {agent.is_active ? '✅ Actif' : '⬜ Inactif'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid var(--fz-border, #E2E8F0)',
                    background: 'var(--fz-bg, #FFFFFF)', color: 'var(--fz-text-secondary, #64748B)', fontSize: 11, fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    ✏️ Éditer
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id, agent.name)}
                    disabled={deleting === agent.id}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                      background: 'var(--fz-bg, #FFFFFF)', color: '#ef4444', fontSize: 11, cursor: 'pointer',
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

      {/* Agents Freenzy — Business */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fz-text, #1E293B)' }}>
          💼 Assistants business Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text-secondary, #64748B)', padding: '2px 8px', borderRadius: 10 }}>{businessAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'var(--fz-bg, #FFFFFF)', borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fz-text, #1E293B)' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)',
                fontSize: 10, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', textDecoration: 'none', flexShrink: 0,
              }}>
                ⚙️ Config
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Agents personnels */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fz-text, #1E293B)' }}>
          👤 Assistants personnels Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text-secondary, #64748B)', padding: '2px 8px', borderRadius: 10 }}>{personalAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'var(--fz-bg, #FFFFFF)', borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fz-text, #1E293B)' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)',
                fontSize: 10, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)', textDecoration: 'none', flexShrink: 0,
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
