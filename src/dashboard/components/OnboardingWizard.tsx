'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.ReactNode;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

const STORAGE_KEY_PROGRESS = 'sarah_onboarding_progress';
const STORAGE_KEY_DONE = 'sarah_onboarding_done';

export default function OnboardingWizard({ steps, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confettiDots, setConfettiDots] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; size: number }>>([]);

  // Load saved progress
  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY_DONE);
      if (done === 'true') {
        onComplete();
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= 0 && idx < steps.length) {
          setCurrentStep(idx);
        }
      }
    } catch { /* localStorage unavailable */ }
  }, [steps.length, onComplete]);

  // Save progress on step change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, String(currentStep));
    } catch { /* */ }
  }, [currentStep]);

  const goToStep = useCallback((nextStep: number, dir: 'forward' | 'backward') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsAnimating(false);
    }, 250);
  }, [isAnimating]);

  function handleNext() {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1, 'forward');
    } else {
      handleComplete();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      goToStep(currentStep - 1, 'backward');
    }
  }

  function handleComplete() {
    try {
      localStorage.setItem(STORAGE_KEY_DONE, 'true');
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch { /* */ }

    // Generate confetti dots
    const dots = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#16a34a', '#2563eb'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1.5,
      size: 4 + Math.random() * 8,
    }));
    setConfettiDots(dots);
    setCompleted(true);
  }

  function handleSkip() {
    try {
      localStorage.setItem(STORAGE_KEY_DONE, 'true');
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch { /* */ }
    onSkip();
  }

  const progressPct = steps.length > 1
    ? Math.round((currentStep / (steps.length - 1)) * 100)
    : 100;

  const step = steps[currentStep];

  // Completion celebration screen
  if (completed) {
    return (
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        padding: 40,
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
      }}>
        {/* Confetti dots */}
        {confettiDots.map(dot => (
          <span
            key={dot.id}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: dot.color,
              opacity: 0,
              animation: `confettiFade 2s ease-out ${dot.delay}s forwards`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Configuration terminee !
        </h2>
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: 400,
          marginBottom: 24,
          lineHeight: 1.6,
        }}>
          Votre espace SARAH OS est pret. Vous pouvez maintenant profiter de toutes les fonctionnalites.
        </p>
        <button
          onClick={onComplete}
          style={{
            padding: '10px 32px',
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          Commencer
        </button>

        <style>{`
          @keyframes confettiFade {
            0% { opacity: 0; transform: scale(0) translateY(0); }
            30% { opacity: 1; transform: scale(1.2) translateY(-10px); }
            100% { opacity: 0; transform: scale(0.8) translateY(30px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-primary)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Header with progress */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        {/* Step indicator circles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  background: i < currentStep
                    ? 'var(--accent)'
                    : i === currentStep
                      ? 'var(--accent)'
                      : 'var(--bg-tertiary)',
                  color: i <= currentStep ? '#fff' : 'var(--text-muted)',
                  border: i === currentStep
                    ? '2px solid var(--accent)'
                    : i < currentStep
                      ? '2px solid var(--accent)'
                      : '2px solid var(--border-secondary)',
                }}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 32,
                  height: 2,
                  background: i < currentStep ? 'var(--accent)' : 'var(--border-secondary)',
                  transition: 'background 0.3s ease',
                  margin: '0 4px',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step counter and progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 13,
            color: 'var(--text-tertiary)',
            fontWeight: 500,
          }}>
            Etape {currentStep + 1} sur {steps.length}
          </span>
          <span style={{
            fontSize: 13,
            color: 'var(--accent)',
            fontWeight: 600,
          }}>
            {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: 4,
          background: 'var(--bg-tertiary)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Step content */}
      <div style={{
        padding: '24px',
        minHeight: 300,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          style={{
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform: isAnimating
              ? direction === 'forward'
                ? 'translateX(-30px)'
                : 'translateX(30px)'
              : 'translateX(0)',
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {/* Step header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 24 }}>{step.icon}</span>
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              {step.title}
            </h3>
          </div>

          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 20,
            marginTop: 0,
          }}>
            {step.description}
          </p>

          {/* Custom component slot */}
          <div>{step.component}</div>
        </div>
      </div>

      {/* Footer with navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
      }}>
        {/* Skip link */}
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '4px 8px',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Passer
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Previous button */}
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              style={{
                padding: '8px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
            >
              Precedent
            </button>
          )}

          {/* Next / Complete button */}
          <button
            onClick={handleNext}
            style={{
              padding: '8px 24px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
