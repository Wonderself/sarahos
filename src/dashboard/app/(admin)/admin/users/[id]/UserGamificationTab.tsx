'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, GamificationData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 6: GAMIFICATION
// ═══════════════════════════════════════════════════

export default function UserGamificationTab({ userId, data, loading, showToast, onReset }: {
  userId: string;
  data: GamificationData | null;
  loading: boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onReset: () => void;
}) {
  const [resetting, setResetting] = useState(false);

  if (loading) {
    return <div style={styles.loadingSpinner}>Chargement des donnees de gamification...</div>;
  }

  const handleReset = async () => {
    if (!window.confirm('Reinitialiser toutes les donnees de gamification ? Cette action est irreversible.')) {
      return;
    }
    setResetting(true);
    try {
      await apiFetch(`/admin/users/${userId}/gamification/reset`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      onReset();
      showToast('Gamification reinitialisee', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={styles.grid4}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Niveau</span>
          <span style={{ ...styles.kpiValue, color: 'var(--text-primary)' }}>
            {data?.level ?? 1}
          </span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>XP</span>
          <span style={{ ...styles.kpiValue, color: 'var(--text-primary)' }}>
            {(data?.xp ?? 0).toLocaleString()}
          </span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Streak</span>
          <span style={{ ...styles.kpiValue, color: 'var(--text-secondary)' }}>
            {data?.streak ?? 0}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>jours</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Succes</span>
          <span style={{ ...styles.kpiValue, color: 'var(--text-primary)' }}>
            {data?.achievements ?? 0}
          </span>
        </div>
      </div>

      {/* XP Progress to Next Level */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🎮 Progression</div>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Niveau {data?.level ?? 1}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {(data?.xp ?? 0).toLocaleString()} / {((data?.level ?? 1) * 1000).toLocaleString()} XP
          </span>
        </div>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: 6,
            width: `${Math.min(((data?.xp ?? 0) / ((data?.level ?? 1) * 1000)) * 100, 100)}%`,
            background: '#1A1A1A',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Badges */}
      {data?.badges && data.badges.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏆 Badges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.badges.map((badge, i) => (
              <span key={i} style={{
                padding: '6px 14px',
                borderRadius: 20,
                background: 'var(--accent-muted)',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 500,
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>⚠️ Zone dangereuse</div>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Reinitialiser la gamification remet le niveau a 1, l&apos;XP a 0, et supprime tous les badges et succes.
        </p>
        <button
          style={{ ...styles.btnDanger, opacity: resetting ? 0.6 : 1 }}
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? 'Reinitialisation...' : <>🗑️ Reinitialiser la gamification</>}
        </button>
      </div>
    </div>
  );
}
