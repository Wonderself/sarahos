'use client';

import { useState, useEffect, useCallback } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';

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
  const isMobile = useIsMobile();
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
      <div style={{ ...pageContainer(isMobile), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        {loadingTimedOut ? (
          <>
            <div style={CU.emptyEmoji}>🔗</div>
            <div style={CU.emptyTitle}>
              Impossible de charger les données
            </div>
            <div style={{ ...CU.emptyDesc, marginBottom: 12 }}>
              Vérifiez votre connexion ou réessayez.
            </div>
            <button
              onClick={() => { setLoadingTimedOut(false); setLoading(true); setError(''); fetchActivities(0, false); }}
              style={CU.btnSmall}
            >
              Réessayer
            </button>
          </>
        ) : (
          <div style={{ color: CU.textMuted, fontSize: 14 }}>Chargement de l&apos;activité...</div>
        )}
      </div>
    );
  }

  const grouped = groupActivities(activities);

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{meta.emoji}</span>
            <h1 style={CU.pageTitle}>{meta.title}</h1>
            <HelpBubble text={meta.helpText} />
          </div>
          <p style={CU.pageSubtitle}>{meta.subtitle}</p>
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
            style={CU.btnGhost}
          >
            📥 Export CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...CU.card, background: '#FFF5F5', borderColor: CU.danger, color: CU.danger, marginBottom: 20, fontSize: 13 }}>{error}</div>
      )}

      {/* Empty state */}
      {activities.length === 0 && !error && (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>📭</div>
          <div style={CU.emptyTitle}>Aucune activite pour le moment</div>
          <div style={CU.emptyDesc}>
            Vos actions apparaitront ici au fur et a mesure de votre utilisation.
          </div>
        </div>
      )}

      {/* Timeline */}
      {Object.entries(grouped).map(([groupLabel, items]) => (
        <div key={groupLabel} style={{ marginBottom: 32 }}>
          {/* Group header */}
          <div style={{
            fontSize: 13, fontWeight: 600, color: CU.textSecondary,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: 14, paddingLeft: isMobile ? 12 : 20,
          }}>
            {groupLabel}
          </div>

          {/* Timeline items */}
          <div style={{ position: 'relative', paddingLeft: isMobile ? 12 : 20 }}>
            {/* Left border line */}
            <div style={{
              position: 'absolute', left: 7, top: 4, bottom: 4,
              width: 2, background: CU.border,
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
                  background: CU.bg,
                  border: `2px solid ${CU.border}`,
                  zIndex: 1,
                }} />

                {/* Card */}
                <div style={{
                  ...CU.cardHoverable,
                  padding: '14px 18px',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#D0D0D0')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = CU.border)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Emoji icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: CU.bgSecondary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {getActionEmoji(activity.action)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>
                          {getActionLabel(activity.action)}
                        </span>
                        <span style={{ fontSize: 12, color: CU.textMuted, flexShrink: 0 }}>
                          {formatTime(activity.created_at)}
                        </span>
                      </div>

                      {/* Description or resource info */}
                      {(activity.description || activity.resource_type) && (
                        <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                          {activity.description ?? (
                            <span>
                              {activity.resource_type}
                              {activity.resource_id && (
                                <span style={{ color: CU.textMuted }}> #{activity.resource_id.slice(0, 8)}</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {/* IP address (subtle) */}
                      {activity.ip_address && (
                        <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 4 }}>
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
            style={CU.btnGhost}
          >
            {loadingMore ? 'Chargement...' : 'Charger plus d\'activites'}
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && activities.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '16px 0 40px',
          fontSize: 12, color: CU.textMuted,
        }}>
          Fin de l&apos;historique
        </div>
      )}
    </div>
  );
}
