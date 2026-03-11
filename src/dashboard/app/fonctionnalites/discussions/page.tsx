'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'chat',
    title: 'Posez votre question',
    desc: '\u00c9crivez naturellement, l\u2019IA comprend le contexte.',
  },
  {
    icon: 'memory',
    title: 'L\u2019IA se souvient',
    desc: 'Votre historique et pr\u00e9f\u00e9rences sont m\u00e9moris\u00e9s.',
  },
  {
    icon: 'lightbulb',
    title: 'Obtenez des r\u00e9ponses pertinentes',
    desc: 'Des r\u00e9ponses pr\u00e9cises, sourc\u00e9es et adapt\u00e9es \u00e0 votre contexte.',
  },
];

const FEATURES = [
  {
    icon: 'history',
    title: 'M\u00e9moire contextuelle',
    desc: 'L\u2019IA se souvient de vos conversations pr\u00e9c\u00e9dentes.',
  },
  {
    icon: 'translate',
    title: 'Multilingue natif',
    desc: 'Discutez dans 12+ langues sans changer de param\u00e8tre.',
  },
  {
    icon: 'attach_file',
    title: 'Analyse de documents',
    desc: 'Uploadez PDF, images, tableaux pour une analyse instantan\u00e9e.',
  },
  {
    icon: 'code',
    title: 'Code & technique',
    desc: 'G\u00e9n\u00e9ration, debug et explication de code en temps r\u00e9el.',
  },
  {
    icon: 'brush',
    title: 'Cr\u00e9ation visuelle',
    desc: 'G\u00e9n\u00e9rez des images, logos et visuels directement dans la conversation.',
  },
  {
    icon: 'shield',
    title: 'Confidentialit\u00e9 totale',
    desc: 'Vos donn\u00e9es ne sont jamais utilis\u00e9es pour entra\u00eener les mod\u00e8les.',
  },
];

const DEMO_MESSAGES = [
  {
    role: 'user',
    text: 'Je lance une startup SaaS B2B dans la cybers\u00e9curit\u00e9. Quels sont les points cl\u00e9s pour mon business plan ?',
  },
  {
    role: 'ai',
    text: 'Pour un SaaS B2B cybers\u00e9curit\u00e9, voici les 5 piliers de votre business plan :\n\n1. **March\u00e9** \u2014 Le march\u00e9 mondial de la cybers\u00e9curit\u00e9 atteint 266 Md$ en 2027. Ciblez un segment pr\u00e9cis (PME, sant\u00e9, fintech).\n2. **Mod\u00e8le** \u2014 ARR avec pricing par si\u00e8ge ou par usage. Visez un LTV/CAC > 3.\n3. **Produit** \u2014 MVP en 3 mois, certifications SOC2/ISO 27001 obligatoires.\n4. **Go-to-market** \u2014 Sales-led pour l\u2019entreprise, PLG pour les PME.\n5. **Financement** \u2014 Pr\u00e9-seed 500K-1M\u20ac, seed apr\u00e8s premiers clients payants.',
  },
  {
    role: 'user',
    text: 'Bonne analyse. Peux-tu approfondir le point 4, en tenant compte que je cible les PME fran\u00e7aises ?',
  },
  {
    role: 'ai',
    text: 'Pour les PME fran\u00e7aises en cybers\u00e9curit\u00e9, je recommande une strat\u00e9gie PLG adapt\u00e9e :\n\n**Acquisition** \u2014 Freemium avec audit de s\u00e9curit\u00e9 gratuit (fort taux de conversion en France). Partenariats avec les CCI et BPI France.\n**Canal** \u2014 R\u00e9seau de revendeurs IT locaux + int\u00e9grateurs. Les PME fran\u00e7aises ach\u00e8tent via des tiers de confiance.\n**Contenu** \u2014 Blog SEO en fran\u00e7ais sur la conformit\u00e9 RGPD/NIS2, webinaires mensuels.\n**Pricing** \u2014 3 paliers : 49\u20ac/mois (5 postes), 149\u20ac/mois (25 postes), sur-mesure au-del\u00e0.\n\nVoulez-vous que je d\u00e9taille le plan de contenu SEO ou le mod\u00e8le financier ?',
  },
  {
    role: 'user',
    text: 'Oui, d\u00e9taille le mod\u00e8le financier sur 3 ans.',
  },
  {
    role: 'ai',
    text: 'Voici une projection financi\u00e8re sur 3 ans pour votre SaaS cybers\u00e9curit\u00e9 PME :\n\n**Ann\u00e9e 1** \u2014 50 clients, MRR 7K\u20ac, ARR 84K\u20ac. Focus acquisition + produit.\n**Ann\u00e9e 2** \u2014 200 clients, MRR 32K\u20ac, ARR 384K\u20ac. Recrutement sales + CSM.\n**Ann\u00e9e 3** \u2014 500 clients, MRR 85K\u20ac, ARR 1M\u20ac. Expansion europ\u00e9enne.\n\nHypoth\u00e8ses : churn 5%/mois, ARPU 170\u20ac, CAC 800\u20ac, LTV/CAC ratio de 4.2.\n\nJe peux vous g\u00e9n\u00e9rer un tableur d\u00e9taill\u00e9 avec ces projections si vous le souhaitez.',
  },
];

