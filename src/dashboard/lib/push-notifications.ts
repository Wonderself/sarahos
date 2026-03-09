// ═══════════════════════════════════════════════════
//   FREENZY.IO — Push Notifications (PWA)
//   Local notification management + permission flow
// ═══════════════════════════════════════════════════

export interface PushPreferences {
  credits: boolean;
  streaks: boolean;
  games: boolean;
  referrals: boolean;
}

const PREFS_KEY = 'fz_push_preferences';
const ASKED_KEY = 'fz_push_permission_asked';

export function loadPreferences(): PushPreferences {
  if (typeof window === 'undefined') return { credits: true, streaks: true, games: true, referrals: true };
  try {
    return { credits: true, streaks: true, games: true, referrals: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch { return { credits: true, streaks: true, games: true, referrals: true }; }
}

export function savePreferences(prefs: PushPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function hasAskedPermission(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ASKED_KEY) === 'true';
}

export function markPermissionAsked(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASKED_KEY, 'true');
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  markPermissionAsked();
  return Notification.requestPermission();
}

export function canSendNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

export function sendLocalNotification(title: string, body: string, icon?: string): void {
  if (!canSendNotifications()) return;
  const prefs = loadPreferences();
  // Don't send if user disabled this category (best effort mapping)
  if (title.includes('crédit') && !prefs.credits) return;
  if (title.includes('série') && !prefs.streaks) return;
  if (title.includes('jeu') && !prefs.games) return;
  if (title.includes('parrain') && !prefs.referrals) return;

  new Notification(title, {
    body,
    icon: icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    tag: `fz-${Date.now()}`,
  });
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => { /* silent */ });
}
