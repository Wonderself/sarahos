'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, ROLES, TIERS, ALL_AGENTS, Toggle, formatDate, UserData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 1: PROFIL
// ═══════════════════════════════════════════════════

export default function UserProfileTab({ user, onUpdate, showToast }: {
  user: UserData;
  onUpdate: (u: UserData) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState({
    displayName: user.displayName,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    dailyApiLimit: user.dailyApiLimit,
    activeAgents: user.activeAgents || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch<UserData>(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      onUpdate(updated);
      showToast('Profil mis a jour avec succes', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur de sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleAgent = (agent: string) => {
    setForm(prev => ({
      ...prev,
      activeAgents: prev.activeAgents.includes(agent)
        ? prev.activeAgents.filter(a => a !== agent)
        : [...prev.activeAgents, agent],
    }));
  };

  return (
    <div>
      {/* Read-only Info */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>person</span> Informations</div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>ID</span>
            <span style={{ ...styles.infoValue, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{user.id}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{user.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email confirme</span>
            <span style={styles.infoValue}>{user.emailConfirmed ? 'Oui' : 'Non'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Numero utilisateur</span>
            <span style={styles.infoValue}>#{user.userNumber ?? '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Inscription</span>
            <span style={styles.infoValue}>{formatDate(user.createdAt)}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Dernier login</span>
            <span style={styles.infoValue}>{formatDate(user.lastLoginAt)}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Code promo utilise</span>
            <span style={styles.infoValue}>{user.promoCodeUsed || '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Code de parrainage</span>
            <span style={styles.infoValue}>{user.referralCode || '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Parraine par</span>
            <span style={styles.infoValue}>{user.referredBy || '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Taux de commission</span>
            <span style={styles.infoValue}>{((user.commissionRate ?? 0) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>bar_chart</span> Activite</div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Appels API aujourd&apos;hui</span>
            <span style={{ ...styles.kpiValue, color: user.dailyApiCalls > user.dailyApiLimit * 0.8 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
              {user.dailyApiCalls}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {user.dailyApiLimit}</span>
          </div>
          <div style={{ marginTop: 12, background: 'var(--bg-tertiary)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: 6,
              width: `${Math.min((user.dailyApiCalls / user.dailyApiLimit) * 100, 100)}%`,
              background: user.dailyApiCalls > user.dailyApiLimit * 0.9 ? 'var(--danger)'
                : user.dailyApiCalls > user.dailyApiLimit * 0.7 ? 'var(--text-secondary)' : 'var(--text-primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          {user.demoExpiresAt && (
            <div style={{ ...styles.infoRow, marginTop: 16 }}>
              <span style={styles.infoLabel}>Demo expire le</span>
              <span style={{ ...styles.infoValue, color: new Date(user.demoExpiresAt) < new Date() ? 'var(--danger)' : 'var(--text-primary)' }}>
                {formatDate(user.demoExpiresAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Editable Fields */}
      <div style={styles.card}>
        <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>edit</span> Modifier le profil</div>
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom d&apos;affichage</label>
            <input
              style={styles.input}
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Limite API quotidienne</label>
            <input
              style={styles.input}
              type="number"
              min={1}
              value={form.dailyApiLimit}
              onChange={e => setForm(f => ({ ...f, dailyApiLimit: Number(e.target.value) }))}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.select}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tier</label>
            <select
              style={styles.select}
              value={form.tier}
              onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
            >
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={styles.toggleRow}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Compte actif</span>
          <Toggle value={form.isActive} onChange={v => setForm(f => ({ ...f, isActive: v }))} />
        </div>

        <div style={{ ...styles.formGroup, marginTop: 16 }}>
          <label style={styles.label}>Agents actifs ({form.activeAgents.length} selectionnes)</label>
          <div style={styles.multiSelect}>
            {ALL_AGENTS.map(agent => (
              <div
                key={agent}
                style={styles.agentChip(form.activeAgents.includes(agent))}
                onClick={() => toggleAgent(agent)}
              >
                {agent}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button
            style={{ ...styles.btnPrimary, opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>save</span> Sauvegarder</>}
          </button>
        </div>
      </div>
    </div>
  );
}
