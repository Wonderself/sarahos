'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

async function apiCall(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
  return data as Record<string, unknown>;
}

type Step = 'idle' | 'setup' | 'verify' | 'done' | 'disable';

export default function SecurityPage() {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    apiCall('/auth/2fa/status')
      .then(d => { setTotpEnabled(!!(d.enabled)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function startSetup() {
    setWorking(true); setError('');
    try {
      const d = await apiCall('/auth/2fa/setup', 'POST');
      setQrCode(d.qrCode as string);
      setSecret(d.secret as string);
      setStep('setup');
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setWorking(false); }
  }

  async function confirmSetup() {
    if (code.length !== 6) { setError('Code à 6 chiffres requis'); return; }
    setWorking(true); setError('');
    try {
      const d = await apiCall('/auth/2fa/confirm', 'POST', { code });
      setBackupCodes(d.backupCodes as string[]);
      setTotpEnabled(true);
      setStep('done');
    } catch (e) { setError(e instanceof Error ? e.message : 'Code invalide'); }
    finally { setWorking(false); }
  }

  async function disable2FA() {
    if (code.length < 6) { setError('Code requis'); return; }
    setWorking(true); setError('');
    try {
      await apiCall('/auth/2fa/disable', 'POST', { code });
      setTotpEnabled(false);
      setStep('idle');
      setCode('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Code invalide'); }
    finally { setWorking(false); }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Sécurité</h1></div>
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="security-card">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sécurité du compte</h1>
          <p className="page-subtitle">Authentification à deux facteurs (2FA TOTP)</p>
        </div>
      </div>

      {/* Status card */}
      <div className="card section">
        <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{totpEnabled ? '🔒' : '🔓'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              Authentification 2FA
              <span className={`badge ${totpEnabled ? 'badge-success' : 'badge-neutral'}`}>
                {totpEnabled ? 'Activée' : 'Désactivée'}
              </span>
            </div>
            <p className="page-subtitle" style={{ marginTop: 2 }}>
              {totpEnabled
                ? 'Votre compte est protégé par Google Authenticator / Authy.'
                : 'Activez la 2FA pour sécuriser votre compte admin.'}
            </p>
          </div>
        </div>

        {/* IDLE */}
        {step === 'idle' && !totpEnabled && (
          <button className="btn btn-primary" onClick={startSetup} disabled={working}>
            {working ? 'Génération…' : '🔐 Activer la 2FA'}
          </button>
        )}
        {step === 'idle' && totpEnabled && (
          <button className="btn btn-danger" onClick={() => { setStep('disable'); setCode(''); setError(''); }}>
            Désactiver la 2FA
          </button>
        )}

        {/* SETUP — QR code */}
        {step === 'setup' && (
          <div>
            <p style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
              1. Scannez ce QR code avec <strong>Google Authenticator</strong> ou <strong>Authy</strong>
            </p>
            {qrCode && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCode}
                alt="QR Code 2FA"
                style={{ borderRadius: 8, marginBottom: 12, border: '1px solid var(--border-primary)', maxWidth: 200 }}
              />
            )}
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', marginBottom: 16,
              wordBreak: 'break-all', background: 'var(--bg-secondary)',
              padding: '8px 12px', borderRadius: 6, fontFamily: 'monospace',
            }}>
              Clé manuelle : <strong>{secret}</strong>
            </div>
            <p style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>
              2. Entrez le code à 6 chiffres affiché dans l'application
            </p>
            <div className="totp-action-row flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              <input
                className="totp-code-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                autoComplete="one-time-code"
              />
              <button className="btn btn-primary" onClick={confirmSetup} disabled={working || code.length !== 6}>
                {working ? '…' : 'Vérifier & Activer'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setStep('idle'); setCode(''); }}>Annuler</button>
            </div>
          </div>
        )}

        {/* DONE — backup codes */}
        {step === 'done' && (
          <div>
            <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 12 }}>✅ 2FA activée avec succès !</div>
            <p style={{ fontSize: 13, marginBottom: 8 }}>
              Sauvegardez ces <strong>8 codes de secours</strong> (chacun utilisable une fois si vous perdez votre téléphone) :
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, marginBottom: 16 }}>
              {backupCodes.map(c => (
                <code key={c} style={{
                  background: 'var(--bg-secondary)', padding: '4px 10px',
                  borderRadius: 4, fontSize: 13, textAlign: 'center',
                  letterSpacing: '0.1em', border: '1px solid var(--border-primary)',
                }}>
                  {c}
                </code>
              ))}
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => { setStep('idle'); setCode(''); setQrCode(''); setSecret(''); setBackupCodes([]); }}>
              Fermer
            </button>
          </div>
        )}

        {/* DISABLE */}
        {step === 'disable' && (
          <div>
            <p style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Entrez votre code TOTP ou un code de secours pour désactiver la 2FA :
            </p>
            <div className="totp-action-row flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              <input
                className="totp-code-input"
                type="text"
                inputMode="numeric"
                placeholder="123456 ou XXXXXXXX"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\s/g, ''))}
                style={{ borderColor: 'var(--danger)' }}
              />
              <button className="btn btn-danger" onClick={disable2FA} disabled={working || !code}>
                {working ? '…' : 'Désactiver'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setStep('idle'); setCode(''); setError(''); }}>Annuler</button>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginTop: 12, fontSize: 13 }}>⚠️ {error}</div>
        )}
      </div>

      {/* Info */}
      <div className="card card-compact" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Comment ça marche :</div>
        <ol style={{ paddingLeft: 16 }}>
          <li>Installez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre téléphone</li>
          <li>Scannez le QR code ou entrez la clé manuellement</li>
          <li>À chaque connexion, entrez le code à 6 chiffres affiché (valable 30 secondes)</li>
        </ol>
        <div style={{ marginTop: 8 }}>
          <strong>Note :</strong> La 2FA est actuellement optionnelle mais fortement recommandée pour les comptes admin.
        </div>
      </div>
    </div>
  );
}
