'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 8: FEATURE FLAGS
// ═══════════════════════════════════════════════════

const FEATURE_LIST = [
  { id: 'studio', label: 'Studio Créatif', desc: 'Génération vidéo & photo (D-ID / Nano Banana)' },
  { id: 'visio', label: 'Visio & Appels', desc: 'Visioconférence agents, appels Twilio' },
  { id: 'documents', label: 'Documents', desc: 'Upload & analyse de documents' },
  { id: 'repondeur', label: 'Répondeur IA', desc: 'Répondeur automatique WhatsApp/SMS' },
  { id: 'personal_agents', label: 'Agents Personnels', desc: '12 agents personnels (budget, coach…)' },
  { id: 'marketplace', label: 'Marketplace', desc: 'Accès aux 50 templates d\'agents' },
  { id: 'reveil', label: 'Réveil Intelligent', desc: '8 modes de réveil + briefing matinal' },
  { id: 'formations', label: 'Formations', desc: 'Accès aux formations en ligne' },
  { id: 'video_pro', label: 'Vidéo Pro', desc: 'Tournage & montage vidéo professionnel' },
  { id: 'social', label: 'Social Media', desc: 'Publication & gestion réseaux sociaux' },
];

export default function UserFeatureFlagsTab({ userId, showToast }: {
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Array<{ feature: string; enabled: boolean }>>(`/admin/users/${userId}/feature-flags`)
      .then(data => {
        const map: Record<string, boolean> = {};
        for (const f of data) map[f.feature] = f.enabled;
        setFlags(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  async function toggle(featureId: string) {
    const newVal = !(flags[featureId] ?? true);
    setSaving(featureId);
    try {
      await apiFetch(`/admin/users/${userId}/feature-flags`, {
        method: 'PATCH',
        body: JSON.stringify({ feature: featureId, enabled: newVal }),
      });
      setFlags(prev => ({ ...prev, [featureId]: newVal }));
      showToast(`${featureId} ${newVal ? 'activé' : 'désactivé'}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div style={{ padding: 24, color: 'var(--text-muted)' }}>Chargement…</div>;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>🚩 Feature Flags — accès individuel</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Les features non définies ici suivent les règles par défaut du tier de l&apos;utilisateur.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {FEATURE_LIST.map(feat => {
          const enabled = flags[feat.id] ?? true;
          const isDefined = feat.id in flags;
          return (
            <div
              key={feat.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--border-primary)',
                background: isDefined ? (enabled ? 'rgba(0,0,0,0.03)' : 'rgba(220,38,38,0.03)') : 'transparent',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{feat.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{feat.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isDefined && (
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 10,
                    background: enabled ? 'rgba(0,0,0,0.08)' : 'rgba(220,38,38,0.08)',
                    color: enabled ? '#1A1A1A' : '#DC2626', fontWeight: 600,
                  }}>
                    {enabled ? 'ON' : 'OFF'}
                  </span>
                )}
                <button
                  onClick={() => toggle(feat.id)}
                  disabled={saving === feat.id}
                  title={enabled ? 'Désactiver' : 'Activer'}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                    background: enabled ? '#1A1A1A' : '#d1d5db', transition: 'background 0.2s', position: 'relative',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: enabled ? 20 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
