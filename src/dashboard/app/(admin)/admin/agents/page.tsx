'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_AGENTS, loadAdminDefaults, saveAdminDefaults, type AdminAgentDefaults } from '../../../../lib/agent-config';

export default function AdminAgentsPage() {
  const [defaults, setDefaults] = useState<AdminAgentDefaults>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDefaults(loadAdminDefaults());
  }, []);

  function handleChange(agentId: string, field: 'name' | 'role', value: string) {
    setSaved(false);
    setDefaults(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], [field]: value || undefined },
    }));
  }

  function handleReset(agentId: string) {
    setSaved(false);
    setDefaults(prev => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  }

  function handleSave() {
    // Clean empty entries
    const cleaned: AdminAgentDefaults = {};
    for (const [id, val] of Object.entries(defaults)) {
      if (val.name || val.role) cleaned[id] = val;
    }
    saveAdminDefaults(cleaned);
    setDefaults(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des agents</h1>
          <p className="page-subtitle">
            Modifiez les prenoms et roles par defaut pour tous les utilisateurs.
            Les utilisateurs ayant personnalise leurs agents gardent leur version.
          </p>
        </div>
        <div className="page-actions">
        <button onClick={handleSave} className="btn btn-primary">
          {saved ? 'Sauvegarde !' : 'Sauvegarder'}
        </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {DEFAULT_AGENTS.map(agent => {
          const override = defaults[agent.id];
          const currentName = override?.name || agent.name;
          const currentRole = override?.role || agent.role;
          const isModified = !!override?.name || !!override?.role;

          return (
            <div key={agent.id} className="flex items-center gap-16 bg-secondary rounded-md" style={{
              padding: '14px 16px',
              border: `1px solid ${isModified ? agent.color + '44' : 'var(--border-primary)'}`,
            }}>
              {/* Agent icon */}
              <div className="flex-center" style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: agent.color + '22', border: `1px solid ${agent.color}44`,
                fontSize: 22,
              }}>
                {agent.emoji}
              </div>

              {/* Name input */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                <label className="text-muted font-semibold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Prenom ({agent.gender === 'F' ? 'feminin' : 'masculin'})
                </label>
                <input
                  type="text"
                  value={override?.name ?? ''}
                  onChange={e => handleChange(agent.id, 'name', e.target.value)}
                  placeholder={agent.name}
                  className="input w-full font-semibold"
                />
              </div>

              {/* Role input */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <label className="text-muted font-semibold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Role
                </label>
                <input
                  type="text"
                  value={override?.role ?? ''}
                  onChange={e => handleChange(agent.id, 'role', e.target.value)}
                  placeholder={agent.role}
                  className="input w-full"
                />
              </div>

              {/* Current display */}
              <div className="text-right" style={{ flexShrink: 0, minWidth: 120 }}>
                <div className="text-sm font-semibold">{currentName}</div>
                <div className="text-xs text-tertiary">{currentRole}</div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => handleReset(agent.id)}
                disabled={!isModified}
                className={`btn btn-sm ${isModified ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ opacity: isModified ? 1 : 0.4 }}
              >
                Reset
              </button>
            </div>
          );
        })}
      </div>

      {saved && (
        <div className="font-semibold text-base rounded-md shadow-md" style={{
          position: 'fixed', bottom: 24, right: 24, padding: '12px 20px',
          background: '#22c55e', color: 'white',
        }}>
          Modifications sauvegardees
        </div>
      )}
    </div>
  );
}
