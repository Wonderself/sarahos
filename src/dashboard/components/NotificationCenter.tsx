'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

// ═══════════════════════════════════════════════════
//   SARAH OS — Notification Center
//   Bell icon + dropdown + provider context
// ═══════════════════════════════════════════════════

// ── Types ──

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// ── Context ──

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  push: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a <NotificationProvider>');
  }
  return ctx;
}

// ── Provider ──

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const push = useCallback(
    (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fetch notifications from portal API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const sessionRaw =
          typeof window !== 'undefined'
            ? localStorage.getItem('sarah_session')
            : null;
        if (!sessionRaw) return;

        const session = JSON.parse(sessionRaw);
        const token = session?.token;
        if (!token) return;

        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/notifications', token }),
        });

        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data)) {
          const mapped: Notification[] = data.map(
            (item: Record<string, unknown>) => ({
              id: (item.id as string) ?? `srv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              type: mapNotificationType(item.type as string),
              title: (item.title as string) ?? (item.subject as string) ?? 'Notification',
              message: (item.message as string) ?? (item.body as string) ?? '',
              createdAt: (item.createdAt as string) ?? new Date().toISOString(),
              read: (item.isRead as boolean) ?? (item.read as boolean) ?? false,
            }),
          );
          setNotifications((prev) => [...mapped, ...prev]);
        }
      } catch {
        // Silently fail — notifications are not critical
      }
    }

    fetchNotifications();
    return () => { cancelled = true; };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, push, markAsRead, markAllAsRead, dismiss, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ── Notification Center Component ──

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-mark visible notifications as read after 3 seconds
  useEffect(() => {
    if (!isOpen) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const timer = setTimeout(() => {
      unread.forEach((n) => markAsRead(n.id));
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOpen, notifications, markAsRead]);

  return (
    <div ref={panelRef} style={styles.container}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={styles.bellButton}
        aria-label="Notifications"
        title="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={styles.markAllButton}
              >
                Marquer tout comme lu
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: 28, marginBottom: 8, display: 'block' }}>
                  {/* Empty bell */}
                </span>
                <span>Aucune notification</span>
              </div>
            ) : (
              notifications.slice(0, 50).map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    ...styles.notificationItem,
                    ...(notif.read ? {} : styles.notificationItemUnread),
                  }}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                  }}
                >
                  <div style={styles.notificationIcon}>
                    <TypeIcon type={notif.type} />
                  </div>
                  <div style={styles.notificationBody}>
                    <div style={styles.notificationTitleRow}>
                      <span style={styles.notificationTitle}>{notif.title}</span>
                      <span style={styles.notificationTime}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <div style={styles.notificationMessage}>{notif.message}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(notif.id);
                    }}
                    style={styles.dismissButton}
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper: Map backend notification type to our types ──

function mapNotificationType(type?: string): NotificationType {
  if (!type) return 'info';
  const t = type.toLowerCase();
  if (t.includes('error') || t.includes('fail')) return 'error';
  if (t.includes('warn') || t.includes('alert')) return 'warning';
  if (t.includes('success') || t.includes('complete') || t.includes('done')) return 'success';
  return 'info';
}

// ── Helper: Time Ago ──

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'maintenant';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'maintenant';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;

  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;

  const years = Math.floor(months / 12);
  return `il y a ${years}a`;
}

// ── Icons ──

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function TypeIcon({ type }: { type: NotificationType }) {
  const colors: Record<NotificationType, string> = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const icons: Record<NotificationType, string> = {
    info: 'i',
    success: '\u2713',
    warning: '!',
    error: '\u2717',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: `${colors[type]}20`,
        color: colors[type],
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {icons[type]}
    </span>
  );
}

// ── Styles ──

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellButton: {
    position: 'relative',
    background: 'none',
    border: '1px solid var(--border, #2a2a3e)',
    borderRadius: 8,
    padding: '8px 10px',
    cursor: 'pointer',
    color: 'var(--text-muted, #a0a0b8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, border-color 0.2s',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 380,
    maxHeight: 480,
    backgroundColor: 'var(--card-bg, #1a1a2e)',
    border: '1px solid var(--border, #2a2a3e)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 1000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border, #2a2a3e)',
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text, #e0e0f0)',
  },
  markAllButton: {
    background: 'none',
    border: 'none',
    color: 'var(--accent, #6366f1)',
    fontSize: 12,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    fontWeight: 500,
  },
  notificationList: {
    overflowY: 'auto',
    flex: 1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    color: 'var(--text-muted, #a0a0b8)',
    fontSize: 13,
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 16px',
    borderBottom: '1px solid var(--border, #2a2a3e)',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  notificationItemUnread: {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  notificationIcon: {
    flexShrink: 0,
    paddingTop: 2,
  },
  notificationBody: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text, #e0e0f0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  notificationTime: {
    fontSize: 11,
    color: 'var(--text-muted, #a0a0b8)',
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: 12,
    color: 'var(--text-muted, #a0a0b8)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #a0a0b8)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    flexShrink: 0,
    opacity: 0.6,
  },
};
