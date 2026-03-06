'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, PERSONAL_AGENTS } from '../../../lib/agent-config';

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
    if (!confirm(`Supprimer l'agent "${name}" ? Cette action est irréversible.`)) return;
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
    <div className="client-page-scrollable" style={{ padding: '24px 20px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}><span className="fz-logo-word">Agents IA</span></h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Gérez vos agents <span className="fz-logo-word">Freenzy</span> et créez vos propres assistants personnalisés
          </p>
        </div>
        <Link href="/client/agents/create" style={{
          padding: '10px 20px', borderRadius: 10, background: '#5b6cf7', color: 'white',
          fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          + Créer un agent
        </Link>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Mes agents personnalisés */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}><span className="material-symbols-rounded" style={{ fontSize: 15 }}>auto_awesome</span> Mes agents personnalisés</h2>
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--accent-muted)', color: '#5b6cf7', padding: '2px 8px', borderRadius: 10 }}>
            {customAgents.length}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Chargement...</div>
        ) : customAgents.length === 0 ? (
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14, border: '2px dashed var(--border-primary)',
            padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>smart_toy</span></div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Aucun agent personnalisé</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Créez votre premier <span className="fz-logo-word">agent IA</span> sur mesure en quelques minutes
            </div>
            <Link href="/client/agents/create" style={{
              padding: '10px 24px', borderRadius: 10, background: '#5b6cf7', color: 'white',
              fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 13 }}>auto_awesome</span> Créer mon premier agent
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border-primary)',
                padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                borderTop: `3px solid ${agent.color ?? '#5b6cf7'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${agent.color ?? '#5b6cf7'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 20, color: agent.color ?? '#5b6cf7' }}>{agent.emoji ? 'smart_toy' : 'smart_toy'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.role ?? 'Agent personnalisé'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {agent.domain && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {DOMAIN_LABELS[agent.domain] ?? agent.domain}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                    background: agent.is_active ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                    color: agent.is_active ? '#10b981' : 'var(--text-muted)',
                  }}>
                    {agent.is_active ? '● Actif' : '○ Inactif'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid var(--border-primary)',
                    background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 11 }}>edit</span> Éditer
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id, agent.name)}
                    disabled={deleting === agent.id}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                      background: 'var(--bg-elevated)', color: '#ef4444', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    {deleting === agent.id ? '...' : <span className="material-symbols-rounded" style={{ fontSize: 11 }}>delete</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Agents Freenzy — Business */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 15 }}>work</span> Agents business Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10 }}>{businessAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-primary)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, flexShrink: 0, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)',
                fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', flexShrink: 0,
              }}>
                Config
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Agents personnels */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 15 }}>person</span> Agents personnels Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10 }}>{personalAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-primary)', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, flexShrink: 0, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)',
                fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', flexShrink: 0,
              }}>
                Config
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
