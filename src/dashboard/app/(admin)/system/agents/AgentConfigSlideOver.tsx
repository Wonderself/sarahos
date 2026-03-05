'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — Rapide, économique' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — Équilibré (défaut)' },
  { value: 'claude-opus-4-6', label: 'Opus 4.6 — Puissant, coûteux' },
];

interface Config {
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  model: string;
  updated_at: string | null;
  updated_by: string | null;
}

export function AgentConfigButton({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-ghost btn-xs" onClick={() => setOpen(true)} style={{ marginLeft: 4 }}>
        ⚙️ Config
      </button>
      {open && <AgentConfigSlideOver agentId={agentId} agentName={agentName} onClose={() => setOpen(false)} />}
    </>
  );
}

function AgentConfigSlideOver({ agentId, agentName, onClose }: { agentId: string; agentName: string; onClose: () => void }) {
  const [config, setConfig] = useState<Config>({ temperature: 0.7, max_tokens: 4096, system_prompt: null, model: 'claude-sonnet-4-6', updated_at: null, updated_by: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/admin/agents/${encodeURIComponent(agentId)}/config`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then((d: Config) => { setConfig(d); setLoading(false); })
      .catch(() => setLoading(false));

    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [agentId, onClose]);

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`${API}/admin/agents/${encodeURIComponent(agentId)}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          temperature: Number(config.temperature),
          max_tokens: Number(config.max_tokens),
          system_prompt: config.system_prompt || null,
          model: config.model,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error: string };
        throw new Error(d.error);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setSaving(false); }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.4)' }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9001,
        width: '100%', maxWidth: 480,
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-primary)',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>⚙️ Config — {agentName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              ID: <code>{agentId}</code>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chargement…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Model */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Modèle
                </label>
                <select
                  value={config.model}
                  onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                >
                  {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Température — <span style={{ color: 'var(--accent)' }}>{Number(config.temperature).toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={config.temperature}
                  onChange={e => setConfig(c => ({ ...c, temperature: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>0 — Déterministe</span>
                  <span>1 — Créatif</span>
                </div>
              </div>

              {/* Max tokens */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Max Tokens
                </label>
                <input
                  type="number"
                  min={256} max={32768} step={256}
                  value={config.max_tokens}
                  onChange={e => setConfig(c => ({ ...c, max_tokens: parseInt(e.target.value) || 4096 }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Entre 256 et 32 768 tokens</div>
              </div>

              {/* System prompt */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Prompt (override)
                </label>
                <textarea
                  value={config.system_prompt ?? ''}
                  onChange={e => setConfig(c => ({ ...c, system_prompt: e.target.value || null }))}
                  placeholder="Laisser vide pour utiliser le prompt par défaut de l'agent…"
                  rows={6}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.5 }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  Override le system prompt défini dans le code. Attention : peut changer le comportement.
                </div>
              </div>

              {/* Last updated */}
              {config.updated_at && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Dernière modif : {new Date(config.updated_at).toLocaleString('fr-FR')} par {config.updated_by ?? '—'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving || loading}>
            {saving ? 'Sauvegarde…' : saved ? '✅ Sauvegardé' : 'Sauvegarder'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>⚠️ {error}</span>}
        </div>
      </div>
    </>
  );
}
