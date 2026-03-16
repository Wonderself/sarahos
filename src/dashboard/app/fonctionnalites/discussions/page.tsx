'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'chat',
    title: 'Posez votre question',
    desc: 'Écrivez naturellement, l\'IA comprend le contexte.',
  },
  {
    icon: 'memory',
    title: 'L\'IA se souvient',
    desc: 'Votre historique et préférences sont mémorisés.',
  },
  {
    icon: 'lightbulb',
    title: 'Obtenez des réponses pertinentes',
    desc: 'Des réponses précises, sourcées et adaptées à votre contexte.',
  },
];

const FEATURES = [
  {
    icon: 'history',
    title: 'Mémoire contextuelle',
    desc: 'L\'IA se souvient de vos conversations précédentes.',
  },
  {
    icon: 'translate',
    title: 'Multilingue natif',
    desc: 'Discutez dans 12+ langues sans changer de paramètre.',
  },
  {
    icon: 'attach_file',
    title: 'Analyse de documents',
    desc: 'Uploadez PDF, images, tableaux pour une analyse instantanée.',
  },
  {
    icon: 'code',
    title: 'Code & technique',
    desc: 'Génération, debug et explication de code en temps réel.',
  },
  {
    icon: 'brush',
    title: 'Création visuelle',
    desc: 'Générez des images, logos et visuels directement dans la conversation.',
  },
  {
    icon: 'shield',
    title: 'Confidentialité totale',
    desc: 'Vos données ne sont jamais utilisées pour entraîner les modèles.',
  },
];

const DEMO_MESSAGES = [
  {
    role: 'user',
    text: 'Je lance une startup SaaS B2B dans la cybersécurité. Quels sont les points clés pour mon business plan ?',
  },
  {
    role: 'ai',
    text: 'Pour un SaaS B2B cybersécurité, voici les 5 piliers de votre business plan :\n\n1. **Marché** — Le marché mondial de la cybersécurité atteint 266 Md$ en 2027. Ciblez un segment précis (PME, santé, fintech).\n2. **Modèle** — ARR avec pricing par siège ou par usage. Visez un LTV/CAC > 3.\n3. **Produit** — MVP en 3 mois, certifications SOC2/ISO 27001 obligatoires.\n4. **Go-to-market** — Sales-led pour l\'entreprise, PLG pour les PME.\n5. **Financement** — Pré-seed 500K-1M€, seed après premiers clients payants.',
  },
  {
    role: 'user',
    text: 'Bonne analyse. Peux-tu approfondir le point 4, en tenant compte que je cible les PME françaises ?',
  },
  {
    role: 'ai',
    text: 'Pour les PME françaises en cybersécurité, je recommande une stratégie PLG adaptée :\n\n**Acquisition** — Freemium avec audit de sécurité gratuit (fort taux de conversion en France). Partenariats avec les CCI et BPI France.\n**Canal** — Réseau de revendeurs IT locaux + intégrateurs. Les PME françaises achètent via des tiers de confiance.\n**Contenu** — Blog SEO en français sur la conformité RGPD/NIS2, webinaires mensuels.\n**Pricing** — 3 paliers : 49€/mois (5 postes), 149€/mois (25 postes), sur-mesure au-delà.\n\nVoulez-vous que je détaille le plan de contenu SEO ou le modèle financier ?',
  },
];

const MODELS = [
  {
    name: 'Haiku',
    desc: 'Rapide, simple',
    credits: '~0.2',
    color: '#22c55e',
    icon: 'bolt',
    details: 'Idéal pour les questions simples, résumés et traductions rapides.',
  },
  {
    name: 'Sonnet',
    desc: 'Équilibré',
    credits: '~0.5',
    color: '#7c3aed',
    icon: 'balance',
    details: 'Parfait pour l\'analyse, la rédaction et les tâches complexes du quotidien.',
  },
  {
    name: 'Opus',
    desc: 'Avancé, raisonnement',
    credits: '~2',
    color: '#f59e0b',
    icon: 'psychology',
    details: 'Raisonnement profond, résolution de problèmes complexes et création avancée.',
  },
];

