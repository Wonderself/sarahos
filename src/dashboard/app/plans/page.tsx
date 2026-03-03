import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_AGENTS, SIGNUP_BONUS_CREDITS } from '../../lib/agent-config';

export const metadata: Metadata = {
  title: 'Tarifs — Gratuit, payez uniquement vos tokens',
  description: 'SARAH OS : 100% gratuit, 10 agents IA, 0% de commission pour les 1000 premiers inscrits. Payez uniquement les tokens que vous consommez, sans abonnement.',
};

export default function PlansPage() {
  return (
    <div style={{ background: '#fff', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="flex items-center">
          <img src="/images/logo.jpg" alt="SARAH OS" style={{ height: 42, borderRadius: 8 }} />
        </Link>
        <div className="flex items-center gap-24">
          <Link href="/" className="text-base text-secondary font-medium">Accueil</Link>
          <Link href="/demo" className="text-base text-secondary font-medium">Demo</Link>
          <Link href="/login?mode=register" className="btn btn-primary btn-sm" style={{ padding: '8px 20px', fontSize: 13 }}>
            Essayer gratuitement
          </Link>
        </div>
      </nav>

    <div className="hero-gradient" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderRadius: 24, marginBottom: 60 }}>
        <img src="/images/image1.jpg" alt="SARAH OS" className="w-full"
          style={{ height: 340, objectFit: 'cover', display: 'block' }} loading="eager" />
        <div className="flex-col flex-center text-center" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.95))',
          padding: '40px 20px',
        }}>
          <img src="/images/logo.jpg" alt="SARAH OS"
            style={{ height: 56, borderRadius: 16, margin: '0 auto 20px', display: 'block' }} />
          <h1 className="mb-12" style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#111827' }}>
            Gratuit. Payez uniquement ce que vous consommez.
          </h1>
          <p className="leading-relaxed" style={{ fontSize: 17, color: '#4b5563', maxWidth: 640, margin: '0 auto 28px' }}>
            Le meilleur cerveau (Claude), la meilleure voix (ElevenLabs), les meilleurs outils — reunis dans une seule plateforme.
            {DEFAULT_AGENTS.length} agents IA specialises, 0% de commission pour les premiers inscrits.
          </p>
          <div className="flex flex-wrap gap-12" style={{ justifyContent: 'center' }}>
            <Link href="/login?mode=register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              S&apos;inscrire — {SIGNUP_BONUS_CREDITS} credits offerts
            </Link>
            <Link href="#tiers" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Voir les paliers
            </Link>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="grid-4" style={{ gap: 12, marginBottom: 60 }}>
        {[
          { icon: '🧠', label: 'Meilleur cerveau', desc: 'Claude (Anthropic) — IA #1 au monde' },
          { icon: '🗣️', label: 'Meilleure voix', desc: 'ElevenLabs — voix ultra-realistes' },
          { icon: '🛠️', label: 'Meilleurs outils', desc: 'WhatsApp, email, tel, visio...' },
          { icon: '🔓', label: 'Sans engagement', desc: 'Pas d\'abonnement, pas de surprise' },
        ].map(p => (
          <div key={p.label} className="card card-lift text-center" style={{ padding: '20px 16px' }}>
            <div className="mb-8" style={{ fontSize: 28 }}>{p.icon}</div>
            <div className="text-base font-bold mb-4">{p.label}</div>
            <div className="text-sm text-muted">{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Commission Tiers */}
      <div id="tiers" style={{ marginBottom: 80 }}>
        <h2 className="font-bold text-center mb-8" style={{ fontSize: 26 }}>
          Votre taux de commission — <span className="gradient-text">verrouille a vie</span>
        </h2>
        <p className="text-base text-tertiary text-center" style={{ maxWidth: 650, margin: '0 auto 40px' }}>
          Votre taux est determine par votre numero d&apos;inscription et ne changera <strong>jamais</strong>.
          Plus vous vous inscrivez tot, moins vous payez. A vie.
        </p>

        <div className="grid-3 max-w-lg items-start" style={{ gap: 20, margin: '0 auto' }}>
          {/* Tier 1: Early Adopter */}
          <div className="plan-card plan-card-popular card-lift text-center" style={{ borderColor: '#22c55e' }}>
            <div className="font-bold" style={{
              position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
              background: '#22c55e', color: 'white', fontSize: 10,
              padding: '3px 16px', borderRadius: '0 0 8px 8px', letterSpacing: '0.03em',
            }}>
              PLACES LIMITEES
            </div>
            <div className="mb-8" style={{ fontSize: 40, marginTop: 8 }}>🌟</div>
            <div className="text-lg font-bold mb-4" style={{ color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Early Adopter
            </div>
            <div className="text-md text-secondary mb-16">Les 1 000 premiers inscrits</div>
            <div className="mb-16">
              <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', color: '#22c55e' }}>0%</span>
              <div className="text-base text-tertiary">de commission</div>
            </div>
            <div className="text-base font-bold mb-16" style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: 8,
              background: '#22c55e12', color: '#22c55e',
            }}>
              A vie — pour toujours
            </div>
            <div className="text-sm text-muted mb-20">
              Payez uniquement le cout brut des tokens. Zero marge, zero frais.
            </div>
            <Link href="/login?mode=register" className="btn btn-primary w-full text-base"
              style={{ height: 44, background: '#22c55e' }}>
              Rejoindre les Early Adopters
            </Link>
          </div>

          {/* Tier 2: Standard */}
          <div className="plan-card card-lift text-center">
            <div className="mb-8" style={{ fontSize: 40 }}>🚀</div>
            <div className="text-lg font-bold mb-4" style={{ color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standard
            </div>
            <div className="text-md text-secondary mb-16">Inscrits n&deg;1 001 a 100 000</div>
            <div className="mb-16">
              <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em' }}>5%</span>
              <div className="text-base text-tertiary">de commission</div>
            </div>
            <div className="text-base font-bold mb-16" style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: 8,
              background: '#6366f112', color: '#6366f1',
            }}>
              Taux verrouille a vie
            </div>
            <div className="text-sm text-muted mb-20">
              5% seulement sur le cout des tokens. Toujours bien en dessous du marche.
            </div>
            <Link href="/login?mode=register" className="btn btn-primary w-full text-base"
              style={{ height: 44, background: '#6366f1' }}>
              S&apos;inscrire
            </Link>
          </div>

          {/* Tier 3: Standard+ */}
          <div className="plan-card card-lift text-center">
            <div className="mb-8" style={{ fontSize: 40 }}>💎</div>
            <div className="text-lg font-bold mb-4" style={{ color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standard+
            </div>
            <div className="text-md text-secondary mb-16">A partir du 100 001e</div>
            <div className="mb-16">
              <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em' }}>7%</span>
              <div className="text-base text-tertiary">de commission</div>
            </div>
            <div className="text-base font-bold mb-16" style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: 8,
              background: '#9333ea12', color: '#9333ea',
            }}>
              Taux verrouille a vie
            </div>
            <div className="text-sm text-muted mb-20">
              Toujours le meilleur rapport qualite-prix du marche, meme a 7%.
            </div>
            <Link href="/login?mode=register" className="btn btn-primary w-full text-base"
              style={{ height: 44, background: '#9333ea' }}>
              S&apos;inscrire
            </Link>
          </div>
        </div>

        <div className="text-center mt-24">
          <div className="items-center gap-8 rounded-lg" style={{
            display: 'inline-flex', padding: '10px 20px',
            background: '#22c55e12', border: '1px solid #22c55e44',
          }}>
            <span style={{ fontSize: 20 }}>🎁</span>
            <span className="text-base font-semibold" style={{ color: '#22c55e' }}>
              {SIGNUP_BONUS_CREDITS} credits offerts a l&apos;inscription !
            </span>
          </div>
        </div>
      </div>

      {/* Deposit Options */}
      <div style={{ marginBottom: 80 }}>
        <h2 className="font-bold text-center mb-8" style={{ fontSize: 26 }}>
          Deposez des euros, obtenez des credits
        </h2>
        <p className="text-base text-tertiary text-center" style={{ maxWidth: 600, margin: '0 auto 32px' }}>
          Deposez librement le montant de votre choix. 1 EUR = 100 credits. Vos credits n&apos;expirent jamais.
        </p>
        <div className="grid-4 max-w-lg" style={{ gap: 16, margin: '0 auto' }}>
          {[
            { amount: 5, credits: '500', icon: '🌱', label: '5 EUR' },
            { amount: 20, credits: '2 000', icon: '🚀', label: '20 EUR', popular: true },
            { amount: 50, credits: '5 000', icon: '💎', label: '50 EUR' },
            { amount: 100, credits: '10 000', icon: '👑', label: '100 EUR' },
          ].map(opt => (
            <div key={opt.amount} className={`card card-lift text-center${opt.popular ? '' : ''}`} style={{
              padding: '20px 16px', position: 'relative',
              borderColor: opt.popular ? '#6366f1' : 'var(--border-primary)',
              borderWidth: opt.popular ? 2 : 1,
            }}>
              {opt.popular && (
                <div className="font-bold" style={{
                  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                  background: '#6366f1', color: 'white', fontSize: 9,
                  padding: '2px 12px', borderRadius: '0 0 6px 6px',
                }}>
                  POPULAIRE
                </div>
              )}
              <div style={{ fontSize: 32, marginBottom: 8, marginTop: opt.popular ? 6 : 0 }}>{opt.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{opt.amount}€</div>
              <div className="text-md text-secondary mb-8">{opt.credits} credits</div>
              <Link href="/client/account" className="btn btn-primary btn-sm w-full"
                style={{ background: opt.popular ? '#6366f1' : undefined }}>
                Deposer
              </Link>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted text-center" style={{ marginTop: 16 }}>
          Montant libre egalement disponible. Integration Stripe bientot disponible.
        </div>
      </div>

      {/* Your free team */}
      <div style={{ marginBottom: 80 }}>
        <h2 className="font-bold text-center mb-8" style={{ fontSize: 26 }}>
          Votre equipe complete, <span className="gradient-text">gratuite</span>
        </h2>
        <p className="text-base text-tertiary text-center" style={{ marginBottom: 32 }}>
          {DEFAULT_AGENTS.length} agents specialises. Choisissez ceux dont vous avez besoin a l&apos;inscription.
        </p>
        <div className="grid-3 max-w-lg" style={{ gap: 12, margin: '0 auto' }}>
          {DEFAULT_AGENTS.map(agent => (
            <div key={agent.id} className="card card-lift p-20" style={{ borderLeft: `3px solid ${agent.color}` }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{agent.emoji}</span>
                <div>
                  <div className="text-base font-bold">{agent.role}</div>
                  <span className="font-semibold" style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: '#16a34a15', color: '#16a34a',
                  }}>Gratuit</span>
                </div>
              </div>
              <div className="text-md text-secondary" style={{ lineHeight: 1.5 }}>{agent.tagline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consumption table */}
      <div style={{ marginBottom: 80 }}>
        <h2 className="font-bold text-center mb-8" style={{ fontSize: 26 }}>
          Combien coute chaque action ?
        </h2>
        <p className="text-base text-tertiary text-center" style={{ maxWidth: 650, margin: '0 auto 32px' }}>
          Estimations precises basees sur les tarifs reels Anthropic. <strong className="text-accent">Calculs transparents.</strong>
        </p>

        <div className="card table-responsive overflow-hidden" style={{ maxWidth: 800, margin: '0 auto', padding: 0 }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Action</th>
                <th className="text-center">Cout moyen</th>
                <th className="text-center">Early Adopter (0%)</th>
                <th className="text-center">Standard (5%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { icon: '💬', action: 'Chat simple', model: 'Sonnet', cost: 0.69 },
                { icon: '📧', action: 'Email redige', model: 'Sonnet', cost: 1.26 },
                { icon: '📊', action: 'Analyse marketing', model: 'Sonnet', cost: 2.40 },
                { icon: '📄', action: 'Document genere', model: 'Sonnet', cost: 3.45 },
                { icon: '☀️', action: 'Briefing du jour', model: 'Sonnet', cost: 2.70 },
                { icon: '📋', action: 'Campagne complete', model: 'Sonnet', cost: 5.40 },
                { icon: '🏛️', action: 'Reunion (3 agents)', model: 'Sonnet', cost: 8.28 },
                { icon: '👩‍💼', action: 'Conseil strategique', model: 'Opus', cost: 8.25 },
              ].map(row => (
                <tr key={row.action}>
                  <td>
                    <span style={{ marginRight: 6 }}>{row.icon}</span>
                    <strong>{row.action}</strong>
                    <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>{row.model}</div>
                  </td>
                  <td className="text-center font-semibold text-accent">{row.cost.toFixed(2)} cr</td>
                  <td className="text-center font-bold" style={{ color: '#22c55e' }}>{row.cost.toFixed(2)} cr</td>
                  <td className="text-center font-bold">{(row.cost * 1.05).toFixed(2)} cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ marginBottom: 80 }}>
        <h2 className="text-2xl font-bold text-center" style={{ marginBottom: 32 }}>
          Pourquoi SARAH OS casse le marche
        </h2>
        <div className="card table-responsive max-w-lg overflow-hidden" style={{ margin: '0 auto', padding: 0 }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Critere</th>
                <th className="highlight-col">SARAH OS</th>
                <th>ChatGPT Plus</th>
                <th>Assistant classique</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Prix', 'Gratuit + 0-7% commission', '20 EUR/mois', '30-100 EUR/mois'],
                ['Agents', `${DEFAULT_AGENTS.length} specialistes`, '1 seul', '1 seul'],
                ['Disponibilite', '24/7', '24/7', 'Heures bureau'],
                ['Personnalisation', 'Agent Studio complet', 'Limitee', 'Limitee'],
                ['Engagement', 'Aucun', 'Mensuel', 'Annuel'],
                ['Reunions multi-agents', 'Oui', 'Non', 'Non'],
                ['Transparence prix', '100% au reel', 'Opaque', 'Opaque'],
              ].map(([label, sarah, chatgpt, classic]) => (
                <tr key={label}>
                  <td className="font-semibold">{label}</td>
                  <td className="highlight-col">{sarah}</td>
                  <td>{chatgpt}</td>
                  <td>{classic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming Soon */}
      <div style={{ marginBottom: 80 }}>
        <h2 className="font-bold text-center mb-8" style={{ fontSize: 26 }}>
          Bientot disponible
        </h2>
        <p className="text-base text-tertiary text-center" style={{ maxWidth: 600, margin: '0 auto 32px' }}>
          SARAH OS evolue en permanence. Voici ce qui arrive.
        </p>
        <div className="grid-3 max-w-lg" style={{ gap: 12, margin: '0 auto' }}>
          {[
            { icon: '🎬', title: 'Avatars video (D-ID)', desc: 'Vos agents en video pour briefings et presentations', color: '#6366f1' },
            { icon: '🛠️', title: 'Outils sur mesure', desc: 'Creez vos propres outils automatises dans l\'environnement SARAH', color: '#f59e0b' },
            { icon: '📐', title: 'Projets pilotes', desc: 'Creez votre projet dans notre environnement et faites-le piloter de A a Z par vos agents', color: '#22c55e' },
            { icon: '📲', title: 'WhatsApp Business', desc: 'Vos agents disponibles directement sur WhatsApp', color: '#25d366' },
            { icon: '🗣️', title: 'Voix Premium', desc: 'ElevenLabs — voix ultra-realistes pour chaque agent', color: '#ec4899' },
            { icon: '🔌', title: 'Integrations', desc: 'Slack, Notion, CRM, Google Workspace et plus', color: '#3b82f6' },
          ].map(item => (
            <div key={item.title} className="card card-lift p-20" style={{ borderLeft: `3px solid ${item.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div className="text-base font-bold mb-4">{item.title}</div>
              <div className="text-sm text-muted" style={{ lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto 80px' }}>
        <h2 className="text-2xl font-bold text-center" style={{ marginBottom: 32 }}>Questions frequentes</h2>
        {[
          {
            q: 'C\'est vraiment gratuit ?',
            a: 'Oui ! L\'acces a tous les agents est 100% gratuit. Vous ne payez que les tokens consommes, avec une commission de 0% a 7% selon votre numero d\'inscription. Les 1 000 premiers inscrits ne paient aucune commission — a vie.',
          },
          {
            q: 'Comment fonctionne la commission ?',
            a: 'Votre taux de commission est determine par votre numero d\'inscription et verrouille a vie. Users 1-1000 : 0%, Users 1001-100000 : 5%, Users 100001+ : 7%. Ce taux s\'applique sur le cout brut des tokens consommes.',
          },
          {
            q: 'Comment ca marche concretement ?',
            a: 'Vous deposez des euros (5, 20, 50, 100 ou montant libre). 1 EUR = 100 credits. Chaque action (chat, email, analyse...) consomme des credits. Vos credits n\'expirent jamais.',
          },
          {
            q: 'Quelle est la difference avec ChatGPT Plus ?',
            a: `ChatGPT Plus coute 20 EUR/mois pour un seul agent generaliste. SARAH OS est gratuit, avec ${DEFAULT_AGENTS.length} agents specialises, des reunions multi-agents, et un Agent Studio complet pour personnaliser chaque agent.`,
          },
          {
            q: 'Le systeme de parrainage, comment ca marche ?',
            a: 'Chaque utilisateur recoit un code de parrainage unique. Quand quelqu\'un s\'inscrit via votre lien, vous pouvez gagner jusqu\'a 20 EUR de credits gratuits (sous conditions d\'utilisation du filleul).',
          },
          {
            q: 'Mes donnees sont-elles en securite ?',
            a: 'Absolument. Vos donnees ne sont jamais utilisees pour entrainer des modeles. Tout est chiffre et prive. Nous utilisons Claude (Anthropic), le leader en securite IA.',
          },
        ].map(faq => (
          <div key={faq.q} style={{ marginBottom: 20, padding: '16px 0', borderBottom: '1px solid var(--border-primary)' }}>
            <div className="font-semibold mb-8" style={{ fontSize: 15 }}>{faq.q}</div>
            <div className="text-md text-secondary" style={{ lineHeight: 1.6 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center" style={{ padding: '48px 0', borderTop: '1px solid var(--border-primary)' }}>
        <h2 className="mb-12" style={{ fontSize: 28, fontWeight: 800 }}>
          Pret a lancer votre equipe IA ?
        </h2>
        <p className="text-tertiary mb-24" style={{ fontSize: 15 }}>
          Inscription gratuite. {SIGNUP_BONUS_CREDITS} credits offerts. 0% commission pour les premiers.
        </p>
        <Link href="/login?mode=register" className="btn btn-primary text-lg" style={{ padding: '14px 36px' }}>
          Commencer gratuitement
        </Link>
        <div className="flex flex-wrap gap-24" style={{ justifyContent: 'center', marginTop: 20 }}>
          {['Pas de carte bancaire', 'Credits sans expiration', '0% commission (1000 premiers)'].map(t => (
            <span key={t} className="flex items-center gap-4 text-sm text-muted">
              <span className="text-success">✓</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center" style={{ padding: '32px 0', borderTop: '1px solid var(--border-light, #e5e7eb)' }}>
        <div className="flex flex-wrap gap-20 mb-16" style={{ justifyContent: 'center' }}>
          <Link href="/" className="text-md text-secondary">Accueil</Link>
          <Link href="/login" className="text-md text-secondary">Se connecter</Link>
          <Link href="/demo" className="text-md text-secondary">Demo</Link>
        </div>
        <div className="text-sm text-muted">SARAH OS v0.10.0 — Powered by Claude AI</div>
      </footer>
    </div>
    </div>
  );
}
