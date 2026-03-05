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
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Agents IA</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>
            Gérez vos agents Freenzy et créez vos propres assistants personnalisés
          </p>
        </div>
        <Link href="/client/agents/create" style={{
          padding: '10px 20px', borderRadius: 10, background: '#6366f1', color: 'white',
          fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          + Créer un agent
        </Link>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Mes agents personnalisés */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>✨ Mes agents personnalisés</h2>
          <span style={{ fontSize: 11, fontWeight: 600, background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: 10 }}>
            {customAgents.length}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: '#9ca3af', fontSize: 13 }}>Chargement...</div>
        ) : customAgents.length === 0 ? (
          <div style={{
            background: '#fafafa', borderRadius: 14, border: '2px dashed #e5e7eb',
            padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Aucun agent personnalisé</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
              Créez votre premier agent IA sur mesure en quelques minutes
            </div>
            <Link href="/client/agents/create" style={{
              padding: '10px 24px', borderRadius: 10, background: '#6366f1', color: 'white',
              fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ✨ Créer mon premier agent
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {customAgents.map(agent => (
              <div key={agent.id} style={{
                background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
                padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                borderTop: `3px solid ${agent.color ?? '#6366f1'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${agent.color ?? '#6366f1'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>
                    {agent.emoji ?? '🤖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.role ?? 'Agent personnalisé'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {agent.domain && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>
                      {DOMAIN_LABELS[agent.domain] ?? agent.domain}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                    background: agent.is_active ? '#d1fae5' : '#f3f4f6',
                    color: agent.is_active ? '#065f46' : '#9ca3af',
                  }}>
                    {agent.is_active ? '● Actif' : '○ Inactif'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <Link href={`/client/agents/create?edit=${agent.id}`} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #e5e7eb',
                    background: 'white', color: '#374151', fontSize: 11, fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    ✏️ Éditer
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id, agent.name)}
                    disabled={deleting === agent.id}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid #fecaca',
                      background: 'white', color: '#ef4444', fontSize: 11, cursor: 'pointer',
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
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          💼 Agents business Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 10 }}>{businessAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {businessAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white',
                fontSize: 10, fontWeight: 600, color: '#6b7280', textDecoration: 'none', flexShrink: 0,
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
          👤 Agents personnels Freenzy
          <span style={{ fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 10 }}>{personalAgents.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {personalAgents.map(agent => (
            <div key={agent.id} style={{
              background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.description ?? ''}</div>
              </div>
              <Link href={`/client/agents/customize?agent=${agent.id}`} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white',
                fontSize: 10, fontWeight: 600, color: '#6b7280', textDecoration: 'none', flexShrink: 0,
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
