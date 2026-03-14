'use client';

import React, { useEffect, useState } from 'react';
import { QuizQuestion } from '../../config/onboarding-config';

interface QuizStepProps {
  question: QuizQuestion;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}

export default function QuizStep({ question, value, onChange }: QuizStepProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [question.id]);

  const handleSingleSelect = (optionId: string) => {
    onChange(optionId);
  };

  const handleMultiToggle = (optionId: string) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(optionId)) {
      onChange(current.filter((v) => v !== optionId));
    } else if (!question.max_select || current.length < question.max_select) {
      onChange([...current, optionId]);
    }
  };

  const selectedArr = Array.isArray(value) ? value : [];
  const selectedSingle = typeof value === 'string' ? value : '';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        {question.title}
      </h2>

      {question.type === 'multi' && question.max_select && (
        <p style={{ fontSize: 13, color: '#9B9B9B', marginBottom: 20 }}>
          {selectedArr.length}/{question.max_select} selectionnes
        </p>
      )}

      {(question.type === 'single' || question.type === 'multi') && question.options && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          {question.options.map((opt) => {
            const isSelected =
              question.type === 'single'
                ? selectedSingle === opt.id
                : selectedArr.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() =>
                  question.type === 'single'
                    ? handleSingleSelect(opt.id)
                    : handleMultiToggle(opt.id)
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 12px',
                  background: isSelected ? '#FAFAFA' : '#FFFFFF',
                  border: isSelected ? '2px solid #1A1A1A' : '1px solid #E5E5E5',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'border-color 0.15s, background 0.15s',
                  minHeight: 90,
                }}
              >
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: 14,
                      color: '#1A1A1A',
                    }}
                  >
                    ✓
                  </span>
                )}
                <span style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span style={{ fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {opt.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || ''}
          style={{
            width: '100%',
            minHeight: 120,
            fontSize: 14,
            color: '#1A1A1A',
            border: '1px solid #E5E5E5',
            borderRadius: 10,
            padding: 16,
            outline: 'none',
            background: '#FAFAFA',
            resize: 'vertical',
            fontFamily: 'inherit',
            marginTop: 16,
          }}
        />
      )}

      {question.skipLabel && (
        <button
          onClick={() => onChange(question.type === 'multi' ? [] : '')}
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#9B9B9B',
            textDecoration: 'underline',
          }}
        >
          {question.skipLabel}
        </button>
      )}
    </div>
  );
}
