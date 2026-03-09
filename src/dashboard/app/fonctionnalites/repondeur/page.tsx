'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: 'call',
    title: 'Un client appelle',
    desc: 'Votre numéro professionnel reçoit un appel, même à 3h du matin.',
  },
  {
    icon: 'smart_toy',
    title: "L'IA répond naturellement",
    desc: 'Une voix française fluide accueille, écoute et répond à votre place.',
  },
  {
    icon: 'summarize',
    title: 'Vous recevez le résumé',
    desc: 'Email ou WhatsApp : nom, motif, urgence, tout est noté pour vous.',
  },
];

const FEATURES = [
  {
    icon: 'bolt',
    title: 'Réponse instantanée 24/7',
    desc: "Plus aucun appel manqué. L'IA décroche en moins de 2 secondes, jour et nuit, weekends et jours fériés.",
  },
  {
    icon: 'filter_alt',
    title: 'Qualification des leads',
    desc: "L'IA identifie les prospects sérieux, note leur besoin et leur urgence pour que vous rappeliez les bons contacts.",
  },
  {
    icon: 'quiz',
    title: 'FAQ automatique',
    desc: 'Horaires, tarifs, adresse : les questions récurrentes sont traitées sans mobiliser votre équipe.',
  },
  {
    icon: 'swap_calls',
    title: 'Transfert intelligent',
    desc: "Appel urgent ? L'IA transfère directement vers votre mobile ou un collaborateur désigné.",
  },
  {
    icon: 'mark_email_read',
    title: 'Résumé par email / WhatsApp',
    desc: 'Après chaque appel, recevez un compte-rendu clair avec le nom, le motif et les actions suggérées.',
  },
  {
    icon: 'record_voice_over',
    title: 'Voix naturelle française',
    desc: "Technologie ElevenLabs premium : vos clients croient parler à un vrai collaborateur, pas à un robot.",
  },
];

const DEMO_MESSAGES = [
  { from: 'caller', text: 'Bonjour, je voudrais un devis pour une refonte de site web.' },
  { from: 'ai', text: "Bonjour ! Avec plaisir. Pourriez-vous me donner le nom de votre entreprise et votre budget approximatif ?" },
  { from: 'caller', text: "C'est pour la société Dupont & Fils, budget autour de 5 000 €." },
  { from: 'ai', text: "Parfait, je note votre demande. Un collaborateur vous rappellera aujourd'hui. Souhaitez-vous préciser un créneau ?" },
  { from: 'caller', text: "Plutôt en fin d'après-midi." },
  { from: 'ai', text: "C'est noté. Merci pour votre appel, à très bientôt !" },
];

const FAQS = [
  {
    q: "L'IA peut-elle transférer un appel vers mon téléphone ?",
    a: "Oui. Vous définissez des règles de transfert : par mot-clé, par urgence ou par horaire. L'IA redirige l'appel en temps réel vers le numéro de votre choix.",
  },
  {
    q: 'Quelle voix est utilisée ?',
    a: "Nous utilisons ElevenLabs, la référence mondiale en synthèse vocale. La voix est fluide, naturelle et disponible en français. Vous pouvez choisir entre une voix féminine (Sarah) ou masculine (Emmanuel).",
  },
  {
    q: 'Puis-je utiliser plusieurs numéros de téléphone ?',
    a: "Absolument. Vous pouvez configurer autant de numéros que nécessaire. Chaque numéro peut avoir ses propres règles d'accueil et de transfert.",
  },
  {
    q: "Quelles langues sont supportées ?",
    a: "Le répondeur fonctionne en français, anglais, espagnol, allemand et italien. La détection de langue est automatique si vous le souhaitez.",
  },
  {
    q: 'Combien de temps pour le configurer ?',
    a: "Moins de 5 minutes. Vous renseignez votre message d'accueil, vos règles de transfert et c'est parti. Aucune compétence technique requise.",
  },
];

