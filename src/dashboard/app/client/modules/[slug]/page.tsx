'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useToast } from '../../../../components/Toast';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleType = 'form' | 'crm' | 'agent' | 'dashboard';
type FieldType = 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'textarea' | 'number';

interface SchemaField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface ModuleSchema {
  fields?: SchemaField[];
  system_prompt?: string;
  welcome_message?: string;
  model?: string;
  language?: string;
  confirmation_message?: string;
}

interface UserModule {
  id: string;
  name: string;
  slug: string;
  description?: string;
  emoji: string;
  color: string;
  type: ModuleType;
  schema: ModuleSchema;
  settings: Record<string, unknown>;
  is_published: boolean;
  public_access: boolean;
  record_count: number;
}

interface ModuleRecord {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TYPE_LABELS: Record<ModuleType, string> = {
  form: 'Formulaire',
  crm: 'Base CRM',
  agent: 'Agent IA',
  dashboard: 'Dashboard',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = getSession();
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erreur ${res.status}`);
  }
  return res.json();
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'à l\'instant';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(d).toLocaleDateString('fr-FR');
}

// ─── FormRenderer ─────────────────────────────────────────────────────────────

function FormRenderer({ mod, onSubmit }: { mod: UserModule; onSubmit: () => void }) {
  const { showError } = useToast();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const schema = mod.schema;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate required fields
    const missing = (schema.fields ?? []).filter(f => f.required && !values[f.id]);
    if (missing.length > 0) { showError(`Champ requis : ${missing[0].label}`); return; }
    setSubmitting(true);
    try {
      await portalCall(`/portal/modules/${mod.id}/records`, 'POST', { data: values });
      setSubmitted(true);
      onSubmit();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{schema.confirmation_message ?? 'Merci !'}</h2>
        <button onClick={() => { setSubmitted(false); setValues({}); }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
          Nouveau formulaire
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(schema.fields ?? []).map(field => (
        <div key={field.id}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
            {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              value={String(values[field.id] ?? '')}
              onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14, resize: 'vertical' }}
            />
          ) : field.type === 'select' ? (
            <select
              value={String(values[field.id] ?? '')}
              onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            >
              <option value="">-- Choisir --</option>
              {(field.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : field.type === 'checkbox' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(values[field.id])}
                onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.checked }))}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ fontSize: 14 }}>{field.placeholder ?? field.label}</span>
            </label>
          ) : (
            <input
              type={field.type === 'phone' ? 'tel' : field.type}
              placeholder={field.placeholder}
              value={String(values[field.id] ?? '')}
              onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        style={{ padding: '12px', borderRadius: 12, background: mod.color, color: 'white', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontWeight: 700, fontSize: 15, marginTop: 4 }}
      >
        {submitting ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}

// ─── CRMRenderer ──────────────────────────────────────────────────────────────

function CRMRenderer({ mod }: { mod: UserModule }) {
  const { showError, showSuccess } = useToast();
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const schema = mod.schema;

  const load = useCallback(async () => {
    try {
      const data = await portalCall<{ records: ModuleRecord[]; total: number }>(`/portal/modules/${mod.id}/records`);
      setRecords(data.records ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [mod.id, showError]);

  useEffect(() => { load(); }, [load]);

  async function addRecord() {
    const missing = (schema.fields ?? []).filter(f => f.required && !formValues[f.id]);
    if (missing.length > 0) { showError(`Champ requis : ${missing[0].label}`); return; }
    setSaving(true);
    try {
      await portalCall(`/portal/modules/${mod.id}/records`, 'POST', { data: formValues });
      showSuccess('Enregistrement ajouté');
      setFormValues({});
      setShowForm(false);
      load();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(id: string) {
    setDeleting(id);
    try {
      await portalCall(`/portal/modules/${mod.id}/records/${id}`, 'DELETE');
      showSuccess('Supprimé');
      setRecords(prev => prev.filter(r => r.id !== id));
      setTotal(t => t - 1);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setDeleting(null);
    }
  }

  const fields = schema.fields ?? [];
  const filtered = records.filter(r =>
    !search || Object.values(r.data).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ flex: 1, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{total} enregistrement{total !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '8px 16px', borderRadius: 10, background: mod.color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
          + Ajouter
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
            {fields.map(field => (
              <div key={field.id}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 3 }}>
                  {field.label}{field.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <input
                  type={field.type === 'phone' ? 'tel' : field.type === 'textarea' ? 'text' : field.type}
                  placeholder={field.placeholder}
                  value={String(formValues[field.id] ?? '')}
                  onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 13 }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addRecord} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, background: mod.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
            <button onClick={() => { setShowForm(false); setFormValues({}); }} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
          {search ? 'Aucun résultat' : 'Aucun enregistrement — cliquez "+ Ajouter" pour commencer.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {fields.map(f => (
                  <th key={f.id} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {f.label}
                  </th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  {fields.map(f => (
                    <td key={f.id} style={{ padding: '8px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(rec.data[f.id] ?? '—')}
                    </td>
                  ))}
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {timeAgo(rec.created_at)}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <button
                      onClick={() => deleteRecord(rec.id)}
                      disabled={deleting === rec.id}
                      style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}
                    >
                      {deleting === rec.id ? '...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── AgentRenderer ────────────────────────────────────────────────────────────

function AgentRenderer({ mod }: { mod: UserModule }) {
  const schema = mod.schema;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const wm = schema.welcome_message;
    return wm ? [{ role: 'assistant', content: wm }] : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { showError } = useToast();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const session = getSession();
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const systemMsg = schema.system_prompt ? [{ role: 'system', content: schema.system_prompt }] : [];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...systemMsg, ...newMessages.map(m => ({ role: m.role, content: m.content }))],
          token: session.token,
          model: schema.model ?? 'claude-haiku-4-5-20251001',
          agentName: 'module-agent',
        }),
      });
      const data = await res.json();
      const reply = data.content ?? data.message ?? data.text ?? 'Désolé, je ne peux pas répondre.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      showError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: 400 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${mod.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 8 }}>
                {mod.emoji}
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
              background: msg.role === 'user' ? mod.color : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'white' : 'inherit',
              fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 14,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${mod.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 8 }}>{mod.emoji}</div>
            <div style={{ padding: '10px 14px', borderRadius: 14, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 14 }}>...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Écrivez votre message..."
          disabled={loading}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 14 }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 20px', borderRadius: 12, background: mod.color, color: 'white', border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

// ─── DashboardRenderer ────────────────────────────────────────────────────────

function DashboardRenderer({ mod }: { mod: UserModule }) {
  const [stats, setStats] = useState<{ total: number; today: number; thisWeek: number } | null>(null);
  const { showError } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await portalCall<{ records: ModuleRecord[]; total: number }>(`/portal/modules/${mod.id}/records?limit=200`);
        const records = data.records ?? [];
        const now = Date.now();
        const today = records.filter(r => now - new Date(r.created_at).getTime() < 86400000).length;
        const thisWeek = records.filter(r => now - new Date(r.created_at).getTime() < 7 * 86400000).length;
        setStats({ total: data.total, today, thisWeek });
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Erreur');
      }
    })();
  }, [mod.id, showError]);

  if (!stats) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Chargement...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total', value: stats.total, icon: 'bar_chart' },
          { label: "Aujourd'hui", value: stats.today, icon: 'calendar_month' },
          { label: 'Cette semaine', value: stats.thisWeek, icon: 'trending_up' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}><span style={{ fontSize: 24 }}>{s.icon === 'bar_chart' ? '📊' : s.icon === 'calendar_month' ? '📅' : s.icon === 'trending_up' ? '📈' : s.icon}</span></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: mod.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          📈 Les graphiques détaillés et l&apos;analyse des tendances seront disponibles dans une prochaine mise à jour.
        </p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ModuleRuntimePage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const slugParam = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';
  const { showError } = useToast();

  const [mod, setMod] = useState<UserModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    if (!slugParam) return;
    (async () => {
      try {
        const data = await portalCall<{ module: UserModule }>(`/portal/modules/${slugParam}`);
        if (data.module) {
          // Parse schema if stringified
          const m = data.module;
          if (typeof m.schema === 'string') {
            try { (m as UserModule).schema = JSON.parse(m.schema as unknown as string); } catch { m.schema = {}; }
          }
          setMod(m);
          setRecordCount(m.record_count ?? 0);
        }
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Module introuvable');
      } finally {
        setLoading(false);
      }
    })();
  }, [slugParam, showError]);

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
      Chargement du module...
    </div>
  );

  if (!mod) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <h2 style={{ fontWeight: 700 }}>Module introuvable</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Ce module n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
      <Link href="/client/modules" className="btn btn-primary" style={{ textDecoration: 'none' }}>← Retour aux modules</Link>
    </div>
  );

  const typeInfo = {
    form: { icon: 'assignment', label: 'Formulaire' },
    crm: { icon: 'bar_chart', label: 'Base CRM' },
    agent: { icon: 'smart_toy', label: 'Agent IA' },
    dashboard: { icon: 'trending_up', label: 'Dashboard' },
  }[mod.type] ?? { icon: 'inventory_2', label: mod.type };

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 900 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={headerRow()}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: `${mod.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {mod.emoji}
          </div>
          <div>
            <h1 style={CU.pageTitle}>{mod.name}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
              <span style={{ ...CU.badge, background: `${mod.color}20`, color: mod.color }}>
                <span style={{ fontSize: 12 }}>{typeInfo.icon === 'assignment' ? '📋' : typeInfo.icon === 'bar_chart' ? '📊' : typeInfo.icon === 'smart_toy' ? '🤖' : typeInfo.icon === 'trending_up' ? '📈' : typeInfo.icon === 'inventory_2' ? '📦' : typeInfo.icon}</span> {typeInfo.label}
              </span>
              {mod.type !== 'agent' && (
                <span style={{ fontSize: 12, color: CU.textSecondary }}>
                  {recordCount} enregistrement{recordCount !== 1 ? 's' : ''}
                </span>
              )}
              {!mod.is_published && (
                <span style={CU.badgeWarning}>
                  Brouillon
                </span>
              )}
            </div>
            {mod.description && <p style={{ color: CU.textSecondary, fontSize: 13, marginTop: 4 }}>{mod.description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/client/modules" style={{ ...CU.btnGhost, textDecoration: 'none' }}>
            ← Retour
          </Link>
          <Link href={`/client/modules/builder?edit=${mod.id}`} style={{ ...CU.btnGhost, textDecoration: 'none' }}>
            ✏️ Modifier
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ ...CU.card, padding: 24 }}>
        {mod.type === 'form' && (
          <FormRenderer mod={mod} onSubmit={() => setRecordCount(c => c + 1)} />
        )}
        {mod.type === 'crm' && (
          <CRMRenderer mod={mod} />
        )}
        {mod.type === 'agent' && (
          <AgentRenderer mod={mod} />
        )}
        {mod.type === 'dashboard' && (
          <DashboardRenderer mod={mod} />
        )}
      </div>

      {/* ── Public URL info ── */}
      {mod.public_access && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: CU.bgSecondary, borderRadius: 8, fontSize: 13, color: CU.textSecondary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔗 Ce module a une URL publique : <code>/m/{mod.slug}</code></span>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/m/${mod.slug}`)}
            style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
          >
            Copier
          </button>
        </div>
      )}
    </div>
  );
}
