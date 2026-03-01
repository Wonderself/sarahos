'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEPOSIT_OPTIONS, COMMISSION_TIERS, DEFAULT_AGENTS } from '../../../lib/agent-config';

interface WalletData {
  balance: number;
  totalDeposited: number;
  totalSpent: number;
}

interface UsageData {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
}

export default function AccountPage() {
  const [session, setSession] = useState<Record<string, unknown>>({});
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sarah_session');
    if (!stored) { window.location.href = '/login'; return; }
    let s;
    try { s = JSON.parse(stored); } catch { window.location.href = '/login'; return; }
    setSession(s);
    loadData(s.token as string);
  }, []);

  async function loadData(token: string) {
    try {
      const [walletRes, usageRes] = await Promise.all([
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/wallet', token }),
        }).catch(() => null),
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/usage', token }),
        }).catch(() => null),
      ]);
      if (walletRes?.ok) {
        const w = await walletRes.json();
        setWallet(w.wallet ?? w);
      }
      if (usageRes?.ok) {
        const u = await usageRes.json();
        setUsage(u.usage ?? u);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  function copyReferralCode() {
    const code = session.referralCode as string;
    if (!code) return;
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${code}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const balance = Number(wallet?.balance ?? 0);
  const deposited = Number(wallet?.totalDeposited ?? 0);
  const spent = Number(wallet?.totalSpent ?? 0);
  const userNumber = Number(session.userNumber ?? 0);
  const commissionRate = Number(session.commissionRate ?? 0);
  const referralCode = (session.referralCode as string) ?? '';

  // Determine tier badge
  const tierBadge = COMMISSION_TIERS.find(t => userNumber <= t.maxUsers);
  const badgeLabel = tierBadge?.badge ?? 'Standard+';
  const badgeColor = commissionRate === 0 ? '#22c55e' : commissionRate <= 0.05 ? '#6366f1' : '#9333ea';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compte & Credits</h1>
          <p className="page-subtitle">Votre profil, votre taux, vos credits</p>
        </div>
      </div>

      {/* Commission & Status */}
      <div className="section">
        <div className="section-title">Mon statut</div>
        <div className="card" style={{ borderColor: badgeColor + '44', background: badgeColor + '08' }}>
          <div className="flex-between items-center flex-wrap gap-16">
            <div className="flex items-center gap-16">
              <div className="flex-center" style={{
                width: 56, height: 56, borderRadius: 16,
                background: badgeColor + '22', border: `2px solid ${badgeColor}44`,
                fontSize: 13, fontWeight: 800, color: badgeColor,
              }}>
                #{userNumber || '—'}
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: 18 }}>
                  Inscrit n&deg;{userNumber || '—'}
                  <span className="font-bold" style={{
                    marginLeft: 10, padding: '3px 10px', borderRadius: 6,
                    background: badgeColor + '18', color: badgeColor, fontSize: 12,
                  }}>
                    {badgeLabel}
                  </span>
                </div>
                <div className="text-md text-secondary" style={{ marginTop: 4 }}>
                  Taux de commission a vie : <strong style={{ color: badgeColor }}>{(commissionRate * 100).toFixed(0)}%</strong>
                  {commissionRate === 0 && ' — Vous ne payez aucune commission !'}
                </div>
              </div>
            </div>
            <Link href="/plans" className="btn btn-secondary">
              Voir les paliers &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Referral Code */}
      {referralCode && (
        <div className="section">
          <div className="section-title">Code de parrainage</div>
          <div className="card flex-between items-center flex-wrap gap-12">
            <div className="flex items-center gap-12">
              <span style={{ fontSize: 28 }}>🎁</span>
              <div>
                <div className="text-md font-bold">Invitez vos amis, gagnez 20 EUR de credits</div>
                <div className="text-sm text-secondary" style={{ marginTop: 2 }}>
                  Votre code : <strong style={{ color: 'var(--accent)' }}>{referralCode}</strong>
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              <button onClick={copyReferralCode} className="btn btn-primary btn-sm">
                {copied ? 'Copie !' : 'Copier le lien'}
              </button>
              <Link href="/client/referrals" className="btn btn-secondary btn-sm">
                Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="section">
        <div className="section-title">Profil</div>
        <div className="card">
          <div className="grid-3">
            <div>
              <div className="text-xs text-muted mb-4">Nom</div>
              <div className="font-semibold" style={{ fontSize: 15 }}>{(session.displayName as string) ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-4">Email</div>
              <div className="font-semibold" style={{ fontSize: 15 }}>{(session.email as string) ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-4">Role</div>
              <div className="flex gap-6 items-center">
                <span className="badge badge-neutral text-md" style={{ padding: '4px 12px' }}>{(session.role as string) ?? 'viewer'}</span>
              </div>
            </div>
          </div>
          <div className="separator" />
          <div>
            <div className="text-xs text-muted mb-4">Cle API</div>
            <code className="text-sm text-mono text-tertiary rounded-sm" style={{ background: 'var(--bg-primary)', padding: '4px 8px' }}>
              {session.apiKey ? `${(session.apiKey as string).slice(0, 12)}...` : 'Non disponible'}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="section">
        <div className="section-title">Wallet & Credits</div>
        {loading ? (
          <div className="card"><div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Chargement...</div></div>
        ) : (
          <div className="grid-3">
            <div className="stat-card">
              <span className="stat-label">Solde actuel</span>
              <span className="stat-value stat-value-sm" style={{ color: balance > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {(balance / 1_000_000).toFixed(2)}
              </span>
              <span className="text-xs text-muted">credits</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total depose</span>
              <span className="stat-value stat-value-sm">{(deposited / 1_000_000).toFixed(2)}</span>
              <span className="text-xs text-muted">credits</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total depense</span>
              <span className="stat-value stat-value-sm text-warning">{(spent / 1_000_000).toFixed(2)}</span>
              <span className="text-xs text-muted">credits</span>
            </div>
          </div>
        )}

        {/* Deposit Options */}
        <div className="card text-center mt-16" style={{ padding: 24 }}>
          <div className="font-bold mb-4" style={{ fontSize: 15 }}>Deposer des euros</div>
          <div className="text-md text-secondary mb-16">
            1 EUR = 100 credits. Vos credits n&apos;expirent jamais.
            {commissionRate === 0 && (
              <span style={{ color: '#22c55e', fontWeight: 600 }}> 0% de commission — Early Adopter !</span>
            )}
          </div>
          <div className="grid-auto gap-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {DEPOSIT_OPTIONS.map(opt => (
              <div key={opt.id} className="card card-lift text-center" style={{
                padding: 16, position: 'relative',
                borderColor: opt.popular ? '#6366f1' : 'var(--border-primary)',
                borderWidth: opt.popular ? 2 : 1,
              }}>
                {opt.popular && (
                  <div className="text-xs font-bold" style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366f1', color: 'white',
                    padding: '2px 10px', borderRadius: '0 0 6px 6px', fontSize: 9,
                  }}>
                    POPULAIRE
                  </div>
                )}
                <div className="mb-4" style={{ fontSize: 24, marginTop: opt.popular ? 6 : 0 }}>{opt.icon}</div>
                <div className="font-bold" style={{ fontSize: 24, marginBottom: 2 }}>{opt.amount}€</div>
                <div className="text-sm text-secondary mb-8">{(opt.amount * 100).toLocaleString()} credits</div>
                <button className="btn btn-primary btn-sm w-full"
                  onClick={() => alert(`Depot de ${opt.amount} EUR\n\nL'integration Stripe arrive bientot.\nContactez contact@sarah-os.com pour deposer.`)}>
                  Deposer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Channels */}
      <div className="card mt-16 p-16">
        <h3 className="font-bold text-lg mb-16">Canaux de communication</h3>
        {[
          { icon: '📱', name: 'WhatsApp', desc: 'Parlez a vos agents par message et notes vocales', status: 'Bientot' },
          { icon: '💬', name: 'SMS', desc: 'Recevez des alertes et rapports par SMS', status: 'Bientot' },
          { icon: '📧', name: 'Email', desc: 'Notifications et rapports par email', status: 'Bientot' },
          { icon: '🎤', name: 'Voix (Deepgram)', desc: 'Dictez vos messages et ecoutez les reponses', status: 'Actif' },
        ].map((ch, i, arr) => (
          <div key={ch.name} className="flex-between items-center" style={{
            padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-primary)' : 'none',
          }}>
            <div className="flex items-center gap-8">
              <span style={{ fontSize: 20 }}>{ch.icon}</span>
              <div>
                <div className="text-base font-semibold">{ch.name}</div>
                <div className="text-sm text-muted">{ch.desc}</div>
              </div>
            </div>
            <span className={`badge ${ch.status === 'Actif' ? 'badge-success' : 'badge-warning'}`}>{ch.status}</span>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="card mt-16 p-16" style={{ background: 'linear-gradient(135deg, #6366f108, #a855f708)' }}>
        <h3 className="font-bold text-lg mb-12">Bientot disponible</h3>
        <div className="grid-auto gap-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[
            { icon: '🎬', title: 'Avatar Video (D-ID)', desc: 'Vos agents en video' },
            { icon: '🗣️', title: 'Voix Premium (ElevenLabs)', desc: 'Voix ultra-realistes' },
            { icon: '📲', title: 'WhatsApp Business', desc: 'Vos agents sur WhatsApp' },
          ].map(item => (
            <div key={item.title} className="border rounded-md p-12" style={{ background: 'var(--bg-primary)' }}>
              <div className="mb-4" style={{ fontSize: 22 }}>{item.icon}</div>
              <div className="text-md font-semibold">{item.title}</div>
              <div className="text-xs text-muted">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div className="section">
          <div className="section-title">Utilisation</div>
          <div className="grid-3">
            <div className="stat-card">
              <span className="stat-label">Tokens utilises</span>
              <span className="stat-value stat-value-sm">{Number(usage.totalTokens ?? 0).toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Requetes</span>
              <span className="stat-value stat-value-sm">{Number(usage.totalRequests ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Cout total</span>
              <span className="stat-value stat-value-sm">{(Number(usage.totalCost ?? 0) / 1_000_000).toFixed(2)} cr</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