export default function RepondeurPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [missedCalls, setMissedCalls] = useState(15);

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
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>call</span>
            Répondeur IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Ne perdez plus jamais<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>un appel</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Votre standard téléphonique IA répond 24h/24 avec une voix naturelle française. Vos clients sont accueillis, qualifiés et vous recevez un résumé instantané.
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
          Trois étapes simples pour ne plus jamais rater un appel.
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
          Tout ce dont vous avez besoin
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Un répondeur complet qui travaille pour vous, même quand vous dormez.
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

      {/* Temps économisé */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Combien de temps gagnez-vous ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Comparez votre quotidien sans et avec Freenzy.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {/* Sans Freenzy */}
          <div style={{ flex: '1 1 260px', maxWidth: 320, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 44, color: '#ef4444', marginBottom: 16, display: 'block' }}>phone_missed</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#ef4444' }}>Sans Freenzy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>15 min</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>par appel manqué</div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>Rappeler, qualifier, noter</p>
              <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>~4h / semaine</div>
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
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#22c55e' }}>Avec Freenzy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>0 min</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>d&apos;effort</div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>L&apos;IA qualifie + résume + notifie</p>
              <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>4h récupérées</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/ semaine</div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom stat */}
        <div style={{ marginTop: 40, textAlign: 'center', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 16, padding: '24px 28px', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, color: '#fff' }}>
            Sur 1 an = <span style={{ color: '#7c3aed' }}>200+ heures</span> récupérées = <span style={{ color: '#22c55e' }}>~5 000€</span> de productivité
          </div>
        </div>
      </section>

      {/* Demo Conversation */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Exemple de conversation
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Voici ce que vos clients entendent quand ils appellent.
        </p>
        <div style={{ maxWidth: 540, margin: '0 auto', ...cardStyle, padding: '28px 24px' }}>
          {/* Phone header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#fff' }}>call</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Appel entrant</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>+33 1 23 45 67 89 — 14:32</div>
            </div>
            <div style={{ marginLeft: 'auto', background: '#22c55e', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>En cours</div>
          </div>
          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DEMO_MESSAGES.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.from === 'caller' ? 'flex-start' : 'flex-end',
                maxWidth: '82%',
                background: msg.from === 'caller' ? 'rgba(255,255,255,0.07)' : 'rgba(124,58,237,0.15)',
                border: `1px solid ${msg.from === 'caller' ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.25)'}`,
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 14,
                lineHeight: 1.55,
                color: msg.from === 'caller' ? 'rgba(255,255,255,0.85)' : '#fff',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 600 }}>
                  {msg.from === 'caller' ? 'Client' : 'Freenzy IA'}
                </div>
                {msg.text}
              </div>
            ))}
          </div>
          {/* Summary */}
          <div style={{ marginTop: 20, padding: '16px 18px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#22c55e' }}>summarize</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#22c55e' }}>Résumé envoyé par WhatsApp</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              <strong>Contact :</strong> Dupont & Fils<br />
              <strong>Besoin :</strong> Refonte site web (~5 000 €)<br />
              <strong>Rappel :</strong> Fin d&apos;après-midi souhaité<br />
              <strong>Priorité :</strong> Moyenne
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
            Environ <strong style={{ color: '#fff' }}>10 appels entrants</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Pas d&apos;abonnement, pas de frais cachés. Vous payez uniquement ce que vous consommez.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>~5</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits / appel</div>
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

      {/* Sécurité & Conformité — Trust Badges */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 48 }}>
          Confiance & Conformité
        </h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: 'verified_user', label: 'RGPD Confiant', color: '#22c55e' },
            { icon: 'enhanced_encryption', label: 'Données chiffrées', color: '#06b6d4' },
            { icon: 'dns', label: 'Serveurs EU', color: '#7c3aed' },
            { icon: 'fingerprint', label: 'Signature Twilio HMAC', color: '#f59e0b' },
          ].map((badge, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '12px 24px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: badge.color }}>{badge.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout ce que vous devez savoir sur le répondeur IA.
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

      {/* Calculateur de ROI */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Calculateur de ROI
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Estimez combien vous perdez chaque mois en appels manqués.
        </p>
        <div style={{ maxWidth: 600, margin: '0 auto', ...cardStyle, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
            Combien d&apos;appels manqués par mois ?
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <input
              type="range"
              min={1}
              max={100}
              value={missedCalls}
              onChange={(e) => setMissedCalls(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#7c3aed' }}
            />
            <span style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed', minWidth: 50, textAlign: 'right' }}>{missedCalls}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Manque à gagner ({missedCalls} x 85€)</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#ef4444' }}>{(missedCalls * 85).toLocaleString('fr-FR')} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Coût Freenzy ({missedCalls} x 5 cr x 0.05€)</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#7c3aed' }}>{(missedCalls * 5 * 0.05).toFixed(2).replace('.', ',')} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 600 }}>Économie nette / mois</span>
              <span style={{ fontWeight: 800, fontSize: 24, color: '#22c55e' }}>{(missedCalls * 85 - missedCalls * 5 * 0.05).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité & Conformité */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Sécurité & Conformité
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Vos données et celles de vos clients sont protégées à chaque instant.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: 'verified_user', title: 'RGPD conforme', desc: 'Données hébergées en EU' },
            { icon: 'enhanced_encryption', title: 'Chiffrement AES-256', desc: 'Appels et données chiffrés de bout en bout' },
            { icon: 'shield', title: 'Isolation des données', desc: 'Chaque compte est cloisonné' },
            { icon: 'auto_delete', title: 'Pas de rétention', desc: 'Données supprimées après 90 jours' },
          ].map((item, i) => (
            <div key={i} style={{ ...cardStyle, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', textAlign: 'center', padding: '28px 20px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#22c55e', marginBottom: 12, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vs secrétaire traditionnelle */}
      <section style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Vs secrétaire traditionnelle
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Comparez et faites le bon choix pour votre entreprise.
        </p>
        <div style={{ maxWidth: 800, margin: '0 auto', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <thead>
              <tr>
                <th style={{ padding: '18px 20px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Critère</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Secrétaire</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#7c3aed', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Freenzy Répondeur</th>
              </tr>
            </thead>
            <tbody>
              {[
                { criteria: 'Disponibilité', secretary: 'Lun-Ven 9h-18h', freenzy: '24/7/365' },
                { criteria: 'Coût mensuel', secretary: '2 500€+', freenzy: '~15€/mois (300 appels)' },
                { criteria: 'Temps de réponse', secretary: 'Variable', freenzy: '< 2 secondes' },
                { criteria: 'Qualification leads', secretary: 'Manuelle', freenzy: 'Automatique + scoring' },
                { criteria: 'Résumé WhatsApp', secretary: 'Non', freenzy: 'Instantané' },
                { criteria: 'Langues', secretary: '1-2', freenzy: '12+' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{row.criteria}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{row.secretary}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#22c55e' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
                    {row.freenzy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Prêt à ne plus jamais rater un appel ?
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