const USE_CASES = [
  { icon: 'business', title: 'Strat\u00e9gie business', desc: 'Business plans, analyses de march\u00e9 et conseils strat\u00e9giques.' },
  { icon: 'school', title: '\u00c9ducation & recherche', desc: 'Explications p\u00e9dagogiques, synth\u00e8ses et aide \u00e0 la r\u00e9daction.' },
  { icon: 'code', title: 'D\u00e9veloppement', desc: 'Debug, code review, architecture et documentation technique.' },
  { icon: 'edit_note', title: 'R\u00e9daction', desc: 'Articles, emails, posts r\u00e9seaux sociaux et copywriting.' },
  { icon: 'analytics', title: 'Analyse de donn\u00e9es', desc: 'Interpr\u00e9tation de tableaux, graphiques et rapports.' },
  { icon: 'translate', title: 'Traduction', desc: 'Traduction contextuelle dans 12+ langues avec nuances.' },
];

const MODELS = [
  {
    name: 'Haiku',
    desc: 'Rapide, simple',
    credits: '~0.2',
    color: '#22c55e',
    icon: 'bolt',
    details: 'Id\u00e9al pour les questions simples, r\u00e9sum\u00e9s et traductions rapides.',
  },
  {
    name: 'Sonnet',
    desc: '\u00c9quilibr\u00e9',
    credits: '~0.5',
    color: '#7c3aed',
    icon: 'balance',
    details: 'Parfait pour l\u2019analyse, la r\u00e9daction et les t\u00e2ches complexes du quotidien.',
  },
  {
    name: 'Opus',
    desc: 'Avanc\u00e9, raisonnement',
    credits: '~2',
    color: '#f59e0b',
    icon: 'psychology',
    details: 'Raisonnement profond, r\u00e9solution de probl\u00e8mes complexes et cr\u00e9ation avanc\u00e9e.',
  },
];

const FAQS = [
  {
    q: 'Combien de messages puis-je envoyer ?',
    a: 'Il n\u2019y a pas de limite de messages. Chaque message consomme des cr\u00e9dits en fonction du mod\u00e8le utilis\u00e9 : ~0.2 pour Haiku, ~0.5 pour Sonnet, ~2 pour Opus.',
  },
  {
    q: 'L\u2019IA se souvient-elle de mes conversations pr\u00e9c\u00e9dentes ?',
    a: 'Oui. La m\u00e9moire contextuelle retient vos pr\u00e9f\u00e9rences, votre historique et le contexte de vos \u00e9changes pour des r\u00e9ponses toujours plus pertinentes.',
  },
  {
    q: 'Quels types de fichiers puis-je analyser ?',
    a: 'Vous pouvez uploader des PDF, images (PNG, JPG), tableurs (CSV, Excel), documents Word et fichiers texte. L\u2019IA les analyse et r\u00e9pond \u00e0 vos questions dessus.',
  },
  {
    q: 'Mes donn\u00e9es sont-elles confidentielles ?',
    a: 'Absolument. Vos conversations sont chiffr\u00e9es, h\u00e9berg\u00e9es en Europe et ne sont jamais utilis\u00e9es pour entra\u00eener les mod\u00e8les IA. Suppression automatique apr\u00e8s 90 jours.',
  },
  {
    q: 'Puis-je utiliser les discussions pour du code ?',
    a: 'Oui. L\u2019IA g\u00e9n\u00e8re, debug et explique du code dans 20+ langages. Elle peut aussi analyser vos fichiers de code upload\u00e9s et proposer des am\u00e9liorations.',
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
              Essayer gratuitement
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
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Context badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#06b6d4' }}>memory</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Conversation avec mémoire contextuelle
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    {msg.role === 'ai' && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>Sonnet</span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px 16px 16px 4px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', opacity: 0.6 }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', opacity: 0.4 }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', opacity: 0.2 }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>
              L&apos;IA se souvient que vous ciblez les PME françaises en cybersécurité...
            </span>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Pour tous vos cas d&apos;usage
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Une IA polyvalente qui s&apos;adapte à chaque domaine.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, maxWidth: 1000, margin: '0 auto' }}>
          {USE_CASES.map((uc, i) => (
            <div key={i} style={{ ...cardStyle, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#a78bfa' }}>{uc.icon}</span>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, margin: '0 0 4px' }}>{uc.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{uc.desc}</p>
              </div>
            </div>
          ))}
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
                {model.credits} crédit{model.credits === '~2' ? 's' : ''}
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
          Commencer gratuitement
          <span className="material-symbols-rounded" style={{ fontSize: 22 }}>rocket_launch</span>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
