'use client';

import React, { useRef, useEffect } from 'react';

interface WhatsAppPreviewProps {
  content: string;
  recipientName?: string;
  recipientPhone?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function WhatsAppPreview({
  content,
  recipientName = 'Client',
  recipientPhone = '+33 6 12 34 56 78',
  editable = false,
  onEdit,
}: WhatsAppPreviewProps) {
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
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: '#075E54',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Back arrow */}
        <span style={{ color: '#FFFFFF', fontSize: 18, cursor: 'pointer' }}>←</span>

        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#128C7E',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {getInitials(recipientName)}
        </div>

        {/* Contact info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#FFFFFF' }}>
            {recipientName}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>en ligne</div>
        </div>

        {/* Decorative icons */}
        <span style={{ color: '#FFFFFF', fontSize: 18, marginLeft: 4 }}>📹</span>
        <span style={{ color: '#FFFFFF', fontSize: 18 }}>📞</span>
        <span style={{ color: '#FFFFFF', fontSize: 16 }}>⋮</span>
      </div>

      {/* Chat area with WhatsApp wallpaper */}
      <div
        style={{
          background: '#ECE5DD',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 40px)',
          padding: '16px 12px',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Date chip */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 11,
              color: '#6B6B6B',
              fontWeight: 500,
            }}
          >
            Aujourd&apos;hui
          </span>
        </div>

        {/* Incoming message */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingRight: 48 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '0 8px 8px 8px',
              padding: '6px 10px 4px 10px',
              maxWidth: '85%',
              position: 'relative',
              boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.4 }}>
              Bonjour, je souhaite en savoir plus sur vos services.
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: 11, color: '#9B9B9B' }}>14:30</span>
            </div>
          </div>
        </div>

        {/* Outgoing message (the generated content) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 48 }}>
          <div
            style={{
              background: '#DCF8C6',
              borderRadius: '8px 0 8px 8px',
              padding: '6px 10px 4px 10px',
              maxWidth: '85%',
              position: 'relative',
              boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
            }}
          >
            {editable ? (
              <>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => onEdit?.(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: '#1A1A1A',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    padding: 0,
                    overflow: 'hidden',
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>
                  {content.length} caractères
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                {content}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: 11, color: '#9B9B9B' }}>14:32</span>
              <span style={{ fontSize: 12, color: '#4FC3F7' }}>✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom input bar */}
      <div
        style={{
          background: '#F0F0F0',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20, cursor: 'pointer' }}>😊</span>
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '8px 16px',
            fontSize: 14,
            color: '#9B9B9B',
          }}
        >
          Écrire un message
        </div>
        <span style={{ fontSize: 18, cursor: 'pointer', color: '#6B6B6B' }}>📎</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16, color: '#FFFFFF' }}>🎤</span>
        </div>
      </div>
    </div>
  );
}
