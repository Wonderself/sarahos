'use client';

import type { WorkflowStep } from '../../lib/studio-workflows';

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export default function WorkflowStepper({ steps, currentStep, onStepClick }: WorkflowStepperProps) {
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3, borderRadius: 10,
      background: '#f3f4f6', overflowX: 'auto',
    }}>
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        const isRoadmap = step.type === 'roadmap';

        return (
          <button
            key={step.id}
            onClick={() => onStepClick?.(i)}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none',
              cursor: onStepClick ? 'pointer' : 'default',
              background: isActive ? 'white' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontFamily: 'inherit', fontSize: 11, textAlign: 'center',
              color: isActive ? '#1d1d1f' : isDone ? '#10b981' : isRoadmap ? '#d97706' : '#9ca3af',
              fontWeight: isActive ? 600 : 400,
              opacity: isRoadmap ? 0.6 : 1,
              transition: 'all 0.15s',
              minWidth: 70,
            }}
          >
            <div style={{ fontSize: 10, marginBottom: 2 }}>
              {isDone ? <span className="material-symbols-rounded" style={{ fontSize: 10 }}>check</span> : isRoadmap ? <span className="material-symbols-rounded" style={{ fontSize: 10 }}>hourglass_empty</span> : `${i + 1}`}
            </div>
            <div>{step.title}</div>
          </button>
        );
      })}
    </div>
  );
}
