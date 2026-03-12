'use client';

import { useState, useEffect } from 'react';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

type AgentMode = 'pro' | 'eco';

export default function AgentModePage() {
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

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#9B9B9B' }}>Chargement...</div>;

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 8, padding: 24,
    border: '1px solid #E5E5E5',
  };

  const btnStyle: React.CSSProperties = {
    height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #E5E5E5',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1A1A1A',
  };

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>Mode de fonctionnement</h1>
        <p style={{ color: '#9B9B9B', marginTop: 4, fontSize: 14 }}>Choisis comment tes agents travaillent</p>
      </div>

      {/* Toggle */}
      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={() => mode !== 'pro' ? setShowConfirm('pro') : null}
            disabled={switching}
            style={{
              padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
              border: mode === 'pro' ? '2px solid #1A1A1A' : '1px solid #E5E5E5',
              background: mode === 'pro' ? 'rgba(0,0,0,0.02)' : '#fff',
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
            <p style={{ fontWeight: 700, marginTop: 8, color: '#1A1A1A' }}>Mode Pro</p>
            {mode === 'pro' && <span style={{ fontSize: 12, color: '#1A1A1A', marginTop: 4, display: 'inline-block' }}>Actif</span>}
          </button>
          <button
            onClick={() => mode !== 'eco' ? setShowConfirm('eco') : null}
            disabled={switching}
            style={{
              padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
              border: mode === 'eco' ? '2px solid #1A1A1A' : '1px solid #E5E5E5',
              background: mode === 'eco' ? 'rgba(0,0,0,0.02)' : '#fff',
            }}
          >
            <span style={{ fontSize: 24 }}>⚡</span>
            <p style={{ fontWeight: 700, marginTop: 8, color: '#1A1A1A' }}>Mode Éco</p>
            {mode === 'eco' && <span style={{ fontSize: 12, color: '#1A1A1A', marginTop: 4, display: 'inline-block' }}>Actif</span>}
          </button>
        </div>

        {/* Current mode description */}
        <div style={{ marginTop: 16, padding: 16, background: '#F7F7F7', borderRadius: 8 }}>
          {mode === 'pro' ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>🚀 Résultats détaillés, agents qui collaborent</p>
              <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>Consomme tes crédits ~3x plus vite</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>⚡ Rapide, efficace, économique</p>
              <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>Tes crédits durent ~3x plus longtemps</p>
            </>
          )}
        </div>

        <button onClick={() => setShowInfo(!showInfo)} style={{ marginTop: 12, background: 'none', border: 'none', color: '#6B6B6B', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
          Quelle est la différence ?
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, color: '#1A1A1A' }}>🚀 Pro vs ⚡ Éco</h3>
            <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', color: '#9B9B9B', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ background: '#F7F7F7', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>🚀 MODE PRO</p>
            <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>
              Tes agents travaillent ensemble, se consultent, et te donnent des réponses riches et complètes.
            </p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Projets créatifs complexes</p>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Création de contenu pro</p>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Quand tu veux le meilleur résultat</p>
              <p style={{ fontSize: 12, color: '#6B6B6B' }}>⚠️ Tes crédits s&apos;épuisent ~3x plus vite</p>
            </div>
          </div>

          <div style={{ background: '#F7F7F7', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>⚡ MODE ÉCO</p>
            <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>
              Chaque agent va droit au but. Réponses rapides, crédits préservés.
            </p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Tâches simples et quotidiennes</p>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Quand tu veux économiser</p>
              <p style={{ fontSize: 12, color: '#1A1A1A' }}>✅ Réponses instantanées</p>
              <p style={{ fontSize: 12, color: '#6B6B6B' }}>⚠️ Pas de collaboration entre agents</p>
              <p style={{ fontSize: 12, color: '#6B6B6B' }}>⚠️ Réponses plus courtes</p>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 8, padding: 12, border: '1px solid #E5E5E5' }}>
            <p style={{ fontSize: 12, color: '#6B6B6B' }}>
              💡 Tu peux changer quand tu veux. Tes conversations et tes réglages sont toujours conservés. C&apos;est juste la façon dont tes agents travaillent qui change.
            </p>
          </div>

          <button onClick={() => setShowInfo(false)} style={{ ...btnStyle, width: '100%', background: '#1A1A1A', color: '#fff', border: 'none' }}>
            J&apos;ai compris
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={() => setShowConfirm(null)}>
          <div style={{ ...cardStyle, maxWidth: 384, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 600, color: '#1A1A1A' }}>
              Passer en Mode {showConfirm === 'pro' ? <>Pro 🚀</> : <>Éco ⚡</>} ?
            </h3>
            <p style={{ color: '#9B9B9B', fontSize: 14, marginTop: 12 }}>
              {showConfirm === 'eco'
                ? 'Tes agents iront droit au but. Tes crédits dureront plus longtemps. Tu pourras revenir en Pro à tout moment.'
                : 'Tes agents collaboreront entre eux pour des résultats plus complets. Tes crédits seront consommés plus rapidement.'
              }
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowConfirm(null)} style={{ ...btnStyle, flex: 1, background: '#F7F7F7', color: '#6B6B6B' }}>
                Annuler
              </button>
              <button
                onClick={() => handleSwitch(showConfirm)}
                style={{ ...btnStyle, flex: 1, background: '#1A1A1A', color: '#fff', border: 'none' }}
              >
                Activer le Mode {showConfirm === 'pro' ? 'Pro' : 'Éco'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specs comparison */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Comparaison technique</h3>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#9B9B9B', borderBottom: '1px solid #E5E5E5' }}>
              <th style={{ padding: '8px 0', textAlign: 'left' }}>Paramètre</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>🚀 Pro</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>⚡ Éco</th>
            </tr>
          </thead>
          <tbody style={{ color: '#1A1A1A' }}>
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

      {/* Current Limits */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Tes limites actuelles</h3>
        {myLimits ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#9B9B9B', fontSize: 14 }}>Palier</span>
              <span style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{myLimits.tier}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#9B9B9B', fontSize: 14 }}>Tokens aujourd&apos;hui</span>
              <span style={{ color: '#1A1A1A', fontSize: 14 }}>{formatK(myLimits.consumed.today)} / {formatK(myLimits.limits.daily)}</span>
            </div>
            <div style={{ width: '100%', background: '#F0F0F0', borderRadius: 999, height: 8 }}>
              <div style={{ height: '100%', borderRadius: 999, background: '#1A1A1A', width: `${Math.min(100, (myLimits.consumed.today / myLimits.limits.daily) * 100)}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#9B9B9B', fontSize: 14 }}>Tokens cette heure</span>
              <span style={{ color: '#1A1A1A', fontSize: 14 }}>{formatK(myLimits.consumed.thisHour)} / {formatK(myLimits.limits.hourly)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#9B9B9B', fontSize: 14 }}>Output max par reponse</span>
              <span style={{ color: '#1A1A1A', fontSize: 14 }}>{myLimits.limits.perRequest} tokens</span>
            </div>
            <p style={{ fontSize: 12, color: '#9B9B9B', marginTop: 8 }}>Recharge tes credits pour augmenter tes limites</p>
          </div>
        ) : (
          <p style={{ color: '#9B9B9B', fontSize: 14 }}>Chargement...</p>
        )}
      </div>
    </div>
  );
}
