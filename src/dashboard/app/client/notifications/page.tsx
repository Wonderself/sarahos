'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import AuthRequired from '../../../components/AuthRequired';
import { CU, pageContainer, headerRow, emojiIcon, toolbar } from '../../../lib/page-styles';

const NOTIF_READ_KEY = 'fz_notif_read';

type NotifType = 'alert' | 'session' | 'update' | 'info';
type FilterType = 'all' | NotifType;

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  date: string;
  actionLabel?: string;
  actionHref?: string;
  read?: boolean;
}


const TYPE_EMOJIS: Record<NotifType, string> = {
  alert: '⚠️',
  session: '🔑',
  update: '📦',
  info: 'ℹ️',
};

const TYPE_LABELS: Record<NotifType, string> = {
  alert: 'Alerte',
  session: 'Connexion',
  update: 'Mise à jour',
  info: 'Info',
};

const FILTER_LABELS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'alert', label: 'Alertes' },
  { id: 'session', label: 'Connexions' },
  { id: 'update', label: 'Mises à jour' },
  { id: 'info', label: 'Infos' },
];

function getReadIds(): string[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_READ_KEY) ?? '[]'); } catch { return []; }
}

function markRead(id: string) {
  const ids = getReadIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(ids)); } catch { /* */ }
  }
}

