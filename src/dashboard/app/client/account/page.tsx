'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEPOSIT_OPTIONS, COMMISSION_TIERS, DEFAULT_AGENTS } from '../../../lib/agent-config';
import { useToast } from '../../../components/Toast';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import AuthRequired from '../../../components/AuthRequired';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

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
  const isMobile = useIsMobile();
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

  // Section card shorthand
  const sectionCard: React.CSSProperties = { ...CU.card, padding: '16px 24px' };

  return (
    <AuthRequired pageName="Mon Compte">
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.account.emoji}</span>
          <div style={{ flex: 1 }}>
            <h1 style={CU.pageTitle}>{PAGE_META.account.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.account.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.account.helpText} />
        </div>
      </div>
      <PageExplanation pageId="account" text={PAGE_META.account?.helpText} />

      {/* Commission & Status */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={CU.sectionTitle}>Mon statut</h2>
        <div style={{ ...sectionCard, borderLeft: `3px solid ${CU.accent}`, background: CU.accent + '06' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: isMobile ? 10 : 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 8,
                background: CU.accent + '18', border: `2px solid ${CU.accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: CU.accent,
              }}>
                #{userNumber || '—'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: CU.text }}>
                  Inscrit n&deg;{userNumber || '—'}
                  <span style={{
                    ...CU.badge, marginLeft: 10,
                  }}>
                    {badgeLabel}
                  </span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: CU.textSecondary }}>
                  Taux de commission a vie : <strong style={{ color: CU.accent }}>{(commissionRate * 100).toFixed(0)}%</strong>
                  {commissionRate === 0 && ' — Vous ne payez aucune commission !'}
                </div>
              </div>
            </div>
            <Link href="/plans" style={{ ...CU.btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Voir les paliers &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Referral Code */}
      {referralCode && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={CU.sectionTitle}>Code de parrainage</h2>
          <div style={{ ...sectionCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>🎁</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>Invitez vos amis, gagnez 20 EUR de crédits</div>
                <div style={{ fontSize: 12, color: CU.textSecondary, marginTop: 2 }}>
                  Votre code : <strong style={{ color: CU.text }}>{referralCode}</strong>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={copyReferralCode} style={CU.btnPrimary}>
                {copied ? '✅ Copie !' : '📋 Copier le lien'}
              </button>
              <Link href="/client/referrals" style={{ ...CU.btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={CU.sectionTitle}>Profil</h2>
        <div style={sectionCard}>
          <div style={cardGrid(isMobile, 3)}>
            <div>
              <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nom</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{(session.displayName as string) ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{(session.email as string) ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</div>
              <span style={CU.badge}>
                {(session.role as string) ?? 'viewer'}
              </span>
            </div>
          </div>
          <div style={CU.divider} />
          <div>
            <div style={{ fontSize: 11, color: CU.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Clé API</div>
            <code style={{ fontSize: 13, fontFamily: 'monospace', color: CU.textSecondary, background: CU.bgSecondary, padding: '4px 8px', borderRadius: 4 }}>
              {session.apiKey ? `${(session.apiKey as string).slice(0, 12)}...` : 'Non disponible'}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={CU.sectionTitle}>💰 Wallet & Crédits</h2>
        {loading ? (
          <div style={sectionCard}><div style={{ color: CU.textMuted }}>Chargement...</div></div>
        ) : (
          <div style={cardGrid(isMobile, 3)}>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <span style={{ ...CU.statValue, color: balance > 0 ? CU.text : CU.danger }}>
                {(balance / 1_000_000).toFixed(2)}
              </span>
              <span style={CU.statLabel}>Solde actuel (crédits)</span>
            </div>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>📥</span>
              <span style={CU.statValue}>{(deposited / 1_000_000).toFixed(2)}</span>
              <span style={CU.statLabel}>Total déposé (crédits)</span>
            </div>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>📤</span>
              <span style={{ ...CU.statValue, color: CU.textSecondary }}>{(spent / 1_000_000).toFixed(2)}</span>
              <span style={CU.statLabel}>Total dépensé (crédits)</span>
            </div>
          </div>
        )}

        {/* Deposit Options */}
        <div style={{ ...sectionCard, textAlign: 'center', marginTop: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: CU.text }}>Deposer des euros</div>
          <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 16 }}>
            1 EUR = 100 crédits. Vos crédits n&apos;expirent jamais.
            {commissionRate === 0 && (
              <span style={{ color: CU.text, fontWeight: 600 }}> 0% de commission — Early Adopter !</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '120px' : '140px'}, 1fr))`, gap: 12 }}>
            {DEPOSIT_OPTIONS.map(opt => (
              <div key={opt.id} style={{
                ...CU.card, padding: 16, position: 'relative', textAlign: 'center',
                border: opt.popular ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                {opt.popular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: CU.accent, color: '#fff',
                    padding: '2px 10px', borderRadius: '0 0 6px 6px', fontSize: 9, fontWeight: 700,
                  }}>
                    POPULAIRE
                  </div>
                )}
                <div style={{ fontSize: 24, marginBottom: 4, marginTop: opt.popular ? 6 : 0 }}>💳</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2, color: CU.text }}>{opt.amount}€</div>
                <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 8 }}>{(opt.amount * 100).toLocaleString()} crédits</div>
                <button
                  style={{ ...CU.btnPrimary, width: '100%' }}
                  onClick={() => alert(`Dépôt de ${opt.amount} EUR\n\nL'intégration Stripe arrive bientôt.\nContactez contact@freenzy.io pour déposer.`)}>
                  Déposer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Recharge */}
      <div style={{ ...sectionCard, marginBottom: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🔄</span>
          <h3 style={CU.sectionTitle}>Recharge Automatique</h3>
        </div>
        <p style={{ color: CU.textSecondary, fontSize: 13, marginBottom: 16 }}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>Activer la recharge automatique</span>
          </label>
        </div>

        {autoTopup.enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: CU.text }}>
                Seuil minimum (crédits)
              </label>
              <input
                type="number"
                value={autoTopup.threshold}
                onChange={e => setAutoTopup(prev => ({ ...prev, threshold: Math.max(1, Number(e.target.value)) }))}
                min={1}
                style={CU.input}
              />
              <small style={{ display: 'block', marginTop: 4, fontSize: 11, color: CU.textMuted }}>
                Recharger quand le solde descend sous ce seuil
              </small>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: CU.text }}>
                Montant de recharge (crédits)
              </label>
              <input
                type="number"
                value={autoTopup.amount}
                onChange={e => setAutoTopup(prev => ({ ...prev, amount: Math.max(1, Number(e.target.value)) }))}
                min={1}
                style={CU.input}
              />
              <small style={{ display: 'block', marginTop: 4, fontSize: 11, color: CU.textMuted }}>
                Montant demande a chaque recharge
              </small>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                onClick={saveAutoTopup}
                disabled={autoTopupLoading}
                style={{ ...CU.btnPrimary, opacity: autoTopupLoading ? 0.6 : 1 }}
              >
                {autoTopupLoading ? 'Sauvegarde...' : autoTopupSaved ? '✅ Sauvegarde !' : 'Sauvegarder'}
              </button>
              {autoTopupSaved && (
                <span style={{ marginLeft: 12, fontSize: 12, color: CU.text }}>
                  Preferences enregistrees
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Type de compte */}
      <div style={{ ...sectionCard, marginBottom: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🏷️</span>
          <h3 style={CU.sectionTitle}>Type de compte</h3>
        </div>
        <p style={{ color: CU.textSecondary, fontSize: 13, marginBottom: 16 }}>
          Activez le mode Entreprise pour accéder aux modules business et à la section «&nbsp;Mon Entreprise&nbsp;» dans le menu.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => toggleProMode(false)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
              border: `2px solid ${!isPro ? CU.accent : CU.border}`,
              background: !isPro ? CU.accentLight : 'transparent',
              textAlign: 'center', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: !isPro ? CU.accent : CU.textSecondary }}>Personnel</div>
          </button>
          <button
            onClick={() => toggleProMode(true)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
              border: `2px solid ${isPro ? CU.accent : CU.border}`,
              background: isPro ? CU.accentLight : 'transparent',
              textAlign: 'center', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🏢</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isPro ? CU.accent : CU.textSecondary }}>Entreprise</div>
          </button>
        </div>
        {isPro && (
          <p style={{ marginTop: 10, fontSize: 12, color: CU.text }}>
            ✅ Section «&nbsp;Mon Entreprise&nbsp;» activée dans le menu — rechargez la page pour voir les changements.
          </p>
        )}
      </div>

      {/* Notification Preferences */}
      <div style={{ ...sectionCard, marginBottom: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <h3 style={CU.sectionTitle}>Preferences de Notification</h3>
        </div>
        <p style={{ color: CU.textSecondary, fontSize: 13, marginBottom: 16 }}>
          Choisissez comment vous souhaitez etre notifie.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
          {NOTIFICATION_CHANNELS.map(channel => (
            <label
              key={channel.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                borderRadius: 8, cursor: channel.comingSoon ? 'not-allowed' : 'pointer',
                opacity: channel.comingSoon ? 0.55 : 1,
                background: notifPrefs[channel.key] ? CU.accentLight : CU.bgSecondary,
                border: `1px solid ${notifPrefs[channel.key] ? CU.accent + '33' : CU.border}`,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={!!notifPrefs[channel.key]}
                disabled={channel.comingSoon}
                onChange={() => setNotifPrefs(prev => ({ ...prev, [channel.key]: !prev[channel.key] }))}
                style={{ width: 16, height: 16, cursor: channel.comingSoon ? 'not-allowed' : 'pointer' }}
              />
              <span style={{ fontSize: 13 }}>{channel.icon} {channel.label}</span>
              {channel.comingSoon && (
                <span style={{ ...CU.badge, marginLeft: 'auto', fontSize: 10 }}>
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
            style={{ ...CU.btnPrimary, opacity: notifLoading ? 0.6 : 1 }}
          >
            {notifLoading ? 'Sauvegarde...' : notifSaved ? '✅ Sauvegarde !' : 'Sauvegarder les preferences'}
          </button>
          {notifSaved && (
            <span style={{ fontSize: 12, color: CU.text }}>
              Preferences enregistrees
            </span>
          )}
        </div>
      </div>

      {/* Communication Channels */}
      <div style={{ ...sectionCard, marginBottom: 20 }}>
        <h3 style={CU.sectionTitle}>Canaux de communication</h3>
        {[
          { icon: '📱', name: 'WhatsApp', desc: 'Parlez a vos agents par message et notes vocales', status: 'Bientot' },
          { icon: '💬', name: 'SMS', desc: 'Recevez des alertes et rapports par SMS', status: 'Bientot' },
          { icon: '📧', name: 'Email', desc: 'Notifications et rapports par email', status: 'Bientot' },
          { icon: '🎙️', name: 'Voix (Deepgram)', desc: 'Dictez vos messages et ecoutez les reponses', status: 'Actif' },
        ].map((ch, i, arr) => (
          <div key={ch.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${CU.border}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{ch.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{ch.name}</div>
                <div style={{ fontSize: 12, color: CU.textMuted }}>{ch.desc}</div>
              </div>
            </div>
            <span style={CU.badge}>{ch.status}</span>
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div style={{ ...sectionCard, marginBottom: 20 }}>
        <h3 style={CU.sectionTitle}>Integrations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '🎙️', title: 'Voix Premium (ElevenLabs)', desc: 'Voix ultra-realistes', active: true },
            { icon: '🎬', title: 'Avatar Video (D-ID)', desc: 'Vos agents en video', active: false },
            { icon: '📱', title: 'WhatsApp Business', desc: 'Vos agents sur WhatsApp', active: false },
          ].map(item => (
            <div key={item.title} style={{
              ...CU.card, padding: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={CU.badge}>
                  {item.active ? 'Actif' : 'Bientot'}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{item.title}</div>
              <div style={{ fontSize: 11, color: CU.textMuted }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={CU.sectionTitle}>Utilisation</h2>
          <div style={cardGrid(isMobile, 3)}>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>🔤</span>
              <span style={CU.statValue}>{Number(usage.totalTokens ?? 0).toLocaleString()}</span>
              <span style={CU.statLabel}>Tokens utilises</span>
            </div>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>📨</span>
              <span style={CU.statValue}>{Number(usage.totalRequests ?? 0)}</span>
              <span style={CU.statLabel}>Requetes</span>
            </div>
            <div style={{ ...CU.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <span style={CU.statValue}>{(Number(usage.totalCost ?? 0) / 1_000_000).toFixed(2)} cr</span>
              <span style={CU.statLabel}>Cout total</span>
            </div>
          </div>
        </div>
      )}

      {/* Sessions */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={CU.sectionTitle}>🔒 Appareils connectés</h2>
        {sessions.length === 0 ? (
          <div style={{ ...sectionCard, textAlign: 'center', padding: 24, color: CU.textMuted, fontSize: 13 }}>
            Aucune session active trouvée
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map(s => (
              <div key={s.jti} style={{ ...sectionCard, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>
                  {/mobile|android|iphone/i.test(s.userAgent ?? '') ? '📱' : '💻'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: CU.text }}>
                    {s.userAgent ? s.userAgent.slice(0, 60) : 'Appareil inconnu'}
                    {s.current && (
                      <span style={CU.badge}>
                        Cette session
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 2 }}>
                    {s.ip ? `IP: ${s.ip} · ` : ''}
                    {s.lastSeen ? `Dernière activité: ${new Date(s.lastSeen).toLocaleString('fr-FR')}` : `Créée le ${new Date(s.createdAt).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => revokeSession(s.jti)}
                    style={{ ...CU.btnDanger, flexShrink: 0 }}
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
        <div style={{ marginBottom: 20 }}>
          <h2 style={CU.sectionTitle}>🧾 Factures</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invoices.slice(0, 10).map(inv => (
              <div key={inv.id} style={{ ...sectionCard, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>🧾</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: CU.text }}>
                    Dépôt de {(Number(inv.amount ?? 0) / 1_000_000).toFixed(0)} crédits
                  </div>
                  <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 2 }}>
                    {new Date(inv.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={() => downloadInvoice(inv.transactionId ?? inv.id)}
                  style={{ ...CU.btnGhost, flexShrink: 0 }}
                >
                  ⬇️ Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </AuthRequired>
  );
}
