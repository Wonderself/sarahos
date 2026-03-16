'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'person_add',
    title: 'Choisissez vos agents',
    desc: 'S\u00e9lectionnez parmi 24 agents sp\u00e9cialis\u00e9s ceux dont votre activit\u00e9 a besoin.',
  },
  {
    icon: 'tune',
    title: 'Personnalisez-les',
    desc: 'Adaptez le ton, les consignes et le contexte de chaque agent \u00e0 votre entreprise.',
  },
  {
    icon: 'rocket_launch',
    title: 'Lancez-les',
    desc: 'Vos agents travaillent 24/7 sur WhatsApp, email, t\u00e9l\u00e9phone ou dans le dashboard.',
  },
];

const AGENTS = [
  {
    icon: 'call',
    title: 'R\u00e9pondeur Intelligent',
    color: '#7c3aed',
    desc: 'R\u00e9pond \u00e0 vos appels 24h/24 avec une voix naturelle fran\u00e7aise.',
  },
  {
    icon: 'assignment',
    title: 'Assistante Ex\u00e9cutive',
    color: '#06b6d4',
    desc: 'G\u00e8re votre agenda, r\u00e9dige vos emails, pr\u00e9pare vos r\u00e9unions.',
  },
  {
    icon: 'handshake',
    title: 'Directeur Commercial',
    color: '#f59e0b',
    desc: 'Qualifie vos leads, r\u00e9dige devis et propositions commerciales.',
  },
  {
    icon: 'campaign',
    title: 'Directrice Marketing',
    color: '#ec4899',
    desc: 'Cr\u00e9e vos posts sociaux, newsletters et campagnes publicitaires.',
  },
  {
    icon: 'description',
    title: 'Gestionnaire Documents',
    color: '#22c55e',
    desc: 'R\u00e9dige contrats, factures, courriers avec vos mod\u00e8les.',
  },
  {
    icon: 'psychology',
    title: 'Conseiller Strat\u00e9gique',
    color: '#ef4444',
    desc: 'Analyse votre march\u00e9, identifie opportunit\u00e9s et menaces.',
  },
];

const CUSTOM_FEATURES = [
  {
    icon: 'record_voice_over',
    title: 'Ton',
    desc: 'Professionnel, amical, formel... chaque agent adopte votre style.',
  },
  {
    icon: 'business',
    title: 'Contexte',
    desc: 'Secteur, taille, offres : l\u2019agent conna\u00eet votre entreprise sur le bout des doigts.',
  },
  {
    icon: 'devices',
    title: 'Canaux',
    desc: 'WhatsApp, email, t\u00e9l\u00e9phone, dashboard : vos agents sont partout.',
  },
  {
    icon: 'translate',
    title: 'Langues',
    desc: 'FR, EN, ES, DE, IT et plus encore. D\u00e9tection automatique incluse.',
  },
];

const FAQS = [
  {
    q: 'Puis-je cr\u00e9er mes propres agents personnalis\u00e9s ?',
    a: 'Oui. Vous pouvez personnaliser chaque agent existant avec vos propres consignes, ton et contexte. Vous pouvez \u00e9galement demander la cr\u00e9ation d\u2019agents sur mesure pour des besoins sp\u00e9cifiques.',
  },
  {
    q: 'Combien d\u2019agents puis-je utiliser en m\u00eame temps ?',
    a: 'Il n\u2019y a aucune limite. Vous pouvez activer les 24 agents simultan\u00e9ment. Chaque agent fonctionne de mani\u00e8re ind\u00e9pendante et peut traiter plusieurs demandes en parall\u00e8le.',
  },
  {
    q: 'Les agents peuvent-ils collaborer entre eux ?',
    a: 'Absolument. Par exemple, le Directeur Commercial peut transmettre un lead qualifi\u00e9 \u00e0 l\u2019Assistante Ex\u00e9cutive pour planifier un rendez-vous, ou \u00e0 la Gestionnaire Documents pour g\u00e9n\u00e9rer un devis.',
  },
  {
    q: 'Mes donn\u00e9es sont-elles s\u00e9curis\u00e9es ?',
    a: 'Oui. Toutes les donn\u00e9es sont h\u00e9berg\u00e9es en Europe, chiffr\u00e9es AES-256 et conformes au RGPD. Suppression automatique apr\u00e8s 90 jours.',
  },
  {
    q: 'Combien co\u00fbte chaque action d\u2019un agent ?',
    a: 'Entre 0.5 et 2 cr\u00e9dits par action selon la complexit\u00e9. Un email simple co\u00fbte ~0.5 cr\u00e9dit, une analyse strat\u00e9gique ~2 cr\u00e9dits. 50 cr\u00e9dits offerts \u00e0 l\u2019inscription.',
  },
];

