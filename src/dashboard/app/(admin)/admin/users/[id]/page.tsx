'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/client-fetch';
import {
  styles,
  ROLE_COLORS,
  TIER_COLORS,
  formatDate,
  UserData,
  WalletData,
  PreferencesData,
  UsageData,
  GamificationData,
  TabId,
} from './styles';

import UserProfileTab from './UserProfileTab';
import UserWalletTab from './UserWalletTab';
import UserPreferencesTab from './UserPreferencesTab';
import UserEnterpriseTab from './UserEnterpriseTab';
import UserUsageTab from './UserUsageTab';
import UserGamificationTab from './UserGamificationTab';
import UserNotificationsTab from './UserNotificationsTab';
import UserFeatureFlagsTab from './UserFeatureFlagsTab';
import UserDangerTab from './UserDangerTab';

// ═══════════════════════════════════════════════════
//   Freenzy.io — Admin User Detail Page
//   9 tabs: Profil, Wallet, Preferences, Entreprise,
//           Usage, Gamification, Notifications,
//           Feature Flags, Danger Zone
// ═══════════════════════════════════════════════════

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'profil', label: 'Profil', emoji: '👤' },
  { id: 'wallet', label: 'Wallet', emoji: '💰' },
  { id: 'preferences', label: 'Préférences', emoji: '⚙️' },
  { id: 'entreprise', label: 'Entreprise', emoji: '🏢' },
  { id: 'usage', label: 'Usage', emoji: '📊' },
  { id: 'gamification', label: 'Gamification', emoji: '🎮' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔' },
  { id: 'feature_flags', label: 'Feature Flags', emoji: '🚩' },
  { id: 'danger', label: 'Danger Zone', emoji: '⚠️' },
];

