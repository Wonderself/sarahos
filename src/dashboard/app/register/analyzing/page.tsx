'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisStep {
  emoji: string;
  label: string;
  progress: number;
}

const STEPS: AnalysisStep[] = [
  { emoji: '\uD83D\uDD0D', label: 'Recherche de votre entreprise...', progress: 0 },
  { emoji: '\uD83D\uDCCD', label: 'Vérification de votre adresse...', progress: 20 },
  { emoji: '\u2B50', label: 'Analyse de votre présence Google...', progress: 40 },
  { emoji: '\uD83D\uDC65', label: 'Identification de vos concurrents locaux...', progress: 60 },
  { emoji: '\uD83D\uDCCA', label: 'Compilation de votre profil métier...', progress: 80 },
  { emoji: '\u2705', label: 'Profil prêt à valider !', progress: 100 },
];

export default function RegisterAnalyzing() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const fetchDone = useRef(false);

  // Fire the intelligence gather API call on mount
  useEffect(() => {
    if (fetchDone.current) return;
    fetchDone.current = true;

    const raw = sessionStorage.getItem('freenzy_register_step1');
    if (!raw) {
      router.push('/register/step1');
      return;
    }

    let input: Record<string, string>;
    try {
      input = JSON.parse(raw);
    } catch {
      router.push('/register/step1');
      return;
    }

    fetch('/api/intelligence-gather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          sessionStorage.setItem('freenzy_intelligence_result', JSON.stringify(json.data));
        }
      })
      .catch(() => {
        // Graceful degradation: continue animation even if fetch fails
      });
  }, [router]);

  // Step progression timers
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i < STEPS.length; i++) {
      timers.push(setTimeout(() => setCurrentStep(i), i * 2000));
    }

    // Redirect after last step
    timers.push(setTimeout(() => {
      router.push('/register/validate-profile');
    }, 11000));

    return () => timers.forEach(clearTimeout);
  }, [router]);

  const step = STEPS[currentStep];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
      `}</style>

      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: 32,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.3px',
        }}>
          freenzy.io
        </div>
      </div>

      {/* Pulsing circle */}
      <div style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        animation: 'pulse 2s ease-in-out infinite',
        marginBottom: 32,
      }}>
        {step.emoji}
      </div>

      {/* Current step text */}
      <div style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
        minHeight: 28,
      }}>
        {step.emoji} {step.label}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 24,
      }}>
        <div style={{
          height: '100%',
          width: `${step.progress}%`,
          backgroundColor: '#FFFFFF',
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Percentage */}
      <div style={{
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 12,
      }}>
        {step.progress}%
      </div>

      {/* Previous steps */}
      <div style={{
        marginTop: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        maxWidth: 400,
      }}>
        {STEPS.slice(0, currentStep).map((s, i) => (
          <div key={i} style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'\u2713'}</span>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
