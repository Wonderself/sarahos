'use client';

import React, { useRef, useEffect } from 'react';

interface EmailPreviewProps {
  content: string;
  subject?: string;
  from?: string;
  to?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

export default function EmailPreview({
  content,
  subject = '(Sans objet)',
  from = 'moi@freenzy.io',
  to = 'destinataire@email.com',
  editable = false,
  onEdit,
}: EmailPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  const iconBtn = (label: string) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 4,
        cursor: 'pointer',
        color: '#5F6368',
        fontSize: 14,
      }}
    >
      {label}
    </span>
  );

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #DADCE0',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      {/* Gmail-like title bar */}
      <div
        style={{
          background: '#F2F6FC',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #DADCE0',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
          Nouveau message
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {iconBtn('—')}
          {iconBtn('⤢')}
          {iconBtn('✕')}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '0 12px' }}>
        {/* De */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #F1F3F4',
            fontSize: 13,
          }}
        >
          <span style={{ color: '#5F6368', width: 40, flexShrink: 0 }}>De :</span>
          <span style={{ color: '#1A1A1A' }}>{from}</span>
        </div>

        {/* À */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #F1F3F4',
            fontSize: 13,
          }}
        >
          <span style={{ color: '#5F6368', width: 40, flexShrink: 0 }}>À :</span>
          <span style={{ color: '#1A1A1A' }}>{to}</span>
        </div>

        {/* Objet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #F1F3F4',
            fontSize: 13,
          }}
        >
          <span style={{ color: '#5F6368', width: 50, flexShrink: 0 }}>Objet :</span>
          <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{subject}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 12px', minHeight: 160 }}>
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
              lineHeight: 1.6,
              color: '#1A1A1A',
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
              lineHeight: 1.6,
              color: '#1A1A1A',
              fontFamily: 'Georgia, "Times New Roman", serif',
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #F1F3F4',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <button
          type="button"
          style={{
            background: '#1A73E8',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 18,
            padding: '8px 22px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            minHeight: 36,
          }}
        >
          Envoyer
        </button>
        <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
          {['B', 'I', 'U', '🔗'].map((icon) => (
            <span
              key={icon}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 4,
                fontSize: 14,
                fontWeight: icon === 'B' ? 700 : icon === 'I' ? 400 : 400,
                fontStyle: icon === 'I' ? 'italic' : 'normal',
                textDecoration: icon === 'U' ? 'underline' : 'none',
                color: '#5F6368',
                cursor: 'pointer',
              }}
            >
              {icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
