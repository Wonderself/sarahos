'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '../../../components/Skeleton';
import { useToast } from '../../../components/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriefingData {
  content: string;
  generated_at: string;
  date: string;
}

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
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Erreur ${res.status}`);
  }
  return res.json();
}

const TODAY = new Date().toISOString().split('T')[0];

// ─── Section parser ────────────────────────────────────────────────────────────
// Parses **Title** ... sections from markdown-ish text

function parseSections(text: string): { title: string; body: string }[] {
  const lines = text.split('\n');
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const boldMatch = line.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      if (current) sections.push(current);
      current = { title: boldMatch[1], body: line.replace(/^\*\*(.+?)\*\*/, '').replace(/^[:\s]+/, '') };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else if (line.trim()) {
      sections.push({ title: '', body: line });
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.title || s.body.trim());
}

const SECTION_ICONS: Record<string, string> = {
  'Salutation': '👋',
  'Priorités du jour': '🎯',
  'Insight': '💡',
  'Conseil': '✨',
  'Tâches': '📋',
  'Alertes': '⚠️',
  'Opportunités': '🚀',
};

function sectionIcon(title: string): string {
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '📌';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BriefingPage() {
  const { showError, showSuccess } = useToast();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadBriefing();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadBriefing() {
    setLoading(true);
    try {
      const data = await portalCall<{ data?: BriefingData }>('/portal/user-data/briefing');
      const stored = data?.data as BriefingData | undefined;
      if (stored?.date === TODAY && stored?.content) {
        setBriefing(stored);
      } else {
        // Auto-generate if no briefing for today
        await generateBriefing(false);
      }
    } catch {
      // No stored briefing — prompt to generate
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  }

  async function generateBriefing(showToast = true) {
    const session = getSession();
    if (!session.token) { showError('Session expirée'); return; }
    setGenerating(true);
    try {
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const companyProfile = localStorage.getItem('fz_company_profile') ?? 'Non renseigné';
      const gam = JSON.parse(localStorage.getItem('fz_gamification') ?? '{}');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-haiku-4-5-20251001',
          messages: [{
            role: 'user',
            content: `Tu es Maëva, directrice générale IA de Freenzy. Nous sommes le ${today}. Génère un briefing du jour concis et actionnable. Contexte entreprise: ${companyProfile}. Stats: ${gam.totalMessages ?? 0} messages, ${gam.streak ?? 0} jours consécutifs. Structure ainsi:\n**Salutation personnalisée** (1 ligne bienveillante)\n**Priorités du jour** (3 actions concrètes numérotées)\n**Insight business** (1 observation basée sur l'activité)\n**Conseil du jour** (1 astuce productivité)\nSois concise et percutante. En français.`,
          }],
          maxTokens: 400,
          agentName: 'fz-dg',
        }),
      });

      if (!res.ok) throw new Error('Service temporairement indisponible');
      const chatData = await res.json();
      const content = chatData.content ?? chatData.text ?? '';

      const newBriefing: BriefingData = {
        content,
        generated_at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: TODAY,
      };

      // Persist to backend
      await portalCall('/portal/user-data/briefing', 'POST', newBriefing).catch(() => {});

      setBriefing(newBriefing);
      if (showToast) showSuccess('Briefing généré !');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de génération');
    } finally {
      setGenerating(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const sections = briefing ? parseSections(briefing.content) : [];

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 760, margin: '0 auto', padding: '24px 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: 'var(--fz-text, #1A1A1A)' }}>
            ☀️ <span className="fz-logo-word">Briefing</span> du jour
          </h1>
          <p style={{ color: 'var(--fz-text-secondary, #6B6B6B)', fontSize: 14 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {briefing?.generated_at ? ` · Généré à ${briefing.generated_at}` : ''}
          </p>
        </div>
        <button
          onClick={() => generateBriefing(true)}
          disabled={generating || loading}
          className="btn btn-primary btn-sm"
        >
          {generating ? <>⌛ Génération...</> : briefing ? <>🔄 Rafraîchir</> : <>✨ Générer</>}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton width="40%" height={20} />
              <Skeleton width="100%" height={14} />
              <Skeleton width="85%" height={14} />
              {i === 2 && <Skeleton width="70%" height={14} />}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !briefing && !generating && (
        <div style={{
          textAlign: 'center', padding: '60px 40px',
          background: 'var(--fz-bg, #fff)', borderRadius: 20,
          border: '2px dashed var(--fz-border, #E5E5E5)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>☀️</div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--fz-text, #1A1A1A)' }}>Pas encore de briefing</h2>
          <p style={{ color: 'var(--fz-text-secondary, #6B6B6B)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Générez votre briefing <span className="fz-logo-word">IA</span> quotidien — priorités du jour, insights business et conseils personnalisés.
          </p>
          <button
            onClick={() => generateBriefing(true)}
            disabled={generating}
            className="btn btn-primary"
          >
            {generating ? <>⌛ Génération en cours...</> : <>✨ Générer mon briefing</>}
          </button>
        </div>
      )}

      {/* Generating state */}
      {generating && !briefing && (
        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }} className="animate-pulse">✨</div>
          <p style={{ color: 'var(--fz-text-secondary, #6B6B6B)', fontSize: 14 }}>
            Maëva analyse votre contexte et prépare votre briefing...
          </p>
        </div>
      )}

      {/* Briefing content */}
      {!loading && briefing && sections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((section, i) => (
            <div
              key={i}
              className="card"
              style={{
                background: i === 0
                  ? 'rgba(0,0,0,0.02)'
                  : 'var(--fz-bg, #fff)',
                borderColor: i === 0 ? '#E5E5E5' : 'var(--fz-border, #E5E5E5)',
              }}
            >
              {section.title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{sectionIcon(section.title)}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fz-text, #1A1A1A)' }}>{section.title}</span>
                </div>
              )}
              <div style={{
                fontSize: 14,
                color: 'var(--fz-text-secondary, #6B6B6B)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {section.body.trim()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw fallback if no sections parsed */}
      {!loading && briefing && sections.length === 0 && (
        <div className="card">
          <div style={{ fontSize: 14, color: 'var(--fz-text-secondary, #6B6B6B)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {briefing.content}
          </div>
        </div>
      )}
    </div>
  );
}