function markAllRead(ids: string[]) {
  try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(ids)); } catch { /* */ }
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const ids = getReadIds();
    setReadIds(ids);
    loadNotifications(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callPortal(path: string, token: string, method = 'GET', data?: unknown) {
    const res = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, token, method, data }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }

  async function loadNotifications(currentReadIds: string[]) {
    setLoading(true);
    const notifs: Notification[] = [];

    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const token = session.token;

      if (token) {
        // Fetch real notifications from backend
        try {
          const notifData = await callPortal('/notifications?limit=50', token, 'GET');
          const backendNotifs: Array<{ id: string; type: string; title: string; message: string; created_at: string; is_read: boolean; data?: Record<string, string> }> = notifData.notifications ?? notifData ?? [];
          for (const n of backendNotifs) {
            notifs.push({
              id: `backend-${n.id}`,
              type: (n.type as NotifType) ?? 'info',
              title: n.title,
              body: n.message,
              date: n.created_at,
              actionLabel: n.data?.actionLabel,
              actionHref: n.data?.actionHref,
              read: n.is_read || currentReadIds.includes(`backend-${n.id}`),
            });
          }
        } catch { /* silent */ }

        // Check wallet balance
        try {
          const wallet = await callPortal('/portal/wallet', token, 'GET');
          const balance = wallet.balance ?? wallet.wallet?.balance ?? 0;
          const CREDIT = 1_000_000;
          if (balance < 10 * CREDIT) {
            const credits = (balance / CREDIT).toFixed(1);
            notifs.unshift({
              id: 'alert-credits-low',
              type: 'alert',
              title: 'Crédits bas',
              body: `Il vous reste ${credits} crédit${Number(credits) < 2 ? '' : 's'}. Rechargez votre compte pour continuer à utiliser vos assistants IA.`,
              date: new Date().toISOString(),
              actionLabel: 'Recharger →',
              actionHref: '/client/account',
            });
          }
        } catch { /* silent */ }

        // Load recent sessions
        try {
          const activityData = await callPortal('/portal/activity?limit=5', token, 'GET');
          const events: Array<{ action: string; created_at: string; metadata?: { ip?: string; city?: string; country?: string } }> =
            activityData.activities ?? activityData.events ?? [];
          const loginEvents = events.filter(e => e.action === 'login').slice(0, 3);
          for (const event of loginEvents) {
            const meta = event.metadata ?? {};
            const location = [meta.city, meta.country].filter(Boolean).join(', ') || 'Localisation inconnue';
            const dt = new Date(event.created_at);
            notifs.push({
              id: `session-${dt.getTime()}`,
              type: 'session',
              title: 'Connexion détectée',
              body: `Connexion le ${dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à ${dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${location}`,
              date: event.created_at,
            });
          }
        } catch { /* silent */ }
      }
    } catch { /* silent */ }

    // Mark read status
    const final = notifs.map(n => ({ ...n, read: currentReadIds.includes(n.id) }));
    // Sort: unread first, then by date
    final.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setNotifications(final);
    setLoading(false);
  }

  function handleDismiss(id: string) {
    markRead(id);
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    setNotifications(prev => [...prev.map(n => n.id === id ? { ...n, read: true } : n)].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }));
    // Mark as read on backend for real notifications
    if (id.startsWith('backend-')) {
      const realId = id.replace('backend-', '');
      try {
        const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
        if (session.token) {
          fetch('/api/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/notifications/${realId}/read`, token: session.token, method: 'POST' }),
          }).catch(() => {});
        }
      } catch { /* */ }
    }
  }

  function handleMarkAllRead() {
    const allIds = notifications.map(n => n.id);
    markAllRead(allIds);
    setReadIds(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const pageMeta = PAGE_META.notifications;

  return (
    <AuthRequired pageName="Notifications">
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: isMobile ? 8 : 12 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(22)}>{pageMeta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={CU.pageTitle}>
                <span className="fz-logo-word">{pageMeta.title}</span>
              </h1>
              {unreadCount > 0 && (
                <span style={{
                  ...CU.badgeDanger,
                  minWidth: 20, height: 20, borderRadius: 10,
                  justifyContent: 'center',
                  background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '0 6px',
                }}>
                  {unreadCount}
                </span>
              )}
              <HelpBubble text={pageMeta.helpText} />
            </div>
            <p style={CU.pageSubtitle}>
              {unreadCount > 0
                ? <>{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</>
                : <><span className="fz-logo-word">Tout est à jour</span></>}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={CU.btnGhost}>
            ✅ Tout marquer comme lu
          </button>
        )}
      </div>
      <PageExplanation pageId="notifications" text={PAGE_META.notifications?.helpText} />

      {/* Filter chips */}
      <div style={toolbar()}>
        {FILTER_LABELS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={
              filter === f.id
                ? { ...CU.btnPrimary, height: isMobile ? 28 : 32, fontSize: isMobile ? 11 : 12, padding: isMobile ? '0 8px' : '0 12px' }
                : { ...CU.btnGhost, height: isMobile ? 28 : 32, fontSize: isMobile ? 11 : 12, padding: isMobile ? '0 8px' : '0 12px' }
            }
          >
            {f.label}
            {f.id !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({notifications.filter(n => n.type === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ ...CU.emptyState }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ color: CU.textMuted }}>Chargement des notifications...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...CU.card, ...CU.emptyState }}>
          <div style={CU.emptyEmoji}>✅</div>
          <div style={CU.emptyTitle}>Tout est parfait !</div>
          <div style={CU.emptyDesc}>Aucune notification dans cette catégorie.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(notif => {
            const isHovered = hoveredId === notif.id;
            return (
              <div
                key={notif.id}
                onMouseEnter={() => setHoveredId(notif.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...CU.card,
                  borderLeft: `3px solid ${CU.text}`,
                  opacity: notif.read ? 0.6 : 1,
                  background: isHovered ? CU.bgSecondary : CU.bg,
                  transition: 'opacity 0.15s, background 0.15s',
                  minHeight: 56,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: CU.accentLight, fontSize: 20,
                  }}>
                    {TYPE_EMOJIS[notif.type]}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ ...CU.badge, background: CU.accentLight, color: CU.text }}>
                          {TYPE_LABELS[notif.type]}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{notif.title}</span>
                        {!notif.read && (
                          <span style={{
                            display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                            background: CU.accent,
                          }} />
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: CU.textMuted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {relativeDate(notif.date)}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: CU.textSecondary, lineHeight: 1.6, margin: '6px 0 10px' }}>
                      {notif.body}
                    </p>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {notif.actionLabel && notif.actionHref && (
                        <Link href={notif.actionHref} style={{ ...CU.btnPrimary, textDecoration: 'none', height: isMobile ? 40 : 30, fontSize: 12 }}>
                          {notif.actionLabel}
                        </Link>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => handleDismiss(notif.id)}
                          style={{ ...CU.btnGhost, height: isMobile ? 40 : 30, fontSize: 12 }}
                        >
                          Ignorer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA if no alerts */}
      {!loading && notifications.filter(n => n.type === 'alert').length === 0 && (
        <div style={{
          ...CU.card, textAlign: 'center', marginTop: 16, padding: '24px 20px',
          borderLeft: `3px solid ${CU.accent}`,
        }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, color: CU.text }}>
            Aucune alerte active — Votre compte est en bonne santé
          </div>
          <div style={{ fontSize: 12, color: CU.textSecondary, marginTop: 4 }}>
            Vos crédits sont suffisants et vos assistants sont opérationnels.
          </div>
          <Link href="/client/dashboard" style={{
            ...CU.btnPrimary, marginTop: 12, textDecoration: 'none',
          }}>
            Voir mon dashboard →
          </Link>
        </div>
      )}
    </div>
    </AuthRequired>
  );
}
