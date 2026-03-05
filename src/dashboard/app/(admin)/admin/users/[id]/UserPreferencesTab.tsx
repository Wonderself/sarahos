'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, LANGUAGES, VOICES, ALL_AGENTS, Toggle, PreferencesData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 3: PREFERENCES
// ═══════════════════════════════════════════════════

export default function UserPreferencesTab({ userId, prefs, loading, showToast, onUpdate }: {
  userId: string;
  prefs: PreferencesData['preferences'];
  loading: boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onUpdate: (p: PreferencesData['preferences']) => void;
}) {
  const [form, setForm] = useState({
    darkMode: false,
    compactMode: false,
    language: 'fr',
    notifyEmail: true,
    notifySms: false,
    notifyWhatsapp: false,
    notifyInApp: true,
    notifyLowBalance: true,
    notifyDailyReport: false,
    notifyWeeklyReport: false,
    voiceEnabled: false,
    preferredVoice: 'sarah',
    defaultAgent: 'fz-assistante',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setForm(f => ({
        ...f,
        darkMode: prefs.darkMode ?? false,
        compactMode: prefs.compactMode ?? false,
        language: prefs.language ?? 'fr',
        notifyEmail: prefs.notifyEmail ?? true,
        notifySms: prefs.notifySms ?? false,
        notifyWhatsapp: prefs.notifyWhatsapp ?? false,
        notifyInApp: prefs.notifyInApp ?? true,
        notifyLowBalance: prefs.notifyLowBalance ?? true,
        notifyDailyReport: prefs.notifyDailyReport ?? false,
        notifyWeeklyReport: prefs.notifyWeeklyReport ?? false,
        voiceEnabled: prefs.voiceEnabled ?? false,
        preferredVoice: prefs.preferredVoice ?? 'sarah',
        defaultAgent: prefs.defaultAgent ?? 'fz-assistante',
      }));
    }
  }, [prefs]);

  if (loading) {
    return <div style={styles.loadingSpinner}>Chargement des preferences...</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiFetch<PreferencesData>(`/admin/users/${userId}/preferences`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      onUpdate(data.preferences);
      showToast('Preferences sauvegardees', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={styles.grid2}>
        {/* Display Preferences */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🎨 Affichage</div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>Mode sombre</span>
            <Toggle value={form.darkMode} onChange={v => setForm(f => ({ ...f, darkMode: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>Mode compact</span>
            <Toggle value={form.compactMode} onChange={v => setForm(f => ({ ...f, compactMode: v }))} />
          </div>
          <div style={{ ...styles.formGroup, marginTop: 16 }}>
            <label style={styles.label}>Langue</label>
            <select
              style={styles.select}
              value={form.language}
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔔 Notifications</div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>Email</span>
            <Toggle value={form.notifyEmail} onChange={v => setForm(f => ({ ...f, notifyEmail: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>SMS</span>
            <Toggle value={form.notifySms} onChange={v => setForm(f => ({ ...f, notifySms: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>WhatsApp</span>
            <Toggle value={form.notifyWhatsapp} onChange={v => setForm(f => ({ ...f, notifyWhatsapp: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>In-App</span>
            <Toggle value={form.notifyInApp} onChange={v => setForm(f => ({ ...f, notifyInApp: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>Alerte solde bas</span>
            <Toggle value={form.notifyLowBalance} onChange={v => setForm(f => ({ ...f, notifyLowBalance: v }))} />
          </div>
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14 }}>Rapport quotidien</span>
            <Toggle value={form.notifyDailyReport} onChange={v => setForm(f => ({ ...f, notifyDailyReport: v }))} />
          </div>
          <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
            <span style={{ fontSize: 14 }}>Rapport hebdomadaire</span>
            <Toggle value={form.notifyWeeklyReport} onChange={v => setForm(f => ({ ...f, notifyWeeklyReport: v }))} />
          </div>
        </div>
      </div>

      {/* Voice & Agent Settings */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🗣️ Voix et agent</div>
        <div style={styles.grid3}>
          <div>
            <div style={styles.toggleRow}>
              <span style={{ fontSize: 14 }}>Voix activee</span>
              <Toggle value={form.voiceEnabled} onChange={v => setForm(f => ({ ...f, voiceEnabled: v }))} />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Voix preferee</label>
            <select
              style={styles.select}
              value={form.preferredVoice}
              onChange={e => setForm(f => ({ ...f, preferredVoice: e.target.value }))}
            >
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Agent par defaut</label>
            <select
              style={styles.select}
              value={form.defaultAgent}
              onChange={e => setForm(f => ({ ...f, defaultAgent: e.target.value }))}
            >
              {ALL_AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            style={{ ...styles.btnPrimary, opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
