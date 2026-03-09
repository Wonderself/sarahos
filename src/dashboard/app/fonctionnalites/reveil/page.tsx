'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'tune',
    title: 'Choisissez votre mode',
    desc: '8 ambiances disponibles : doux, motivant, drôle, zen... Votre briefing reflète votre humeur.',
  },
  {
    icon: 'checklist',
    title: 'Sélectionnez vos rubriques',
    desc: 'Météo, actualités, horoscope, citation, agenda... Composez votre briefing sur mesure.',
  },
  {
    icon: 'notifications_active',
    title: 'Recevez votre briefing',
    desc: 'Par appel vocal ou WhatsApp, à l\'heure que vous choisissez. Chaque matin.',
  },
];

const MODES = [
  { name: 'Doux', icon: 'spa', color: '#a78bfa', desc: 'Un réveil tout en douceur' },
  { name: 'Dur', icon: 'fitness_center', color: '#ef4444', desc: 'Le coup de fouet du matin' },
  { name: 'Sympa', icon: 'sentiment_satisfied', color: '#22c55e', desc: 'Comme un ami bienveillant' },
  { name: 'Drôle', icon: 'mood', color: '#f59e0b', desc: 'Commencez par un sourire' },
  { name: 'Fou', icon: 'celebration', color: '#ec4899', desc: 'Énergie débordante garantie' },
  { name: 'Motivant', icon: 'rocket_launch', color: '#7c3aed', desc: 'Prêt à conquérir le monde' },
  { name: 'Zen', icon: 'self_improvement', color: '#06b6d4', desc: 'Calme et sérénité' },
  { name: 'Énergique', icon: 'bolt', color: '#ff6b35', desc: 'Plein d\'énergie dès le réveil' },
];

const RUBRIQUES = [
  { name: 'Météo', icon: 'wb_sunny' },
  { name: 'Actualités', icon: 'newspaper' },
  { name: 'Horoscope', icon: 'stars' },
  { name: 'Citation du jour', icon: 'format_quote' },
  { name: 'Agenda', icon: 'event' },
  { name: 'Bourse', icon: 'show_chart' },
  { name: 'Sport', icon: 'sports_soccer' },
  { name: 'Blague', icon: 'sentiment_very_satisfied' },
  { name: 'Anniversaires', icon: 'cake' },
  { name: 'Santé', icon: 'favorite' },
  { name: 'Musique', icon: 'music_note' },
  { name: 'Recette', icon: 'restaurant' },
  { name: 'Mot du jour', icon: 'abc' },
  { name: 'Éphéméride', icon: 'history_edu' },
  { name: 'Tech', icon: 'memory' },
  { name: 'Méditation', icon: 'self_improvement' },
  { name: 'Objectif', icon: 'flag' },
  { name: 'Productivité', icon: 'task_alt' },
];

const FEATURES = [
  {
    icon: 'palette',
    title: '8 modes d\'ambiance',
    desc: 'Doux, Dur, Sympa, Drôle, Fou, Motivant, Zen, Énergique. Changez chaque jour ou gardez votre préféré.',
  },
  {
    icon: 'dashboard_customize',
    title: '18 rubriques au choix',
    desc: 'Météo, actualités, horoscope, citation, agenda, bourse, sport, blague, anniversaires et bien plus.',
  },
  {
    icon: 'call',
    title: 'Appel vocal ou WhatsApp',
    desc: 'Recevez votre briefing par appel téléphonique avec voix naturelle ou par message WhatsApp détaillé.',
  },
  {
    icon: 'record_voice_over',
    title: 'Voix Sarah ou Emmanuel',
    desc: 'Choisissez votre voix préférée. Deux avatars avec des personnalités distinctes pour vous réveiller.',
  },
  {
    icon: 'schedule',
    title: 'Programmation récurrente',
    desc: 'Définissez l\'heure, les jours de la semaine, le mode et les rubriques. Tout est automatique ensuite.',
  },
  {
    icon: 'science',
    title: 'Mode test gratuit',
    desc: 'Testez votre briefing immédiatement sans attendre le lendemain matin. Ajustez jusqu\'à satisfaction.',
  },
];

const FAQS = [
  {
    q: 'Puis-je choisir l\'heure du briefing ?',
    a: 'Bien sûr. Vous définissez l\'heure exacte de réception, de 5h à 12h. Le briefing arrive à la minute près, que ce soit par appel ou WhatsApp.',
  },
  {
    q: 'Le briefing fonctionne-t-il le weekend ?',
    a: 'Oui. Vous pouvez configurer des jours différents : par exemple, un briefing "Motivant" en semaine et un mode "Zen" le weekend, avec des rubriques différentes.',
  },
  {
    q: 'Puis-je choisir mes rubriques ?',
    a: 'Absolument. Parmi les 18 rubriques disponibles, vous sélectionnez celles qui vous intéressent. Vous pouvez aussi changer la sélection à tout moment.',
  },
  {
    q: 'Quelles voix sont disponibles ?',
    a: 'Deux voix premium ElevenLabs : Sarah (féminine, chaleureuse) et Emmanuel (masculine, dynamique). Les deux parlent un français naturel et fluide.',
  },
  {
    q: 'Combien coûte un briefing ?',
    a: 'Un briefing vocal coûte environ 4,5 crédits. Avec les 50 crédits offerts à l\'inscription, vous avez environ 11 briefings gratuits pour tester.',
  },
];

