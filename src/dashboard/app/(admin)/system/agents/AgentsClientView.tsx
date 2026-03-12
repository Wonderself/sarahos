'use client';

import { useState } from 'react';
import type { AgentEntry } from '@/lib/api-client';
import { AgentActions } from './actions';
import { AgentConfigButton } from './AgentConfigSlideOver';

const levelMeta: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'L1 — Execution', color: 'var(--text-secondary)', desc: 'Agents operationnels executant les taches quotidiennes' },
  2: { label: 'L2 — Management', color: 'var(--text-secondary)', desc: 'Agents de coordination et gestion des workflows' },
  3: { label: 'L3 — Executive', color: 'var(--text-primary)', desc: 'Agents strategiques et prise de decision' },
};

const statusBadge: Record<string, string> = {
  IDLE: 'badge-success',
  BUSY: 'badge-warning',
  ERROR: 'badge-danger',
  DISABLED: 'badge-neutral',
};

type LevelFilter = 0 | 1 | 2 | 3;

export function AgentsClientView({ agents }: { agents: AgentEntry[] }) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(0);

  const filtered = agents.filter(a => {
    const matchLevel = levelFilter === 0 || a.level === levelFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) ||
      a.capabilities.some(c => c.toLowerCase().includes(q));
    return matchLevel && matchSearch;
  });

  const byLevel = [1, 2, 3].map(level => ({
    level,
    meta: levelMeta[level]!,
    agents: filtered.filter(a => a.level === level),
  })).filter(g => g.agents.length > 0);

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un agent…"
          className="input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {([0, 1, 2, 3] as LevelFilter[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`btn btn-sm ${levelFilter === lvl ? 'btn-primary' : 'btn-secondary'}`}
            >
              {lvl === 0 ? 'Tous' : `L${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card section">
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <div className="empty-state-text">Aucun agent trouvé</div>
          </div>
        </div>
      )}

      {byLevel.map(group => (
        <div key={group.level} className="section">
          <div className="section-title" style={{ color: group.meta.color }}>
            {group.meta.label}
            <span className="section-subtitle">— {group.agents.length} agents — {group.meta.desc}</span>
          </div>
          <div className="grid-2">
            {group.agents.map(agent => (
              <div key={agent.id} className="card" style={{ borderLeft: `3px solid ${group.meta.color}` }}>
                <div className="flex flex-between items-center mb-8">
                  <span className="text-base font-semibold">{agent.name}</span>
                  <span className={`badge ${statusBadge[agent.status] ?? 'badge-neutral'}`}>{agent.status}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {agent.capabilities.map(cap => (
                    <span key={cap} className="badge badge-neutral text-xs">{cap}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  <AgentActions agentId={agent.id} status={agent.status} />
                  <AgentConfigButton agentId={agent.id} agentName={agent.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
