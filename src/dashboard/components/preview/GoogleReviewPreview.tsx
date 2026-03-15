'use client';

import React, { useRef, useEffect } from 'react';

interface GoogleReviewPreviewProps {
  content: string;
  stars?: number;
  reviewText?: string;
  businessName?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

function StarRow({ count }: { count: number }) {
  const stars: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          fontSize: 16,
          color: i <= count ? '#FBBC04' : '#DADCE0',
          marginRight: 1,
        }}
      >
        ★
      </span>
    );
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{stars}</span>;
}

export default function GoogleReviewPreview({
  content,
  stars = 4,
  reviewText = "Très bon service, je recommande vivement.",
  businessName = 'Mon Entreprise',
  editable = false,
  onEdit,
}: GoogleReviewPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #DADCE0',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Google Business header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #DADCE0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#4285F4',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{businessName}</div>
          <div style={{ fontSize: 12, color: '#5F6368' }}>Google Avis</div>
        </div>
      </div>

      {/* Original review */}
      <div
        style={{
          margin: '12px 16px',
          padding: 12,
          background: '#F8F9FA',
          borderRadius: 8,
          border: '1px solid #E8EAED',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#DADCE0',
              color: '#5F6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            C
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Client</div>
            <StarRow count={stars} />
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: '#5F6368',
            fontStyle: 'italic',
            whiteSpace: 'pre-wrap',
          }}
        >
          {reviewText}
        </div>
      </div>

      {/* Owner response */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 600,
            color: '#4285F4',
          }}
        >
          <span>↳</span>
          <span>Réponse du propriétaire</span>
        </div>

        <div
          style={{
            padding: 12,
            background: '#FFFFFF',
            border: '1px solid #E8EAED',
            borderRadius: 8,
            borderLeft: '3px solid #4285F4',
          }}
        >
          {editable ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onEdit?.(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                lineHeight: 1.5,
                color: '#1A1A1A',
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: '#1A1A1A',
                whiteSpace: 'pre-wrap',
              }}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