export default function ReveilPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState(5); // Motivant by default
  const [roiMinutes, setRoiMinutes] = useState(25);

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
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#fbbf24' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>alarm</span>
            Briefing Matinal IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Commencez chaque journée avec<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>un briefing sur mesure</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.6 }}>
            8 modes, 18 rubriques, votre assistant matinal. Recevez chaque matin un briefing personnalisé par appel vocal ou WhatsApp.
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

      {/* 3 Steps */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Configurez une fois, profitez chaque matin.
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

      {/* 8 Modes */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          8 modes pour chaque humeur
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Cliquez sur un mode pour voir l&apos;ambiance.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {MODES.map((mode, i) => (
            <button key={i} onClick={() => setActiveMode(i)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: activeMode === i ? `${mode.color}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeMode === i ? `${mode.color}50` : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 14, padding: '16px 20px', cursor: 'pointer', color: '#fff',
              minWidth: 100, transition: 'all 0.2s',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 28, color: mode.color }}>{mode.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{mode.name}</span>
            </button>
          ))}
        </div>
        {/* Active mode preview */}
        <div style={{ maxWidth: 500, margin: '0 auto', ...cardStyle, textAlign: 'center', borderColor: `${MODES[activeMode].color}30`, background: `${MODES[activeMode].color}08` }}>
          <span className="material-symbols-rounded" style={{ fontSize: 48, color: MODES[activeMode].color, marginBottom: 12, display: 'block' }}>{MODES[activeMode].icon}</span>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: MODES[activeMode].color }}>Mode {MODES[activeMode].name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>{MODES[activeMode].desc}</p>
        </div>
      </section>

      {/* 18 Rubriques */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          18 rubriques à la carte
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Composez le briefing parfait en sélectionnant vos rubriques préférées.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800, margin: '0 auto' }}>
          {RUBRIQUES.map((rub, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 16px',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#7c3aed' }}>{rub.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{rub.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Features */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Un réveil intelligent, vraiment
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Bien plus qu&apos;une alarme : votre assistant personnel du matin.
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

      {/* Demo: Briefing Preview */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Aperçu d&apos;un briefing
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Voici ce que vous entendrez demain matin.
        </p>
        <div style={{ maxWidth: 500, margin: '0 auto', ...cardStyle, padding: '28px 24px' }}>
          {/* Phone header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#fff' }}>alarm</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Briefing du lundi 9 mars</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Mode Motivant — 7h30</div>
            </div>
          </div>
          {/* Briefing items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'wb_sunny', label: 'Météo', text: 'Netanya : 22°C, ensoleillé. Parfait pour attaquer la journée !' },
              { icon: 'newspaper', label: 'Actualités', text: 'L\'IA générative atteint un nouveau cap : 1 milliard d\'utilisateurs actifs.' },
              { icon: 'format_quote', label: 'Citation', text: '« Le succès n\'est pas final, l\'échec n\'est pas fatal. C\'est le courage de continuer qui compte. » — Churchill' },
              { icon: 'event', label: 'Agenda', text: '3 rendez-vous aujourd\'hui. Le premier à 10h avec Dupont & Fils.' },
              { icon: 'flag', label: 'Objectif', text: 'Cette semaine : finaliser la proposition commerciale et relancer 5 prospects.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#7c3aed', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Voice indicator */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#7c3aed' }}>graphic_eq</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'end', height: 20 }}>
                {[8, 14, 10, 18, 12, 16, 8, 20, 14, 10, 16, 12, 18, 8, 14, 20, 10, 16, 12, 8].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, background: '#7c3aed', borderRadius: 2, opacity: 0.6 + (i % 3) * 0.15 }} />
                ))}
              </div>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Voix Sarah</span>
          </div>
        </div>
      </section>

      {/* Structure du briefing */}
      <section style={{ padding: '80px 24px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Structure du briefing
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Un format clair, structuré et adapté à votre heure de réveil.
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { emoji: '\u2600\uFE0F', label: 'MÉTÉO', example: '[Ville] — [Temp]°C, [Conditions]', color: '#f59e0b' },
              { emoji: '\uD83D\uDCF0', label: 'ACTUALITÉS', example: '3 bullet points avec sources fiables', color: '#06b6d4' },
              { emoji: '\uD83D\uDCC5', label: 'AGENDA', example: "Timeline des événements de la journée", color: '#7c3aed' },
              { emoji: '\uD83D\uDCAA', label: 'MOTIVATION', example: 'Citation inspirante avec auteur', color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: item.color, letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item.example}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#7c3aed' }}>info</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Chaque section séparée. Ton adapté selon l&apos;heure et le mode choisi.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Réveil classique vs Freenzy
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Transformez votre routine matinale.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Réveil classique */}
          <div style={{ flex: '1 1 300px', maxWidth: 380, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 16, padding: '32px 28px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 24, textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 24, verticalAlign: 'middle', marginRight: 8 }}>alarm</span>
              Réveil classique
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Alarme', 'Scroll téléphone', 'Stress', 'Retard'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{step}</span>
                  {i < 3 && <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(239,68,68,0.4)', marginLeft: 'auto' }}>arrow_downward</span>}
                </div>
              ))}
            </div>
          </div>
          {/* Réveil Freenzy */}
          <div style={{ flex: '1 1 300px', maxWidth: 380, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 16, padding: '32px 28px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', marginBottom: 24, textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 24, verticalAlign: 'middle', marginRight: 8 }}>smart_toy</span>
              Réveil Freenzy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Briefing structuré', 'Informé', 'Motivé', 'Productif dès 7h'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#22c55e' }}>check</span>
                  </div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{step}</span>
                  {i < 3 && <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(34,197,94,0.4)', marginLeft: 'auto' }}>arrow_downward</span>}
                </div>
              ))}
            </div>
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
            Environ <strong style={{ color: '#fff' }}>11 briefings vocaux</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Un briefing WhatsApp coûte encore moins.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>~4.5</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits / briefing</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits offerts</div>
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
          Tout savoir sur le briefing matinal intelligent.
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

      {/* Intégrations */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Intégrations
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Connecté à vos outils pour un briefing complet.
        </p>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {([
            { icon: 'calendar_month', title: 'Calendrier Google/Outlook', desc: 'Synchronise vos RDV du jour' },
            { icon: 'cloud', title: 'Météo en temps réel', desc: 'Données localisées à votre ville' },
            { icon: 'newspaper', title: 'Actualités IA', desc: 'Sources fiables, résumés intelligents' },
            { icon: 'show_chart', title: 'Bourse & Marchés', desc: 'Indices et tendances du jour' },
            { icon: 'chat', title: 'WhatsApp', desc: 'Recevez votre briefing par message' },
            { icon: 'call', title: 'Appel vocal', desc: 'Voix naturelle ElevenLabs' },
          ] as const).map((item, i) => (
            <div key={i} style={{ flex: '1 1 300px', maxWidth: 340, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 22px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#7c3aed', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculateur de ROI */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Calculateur de ROI
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Combien de minutes pour préparer votre journée ?
        </p>
        <div style={{ maxWidth: 600, margin: '0 auto', ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <input type="range" min={5} max={60} value={roiMinutes} onChange={(e) => setRoiMinutes(Number(e.target.value))} style={{ flex: 1, accentColor: '#7c3aed' }} />
            <span style={{ fontWeight: 800, fontSize: 24, color: '#7c3aed', minWidth: 60, textAlign: 'right' }}>{roiMinutes} min</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Temps perdu ({roiMinutes} min x 22 jours)</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#ef4444' }}>{((roiMinutes * 22) / 60).toFixed(1)}h / mois</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Briefing Freenzy (2 min + ~4.5 crédits)</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#7c3aed' }}>0.23 €/jour</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>Temps récupéré</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: '#22c55e' }}>{(((roiMinutes - 2) * 22) / 60).toFixed(1)}h / mois</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Coût mensuel Freenzy</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{(0.23 * 22).toFixed(2)} €/mois</span>
            </div>
          </div>
        </div>
      </section>

      {/* Voix disponibles */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Voix disponibles
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Choisissez la voix qui vous accompagne chaque matin.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {([
            { name: 'Sarah', desc: 'Voix féminine, naturelle et chaleureuse', color: '#a78bfa' },
            { name: 'Emmanuel', desc: 'Voix masculine, posée et professionnelle', color: '#7c3aed' },
          ] as const).map((voice, i) => (
            <div key={i} style={{ flex: '1 1 280px', maxWidth: 360, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(12px)', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${voice.color}20`, border: `2px solid ${voice.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 28, color: voice.color }}>record_voice_over</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{voice.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>{voice.desc}</p>
              {/* Audio wave animation */}
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'end', height: 24, marginBottom: 16 }}>
                {[6, 12, 8, 16, 10, 14, 8, 18, 12, 10, 14, 8, 16, 10, 12].map((h, j) => (
                  <div key={j} style={{ width: 3, borderRadius: 2, background: voice.color, height: h, opacity: 0.5 + (j % 3) * 0.2, animation: `wave${j % 3} 1.2s ease-in-out infinite`, animationDelay: `${j * 0.08}s` }} />
                ))}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>graphic_eq</span>
                Propulsé par ElevenLabs
              </div>
            </div>
          ))}
        </div>
        {/* wave keyframes in globals.css */}
      </section>

      {/* Final CTA */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Prêt à transformer vos matins ?
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
