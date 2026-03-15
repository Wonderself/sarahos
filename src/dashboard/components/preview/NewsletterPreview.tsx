'use client';

import React, { useRef, useEffect } from 'react';

interface NewsletterPreviewProps {
  content: string;
  subject?: string;
  brandColor?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

export default function NewsletterPreview({
  content,
  subject = 'Les dernières actualités de votre entreprise',
  brandColor = '#1A1A1A',
  editable = false,
  onEdit,
}: NewsletterPreviewProps) {
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
        background: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #E5E5E5',
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: brandColor,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              📰
            </div>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              Newsletter
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Hero */}
        <div style={{ padding: '28px 24px 16px 24px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1A1A1A',
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {subject}
          </div>
          <div style={{ fontSize: 14, color: '#6B6B6B' }}>
            Découvrez nos dernières nouvelles et ressources
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#E5E5E5', margin: '0 24px' }} />

        {/* Content body */}
        <div style={{ padding: '20px 24px' }}>
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
                lineHeight: 1.7,
                color: '#333333',
                fontFamily: 'Georgia, "Times New Roman", serif',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: '#333333',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              {content}
            </div>
          )}
        </div>

        {/* CTA button */}
        <div style={{ padding: '8px 24px 24px 24px', textAlign: 'center' }}>
          <button
            type="button"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: brandColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Découvrir →
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#E5E5E5', margin: '0 24px' }} />

        {/* Footer */}
        <div style={{ padding: '16px 24px', textAlign: 'center' }}>
          {/* Social icons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 12,
              fontSize: 18,
            }}
          >
            <span>📘</span>
            <span>🐦</span>
            <span>📸</span>
          </div>
          <div style={{ fontSize: 12, color: '#9B9B9B', lineHeight: 1.8 }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Se désabonner
            </span>
            {' · '}
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Politique de confidentialité
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
