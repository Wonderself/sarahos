'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import AuthRequired from '../../../../components/AuthRequired';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

type AgentMode = 'pro' | 'eco';

export default function AgentModePage() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<AgentMode>('pro');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfirm, setShowConfirm] = useState<AgentMode | null>(null);
  const [myLimits, setMyLimits] = useState<any>(null);

  const formatK = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : Math.round(n / 1000) + 'K';

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json() as { agentMode?: AgentMode };
        setMode(data.agentMode ?? 'pro');
      }
      const limitsRes = await fetch(`${API_BASE}/portal/my-limits`, { headers: { Authorization: `Bearer ${token}` } });
      if (limitsRes.ok) setMyLimits(await limitsRes.json());
    } catch { /* default to pro */ }
    setLoading(false);
  };

  const handleSwitch = async (newMode: AgentMode) => {
    setShowConfirm(null);
    setSwitching(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/users/me/agent-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        setMode(newMode);
      }
    } catch { /* */ }
    setSwitching(false);
  };

  if (loading) return <AuthRequired pageName="Parametres"><div style={{ padding: 48, textAlign: 'center', color: CU.textMuted }}>Chargement...</div></AuthRequired>;

  return (
    <AuthRequired pageName="Parametres">
    <div className="client-page-scrollable" style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '16px 16px' : '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>⚙️</span>
          <h1 style={CU.pageTitle}>Mode de fonctionnement</h1>
        </div>
        <p style={CU.pageSubtitle}>Choisis comment tes agents travaillent</p>
      </div>

      {/* Toggle */}
      <div style={CU.card}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 8 : 12 }}>
          <button
            onClick={() => mode !== 'pro' ? setShowConfirm('pro') : null}
            disabled={switching}
            style={{
              padding: isMobile ? 12 : 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
              border: mode === 'pro' ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
              background: mode === 'pro' ? CU.accentLight : CU.bg,
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
            <p style={{ fontWeight: 700, marginTop: 8, color: CU.text }}>Mode Pro</p>
            {mode === 'pro' && <span style={{ fontSize: 12, color: CU.text, marginTop: 4, display: 'inline-block' }}>Actif</span>}
          </button>
          <button
            onClick={() => mode !== 'eco' ? setShowConfirm('eco') : null}
            disabled={switching}
            style={{
              padding: isMobile ? 12 : 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
              border: mode === 'eco' ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
              background: mode === 'eco' ? CU.accentLight : CU.bg,
            }}
          >
            <span style={{ fontSize: 24 }}>⚡</span>
            <p style={{ fontWeight: 700, marginTop: 8, color: CU.text }}>Mode Éco</p>
            {mode === 'eco' && <span style={{ fontSize: 12, color: CU.text, marginTop: 4, display: 'inline-block' }}>Actif</span>}
          </button>
        </div>

        {/* Current mode description */}
        <div style={{ marginTop: 16, padding: 16, background: CU.accentLight, borderRadius: 8 }}>
          {mode === 'pro' ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>🚀 Résultats détaillés, agents qui collaborent</p>
              <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 8 }}>Consomme tes crédits ~3x plus vite</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>⚡ Rapide, efficace, économique</p>
              <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 8 }}>Tes crédits durent ~3x plus longtemps</p>
            </>
          )}
        </div>

        <button onClick={() => setShowInfo(!showInfo)} style={{ marginTop: 12, background: 'none', border: 'none', color: CU.textSecondary, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
          Quelle est la différence ?
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div style={{ ...CU.card, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={CU.sectionTitle}>🚀 Pro vs ⚡ Éco</h3>
            <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', color: CU.textMuted, cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ background: CU.accentLight, borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>🚀 MODE PRO</p>
            <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 8 }}>
              Tes agents travaillent ensemble, se consultent, et te donnent des réponses riches et complètes.
            </p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Projets créatifs complexes</p>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Création de contenu pro</p>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Quand tu veux le meilleur résultat</p>
              <p style={{ fontSize: 12, color: CU.textSecondary }}>⚠️ Tes crédits s&apos;épuisent ~3x plus vite</p>
            </div>
          </div>

          <div style={{ background: CU.accentLight, borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>⚡ MODE ÉCO</p>
            <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 8 }}>
              Chaque agent va droit au but. Réponses rapides, crédits préservés.
            </p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Tâches simples et quotidiennes</p>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Quand tu veux économiser</p>
              <p style={{ fontSize: 12, color: CU.text }}>✅ Réponses instantanées</p>
              <p style={{ fontSize: 12, color: CU.textSecondary }}>⚠️ Pas de collaboration entre agents</p>
              <p style={{ fontSize: 12, color: CU.textSecondary }}>⚠️ Réponses plus courtes</p>
            </div>
          </div>

          <div style={{ background: CU.accentLight, borderRadius: 8, padding: 12, border: `1px solid ${CU.border}` }}>
            <p style={{ fontSize: 12, color: CU.textSecondary }}>
              💡 Tu peux changer quand tu veux. Tes conversations et tes réglages sont toujours conservés. C&apos;est juste la façon dont tes agents travaillent qui change.
            </p>
          </div>

          <button onClick={() => setShowInfo(false)} style={{ ...CU.btnPrimary, width: '100%' }}>
            J&apos;ai compris
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div style={CU.overlay} onClick={() => setShowConfirm(null)}>
          <div style={CU.modal} onClick={e => e.stopPropagation()}>
            <h3 style={CU.sectionTitle}>
              Passer en Mode {showConfirm === 'pro' ? <>Pro 🚀</> : <>Éco ⚡</>} ?
            </h3>
            <p style={{ color: CU.textMuted, fontSize: 14, marginTop: 12 }}>
              {showConfirm === 'eco'
                ? 'Tes agents iront droit au but. Tes crédits dureront plus longtemps. Tu pourras revenir en Pro à tout moment.'
                : 'Tes agents collaboreront entre eux pour des résultats plus complets. Tes crédits seront consommés plus rapidement.'
              }
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowConfirm(null)} style={{ ...CU.btnGhost, flex: 1 }}>
                Annuler
              </button>
              <button
                onClick={() => handleSwitch(showConfirm)}
                style={{ ...CU.btnPrimary, flex: 1 }}
              >
                Activer le Mode {showConfirm === 'pro' ? 'Pro' : 'Éco'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specs comparison */}
      <div style={CU.card}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Comparaison technique</h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ color: CU.textMuted, borderBottom: `1px solid ${CU.border}` }}>
              <th style={{ padding: '8px 0', textAlign: 'left' }}>Paramètre</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>🚀 Pro</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>⚡ Éco</th>
            </tr>
          </thead>
          <tbody style={{ color: CU.text }}>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '8px 0' }}>Modèle par défaut</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>Sonnet</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>Haiku</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '8px 0' }}>Collaboration agents</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>Oui</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>Non</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '8px 0' }}>Mémoire</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>10 messages</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>5 messages</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '8px 0' }}>Réponse max</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>8192 tokens</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>2048 tokens</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>Coût moyen/requête</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>~3 crédits</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>~1 crédit</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      {/* Current Limits */}
      <div style={CU.card}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Tes limites actuelles</h3>
        {myLimits ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: CU.textMuted, fontSize: 14 }}>Palier</span>
              <span style={{ color: CU.text, fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{myLimits.tier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: CU.textMuted, fontSize: 14 }}>Tokens aujourd&apos;hui</span>
              <span style={{ color: CU.text, fontSize: 14 }}>{formatK(myLimits.consumed.today)} / {formatK(myLimits.limits.daily)}</span>
            </div>
            <div style={{ width: '100%', background: '#F0F0F0', borderRadius: 999, height: 8 }}>
              <div style={{ height: '100%', borderRadius: 999, background: CU.accent, width: `${Math.min(100, (myLimits.consumed.today / myLimits.limits.daily) * 100)}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: CU.textMuted, fontSize: 14 }}>Tokens cette heure</span>
              <span style={{ color: CU.text, fontSize: 14 }}>{formatK(myLimits.consumed.thisHour)} / {formatK(myLimits.limits.hourly)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: CU.textMuted, fontSize: 14 }}>Output max par reponse</span>
              <span style={{ color: CU.text, fontSize: 14 }}>{myLimits.limits.perRequest} tokens</span>
            </div>
            <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 8 }}>Recharge tes credits pour augmenter tes limites</p>
          </div>
        ) : (
          <p style={{ color: CU.textMuted, fontSize: 14 }}>Chargement...</p>
        )}
      </div>
    </div>
    </AuthRequired>
  );
}
