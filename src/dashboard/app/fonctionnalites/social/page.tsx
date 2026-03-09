'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'storefront',
    title: 'Décrivez votre marque',
    desc: 'Ton, secteur, audience cible : l\'IA apprend votre identité en quelques phrases.',
  },
  {
    icon: 'auto_awesome',
    title: 'L\'IA crée vos posts',
    desc: 'Textes accrocheurs, hashtags pertinents, adaptés à chaque réseau social.',
  },
  {
    icon: 'calendar_month',
    title: 'Planifiez et publiez',
    desc: 'Organisez votre calendrier éditorial et publiez au meilleur moment.',
  },
];

const FEATURES = [
  {
    icon: 'share',
    title: 'Posts multi-plateformes',
    desc: 'Un même message décliné pour LinkedIn, Instagram, Twitter et TikTok. Le bon format, le bon ton, automatiquement.',
  },
  {
    icon: 'calendar_month',
    title: 'Calendrier éditorial',
    desc: 'Visualisez votre planning de publication sur le mois. Glissez-déposez pour réorganiser vos posts.',
  },
  {
    icon: 'trending_up',
    title: 'Analytics engagement',
    desc: 'Suivez vos performances : likes, partages, commentaires. L\'IA suggère les contenus qui marchent le mieux.',
  },
  {
    icon: 'devices',
    title: 'Adaptation par réseau',
    desc: 'LinkedIn professionnel, Instagram visuel, Twitter concis, TikTok dynamique : chaque post est optimisé pour sa plateforme.',
  },
  {
    icon: 'tag',
    title: 'Suggestions hashtags',
    desc: 'L\'IA analyse les tendances de votre secteur et propose les hashtags les plus performants du moment.',
  },
  {
    icon: 'query_stats',
    title: 'Analyse concurrents',
    desc: 'Comparez vos performances avec celles de vos concurrents. Identifiez les opportunités de contenu.',
  },
];

const PLATFORMS = [
  { name: 'LinkedIn', icon: 'work', color: '#0a66c2' },
  { name: 'Instagram', icon: 'photo_camera', color: '#e4405f' },
  { name: 'Twitter / X', icon: 'forum', color: '#1da1f2' },
  { name: 'TikTok', icon: 'play_circle', color: '#ff0050' },
];

const CALENDAR_POSTS = [
  { day: 'Lun', platform: 'LinkedIn', title: '5 tendances IA en 2026', color: '#0a66c2', time: '9:00' },
  { day: 'Mar', platform: 'Instagram', title: 'Behind the scenes', color: '#e4405f', time: '12:30' },
  { day: 'Mer', platform: 'Twitter', title: 'Thread : productivité', color: '#1da1f2', time: '8:00' },
  { day: 'Jeu', platform: 'LinkedIn', title: 'Étude de cas client', color: '#0a66c2', time: '10:00' },
  { day: 'Ven', platform: 'TikTok', title: 'Astuce rapide 30s', color: '#ff0050', time: '18:00' },
  { day: 'Sam', platform: 'Instagram', title: 'Citation inspirante', color: '#e4405f', time: '11:00' },
  { day: 'Dim', platform: 'Twitter', title: 'Sondage audience', color: '#1da1f2', time: '16:00' },
];

const FAQS = [
  {
    q: 'Quels réseaux sociaux sont supportés ?',
    a: 'LinkedIn, Instagram, Twitter/X et TikTok. Nous ajoutons régulièrement de nouvelles plateformes. Facebook et YouTube sont prévus prochainement.',
  },
  {
    q: 'La publication est-elle automatique ?',
    a: 'L\'IA génère et planifie vos posts. La publication peut être manuelle (copier-coller) ou automatique via connexion de vos comptes. Vous gardez toujours le contrôle avant publication.',
  },
  {
    q: 'L\'IA peut-elle créer des images ?',
    a: 'L\'IA génère le texte des posts. Pour les visuels, vous pouvez utiliser notre Studio Photo IA intégré (Freenzy Studio) qui crée des images professionnelles à partir d\'une description.',
  },
  {
    q: 'Le ton est-il adapté à mon secteur ?',
    a: 'Absolument. Vous décrivez votre marque, votre audience et votre ton souhaité. L\'IA s\'adapte : formel pour le B2B, décontracté pour le lifestyle, technique pour la tech, etc.',
  },
  {
    q: 'Quelles analytics sont disponibles ?',
    a: 'Engagement par post, meilleur jour/heure de publication, croissance d\'audience, comparaison mensuelle et suggestions d\'optimisation basées sur vos données.',
  },
];

export default function SocialPage() {
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
    <div style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#22d3ee' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>share</span>
            Réseaux Sociaux IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Vos réseaux sociaux en<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pilote automatique</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Posts, calendrier éditorial et analytics gérés par IA. Publiez du contenu engageant sur tous vos réseaux, sans effort.
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

      {/* Platforms bar */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLATFORMS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 22px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: p.color }}>{p.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Steps */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          De la création à la publication en trois étapes.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                {i + 1}
              </div>
              <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#5b6cf7', marginBottom: 16, display: 'block', marginTop: 12 }}>{step.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Features */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Tout pour briller sur les réseaux
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Créez, planifiez, analysez. L&apos;IA gère le reste.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FEATURES.map((feat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#5b6cf7', marginBottom: 14, display: 'block' }}>{feat.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo: Calendar Mockup */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Votre semaine en un coup d&apos;oeil
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Un calendrier éditorial clair et actionnable.
        </p>
        <div style={{ maxWidth: 800, margin: '0 auto', ...cardStyle, padding: '24px 20px', overflowX: 'auto' }}>
          {/* Calendar header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8, color: '#5b6cf7' }}>calendar_month</span>
              Semaine du 9 mars 2026
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>chevron_left</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>chevron_right</span>
              </div>
            </div>
          </div>
          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CALENDAR_POSTS.map((post, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, borderLeft: `3px solid ${post.color}`,
              }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{post.day}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{post.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: post.color, marginTop: 2 }}>{post.platform}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>edit</span>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>send</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(91,108,247,0.06)', border: '1px solid rgba(91,108,247,0.15)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#5b6cf7', marginBottom: 12, display: 'block' }}>payments</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Environ <strong style={{ color: '#fff' }}>62 posts</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Moins de 1 crédit par post. Le meilleur rapport qualité-prix du marché.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>~0.8</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédit / post</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits offerts</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>0 €</div>
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
          Tout savoir sur le pilotage de vos réseaux sociaux.
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
          Prêt à automatiser vos réseaux sociaux ?
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
