'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'extension',
    title: 'Choisissez un jeu',
    desc: 'Quiz, anagrammes, culture g\u00e9n\u00e9rale ou cr\u00e9ez le v\u00f4tre.',
  },
  {
    icon: 'smart_toy',
    title: 'L\'IA s\'adapte',
    desc: 'Difficult\u00e9 progressive, indices contextuels, corrections intelligentes.',
  },
  {
    icon: 'emoji_events',
    title: 'Gagnez des r\u00e9compenses',
    desc: 'XP, niveaux, badges et classements entre amis.',
  },
];

const GAMES = [
  {
    icon: 'quiz',
    title: 'Quiz Intelligent',
    desc: 'Questions adaptatives sur n\'importe quel sujet, g\u00e9n\u00e9r\u00e9es par IA.',
  },
  {
    icon: 'translate',
    title: 'Anagrammes & Mots',
    desc: 'Jeux de lettres avec indices IA progressifs.',
  },
  {
    icon: 'public',
    title: 'Culture G\u00e9n\u00e9rale',
    desc: 'Milliers de questions sur l\'histoire, sciences, g\u00e9ographie.',
  },
  {
    icon: 'calculate',
    title: 'D\u00e9fi Math\u00e9matique',
    desc: 'Calcul mental avec difficult\u00e9 croissante.',
  },
  {
    icon: 'create',
    title: 'Cr\u00e9ez le v\u00f4tre',
    desc: 'G\u00e9n\u00e9rez un quiz personnalis\u00e9 sur n\'importe quel sujet.',
  },
  {
    icon: 'group',
    title: 'Mode Communaut\u00e9',
    desc: 'Jouez contre d\'autres utilisateurs, classements en temps r\u00e9el.',
  },
];

const BADGES = [
  { icon: 'local_fire_department', label: 'Flamme 7j', color: '#ef4444' },
  { icon: 'school', label: 'Savant', color: '#7c3aed' },
  { icon: 'bolt', label: 'Rapide', color: '#f59e0b' },
  { icon: 'military_tech', label: '\u00c9lite', color: '#06b6d4' },
  { icon: 'diversity_3', label: 'Social', color: '#22c55e' },
  { icon: 'star', label: 'Parfait', color: '#ec4899' },
];

const FAQS = [
  {
    q: 'Quels types de jeux sont disponibles ?',
    a: 'Quiz adaptatifs, anagrammes, culture g\u00e9n\u00e9rale, d\u00e9fis math\u00e9matiques, et vous pouvez aussi cr\u00e9er vos propres quiz sur n\'importe quel sujet gr\u00e2ce \u00e0 l\'IA.',
  },
  {
    q: 'Comment l\'IA adapte-t-elle la difficult\u00e9 ?',
    a: 'L\'IA analyse vos r\u00e9ponses en temps r\u00e9el : si vous r\u00e9ussissez, la difficult\u00e9 augmente progressivement. Si vous bloquez, elle fournit des indices contextuels et ajuste le niveau.',
  },
  {
    q: 'Combien co\u00fbte une partie ?',
    a: 'Entre 1 et 2 cr\u00e9dits par partie selon le type de jeu. Avec les 50 cr\u00e9dits offerts \u00e0 l\'inscription, vous pouvez jouer entre 25 et 50 parties gratuitement.',
  },
  {
    q: 'Peut-on jouer entre amis ?',
    a: 'Oui ! Le mode Communaut\u00e9 permet de d\u00e9fier d\'autres utilisateurs, de comparer vos scores dans les classements et de partager vos quiz personnalis\u00e9s.',
  },
  {
    q: 'Les progr\u00e8s sont-ils sauvegard\u00e9s ?',
    a: 'Absolument. Votre XP, vos niveaux, badges, s\u00e9ries quotidiennes et historique de parties sont sauvegard\u00e9s et synchronis\u00e9s sur tous vos appareils.',
  },
];

