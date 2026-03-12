'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, UserData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 9: DANGER ZONE
// ═══════════════════════════════════════════════════

export default function UserDangerTab({ user, showToast }: {
  user: UserData;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [impersonating, setImpersonating] = useState(false);

  async function handleImpersonate() {
    setImpersonating(true);
    try {
      const data = await apiFetch<{ token: string; email: string; displayName: string }>(`/admin/users/${user.id}/impersonate`, { method: 'POST' });
      const adminSession = localStorage.getItem('fz_session');
      localStorage.setItem('fz_admin_session_backup', adminSession ?? '');
      localStorage.setItem('fz_session', JSON.stringify({
        token: data.token, email: data.email, displayName: data.displayName,
        impersonating: true, impersonatingAdmin: JSON.parse(adminSession ?? '{}').email,
      }));
      showToast(`Connexion en tant que ${data.email}`, 'success');
      setTimeout(() => { window.location.href = '/client/dashboard'; }, 800);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
      setImpersonating(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm(`Désactiver ${user.displayName} ?`)) return;
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
      showToast('Compte désactivé', 'success');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur', 'error'); }
  }

  async function handleResetKey() {
    if (!confirm('Régénérer la clé API ?')) return;
    try {
      const data = await apiFetch<{ apiKey: string }>(`/admin/users/${user.id}/reset-key`, { method: 'POST' });
      showToast(`Nouvelle clé: ${data.apiKey.slice(0, 12)}…`, 'success');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Erreur', 'error'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...styles.card, border: '1px solid rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>theater_comedy</span> Impersonation</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Accéder au dashboard en tant que {user.displayName} pendant 1h.
              Un banner rouge sera affiché. Toutes les actions sont loguées.
            </div>
          </div>
          <button
            onClick={handleImpersonate}
            disabled={impersonating || user.role === 'admin'}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
              background: user.role === 'admin' ? '#9B9B9B' : '#1A1A1A', color: 'white',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 16,
              opacity: impersonating ? 0.7 : 1,
            }}
          >
            {impersonating ? 'Connexion…' : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>theater_comedy</span> Se connecter comme ce user</>}
          </button>
        </div>
      </div>

      <div style={{ ...styles.card, border: '1px solid rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>key</span> Régénérer la clé API</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>L&apos;ancienne clé API sera immédiatement invalidée.</div>
          </div>
          <button
            onClick={handleResetKey}
            style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid #9B9B9B', cursor: 'pointer',
              background: 'transparent', color: '#9B9B9B', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 16,
            }}
          >
            Régénérer
          </button>
        </div>
      </div>

      <div style={{ ...styles.card, border: '1px solid rgba(220,38,38,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>block</span> Désactiver le compte</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Le user ne pourra plus se connecter. Ses données sont conservées.</div>
          </div>
          <button
            onClick={handleDeactivate}
            disabled={!user.isActive}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              cursor: user.isActive ? 'pointer' : 'not-allowed',
              background: user.isActive ? '#DC2626' : '#9B9B9B', color: 'white',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 16,
            }}
          >
            {user.isActive ? 'Désactiver' : 'Déjà désactivé'}
          </button>
        </div>
      </div>
    </div>
  );
}
