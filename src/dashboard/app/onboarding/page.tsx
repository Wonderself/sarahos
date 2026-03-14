'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QuizStep from '../../components/onboarding/QuizStep';
import {
  QUIZ_CONFIG,
  getAdaptiveQ2,
  getAdaptiveQ3,
  QuizQuestion,
} from '../../config/onboarding-config';

type Answers = Record<string, string | string[]>;

export default function OnboardingPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Build the dynamic question sequence based on answers
  const buildQuestions = useCallback((): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const profession = String(answers['q1_profession'] || '');

    // Q1 — always
    questions.push(QUIZ_CONFIG[0]);

    // Q2 — adaptive
    if (profession) {
      const q2 = getAdaptiveQ2(profession);
      if (q2) questions.push(q2);
    }

    // Q3 — objectives
    if (profession) {
      questions.push(getAdaptiveQ3(profession));
    }

    // Q4 — AI level (always)
    const q4 = QUIZ_CONFIG.find((q) => q.id === 'q4_ai_level');
    if (q4) questions.push(q4);

    // Q5 — Tools (conditional)
    const q5 = QUIZ_CONFIG.find((q) => q.id === 'q5_tools');
    if (q5 && (!q5.condition || q5.condition(answers))) {
      questions.push(q5);
    }

    // Q6 — Notifications (always)
    const q6 = QUIZ_CONFIG.find((q) => q.id === 'q6_notifications');
    if (q6) questions.push(q6);

    // Q7 — Custom (conditional)
    const q7 = QUIZ_CONFIG.find((q) => q.id === 'q7_custom');
    if (q7 && (!q7.condition || q7.condition(answers))) {
      questions.push(q7);
    }

    return questions;
  }, [answers]);

  const questions = buildQuestions();
  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;

  const currentValue = currentQuestion ? answers[currentQuestion.id] || (currentQuestion.type === 'multi' ? [] : '') : '';

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'single') return !!currentValue;
    if (currentQuestion.type === 'multi') return true; // can skip multi
    if (currentQuestion.type === 'text') return true; // can skip text
    return false;
  };

  const handleChange = (val: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      setCompleted(true);
      setTimeout(() => {
        router.push('/dashboard?welcome=true');
      }, 2000);
    } catch (err) {
      console.error('Onboarding completion error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Confetti-like dots for completion screen
  const [dots, setDots] = useState<Array<{ x: number; y: number; color: string; size: number }>>([]);
  useEffect(() => {
    if (completed) {
      const colors = ['#1A1A1A', '#E5E5E5', '#6B6B6B', '#FAFAFA', '#9B9B9B'];
      const newDots = Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
      }));
      setDots(newDots);
    }
  }, [completed]);

  if (completed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {dots.map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: dot.color,
              opacity: 0.5,
              animation: `confettiFall 2s ease-out ${i * 0.05}s forwards`,
            }}
          />
        ))}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
            Votre espace est pret !
          </h1>
          <p style={{ fontSize: 15, color: '#6B6B6B' }}>Redirection vers votre tableau de bord...</p>
        </div>
        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(-20px) scale(0); opacity: 0; }
            50% { opacity: 0.7; }
            100% { transform: translateY(20px) scale(1); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        {/* Header */}
        <div
          style={{
            borderBottom: '1px solid #E5E5E5',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>freenzy.io</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#6B6B6B' }}>Etape 3/4</span>
            <div style={{ width: 120, height: 4, background: '#E5E5E5', borderRadius: 2 }}>
              <div style={{ width: '75%', height: '100%', background: '#1A1A1A', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 24 }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
            Derniere etape avant votre tableau de bord
          </h1>
          <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 8 }}>
            Quelques questions pour personnaliser votre experience
          </p>
          <p style={{ fontSize: 14, color: '#9B9B9B', marginBottom: 40 }}>
            3 a 5 questions — moins de 2 minutes
          </p>
          <button
            onClick={() => setStarted(true)}
            style={{
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Commencer →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #E5E5E5',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>freenzy.io</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6B6B6B' }}>Etape 3/4</span>
          <div style={{ width: 120, height: 4, background: '#E5E5E5', borderRadius: 2 }}>
            <div style={{ width: '75%', height: '100%', background: '#1A1A1A', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Progress within quiz */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '8px 24px 0' }}>
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 4,
          }}
        >
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= currentStep ? '#1A1A1A' : '#E5E5E5',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'right', margin: 0 }}>
          {currentStep + 1}/{totalSteps}
        </p>
      </div>

      {/* Question content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px 100px' }}>
        {currentQuestion && (
          <QuizStep
            question={currentQuestion}
            value={currentValue}
            onChange={handleChange}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #E5E5E5',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          style={{
            background: 'none',
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            color: currentStep === 0 ? '#9B9B9B' : '#1A1A1A',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1,
          }}
        >
          Retour
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || submitting}
          style={{
            background: canProceed() ? '#1A1A1A' : '#E5E5E5',
            color: canProceed() ? '#FFFFFF' : '#9B9B9B',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: canProceed() && !submitting ? 'pointer' : 'not-allowed',
          }}
        >
          {currentStep === totalSteps - 1
            ? submitting
              ? 'Finalisation...'
              : 'Terminer'
            : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}
