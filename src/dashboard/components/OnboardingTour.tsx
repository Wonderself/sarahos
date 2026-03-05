'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TOUR_DONE_KEY = 'fz_tour_done';

interface TourStep {
  emoji: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: '🏠',
    title: 'Votre tableau de bord',
    description: 'C\'est votre quartier général. Briefing du jour, crédits, activité récente et résumé de vos agents — tout en un coup d\'œil.',
    href: '/client/dashboard',
    cta: 'Voir mon dashboard',
  },
  {
    emoji: '💬',
    title: 'Discutez avec vos agents',
    description: 'Le Chat est le cœur de Freenzy. Choisissez un agent et posez-lui n\'importe quelle question — il répond en temps réel.',
    href: '/client/chat',
    cta: 'Ouvrir le Chat',
  },
  {
    emoji: '👥',
    title: 'Votre équipe d\'agents',
    description: '24 agents IA spécialisés. Activez ou désactivez ceux qui correspondent à vos besoins, explorez le marketplace pour en ajouter.',
    href: '/client/personal',
    cta: 'Gérer mes agents',
  },
  {
    emoji: '🎨',
    title: 'Personnalisez vos agents',
    description: 'Ajustez la personnalité, les instructions et le style de chaque agent. Plus ils sont configurés, plus ils sont efficaces.',
    href: '/client/agents/customize',
    cta: 'Personnaliser',
  },
  {
    emoji: '📄',
    title: 'Partagez vos documents',
    description: 'Uploadez vos documents d\'entreprise — vos agents les utilisent pour contextualiser leurs réponses. Jusqu\'à 50 MB.',
    href: '/client/documents',
    cta: 'Uploader un document',
  },
  {
    emoji: '📞',
    title: 'Répondeur Intelligent',
    description: 'Votre secrétaire IA répond à vos appels, SMS et WhatsApp. Configurez les plages horaires et les règles de réponse.',
    href: '/client/repondeur',
    cta: 'Configurer le Répondeur',
  },
  {
    emoji: '👤',
    title: 'Votre compte & crédits',
    description: 'Gérez votre solde de crédits, configurez la recharge automatique, et invitez des amis pour gagner de la commission.',
    href: '/client/account',
    cta: 'Voir mon compte',
  },
  {
    emoji: '🛒',
    title: 'Le Marketplace',
    description: '48 templates d\'agents prêts à l\'emploi. Installez en 1 clic les agents adaptés à votre secteur d\'activité.',
    href: '/client/marketplace',
    cta: 'Explorer le Marketplace',
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const done = localStorage.getItem(TOUR_DONE_KEY);
      if (!done) {
        // Delay 1.5s to not appear immediately
        const t = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(t);
      }
    } catch { /* */ }
  }, []);

  function close(completed = false) {
    setIsOpen(false);
    if (completed) {
      try { localStorage.setItem(TOUR_DONE_KEY, 'true'); } catch { /* */ }
    }
  }

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      close(true);
    }
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  function skip() {
    close(true);
  }

  if (!mounted || !isOpen) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        backdropFilter: 'blur(2px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) skip(); }}
    >
      <div
        style={{
          background: 'var(--bg-primary)', borderRadius: 20, padding: '36px 32px',
          maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          border: '1px solid var(--border-primary)', position: 'relative',
          animation: 'fadeInUp 0.3s ease',
        }}
      >
        {/* Close */}
        <button
          onClick={skip}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: 20, lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)60' : 'var(--border-primary)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Étape {step + 1} / {TOUR_STEPS.length}
        </div>

        {/* Emoji */}
        <div style={{ textAlign: 'center', fontSize: 52, marginBottom: 20 }}>{current.emoji}</div>

        {/* Title */}
        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 12, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>
          {current.description}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {step > 0 && (
            <button onClick={prev} className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }}>
              ← Retour
            </button>
          )}
          <Link
            href={current.href}
            onClick={() => next()}
            className="btn btn-primary"
            style={{ flex: 2, textAlign: 'center', textDecoration: 'none', fontSize: 14 }}
          >
            {current.cta} →
          </Link>
          <button onClick={next} className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }}>
            {isLast ? 'Terminer ✅' : 'Suivant →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={skip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-tertiary)' }}>
              Passer le tour d&apos;introduction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-usable trigger component to restart the tour
export function TourRestartButton() {
  function restart() {
    try { localStorage.removeItem(TOUR_DONE_KEY); window.location.reload(); } catch { /* */ }
  }
  return (
    <button onClick={restart} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
      🗺️ Reprendre le tour
    </button>
  );
}
