'use client';

import React from 'react';

interface Step {
  label: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  steps: Step[];
  onComplete: (stepIndex: number) => void;
}

export default function OnboardingChecklist({ steps, onComplete }: OnboardingChecklistProps) {
  if (steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const allDone = completedCount === steps.length;

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
          🚀 Prise en main
        </h2>
        <span style={{ fontSize: 12, color: '#9B9B9B' }}>
          {completedCount}/{steps.length} terminé{completedCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: '#E5E5E5',
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 3,
            background: allDone ? '#38A169' : '#1A1A1A',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!step.completed) onComplete(idx);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #E5E5E5',
              background: step.completed ? '#FAFAFA' : '#FFFFFF',
              cursor: step.completed ? 'default' : 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: step.completed ? 'none' : '2px solid #E5E5E5',
                background: step.completed ? '#38A169' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              {step.completed ? '✓' : ''}
            </span>
            <span
              style={{
                fontSize: 13,
                color: step.completed ? '#9B9B9B' : '#1A1A1A',
                textDecoration: step.completed ? 'line-through' : 'none',
              }}
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
