'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEPOSIT_OPTIONS, COMMISSION_TIERS, DEFAULT_AGENTS } from '../../../lib/agent-config';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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

const NOTIFICATION_CHANNELS = [
  { key: 'notifyInApp', icon: '🔔', label: 'In-App', comingSoon: false },
  { key: 'notifyEmail', icon: '📧', label: 'Email', comingSoon: false },
  { key: 'notifySms', icon: '📱', label: 'SMS', comingSoon: true },
  { key: 'notifyWhatsapp', icon: '💬', label: 'WhatsApp', comingSoon: false },
  { key: 'notifyLowBalance', icon: '💰', label: 'Alertes solde bas', comingSoon: false },
  { key: 'notifyDailyReport', icon: '📊', label: 'Rapport quotidien', comingSoon: false },
  { key: 'notifyWeeklyReport', icon: '📈', label: 'Rapport hebdomadaire', comingSoon: false },
];

export default function AccountPage() {
  const { showError, showSuccess } = useToast();
  const [session, setSession] = useState<Record<string, unknown>>({});
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-Recharge state
  const [autoTopup, setAutoTopup] = useState({ enabled: false, threshold: 5, amount: 50 });
  const [autoTopupLoading, setAutoTopupLoading] = useState(false);
  const [autoTopupSaved, setAutoTopupSaved] = useState(false);

  // Sessions & Invoices
  const [sessions, setSessions] = useState<Array<{ jti: string; ip?: string; userAgent?: string; createdAt: string; lastSeen?: string; current?: boolean }>>([]);
  const [invoices, setInvoices] = useState<Array<{ id: string; transactionId: string; amount: number; createdAt: string; status: string }>>([]);

  // Account type (pro / personal)
  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    try { setIsPro(localStorage.getItem('fz_is_pro') === 'true'); } catch { /* */ }
  }, []);
  function toggleProMode(newValue: boolean) {
    setIsPro(newValue);
    try { localStorage.setItem('fz_is_pro', newValue ? 'true' : 'false'); } catch { /* */ }
    try {
      const s = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (s?.token) {
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/preferences', token: s.token, method: 'PATCH', data: { isPro: newValue } }),
        }).catch(() => {});
      }
    } catch { /* */ }
  }

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    notifyInApp: true, notifyEmail: true, notifySms: false,
    notifyWhatsapp: false, notifyLowBalance: true, notifyDailyReport: false, notifyWeeklyReport: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fz_session');
    if (!stored) { window.location.href = '/login'; return; }
    let s;
    try { s = JSON.parse(stored); } catch { window.location.href = '/login'; return; }
    setSession(s);
    loadData(s.token as string);
  }, []);

  async function loadData(token: string) {
    try {
      const [walletRes, usageRes, topupRes, prefsRes, sessionsRes, invoicesRes] = await Promise.all([
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
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/billing/wallet/auto-topup', token, method: 'GET' }),
        }).catch(() => null),
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/preferences', token, method: 'GET' }),
        }).catch(() => null),
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/sessions', token, method: 'GET' }),
        }).catch(() => null),
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/billing/invoices', token, method: 'GET' }),
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
      if (topupRes?.ok) {
        try {
          const t = await topupRes.json();
          setAutoTopup({
            enabled: !!t.autoTopupEnabled,
            threshold: Math.round(Number(t.autoTopupThreshold ?? 5_000_000) / 1_000_000),
            amount: Math.round(Number(t.autoTopupAmount ?? 50_000_000) / 1_000_000),
          });
        } catch { /* */ }
      }
      if (prefsRes?.ok) {
        try {
          const p = await prefsRes.json();
          const prefs = p.preferences ?? p;
          setNotifPrefs(prev => ({
            ...prev,
            ...(prefs.notifyInApp !== undefined && { notifyInApp: !!prefs.notifyInApp }),
            ...(prefs.notifyEmail !== undefined && { notifyEmail: !!prefs.notifyEmail }),
            ...(prefs.notifySms !== undefined && { notifySms: !!prefs.notifySms }),
            ...(prefs.notifyWhatsapp !== undefined && { notifyWhatsapp: !!prefs.notifyWhatsapp }),
            ...(prefs.notifyLowBalance !== undefined && { notifyLowBalance: !!prefs.notifyLowBalance }),
            ...(prefs.notifyDailyReport !== undefined && { notifyDailyReport: !!prefs.notifyDailyReport }),
            ...(prefs.notifyWeeklyReport !== undefined && { notifyWeeklyReport: !!prefs.notifyWeeklyReport }),
          }));
        } catch { /* */ }
      }
      if (sessionsRes?.ok) {
        try {
          const s = await sessionsRes.json();
          setSessions(s.sessions ?? s ?? []);
        } catch { /* */ }
      }
      if (invoicesRes?.ok) {
        try {
          const inv = await invoicesRes.json();
          setInvoices(inv.invoices ?? inv ?? []);
        } catch { /* */ }
      }
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur lors du chargement du compte'); }
    setLoading(false);
  }

  async function revokeSession(jti: string) {
    if (!confirm('Révoquer cette session ? L\'appareil sera déconnecté.')) return;
    const token = session.token as string | undefined;
    if (!token) { showError('Session expirée'); return; }
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `/portal/sessions/${jti}`, token, method: 'DELETE' }),
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.jti !== jti));
        showSuccess('Session révoquée avec succès');
      } else {
        showError('Impossible de révoquer cette session');
      }
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur réseau'); }
  }

  async function downloadInvoice(transactionId: string) {
    const token = session.token as string | undefined;
    if (!token) { showError('Session expirée'); return; }
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `/billing/invoices/${transactionId}/html`, token, method: 'GET' }),
      });
      if (res.ok) {
        const html = await res.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `facture-${transactionId.slice(0, 8)}.html`;
        a.click(); URL.revokeObjectURL(url);
      } else {
        showError('Impossible de télécharger cette facture');
      }
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur réseau'); }
  }

  function copyReferralCode() {
    const code = session.referralCode as string;
    if (!code) return;
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${code}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function toggleAutoTopup() {
    setAutoTopup(prev => ({ ...prev, enabled: !prev.enabled }));
  }

  async function saveAutoTopup() {
    const token = session.token as string;
    if (!token) return;
    setAutoTopupLoading(true);
    setAutoTopupSaved(false);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/billing/wallet/auto-topup',
          token,
          method: 'PATCH',
          data: {
            autoTopupEnabled: autoTopup.enabled,
            autoTopupThreshold: autoTopup.threshold * 1_000_000,
            autoTopupAmount: autoTopup.amount * 1_000_000,
          },
        }),
      });
      if (res.ok) {
        setAutoTopupSaved(true);
        showSuccess('Paramètres auto-recharge sauvegardés');
        setTimeout(() => setAutoTopupSaved(false), 3000);
      } else {
        showError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur réseau. Veuillez réessayer.');
    }
    setAutoTopupLoading(false);
  }

  async function saveNotifPrefs() {
    const token = session.token as string;
    if (!token) return;
    setNotifLoading(true);
    setNotifSaved(false);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/portal/preferences',
          token,
          method: 'PATCH',
          data: notifPrefs,
        }),
      });
      if (res.ok) {
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 3000);
      } else {
        showError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      }
    } catch {
      showError('Erreur réseau. Veuillez réessayer.');
    }
    setNotifLoading(false);
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
  const badgeColor = commissionRate === 0 ? '#22c55e' : commissionRate <= 0.05 ? 'var(--fz-accent, #0EA5E9)' : '#9333ea';

  return (
    <div className="client-page-scrollable">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{PAGE_META.account.emoji}</span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.account.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.account.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.account.helpText} />
        </div>
      </div>
      <PageExplanation pageId="account" text={PAGE_META.account?.helpText} />

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
                <div className="text-md font-bold">Invitez vos amis, gagnez 20 EUR de crédits</div>
                <div className="text-sm text-secondary" style={{ marginTop: 2 }}>
                  Votre code : <strong style={{ color: 'var(--accent)' }}>{referralCode}</strong>
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              <button onClick={copyReferralCode} className="btn btn-primary btn-sm">
                {copied ? '✅ Copie !' : '📋 Copier le lien'}
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
            <div className="text-xs text-muted mb-4">Clé API</div>
            <code className="text-sm text-mono text-tertiary rounded-sm" style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', padding: '4px 8px' }}>
              {session.apiKey ? `${(session.apiKey as string).slice(0, 12)}...` : 'Non disponible'}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="section">
        <div className="section-title">💰 Wallet & Crédits</div>
        {loading ? (
          <div className="card"><div className="animate-pulse" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Chargement...</div></div>
        ) : (
          <div className="grid-3">
            <div className="stat-card">
              <span className="stat-label">Solde actuel</span>
              <span className="stat-value stat-value-sm" style={{ color: balance > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {(balance / 1_000_000).toFixed(2)}
              </span>
              <span className="text-xs text-muted">crédits</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total déposé</span>
              <span className="stat-value stat-value-sm">{(deposited / 1_000_000).toFixed(2)}</span>
              <span className="text-xs text-muted">crédits</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total dépensé</span>
              <span className="stat-value stat-value-sm text-warning">{(spent / 1_000_000).toFixed(2)}</span>
              <span className="text-xs text-muted">crédits</span>
            </div>
          </div>
        )}

        {/* Deposit Options */}
        <div className="card text-center mt-16" style={{ padding: 24 }}>
          <div className="font-bold mb-4" style={{ fontSize: 15 }}>Deposer des euros</div>
          <div className="text-md text-secondary mb-16">
            1 EUR = 100 crédits. Vos crédits n&apos;expirent jamais.
            {commissionRate === 0 && (
              <span style={{ color: '#22c55e', fontWeight: 600 }}> 0% de commission — Early Adopter !</span>
            )}
          </div>
          <div className="grid-auto gap-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {DEPOSIT_OPTIONS.map(opt => (
              <div key={opt.id} className="card card-lift text-center" style={{
                padding: 16, position: 'relative',
                borderColor: opt.popular ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-border, #E2E8F0)',
                borderWidth: opt.popular ? 2 : 1,
              }}>
                {opt.popular && (
                  <div className="text-xs font-bold" style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--fz-accent, #0EA5E9)', color: 'white',
                    padding: '2px 10px', borderRadius: '0 0 6px 6px', fontSize: 9,
                  }}>
                    POPULAIRE
                  </div>
                )}
                <div className="mb-4" style={{ fontSize: 24, marginTop: opt.popular ? 6 : 0 }}>💳</div>
                <div className="font-bold" style={{ fontSize: 24, marginBottom: 2 }}>{opt.amount}€</div>
                <div className="text-sm text-secondary mb-8">{(opt.amount * 100).toLocaleString()} crédits</div>
                <button className="btn btn-primary btn-sm w-full"
                  onClick={() => alert(`Dépôt de ${opt.amount} EUR\n\nL'intégration Stripe arrive bientôt.\nContactez contact@freenzy.io pour déposer.`)}>
                  Déposer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Recharge */}
      <div style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 className="font-bold text-lg mb-4">🔄 Recharge Automatique</h3>
        <p style={{ color: 'var(--fz-text-secondary, #64748B)', fontSize: 14, marginBottom: 16 }}>
          Activez la recharge <span className="fz-logo-word">automatique</span> pour ne jamais manquer de crédits.
          Sans Stripe, un administrateur traitera votre demande manuellement.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoTopup.enabled}
              onChange={toggleAutoTopup}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span className="text-md font-semibold">Activer la recharge automatique</span>
          </label>
        </div>

        {autoTopup.enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 6 }}>
                Seuil minimum (crédits)
              </label>
              <input
                type="number"
                value={autoTopup.threshold}
                onChange={e => setAutoTopup(prev => ({ ...prev, threshold: Math.max(1, Number(e.target.value)) }))}
                min={1}
                className="w-full"
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--fz-border, #E2E8F0)',
                  background: 'var(--fz-bg, #FFFFFF)', color: 'var(--fz-text, #1E293B)', fontSize: 14,
                }}
              />
              <small className="text-xs text-muted" style={{ display: 'block', marginTop: 4 }}>
                Recharger quand le solde descend sous ce seuil
              </small>
            </div>
            <div>
              <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 6 }}>
                Montant de recharge (crédits)
              </label>
              <input
                type="number"
                value={autoTopup.amount}
                onChange={e => setAutoTopup(prev => ({ ...prev, amount: Math.max(1, Number(e.target.value)) }))}
                min={1}
                className="w-full"
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--fz-border, #E2E8F0)',
                  background: 'var(--fz-bg, #FFFFFF)', color: 'var(--fz-text, #1E293B)', fontSize: 14,
                }}
              />
              <small className="text-xs text-muted" style={{ display: 'block', marginTop: 4 }}>
                Montant demande a chaque recharge
              </small>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                onClick={saveAutoTopup}
                disabled={autoTopupLoading}
                className="btn btn-primary btn-sm"
              >
                {autoTopupLoading ? 'Sauvegarde...' : autoTopupSaved ? '✅ Sauvegarde !' : 'Sauvegarder'}
              </button>
              {autoTopupSaved && (
                <span className="text-sm text-success" style={{ marginLeft: 12 }}>
                  Preferences enregistrees
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Type de compte */}
      <div style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 className="font-bold text-lg mb-4">🏷️ Type de compte</h3>
        <p style={{ color: 'var(--fz-text-secondary, #64748B)', fontSize: 14, marginBottom: 16 }}>
          Activez le mode Entreprise pour accéder aux modules business et à la section «&nbsp;Mon Entreprise&nbsp;» dans le menu.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => toggleProMode(false)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${!isPro ? 'var(--accent)' : 'var(--fz-border, #E2E8F0)'}`,
              background: !isPro ? 'var(--accent-muted)' : 'transparent',
              textAlign: 'center', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: !isPro ? 'var(--accent)' : 'var(--fz-text, #1E293B)' }}>Personnel</div>
          </button>
          <button
            onClick={() => toggleProMode(true)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${isPro ? 'var(--accent)' : 'var(--fz-border, #E2E8F0)'}`,
              background: isPro ? 'var(--accent-muted)' : 'transparent',
              textAlign: 'center', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🏢</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isPro ? 'var(--accent)' : 'var(--fz-text, #1E293B)' }}>Entreprise</div>
          </button>
        </div>
        {isPro && (
          <p className="text-xs text-success" style={{ marginTop: 10 }}>
            ✅ Section «&nbsp;Mon Entreprise&nbsp;» activée dans le menu — rechargez la page pour voir les changements.
          </p>
        )}
      </div>

      {/* Notification Preferences */}
      <div style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 className="font-bold text-lg mb-4">🔔 Preferences de Notification</h3>
        <p style={{ color: 'var(--fz-text-secondary, #64748B)', fontSize: 14, marginBottom: 16 }}>
          Choisissez comment vous souhaitez etre notifie.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {NOTIFICATION_CHANNELS.map(channel => (
            <label
              key={channel.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                borderRadius: 8, border: '1px solid var(--fz-border, #E2E8F0)',
                cursor: channel.comingSoon ? 'not-allowed' : 'pointer',
                opacity: channel.comingSoon ? 0.6 : 1,
                background: notifPrefs[channel.key] ? 'var(--fz-bg, #FFFFFF)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={!!notifPrefs[channel.key]}
                disabled={channel.comingSoon}
                onChange={() => setNotifPrefs(prev => ({ ...prev, [channel.key]: !prev[channel.key] }))}
                style={{ width: 16, height: 16, cursor: channel.comingSoon ? 'not-allowed' : 'pointer' }}
              />
              <span className="text-md">{channel.icon} {channel.label}</span>
              {channel.comingSoon && (
                <span className="badge badge-warning" style={{ fontSize: 10, marginLeft: 'auto', padding: '2px 6px' }}>
                  Bientot
                </span>
              )}
            </label>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={saveNotifPrefs}
            disabled={notifLoading}
            className="btn btn-primary btn-sm"
          >
            {notifLoading ? 'Sauvegarde...' : notifSaved ? '✅ Sauvegarde !' : 'Sauvegarder les preferences'}
          </button>
          {notifSaved && (
            <span className="text-sm text-success">
              Preferences enregistrees
            </span>
          )}
        </div>
      </div>

      {/* Communication Channels */}
      <div className="card mt-16 p-16">
        <h3 className="font-bold text-lg mb-16">Canaux de communication</h3>
        {[
          { icon: '📱', name: 'WhatsApp', desc: 'Parlez a vos agents par message et notes vocales', status: 'Bientot' },
          { icon: '💬', name: 'SMS', desc: 'Recevez des alertes et rapports par SMS', status: 'Bientot' },
          { icon: '📧', name: 'Email', desc: 'Notifications et rapports par email', status: 'Bientot' },
          { icon: '🎙️', name: 'Voix (Deepgram)', desc: 'Dictez vos messages et ecoutez les reponses', status: 'Actif' },
        ].map((ch, i, arr) => (
          <div key={ch.name} className="flex-between items-center" style={{
            padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--fz-border, #E2E8F0)' : 'none',
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

      {/* Coming Soon + Active integrations */}
      <div className="card mt-16 p-16" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.03), #06b6d408)' }}>
        <h3 className="font-bold text-lg mb-12">Integrations</h3>
        <div className="grid-auto gap-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[
            { icon: '🎙️', title: 'Voix Premium (ElevenLabs)', desc: 'Voix ultra-realistes', active: true },
            { icon: '🎬', title: 'Avatar Video (D-ID)', desc: 'Vos agents en video', active: false },
            { icon: '📱', title: 'WhatsApp Business', desc: 'Vos agents sur WhatsApp', active: false },
          ].map(item => (
            <div key={item.title} className="border rounded-md p-12" style={{
              background: item.active ? '#22c55e08' : 'var(--fz-bg, #FFFFFF)',
              borderColor: item.active ? '#22c55e44' : undefined,
            }}>
              <div className="flex-between items-center mb-4">
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span className={`badge ${item.active ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                  {item.active ? 'Actif' : 'Bientot'}
                </span>
              </div>
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

      {/* Sessions */}
      <div className="section">
        <div className="section-title">🔒 Appareils connectés</div>
        {sessions.length === 0 ? (
          <div className="card text-center" style={{ padding: '24px', color: 'var(--fz-text-muted, #94A3B8)', fontSize: 13 }}>
            Aucune session active trouvée
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map(s => (
              <div key={s.jti} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>
                  {/mobile|android|iphone/i.test(s.userAgent ?? '') ? '📱' : '💻'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.userAgent ? s.userAgent.slice(0, 60) : 'Appareil inconnu'}
                    {s.current && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#22c55e20', color: '#22c55e' }}>
                        Cette session
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>
                    {s.ip ? `IP: ${s.ip} · ` : ''}
                    {s.lastSeen ? `Dernière activité: ${new Date(s.lastSeen).toLocaleString('fr-FR')}` : `Créée le ${new Date(s.createdAt).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => revokeSession(s.jti)}
                    style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, border: '1px solid #ef444440', background: '#ef444410', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="section">
          <div className="section-title">🧾 Factures</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invoices.slice(0, 10).map(inv => (
              <div key={inv.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>🧾</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    Dépôt de {(Number(inv.amount ?? 0) / 1_000_000).toFixed(0)} crédits
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>
                    {new Date(inv.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={() => downloadInvoice(inv.transactionId ?? inv.id)}
                  style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg-secondary, #F8FAFC)', color: 'var(--fz-text, #1E293B)', cursor: 'pointer', flexShrink: 0 }}
                >
                  ⬇️ Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