// ── Toast Component ──

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={styles.toast(type)} onClick={onClose}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//   MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('profil');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tab-specific state
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [prefsData, setPrefsData] = useState<PreferencesData['preferences']>(null);
  const [companyData, setCompanyData] = useState<string>('{}');
  const [usageData, setUsageData] = useState<UsageData['usage']>(null);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  // Token budget state
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [tokenLimits, setTokenLimits] = useState<{ tier: string; limits: { daily: number; hourly: number; perMinute: number; perRequest: number } } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const saveMultiplier = useCallback(async () => {
    if (!id) return;
    try {
      await apiFetch(`/admin/users/${id}/token-multiplier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiplier }),
      });
      showToast('Multiplicateur mis a jour', 'success');
      // Refetch token limits
      try {
        const limitsData = await apiFetch<{ tier: string; multiplier: number; limits: { daily: number; hourly: number; perMinute: number; perRequest: number } }>(`/admin/users/${id}/token-limits`);
        setTokenLimits(limitsData);
        setMultiplier(limitsData.multiplier ?? 1.0);
      } catch { /* */ }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  }, [id, multiplier, showToast]);

  // ── Fetch user on load ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<UserData>(`/admin/users/${id}`)
      .then(data => {
        setUser(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Fetch tab data when tab changes ──
  useEffect(() => {
    if (!id || !user) return;

    const fetchTabData = async () => {
      setTabLoading(true);
      try {
        switch (activeTab) {
          case 'wallet': {
            const data = await apiFetch<WalletData>(`/admin/users/${id}/wallet`);
            setWalletData(data);
            try {
              const limitsData = await apiFetch<{ tier: string; multiplier: number; limits: { daily: number; hourly: number; perMinute: number; perRequest: number } }>(`/admin/users/${id}/token-limits`);
              setTokenLimits(limitsData);
              setMultiplier(limitsData.multiplier ?? 1.0);
            } catch { /* token limits endpoint may not exist yet */ }
            break;
          }
          case 'preferences': {
            const data = await apiFetch<PreferencesData>(`/admin/users/${id}/preferences`);
            setPrefsData(data.preferences);
            break;
          }
          case 'entreprise': {
            const data = await apiFetch<{ companyProfile: Record<string, unknown> | null }>(`/admin/users/${id}/company`);
            setCompanyData(JSON.stringify(data.companyProfile || {}, null, 2));
            break;
          }
          case 'usage': {
            const data = await apiFetch<UsageData>(`/admin/users/${id}/usage`);
            setUsageData(data.usage);
            break;
          }
          case 'gamification': {
            const data = await apiFetch<PreferencesData>(`/admin/users/${id}/preferences`);
            const prefs = data.preferences as Record<string, unknown> | null;
            const gData = (prefs?.['gamificationData'] as GamificationData) || {};
            setGamificationData({
              level: gData.level ?? 1,
              xp: gData.xp ?? 0,
              streak: gData.streak ?? 0,
              achievements: gData.achievements ?? 0,
              badges: gData.badges ?? [],
            });
            break;
          }
          default:
            break;
        }
      } catch (err) {
        if (err instanceof Error) {
          showToast(`Erreur de chargement: ${err.message}`, 'error');
        }
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, id, user, showToast]);

  // ── Loading / Error states ──

  if (loading) {
    return (
      <div className="admin-page-scrollable" style={styles.container}>
        <div style={styles.loadingSpinner}>Chargement de l&apos;utilisateur...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="admin-page-scrollable" style={styles.container}>
        <a href="/admin/users" style={styles.backLink}>← Retour</a>
        <div style={{
          background: 'var(--danger-muted)',
          color: 'var(--danger)',
          padding: 20,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
        }}>
          {error || 'Utilisateur introuvable'}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-scrollable" style={styles.container}>
      {/* Back Button */}
      <a href="/admin/users" style={styles.backLink}>← Retour aux utilisateurs</a>

      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Gestion Utilisateur: {user.displayName}</h1>
          <p style={styles.pageSubtitle}>
            {user.email} — Inscrit le {formatDate(user.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={styles.badge(ROLE_COLORS[user.role] || '#6b7280')}>{user.role}</span>
          <span style={styles.badge(TIER_COLORS[user.tier] || '#6b7280')}>{user.tier}</span>
          <span style={styles.badge(user.isActive ? '#1A1A1A' : '#DC2626')}>
            {user.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profil' && (
        <UserProfileTab user={user} onUpdate={setUser} showToast={showToast} />
      )}
      {activeTab === 'wallet' && (
        <>
          <UserWalletTab
            userId={id}
            data={walletData}
            loading={tabLoading}
            showToast={showToast}
            onRefresh={async () => {
              const data = await apiFetch<WalletData>(`/admin/users/${id}/wallet`);
              setWalletData(data);
            }}
          />
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            padding: 20,
            border: '1px solid var(--border-primary, rgba(255,255,255,0.08))',
            marginTop: 16,
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Token Budget</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ color: '#9B9B9B', fontSize: 14 }}>Multiplicateur</label>
              <input
                type="number"
                min={0.1} max={10} step={0.1}
                value={multiplier}
                onChange={e => setMultiplier(parseFloat(e.target.value) || 1)}
                style={{
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  padding: '6px 12px', borderRadius: 8,
                  border: '1px solid var(--border-primary)', width: 96, fontSize: 14,
                }}
              />
              <button
                onClick={saveMultiplier}
                style={{
                  padding: '6px 14px', background: '#1A1A1A', color: 'var(--text-primary)',
                  borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer',
                }}
              >
                Appliquer
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>
              1.0 = standard, 2.0 = double les limites, 0.5 = moitie
            </p>
            {tokenLimits && (
              <div style={{
                marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12,
              }}>
                <div style={{ color: '#9B9B9B' }}>Palier: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{tokenLimits.tier}</span></div>
                <div style={{ color: '#9B9B9B' }}>Daily: <span style={{ color: 'var(--text-primary)' }}>{(tokenLimits.limits.daily / 1000).toFixed(0)}K</span></div>
                <div style={{ color: '#9B9B9B' }}>Hourly: <span style={{ color: 'var(--text-primary)' }}>{(tokenLimits.limits.hourly / 1000).toFixed(0)}K</span></div>
                <div style={{ color: '#9B9B9B' }}>Per-min: <span style={{ color: 'var(--text-primary)' }}>{(tokenLimits.limits.perMinute / 1000).toFixed(0)}K</span></div>
              </div>
            )}
          </div>
        </>
      )}
      {activeTab === 'preferences' && (
        <UserPreferencesTab
          userId={id}
          prefs={prefsData}
          loading={tabLoading}
          showToast={showToast}
          onUpdate={setPrefsData}
        />
      )}
      {activeTab === 'entreprise' && (
        <UserEnterpriseTab
          userId={id}
          json={companyData}
          loading={tabLoading}
          showToast={showToast}
          onUpdate={setCompanyData}
        />
      )}
      {activeTab === 'usage' && (
        <UserUsageTab data={usageData} loading={tabLoading} />
      )}
      {activeTab === 'gamification' && (
        <UserGamificationTab
          userId={id}
          data={gamificationData}
          loading={tabLoading}
          showToast={showToast}
          onReset={() => setGamificationData({ level: 1, xp: 0, streak: 0, achievements: 0, badges: [] })}
        />
      )}
      {activeTab === 'notifications' && (
        <UserNotificationsTab userId={id} showToast={showToast} />
      )}
      {activeTab === 'feature_flags' && (
        <UserFeatureFlagsTab userId={id} showToast={showToast} />
      )}
      {activeTab === 'danger' && user && (
        <UserDangerTab user={user} showToast={showToast} />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