const FAQS = [
  {
    q: 'Combien de messages puis-je envoyer ?',
    a: 'Il n\'y a pas de limite de messages. Chaque message consomme des crédits en fonction du modèle utilisé : ~0.2 pour Haiku, ~0.5 pour Sonnet, ~2 pour Opus.',
  },
  {
    q: 'L\'IA se souvient-elle de mes conversations précédentes ?',
    a: 'Oui. La mémoire contextuelle retient vos préférences, votre historique et le contexte de vos échanges pour des réponses toujours plus pertinentes.',
  },
  {
    q: 'Quels types de fichiers puis-je analyser ?',
    a: 'Vous pouvez uploader des PDF, images (PNG, JPG), tableurs (CSV, Excel), documents Word et fichiers texte. L\'IA les analyse et répond à vos questions dessus.',
  },
  {
    q: 'Mes données sont-elles confidentielles ?',
    a: 'Absolument. Vos conversations sont chiffrées, hébergées en Europe et ne sont jamais utilisées pour entraîner les modèles IA. Suppression automatique après 90 jours.',
  },
  {
    q: 'Puis-je utiliser les discussions pour du code ?',
    a: 'Oui. L\'IA génère, debug et explique du code dans 20+ langages. Elle peut aussi analyser vos fichiers de code uploadés et proposer des améliorations.',
  },
];

export default function DiscussionsPage() {
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#a78bfa' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>psychology</span>
            Discussions Profondes IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Des conversations IA<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>qui vont en profondeur</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Des conversations IA qui comprennent le contexte, se souviennent de votre historique et s&apos;adaptent à vos besoins.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Accéder à Freenzy
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Trois étapes pour des conversations intelligentes et contextuelles.
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

      {/* 6 Features */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Des discussions sans limites
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Une IA qui comprend, se souvient et s&apos;adapte à chaque échange.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FEATURES.map((feat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#7c3aed', marginBottom: 14, display: 'block' }}>{feat.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo conversation */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Une conversation, en vrai
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Voyez comment l&apos;IA se souvient du contexte et approfondit ses réponses.
        </p>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {DEMO_MESSAGES.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '85%',
                background: msg.role === 'user' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: msg.role === 'user' ? '#a78bfa' : '#06b6d4' }}>
                    {msg.role === 'user' ? 'person' : 'smart_toy'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: msg.role === 'user' ? '#a78bfa' : '#06b6d4', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {msg.role === 'user' ? 'Vous' : 'Freenzy IA'}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>
              L&apos;IA se souvient que vous ciblez les PME françaises en cybersécurité...
            </span>
          </div>
        </div>
      </section>

      {/* Models */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          3 modèles IA, selon vos besoins
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Choisissez le niveau de puissance adapté à chaque conversation.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {MODELS.map((model, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${model.color}15`, border: `2px solid ${model.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 28, color: model.color }}>{model.icon}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{model.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 12 }}>{model.desc}</p>
              <div style={{ background: `${model.color}15`, border: `1px solid ${model.color}30`, borderRadius: 100, padding: '6px 16px', display: 'inline-block', fontSize: 14, fontWeight: 700, color: model.color, marginBottom: 16 }}>
                {model.credits} crédit{model.credits !== '~2' ? '' : 's'}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{model.details}</p>
            </div>
          ))}
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
            <strong style={{ color: '#fff' }}>50 crédits offerts</strong> à l&apos;inscription — aucune carte bancaire requise.
            <br />De 0.2 à 2 crédits par message selon le modèle choisi.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits offerts</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>3</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>modèles IA</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>0 €</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>pour commencer</div>
            </div>
          </div>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Créer mon compte gratuit
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout savoir sur les discussions IA.
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
          Prêt à discuter avec une IA qui comprend vraiment ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 crédits offerts — aucune carte bancaire requise.
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
