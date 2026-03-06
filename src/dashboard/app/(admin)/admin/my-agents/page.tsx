'use client';

import { useState } from 'react';
import { ALL_AGENTS } from '../../../../lib/agent-config';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'business', label: 'Business' },
  { id: 'personal', label: 'Personnel' },
];

const BUSINESS_IDS = ['fz-repondeur', 'fz-assistante', 'fz-commercial', 'fz-marketing', 'fz-rh', 'fz-communication', 'fz-finance', 'fz-dev', 'fz-juridique', 'fz-dg', 'fz-video', 'fz-photo'];

export default function MyAgentsPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = ALL_AGENTS.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (category === 'business') return BUSINESS_IDS.includes(a.id);
    if (category === 'personal') return !BUSINESS_IDS.includes(a.id);
    return true;
  });

  const selectedAgent = ALL_AGENTS.find(a => a.id === selected);

  return (
    <div className="space-y-6 admin-page-scrollable">
      <div>
        <h1 className="text-2xl font-bold text-white">Mes Agents</h1>
        <p className="text-gray-400 mt-1">24 agents IA disponibles — business + personnels</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher un agent..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm w-64 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${category === c.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} agents</span>
      </div>

      <div className="flex gap-6">
        {/* Agent grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              className={`p-4 rounded-xl border text-left transition-all hover:border-blue-500/50 ${selected === agent.id ? 'bg-blue-600/10 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
            >
              <div className="mb-2"><span className="material-symbols-rounded" style={{ fontSize: 28, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span></div>
              <h3 className="text-white font-medium text-sm">{agent.name}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${BUSINESS_IDS.includes(agent.id) ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {BUSINESS_IDS.includes(agent.id) ? 'Business' : 'Personnel'}
                </span>
                <span className="text-xs text-gray-600">{agent.model ?? 'sonnet'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selectedAgent && (
          <div className="w-80 bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-4 self-start">
            <div className="mb-3"><span className="material-symbols-rounded" style={{ fontSize: 40, color: selectedAgent.color || 'var(--accent)' }}>{selectedAgent.materialIcon}</span></div>
            <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
            <p className="text-gray-400 text-sm mt-2">{selectedAgent.description}</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">ID</p>
                <p className="text-sm text-gray-300 font-mono">{selectedAgent.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Modèle</p>
                <p className="text-sm text-gray-300">{selectedAgent.model ?? 'claude-sonnet-4-20250514'}</p>
              </div>
              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Capacités</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((cap: string) => (
                      <span key={cap} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{cap}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a
              href={`/admin/chat?agent=${selectedAgent.id}`}
              className="mt-6 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Parler à cet agent
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
