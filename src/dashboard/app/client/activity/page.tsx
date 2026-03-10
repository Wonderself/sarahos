'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

interface Activity {
  id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

const ACTION_EMOJI: Record<string, string> = {
  login: '🔑',
  deposit: '💰',
  withdrawal: '💸',
  update_preferences: '⚙️',
  chat: '💬',
  meeting: '🤝',
  document: '📄',
  register: '🎉',
  password_reset: '🔒',
  logout: '🚪',
  update_profile: '👤',
  agent_call: '🤖',
  billing: '💳',
  upload: '📤',
  download: '📥',
};

const ACTION_LABEL: Record<string, string> = {
  login: 'Connexion',
  deposit: 'Dépôt de crédits',
  withdrawal: 'Retrait',
  update_preferences: 'Préférences mises à jour',
  chat: 'Conversation',
  meeting: 'Reunion',
  document: 'Document',
  register: 'Inscription',
  password_reset: 'Reinitialisation du mot de passe',
  logout: 'Deconnexion',
  update_profile: 'Profil mis a jour',
  agent_call: 'Appel agent IA',
  billing: 'Transaction',
  upload: 'Upload de fichier',
  download: 'Telechargement',
};

function getActionEmoji(action: string): string {
  return ACTION_EMOJI[action] ?? '📝';
}

function getActionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action.replace(/_/g, ' ');
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const activityDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (activityDate.getTime() === today.getTime()) return "Aujourd'hui";
  if (activityDate.getTime() === yesterday.getTime()) return 'Hier';
  if (activityDate >= weekAgo) return 'Cette semaine';
  return 'Plus ancien';
}

function groupActivities(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};
  const order = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];

  for (const a of activities) {
    const group = getDateGroup(a.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(a);
  }

  // Return in order
  const ordered: Record<string, Activity[]> = {};
  for (const key of order) {
    if (groups[key]) ordered[key] = groups[key];
  }
  return ordered;
}

const PAGE_SIZE = 50;

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');

  const fetchActivities = useCallback(async (currentOffset: number, append: boolean) => {
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
      if (!session.token) {
        setError('Session invalide. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `/portal/activity?limit=${PAGE_SIZE}&offset=${currentOffset}`,
          token: session.token,
          method: 'GET',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Erreur ${res.status}`);
        return;
      }

      const data = await res.json();
      const newActivities: Activity[] = data.activities ?? data.events ?? [];

      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      setHasMore(newActivities.length >= PAGE_SIZE);
      setOffset(currentOffset + newActivities.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(0, false);
  }, [fetchActivities]);

  // Timeout fallback: if loading takes more than 5s, show fallback message
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (loading) setLoadingTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  function loadMore() {
    setLoadingMore(true);
    fetchActivities(offset, true);
  }

  const meta = PAGE_META.activity;

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: 400, flexDirection: 'column', gap: 12 }}>
        {loadingTimedOut ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔗</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
              Impossible de charger les données
            </div>
            <div style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }}>
              Vérifiez votre connexion ou réessayez.
            </div>
            <button
              onClick={() => { setLoadingTimedOut(false); setLoading(true); setError(''); fetchActivities(0, false); }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 8 }}
            >
              Réessayer
            </button>
          </>
        ) : (
          <div className="animate-pulse text-md text-tertiary">Chargement de l&apos;activité...</div>
        )}
      </div>
    );
  }

  const grouped = groupActivities(activities);

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: 'var(--fz-text, #1E293B)',
            letterSpacing: '-0.02em', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 24 }}>{meta.emoji}</span> {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }}>
            {meta.subtitle}
          </p>
        </div>
        <PageExplanation pageId="activity" text={PAGE_META.activity?.helpText} />
        {activities.length > 0 && (
          <button
            onClick={() => {
              const rows = [['Action', 'Description', 'IP', 'Date']];
              for (const a of activities) {
                rows.push([getActionLabel(a.action), a.description ?? a.resource_type ?? '', a.ip_address ?? '', new Date(a.created_at).toLocaleString('fr-FR')]);
              }
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `activite_${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1.5px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg-secondary, #F8FAFC)',
              color: 'var(--fz-text, #1E293B)', cursor: 'pointer',
            }}
          >
            📥 Export CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 20, fontSize: 13 }}>{error}</div>
      )}

      {/* Empty state */}
      {activities.length === 0 && !error && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 16,
          border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 8 }}>
            Aucune activite pour le moment
          </div>
          <div style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }}>
            Vos actions apparaitront ici au fur et a mesure de votre utilisation.
          </div>
        </div>
      )}

      {/* Timeline */}
      {Object.entries(grouped).map(([groupLabel, items]) => (
        <div key={groupLabel} style={{ marginBottom: 32 }}>
          {/* Group header */}
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--fz-text-secondary, #64748B)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: 14, paddingLeft: 20,
          }}>
            {groupLabel}
          </div>

          {/* Timeline items */}
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            {/* Left border line */}
            <div style={{
              position: 'absolute', left: 7, top: 4, bottom: 4,
              width: 2, background: 'var(--fz-border, #E2E8F0)',
              borderRadius: 1,
            }} />

            {items.map((activity, idx) => (
              <div key={activity.id ?? idx} style={{
                position: 'relative',
                marginBottom: idx < items.length - 1 ? 12 : 0,
              }}>
                {/* Dot indicator */}
                <div style={{
                  position: 'absolute', left: -16, top: 14,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--fz-bg, #FFFFFF)',
                  border: '2px solid var(--accent, var(--fz-accent, #0EA5E9))',
                  zIndex: 1,
                }} />

                {/* Card */}
                <div style={{
                  background: 'var(--fz-bg, #FFFFFF)',
                  border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                  borderRadius: 12, padding: '14px 18px',
                  transition: 'border-color 0.15s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--fz-border, #CBD5E1)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--fz-border, #E2E8F0)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Emoji icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--fz-bg-secondary, #F8FAFC)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {getActionEmoji(activity.action)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
                          {getActionLabel(activity.action)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', flexShrink: 0 }}>
                          {formatTime(activity.created_at)}
                        </span>
                      </div>

                      {/* Description or resource info */}
                      {(activity.description || activity.resource_type) && (
                        <div style={{ fontSize: 12, color: 'var(--fz-text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                          {activity.description ?? (
                            <span>
                              {activity.resource_type}
                              {activity.resource_id && (
                                <span style={{ color: 'var(--fz-text-muted, #94A3B8)' }}> #{activity.resource_id.slice(0, 8)}</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {/* IP address (subtle) */}
                      {activity.ip_address && (
                        <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                          IP: {activity.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && activities.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 40 }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn btn-ghost"
            style={{
              fontSize: 13, fontWeight: 500, padding: '10px 28px',
              borderRadius: 10, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
            }}
          >
            {loadingMore ? 'Chargement...' : 'Charger plus d\'activites'}
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && activities.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '16px 0 40px',
          fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)',
        }}>
          Fin de l&apos;historique
        </div>
      )}
    </div>
  );
}
