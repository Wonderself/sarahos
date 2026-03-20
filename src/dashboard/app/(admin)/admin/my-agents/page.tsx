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
        <h1 className="text-2xl font-bold text-neutral-900">Mes Outils IA</h1>
        <p className="text-neutral-500 mt-1">34 outils IA disponibles — 22 business + 12 personnels</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher un outil..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 bg-[#F7F7F7] border border-neutral-200 rounded-lg text-neutral-900 text-sm w-64 focus:border-neutral-400 focus:outline-none"
        />
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${category === c.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F7] text-neutral-500 hover:text-neutral-900'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-500 ml-auto">{filtered.length} agents</span>
      </div>

      <div className="flex gap-6">
        {/* Agent grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              className={`p-4 rounded-xl border text-left transition-all hover:border-neutral-400/50 ${selected === agent.id ? 'bg-neutral-200/10 border-neutral-400' : 'bg-[#F7F7F7] border-neutral-200'}`}
            >
              <div className="mb-2">{agent.materialIcon}</div>
              <h3 className="text-neutral-900 font-medium text-sm">{agent.name}</h3>
              <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${BUSINESS_IDS.includes(agent.id) ? 'bg-neutral-300/20 text-neutral-600' : 'bg-neutral-400/20 text-neutral-500'}`}>
                  {BUSINESS_IDS.includes(agent.id) ? 'Business' : 'Personnel'}
                </span>
                <span className="text-xs text-neutral-500">{agent.model ?? 'sonnet'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selectedAgent && (
          <div className="w-80 bg-[#F7F7F7] rounded-xl border border-neutral-200 p-6 sticky top-4 self-start">
            <div className="mb-3">{selectedAgent.materialIcon}</div>
            <h2 className="text-xl font-bold text-neutral-900">{selectedAgent.name}</h2>
            <p className="text-neutral-500 text-sm mt-2">{selectedAgent.description}</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-neutral-500 uppercase">ID</p>
                <p className="text-sm text-neutral-600 font-mono">{selectedAgent.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase">Modèle</p>
                <p className="text-sm text-neutral-600">{selectedAgent.model ?? 'claude-sonnet-4-20250514'}</p>
              </div>
              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase mb-1">Capacités</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((cap: string) => (
                      <span key={cap} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{cap}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a
              href={`/admin/chat?agent=${selectedAgent.id}`}
              className="mt-6 block text-center px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm hover:bg-[#333333] transition-colors"
            >
              Parler à cet agent
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
