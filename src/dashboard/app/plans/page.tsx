import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_AGENTS, PERSONAL_AGENTS, TOTAL_AGENTS_DISPLAY } from '../../lib/agent-config';
import EnterpriseSection from './EnterpriseSection';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

const totalAgents = TOTAL_AGENTS_DISPLAY; // 72 (24 core + 48 marketplace)

export const metadata: Metadata = {
  title: 'Tarifs — Gratuit, payez uniquement ce que vous utilisez | Freenzy.io',
  description: `Freenzy.io : accès gratuit, ${totalAgents}+ agents IA, 0% de commission pour tous, à vie. Pas de minimum, pas d'abonnement.`,
};

// ── Shared styles ────────────────────────────────────────
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 4,
  textTransform: 'uppercase', color: '#86868b', marginBottom: 12,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 900,
  letterSpacing: -1.2, color: '#1d1d1f', lineHeight: 1.1, margin: 0,
};
const sectionSubtitle: React.CSSProperties = {
  fontSize: 15, color: '#86868b', lineHeight: 1.6, marginTop: 10,
};
const sectionPad: React.CSSProperties = {
  padding: 'clamp(64px, 8vw, 96px) 0',
};
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
};

export default function PlansPage() {
  return (
    <div style={{
      background: '#fff', color: '#1d1d1f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <PublicNav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0f 0%, #12121a 55%, #0e0e18 100%)',
        padding: 'clamp(90px, 11vw, 120px) 24px clamp(70px, 8vw, 96px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 320,
          background: 'radial-gradient(ellipse, rgba(91,108,247,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 900,
            color: '#fff', letterSpacing: -2.5, lineHeight: 1.02, marginBottom: 18,
          }}>
            Gratuit.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>
              Payez ce que vous utilisez.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 10px' }}>
            {totalAgents}+ agents IA. 0% de commission pour tous.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 36 }}>
            Pas de minimum · Pas d&apos;abonnement · {DEFAULT_AGENTS.length} business · {PERSONAL_AGENTS.length} personnels · marketplace
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?mode=register" style={{
              padding: '14px 32px', background: '#5b6cf7', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 0 28px rgba(91,108,247,0.35)',
            }}>
              S&apos;inscrire gratuitement
            </Link>
            <a href="#faq" style={{
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              FAQ
            </a>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* VALUE PROPS */}
        <div style={{ ...sectionPad, borderBottom: '1px solid #f2f2f2' }}>
          <div className="lp-plans-value-props">
            {[
              { label: 'Claude & GPT-4', desc: 'Anthropic · OpenAI · Gemini · Meta' },
              { label: 'Voix naturelle', desc: 'ElevenLabs premium multilingual' },
              { label: 'Vidéo & Photo IA', desc: 'HeyGen · D-ID · Stable Diffusion' },
              { label: 'Zéro engagement', desc: '0% commission · pour tous · à vie' },
            ].map((p, i) => (
              <div key={p.label} style={{
                padding: '28px 24px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid #f2f2f2' : 'none',
              }}>
                <div style={{ width: 6, height: 6, background: '#5b6cf7', borderRadius: '50%', margin: '0 auto 14px' }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#86868b', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMISSION */}
        <section style={sectionPad}>
          <div className="lp-plans-commission">
            <div>
              <p style={eyebrow}>Commission</p>
              <h2 style={sectionTitle}>0% pour tous.<br />À vie.</h2>
              <p style={{ ...sectionSubtitle, maxWidth: 380 }}>
                Aucune commission ajoutée sur vos actions. Vous payez uniquement le coût brut des tokens IA, au prix officiel du fournisseur.
              </p>
              <Link href="/login?mode=register" style={{
                display: 'inline-block', marginTop: 28,
                padding: '13px 28px', background: '#1d1d1f', color: '#fff',
                borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Commencer gratuitement
              </Link>
            </div>
            <div style={{ ...card, padding: '36px 32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#16a34a', padding: '4px 12px', borderRadius: 40,
                fontSize: 11, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5,
              }}>
                Pour tous · à vie
              </div>
              <div style={{ fontSize: 64, fontWeight: 900, color: '#1d1d1f', letterSpacing: -4, lineHeight: 1, marginBottom: 6 }}>
                0%
              </div>
              <div style={{ fontSize: 14, color: '#86868b', marginBottom: 28, lineHeight: 1.5 }}>
                Prix officiel fournisseur · aucun frais ajouté
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '0% de commission sur toutes vos actions',
                  'Coût brut uniquement — zéro frais ajoutés',
                  'Valable pour tous les utilisateurs, pour toujours',
                  'Payez uniquement ce que vous consommez',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#4b5563', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* DEPOSITS — light bg */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={eyebrow}>Recharges</p>
            <h2 style={sectionTitle}>Déposez des euros, obtenez des crédits.</h2>
            <p style={{ ...sectionSubtitle, maxWidth: 420, margin: '10px auto 0', fontSize: 14 }}>
              Pas de minimum, pas d&apos;abonnement. 1 EUR = 100 crédits. Vos crédits n&apos;expirent jamais.
            </p>
          </div>
          <div className="lp-plans-deposits">
            {[
              { amount: 5, credits: 500, label: '', tier: 'basic', dailyK: 500, hourlyK: 150, outputMax: 4096, estReqs: 250 },
              { amount: 20, credits: 2000, label: 'Populaire', tier: 'standard', dailyK: 1000, hourlyK: 300, outputMax: 8192, estReqs: 500 },
              { amount: 50, credits: 5000, label: '', tier: 'premium', dailyK: 2000, hourlyK: 600, outputMax: 8192, estReqs: 1000 },
              { amount: 100, credits: 10000, label: 'Pro', tier: 'enterprise', dailyK: 5000, hourlyK: 1500, outputMax: 8192, estReqs: 2500 },
            ].map(opt => (
              <div key={opt.amount} style={{
                padding: '28px 20px', textAlign: 'center',
                borderRadius: 16, position: 'relative',
                background: opt.label === 'Populaire' ? '#1d1d1f' : '#fff',
                border: `1px solid ${opt.label === 'Populaire' ? '#1d1d1f' : '#e5e7eb'}`,
              }}>
                {opt.label && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: opt.label === 'Populaire' ? '#5b6cf7' : '#1d1d1f',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 12px', borderRadius: 40, whiteSpace: 'nowrap', letterSpacing: 0.5,
                  }}>
                    {opt.label}
                  </div>
                )}
                <div style={{
                  fontSize: 32, fontWeight: 900, letterSpacing: -1.5,
                  color: opt.label === 'Populaire' ? '#fff' : '#1d1d1f',
                  lineHeight: 1, marginBottom: 6,
                }}>
                  {opt.amount}€
                </div>
                <div style={{ fontSize: 13, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.45)' : '#86868b' }}>
                  {opt.credits.toLocaleString('fr-FR')} crédits
                </div>
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: `1px solid ${opt.label === 'Populaire' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                }}>
                  <p style={{ fontSize: 10, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.35)' : '#9ca3af', marginBottom: 4, fontWeight: 600 }}>
                    Tes limites avec ce pack :
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.dailyK >= 1000 ? `${opt.dailyK / 1000}M` : `${opt.dailyK}K`} tokens/jour
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.hourlyK >= 1000 ? `${opt.hourlyK / 1000}M` : `${opt.hourlyK}K`} tokens/heure
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.outputMax.toLocaleString('fr-FR')} tokens max/reponse
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    ~{opt.estReqs.toLocaleString('fr-FR')} requetes/jour
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
            Montant libre également disponible depuis votre tableau de bord.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* CREDITS BREAKDOWN */}
        <section style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Ce que vous pouvez faire</p>
            <h2 style={sectionTitle}>Des actions concrètes, au centime près.</h2>
            <p style={{ ...sectionSubtitle, fontSize: 13 }}>Avec 50 crédits (5€) · Hors vidéo et avatars</p>
          </div>
          <div className="lp-plans-credits">
            {[
              { count: '~72', label: 'Chats' },
              { count: '~40', label: 'Emails' },
              { count: '~14', label: 'Documents' },
              { count: '~6', label: 'Réunions' },
              { count: '~19', label: 'Analyses' },
            ].map(ex => (
              <div key={ex.label} style={{ padding: '24px 16px', textAlign: 'center', ...card }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, lineHeight: 1 }}>
                  {ex.count}
                </div>
                <div style={{ fontSize: 12, color: '#86868b', marginTop: 6, fontWeight: 600 }}>{ex.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AGENTS */}
        <section style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Votre équipe</p>
            <h2 style={sectionTitle}>{DEFAULT_AGENTS.length} agents business. Tous inclus.</h2>
            <p style={sectionSubtitle}>Activez ceux dont vous avez besoin. En un clic.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {DEFAULT_AGENTS.map(agent => (
              <div key={agent.id} style={{
                ...card,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{agent.role}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{agent.priceCredits} cr/action</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* COSTS — light bg */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Coûts détaillés</p>
            <h2 style={sectionTitle}>Combien coûte chaque action ?</h2>
          </div>
          <div className="lp-plans-costs">

            {/* Main table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #f2f2f2' }}>
                      Action
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #f2f2f2' }}>
                      Coût · 0% commission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { action: 'Chat simple', cost: 0.69 },
                    { action: 'Email rédigé', cost: 1.10 },
                    { action: 'Analyse marketing', cost: 2.40 },
                    { action: 'Document généré', cost: 3.45 },
                    { action: 'Briefing du jour', cost: 2.70 },
                    { action: 'Réunion IA (3 agents)', cost: 8.28 },
                    { action: 'Conseil stratégique', cost: 8.25 },
                  ].map((row, i, arr) => (
                    <tr key={row.action}>
                      <td style={{ padding: '13px 20px', fontWeight: 500, color: '#1d1d1f', borderBottom: i < arr.length - 1 ? '1px solid #f8f8f8' : 'none' }}>
                        {row.action}
                      </td>
                      <td style={{ padding: '13px 20px', textAlign: 'right', fontWeight: 700, color: '#1d1d1f', borderBottom: i < arr.length - 1 ? '1px solid #f8f8f8' : 'none' }}>
                        {row.cost.toFixed(2)} cr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Telephony */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f2f2f2' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Téléphonie Twilio
                </span>
              </div>
              {[
                ['Appels entrants (France)', '~0.01€/min'],
                ['Appels sortants (France)', '~0.014€/min'],
                ['SMS sortants (France)', '~0.065€/SMS'],
                ['Numéro local', '~1–2€/mois'],
                ['WhatsApp', 'Inclus'],
              ].map(([service, cost], i, arr) => (
                <div key={service} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f8f8f8' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: '#4b5563' }}>{service}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>{cost}</span>
                </div>
              ))}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f2f2f2' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Facturés séparément du solde crédits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* COMPARISON */}
        <section style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Comparaison</p>
            <h2 style={sectionTitle}>Pourquoi Freenzy.io ?</h2>
          </div>
          <div className="lp-table-scroll" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
            <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f5f7' }}>
                  {['Critère', 'Freenzy.io', 'ChatGPT Plus', 'Assistant humain'].map((h, i) => (
                    <th key={h} style={{
                      padding: '14px 20px', textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 12, fontWeight: 700,
                      color: i === 1 ? '#5b6cf7' : '#86868b',
                      borderBottom: '1px solid #e5e7eb',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Prix mensuel', 'Gratuit + 0%', '20€/mois', '500–2 000€/mois'],
                  ['Agents IA', `${DEFAULT_AGENTS.length} spécialisés`, '1 généraliste', '1 personne'],
                  ['Téléphonie', '✓ Incluse', '✗', '✓'],
                  ['Disponibilité', '24h/7j/365j', '24h/7j', 'Horaires bureau'],
                  ['Personnalisation', 'Totale', 'Limitée', 'Totale'],
                  ['Engagement', 'Aucun', 'Mensuel', 'Contrat'],
                ].map(([label, freenzy, chatgpt, classic], i, arr) => (
                  <tr key={label}>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1d1d1f', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{label}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', fontWeight: 700, color: '#22c55e', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{freenzy}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', color: '#9ca3af', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{chatgpt}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', color: '#9ca3af', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{classic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Écosystème</p>
            <h2 style={sectionTitle}>Tout est inclus.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 10 }}>
            {[
              { title: 'Répondeur IA', desc: 'Twilio — répond 24/7', available: true },
              { title: 'Réveil intelligent', desc: 'Briefing matinal IA', available: true },
              { title: 'Studio vidéo', desc: 'HeyGen + D-ID', available: true },
              { title: 'Photo IA', desc: 'Nano Banana', available: true },
              { title: 'Voix Premium', desc: 'ElevenLabs multilingual', available: true },
              { title: 'WhatsApp', desc: 'Agents sur WhatsApp', available: true },
              { title: 'Visio agents', desc: "Face-à-face avec l'IA", available: true },
              { title: 'Création sur mesure', desc: 'Sites, apps, CRM', available: true },
              { title: 'Intégrations', desc: 'Slack, Notion, CRM...', available: false },
            ].map(item => (
              <div key={item.title} style={{
                padding: '18px 16px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14, position: 'relative',
                opacity: item.available ? 1 : 0.55,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>{item.title}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 20,
                    background: item.available ? '#f0fdf4' : '#f5f5f7',
                    color: item.available ? '#22c55e' : '#9ca3af',
                    border: `1px solid ${item.available ? '#bbf7d0' : '#e5e7eb'}`,
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {item.available ? 'Dispo' : 'Bientôt'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ ...sectionPad, paddingTop: 0, maxWidth: 680, margin: '0 auto clamp(64px, 8vw, 96px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>FAQ</p>
            <h2 style={sectionTitle}>Questions fréquentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                q: "C'est vraiment gratuit ?",
                a: "Oui. L'accès à la plateforme et à tous les agents est gratuit. Vous ne payez que les tokens IA réellement consommés, à prix coûtant. 0% de commission pour tous, à vie. Sans carte bancaire pour vous inscrire.",
              },
              {
                q: 'Comment fonctionnent les frais ?',
                a: "0% de commission pour tous les utilisateurs, à vie. Vous payez uniquement le coût brut des tokens IA au prix officiel du fournisseur (Anthropic, OpenAI, etc.). Aucun frais ajouté, aucun abonnement.",
              },
              {
                q: 'Combien coûte une action type ?',
                a: "Un chat IA coûte ~0.5 crédit, un email ~1.1 cr, un document ~3.5 cr, un appel répondeur ~5 cr, une image ~8 cr. 1 crédit ≈ €0.01. Rechargez au montant de votre choix.",
              },
              {
                q: 'Quelle différence avec ChatGPT Plus ?',
                a: `ChatGPT Plus : 20€/mois, 1 agent généraliste. Freenzy.io : gratuit + usage, ${DEFAULT_AGENTS.length} agents business spécialisés + ${PERSONAL_AGENTS.length} agents personnels, voix ElevenLabs, vidéo IA, photo IA, téléphonie Twilio.`,
              },
              {
                q: 'La sécurité des données ?',
                a: "Chiffrement AES-256, conformité RGPD, hébergement Europe. Isolation stricte des données par compte. Claude (Anthropic) ne s'entraîne pas sur vos données.",
              },
              {
                q: 'Une offre Entreprise ?',
                a: 'Oui. White-Label SaaS : votre domaine, vos clés API, isolation complète des données, SLA garanti, support dédié. Disponible sur devis.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <summary style={{
                  padding: '16px 20px',
                  fontSize: 14, fontWeight: 600, color: '#1d1d1f',
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', userSelect: 'none',
                }}>
                  {faq.q}
                  <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 400, flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <div style={{
                  padding: '14px 20px 18px',
                  fontSize: 14, color: '#4b5563', lineHeight: 1.7,
                  background: '#fafafa', borderTop: '1px solid #f2f2f2',
                }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>

      {/* ENTERPRISE */}
      <EnterpriseSection />

      {/* FINAL CTA */}
      <section style={{
        background: 'linear-gradient(165deg, #0a0a0f 0%, #1a1a2e 100%)',
        padding: 'clamp(70px, 9vw, 110px) 24px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 280,
          background: 'radial-gradient(ellipse, rgba(91,108,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: -2, lineHeight: 1.08, marginBottom: 14,
          }}>
            Prêt à commencer ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, marginBottom: 38 }}>
            {totalAgents}+ agents IA. Toutes les IA du marché. 0% de commission.
          </p>
          <Link href="/login?mode=register" style={{
            display: 'inline-block',
            padding: '15px 40px',
            background: '#5b6cf7', color: '#fff',
            borderRadius: 12, fontWeight: 700, fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 0 36px rgba(91,108,247,0.3)',
          }}>
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
