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

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6 client-page-scrollable">
      <div>
        <h1 className="text-2xl font-bold text-white">Mode de fonctionnement</h1>
        <p className="text-gray-400 mt-1">Choisis comment tes agents travaillent</p>
      </div>

      {/* Toggle */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => mode !== 'pro' ? setShowConfirm('pro') : null}
            disabled={switching}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'pro' ? 'border-blue-500 bg-blue-600/10' : 'border-gray-600 hover:border-gray-500'}`}
          >
            <span className="text-2xl"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span></span>
            <p className="text-white font-bold mt-2">Mode Pro</p>
            {mode === 'pro' && <span className="text-xs text-blue-400 mt-1 inline-block">Actif</span>}
          </button>
          <button
            onClick={() => mode !== 'eco' ? setShowConfirm('eco') : null}
            disabled={switching}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'eco' ? 'border-green-500 bg-green-600/10' : 'border-gray-600 hover:border-gray-500'}`}
          >
            <span className="text-2xl"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span></span>
            <p className="text-white font-bold mt-2">Mode Éco</p>
            {mode === 'eco' && <span className="text-xs text-green-400 mt-1 inline-block">Actif</span>}
          </button>
        </div>

        {/* Current mode description */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          {mode === 'pro' ? (
            <>
              <p className="text-white text-sm font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span> Résultats détaillés, agents qui collaborent</p>
              <p className="text-gray-400 text-xs mt-2">Consomme tes crédits ~3x plus vite</p>
            </>
          ) : (
            <>
              <p className="text-white text-sm font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span> Rapide, efficace, économique</p>
              <p className="text-gray-400 text-xs mt-2">Tes crédits durent ~3x plus longtemps</p>
            </>
          )}
        </div>

        <button onClick={() => setShowInfo(!showInfo)} className="mt-3 text-blue-400 text-xs hover:underline">
          Quelle est la différence ?
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span> Pro vs <span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span> Éco</h3>
            <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span></button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-white text-sm font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span> MODE PRO</p>
            <p className="text-gray-400 text-xs mt-2">
              Tes agents travaillent ensemble, se consultent, et te donnent des réponses riches et complètes.
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Projets créatifs complexes</p>
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Création de contenu pro</p>
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Quand tu veux le meilleur résultat</p>
              <p className="text-yellow-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>warning</span> Tes crédits s&apos;épuisent ~3x plus vite</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-white text-sm font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span> MODE ÉCO</p>
            <p className="text-gray-400 text-xs mt-2">
              Chaque agent va droit au but. Réponses rapides, crédits préservés.
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Tâches simples et quotidiennes</p>
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Quand tu veux économiser</p>
              <p className="text-green-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>check_circle</span> Réponses instantanées</p>
              <p className="text-yellow-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>warning</span> Pas de collaboration entre agents</p>
              <p className="text-yellow-400 text-xs"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>warning</span> Réponses plus courtes</p>
            </div>
          </div>

          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-800/50">
            <p className="text-blue-300 text-xs">
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>lightbulb</span> Tu peux changer quand tu veux. Tes conversations et tes réglages sont toujours conservés. C&apos;est juste la façon dont tes agents travaillent qui change.
            </p>
          </div>

          <button onClick={() => setShowInfo(false)} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            J&apos;ai compris
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-medium">
              Passer en Mode {showConfirm === 'pro' ? <>Pro <span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span></> : <>Éco <span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span></>} ?
            </h3>
            <p className="text-gray-400 text-sm mt-3">
              {showConfirm === 'eco'
                ? 'Tes agents iront droit au but. Tes crédits dureront plus longtemps. Tu pourras revenir en Pro à tout moment.'
                : 'Tes agents collaboreront entre eux pour des résultats plus complets. Tes crédits seront consommés plus rapidement.'
              }
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-gray-700 text-gray-300 rounded-lg text-sm">
                Annuler
              </button>
              <button
                onClick={() => handleSwitch(showConfirm)}
                className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium ${showConfirm === 'pro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Activer le Mode {showConfirm === 'pro' ? 'Pro' : 'Éco'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specs comparison */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-medium mb-4">Comparaison technique</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-700">
              <th className="py-2 text-left">Paramètre</th>
              <th className="py-2 text-center"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span> Pro</th>
              <th className="py-2 text-center"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>bolt</span> Éco</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-700/50">
              <td className="py-2">Modèle par défaut</td>
              <td className="py-2 text-center">Sonnet</td>
              <td className="py-2 text-center">Haiku</td>
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="py-2">Collaboration agents</td>
              <td className="py-2 text-center text-green-400">Oui</td>
              <td className="py-2 text-center text-red-400">Non</td>
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="py-2">Mémoire</td>
              <td className="py-2 text-center">10 messages</td>
              <td className="py-2 text-center">5 messages</td>
            </tr>
            <tr className="border-b border-gray-700/50">
              <td className="py-2">Réponse max</td>
              <td className="py-2 text-center">8192 tokens</td>
              <td className="py-2 text-center">2048 tokens</td>
            </tr>
            <tr>
              <td className="py-2">Coût moyen/requête</td>
              <td className="py-2 text-center">~3 crédits</td>
              <td className="py-2 text-center">~1 crédit</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Current Limits */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-white font-medium mb-4">Tes limites actuelles</h3>
        {myLimits ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Palier</span>
              <span className="text-white text-sm font-medium capitalize">{myLimits.tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tokens aujourd&apos;hui</span>
              <span className="text-white text-sm">{formatK(myLimits.consumed.today)} / {formatK(myLimits.limits.daily)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, (myLimits.consumed.today / myLimits.limits.daily) * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tokens cette heure</span>
              <span className="text-white text-sm">{formatK(myLimits.consumed.thisHour)} / {formatK(myLimits.limits.hourly)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Output max par reponse</span>
              <span className="text-white text-sm">{myLimits.limits.perRequest} tokens</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recharge tes credits pour augmenter tes limites</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chargement...</p>
        )}
      </div>
    </div>
  );
}
