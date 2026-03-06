'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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


const TYPE_ICONS: Record<NotifType, string> = {
  alert: '🔴',
  session: '🔗',
  update: '⬆️',
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
              body: `Il vous reste ${credits} crédit${Number(credits) < 2 ? '' : 's'}. Rechargez votre compte pour continuer à utiliser vos agents.`,
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

  const typeColor: Record<NotifType, string> = {
    alert: '#ef4444',
    session: '#5b6cf7',
    update: '#22c55e',
    info: '#3b82f6',
  };

  return (
    <div className="client-page-scrollable">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Notifications
            {unreadCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 10, minWidth: 22, height: 22, borderRadius: 11,
                background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '0 6px',
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Tout est à jour'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost btn-sm">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-6 mb-16">
        {FILTER_LABELS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ fontSize: 12 }}
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
        <div className="text-center text-muted" style={{ padding: 60 }}>
          <div className="animate-pulse" style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div>Chargement des notifications...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div className="text-xl font-bold mb-8">Tout est parfait !</div>
          <div className="text-md text-secondary">Aucune notification dans cette catégorie.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filtered.map(notif => (
            <div
              key={notif.id}
              className="card"
              style={{
                borderLeft: `3px solid ${typeColor[notif.type]}`,
                opacity: notif.read ? 0.65 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div className="flex gap-12" style={{ alignItems: 'flex-start' }}>
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: typeColor[notif.type] + '15', fontSize: 18,
                }}>
                  {TYPE_ICONS[notif.type]}
                </div>

                {/* Content */}
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="flex flex-between items-start gap-8" style={{ flexWrap: 'wrap' }}>
                    <div>
                      <span className="text-xs font-semibold rounded-sm" style={{
                        padding: '2px 6px', marginRight: 8,
                        background: typeColor[notif.type] + '15', color: typeColor[notif.type],
                      }}>
                        {TYPE_LABELS[notif.type]}
                      </span>
                      <span className="text-base font-bold">{notif.title}</span>
                      {!notif.read && (
                        <span style={{
                          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                          background: typeColor[notif.type], marginLeft: 8, verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    <span className="text-xs text-muted" style={{ flexShrink: 0 }}>
                      {relativeDate(notif.date)}
                    </span>
                  </div>

                  <p className="text-sm text-secondary mt-6" style={{ lineHeight: 1.6, margin: '6px 0 10px' }}>
                    {notif.body}
                  </p>

                  <div className="flex gap-8 items-center flex-wrap">
                    {notif.actionLabel && notif.actionHref && (
                      <Link href={notif.actionHref} className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                        {notif.actionLabel}
                      </Link>
                    )}
                    {!notif.read && (
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        Ignorer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA if no alerts */}
      {!loading && notifications.filter(n => n.type === 'alert').length === 0 && (
        <div className="card text-center mt-16" style={{ padding: '24px 20px', background: 'var(--success-muted)', borderColor: 'var(--success)' }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div className="text-base font-semibold mt-6" style={{ color: 'var(--success)' }}>
            Aucune alerte active — Votre compte est en bonne santé
          </div>
          <div className="text-sm text-secondary mt-4">
            Vos crédits sont suffisants et vos agents sont opérationnels.
          </div>
          <Link href="/client/dashboard" className="btn btn-sm mt-12" style={{ background: 'var(--success)', color: '#fff', border: 'none' }}>
            Voir mon dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