export default function ArcadePage() {
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
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>sports_esports</span>
            Arcade & Gamification
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Apprenez en jouant<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>avec l&apos;IA</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Quiz adaptatifs, jeux de mots, d&eacute;fis et r&eacute;compenses. L&apos;IA g&eacute;n&egrave;re des jeux &eacute;ducatifs personnalis&eacute;s et ajuste la difficult&eacute; en temps r&eacute;el.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Jouer gratuitement
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la d&eacute;mo
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
          Du choix du jeu aux r&eacute;compenses en trois &eacute;tapes.
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

      {/* Games showcase */}
      <section style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          6 types de jeux
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Chaque jeu est g&eacute;n&eacute;r&eacute; et adapt&eacute; par l&apos;IA en temps r&eacute;el.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {GAMES.map((game, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#7c3aed', marginBottom: 14, display: 'block' }}>{game.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{game.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{game.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gamification system */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Syst&egrave;me de gamification
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Gagnez de l&apos;XP, montez en niveau et collectionnez des badges.
        </p>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Level progression */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#7c3aed' }}>trending_up</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Niveau 12</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>2,450 / 3,000 XP</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#7c3aed' }}>82%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 12, overflow: 'hidden' }}>
              <div style={{ background: accentGradient, height: '100%', width: '82%', borderRadius: 100, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              <span>Niv. 12</span>
              <span>550 XP restants</span>
              <span>Niv. 13</span>
            </div>
          </div>

          {/* Streak + stats row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Daily streak */}
            <div style={{ ...cardStyle, flex: '1 1 200px', textAlign: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#ef4444', marginBottom: 8, display: 'block' }}>local_fire_department</span>
              <div style={{ fontWeight: 800, fontSize: 36, color: '#ef4444' }}>14</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>jours cons&eacute;cutifs</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 14 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div key={d} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#ef4444' }}>check</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ ...cardStyle, flex: '1 1 200px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#06b6d4', marginBottom: 14, display: 'block' }}>bar_chart</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Parties jou\u00e9es', value: '247', color: '#7c3aed' },
                  { label: 'Taux de r\u00e9ussite', value: '78%', color: '#22c55e' },
                  { label: 'Meilleur score', value: '9,850', color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{stat.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badge collection */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#f59e0b' }}>workspace_premium</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Collection de badges</h3>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>6 / 24 d&eacute;bloqu&eacute;s</span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {BADGES.map((badge, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 16px', background: `${badge.color}10`, border: `1px solid ${badge.color}30`, borderRadius: 14, minWidth: 90 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 30, color: badge.color }}>{badge.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community section */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Communaut&eacute; & Classements
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          D&eacute;fiez vos amis, grimpez dans les classements et partagez vos quiz.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Leaderboard */}
          <div style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#f59e0b' }}>leaderboard</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Classement hebdomadaire</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { rank: 1, name: 'Alice M.', xp: '12,450', medal: '#f59e0b' },
                { rank: 2, name: 'Thomas R.', xp: '11,200', medal: '#94a3b8' },
                { rank: 3, name: 'Sofia L.', xp: '10,800', medal: '#b45309' },
                { rank: 4, name: 'Vous', xp: '9,850', medal: '' },
                { rank: 5, name: 'Lucas P.', xp: '9,100', medal: '' },
              ].map((entry, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: entry.name === 'Vous' ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                  border: entry.name === 'Vous' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: entry.medal ? `${entry.medal}20` : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: entry.medal || 'rgba(255,255,255,0.5)' }}>
                    {entry.rank}
                  </div>
                  <span style={{ flex: 1, fontWeight: entry.name === 'Vous' ? 700 : 500, fontSize: 14, color: entry.name === 'Vous' ? '#a78bfa' : 'rgba(255,255,255,0.8)' }}>{entry.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: entry.name === 'Vous' ? '#7c3aed' : 'rgba(255,255,255,0.5)' }}>{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges + shared */}
          <div style={{ flex: '1 1 320px', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#ef4444' }}>flag</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>D&eacute;fis en cours</h3>
              </div>
              {[
                { title: 'Quiz Science - 20 questions', players: 48, timeLeft: '2h 30min' },
                { title: 'Marathon Culture G\u00e9n\u00e9rale', players: 124, timeLeft: '5h 15min' },
                { title: 'D\u00e9fi Maths Express', players: 36, timeLeft: '45min' },
              ].map((challenge, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{challenge.title}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    <span><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>group</span>{challenge.players} joueurs</span>
                    <span><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>timer</span>{challenge.timeLeft}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#22c55e' }}>share</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Quiz partag&eacute;s</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
                Cr&eacute;ez un quiz personnalis&eacute; et partagez-le avec vos amis. Comparez vos scores et d&eacute;couvrez qui est le meilleur !
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>link</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', flex: 1 }}>freenzy.io/quiz/abc123</span>
                <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#7c3aed', cursor: 'pointer' }}>content_copy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why play with AI */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Pourquoi jouer avec l&apos;IA ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Une exp&eacute;rience d&apos;apprentissage unique, impossible sans intelligence artificielle.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {([
            {
              icon: 'psychology',
              title: 'Adaptation en temps r\u00e9el',
              desc: 'L\'IA analyse vos r\u00e9ponses et ajuste la difficult\u00e9 instantan\u00e9ment. Chaque partie est unique et calibr\u00e9e pour votre niveau.',
              color: '#7c3aed',
            },
            {
              icon: 'auto_fix_high',
              title: 'Contenu illimit\u00e9',
              desc: 'Plus jamais les m\u00eames questions. L\'IA g\u00e9n\u00e8re du contenu frais sur n\'importe quel sujet, \u00e0 chaque partie.',
              color: '#06b6d4',
            },
            {
              icon: 'lightbulb',
              title: 'Explications intelligentes',
              desc: 'Quand vous vous trompez, l\'IA ne donne pas juste la r\u00e9ponse : elle explique le raisonnement et fournit des indices p\u00e9dagogiques.',
              color: '#f59e0b',
            },
            {
              icon: 'speed',
              title: 'Progression rapide',
              desc: 'Gr\u00e2ce \u00e0 l\'apprentissage adaptatif, vous progressez 3x plus vite qu\'avec des quiz traditionnels \u00e0 difficult\u00e9 fixe.',
              color: '#22c55e',
            },
          ] as const).map((item, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 240px', maxWidth: 260, textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
              <span className="material-symbols-rounded" style={{ fontSize: 36, color: item.color, marginBottom: 14, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
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
            Entre <strong style={{ color: '#fff' }}>25 et 50 parties</strong> gratuites avec les 50 cr&eacute;dits offerts &agrave; l&apos;inscription.
            <br />1-2 cr&eacute;dits par partie selon le type de jeu.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>1-2</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>cr&eacute;dits / partie</div>
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
          Tout savoir sur l&apos;Arcade & Gamification.
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
          Pr&ecirc;t &agrave; jouer et apprendre ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 cr&eacute;dits offerts — aucune carte bancaire requise.
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