export default function AgentsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '80px 24px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '32px 28px',
  };

  const accentGradient = 'linear-gradient(135deg, #7c3aed, #06b6d4)';

  return (
    <div style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#7c3aed' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>smart_toy</span>
            100+ Agents IA Sp&eacute;cialis&eacute;s
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Vos 24 experts IA<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>toujours disponibles</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Un agent sp&eacute;cialis&eacute; pour chaque besoin de votre entreprise. Commercial, marketing, administratif, strat&eacute;gie : ils travaillent pour vous 24h/24.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Accéder à Freenzy
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              D&eacute;couvrir les agents
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ca marche */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment &ccedil;a marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Trois &eacute;tapes pour d&eacute;ployer votre &eacute;quipe IA.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {i + 1}
              </div>
              <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed', marginBottom: 16, display: 'block', marginTop: 12 }}>{step.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents Grid */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          24 agents, 24 expertises
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Chaque agent est un sp&eacute;cialiste dans son domaine. Voici les 6 plus populaires.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {AGENTS.map((agent, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360, borderTop: `3px solid ${agent.color}` }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: agent.color, marginBottom: 14, display: 'block' }}>{agent.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{agent.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{agent.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: 32, fontSize: 14 }}>
          + 18 autres agents disponibles dans le dashboard
        </p>
      </section>

      {/* Personnalisation */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Personnalisation compl&egrave;te
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Chaque agent s&apos;adapte &agrave; votre entreprise, pas l&apos;inverse.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CUSTOM_FEATURES.map((feat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 230px', maxWidth: 260, textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#7c3aed', marginBottom: 14, display: 'block' }}>{feat.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Avant / Apres */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Avant / Apr&egrave;s Freenzy
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Comparez votre quotidien sans et avec vos agents IA.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {/* Sans Freenzy */}
          <div style={{ flex: '1 1 260px', maxWidth: 320, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 44, color: '#ef4444', marginBottom: 16, display: 'block' }}>person</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#ef4444' }}>Tout faire soi-m&ecirc;me</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>3h / jour</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>t&acirc;ches r&eacute;p&eacute;titives</div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>Emails, devis, relances, posts...</p>
              <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>~15h / semaine</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>perdues</div>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed' }}>arrow_forward</span>
          </div>
          {/* Avec Freenzy */}
          <div style={{ flex: '1 1 260px', maxWidth: 320, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 44, color: '#22c55e', marginBottom: 16, display: 'block' }}>smart_toy</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#22c55e' }}>Avec vos agents IA</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>15 min</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>de supervision</div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>Les agents g&egrave;rent, vous validez</p>
              <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>14h r&eacute;cup&eacute;r&eacute;es</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/ semaine</div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom stat */}
        <div style={{ marginTop: 40, textAlign: 'center', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 16, padding: '24px 28px', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, color: '#fff' }}>
            Sur 1 an = <span style={{ color: '#7c3aed' }}>700+ heures</span> r&eacute;cup&eacute;r&eacute;es = <span style={{ color: '#22c55e' }}>~17 500&euro;</span> de productivit&eacute;
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#7c3aed', marginBottom: 12, display: 'block' }}>payments</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            <strong style={{ color: '#fff' }}>50 cr&eacute;dits offerts</strong> &agrave; l&apos;inscription. Chaque action d&apos;agent co&ucirc;te entre 0.5 et 2 cr&eacute;dits.
            <br />Pas d&apos;abonnement, pas de frais cach&eacute;s. Vous payez uniquement ce que vous consommez.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>0.5-2</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>cr&eacute;dits / action</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>cr&eacute;dits offerts</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>0 &euro;</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>pour commencer</div>
            </div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Cr&eacute;er mon compte gratuit
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fr&eacute;quentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout ce que vous devez savoir sur les agents IA.
        </p>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...cardStyle, padding: '0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{faq.q}</span>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', color: 'rgba(255,255,255,0.65)', fontSize: 14.5, lineHeight: 1.65 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Pr&ecirc;t &agrave; d&eacute;l&eacute;guer &agrave; vos agents IA ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 cr&eacute;dits offerts — aucune carte bancaire requise.
        </p>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Accéder à Freenzy
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>rocket_launch</span>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
