'use client';

import React, { useRef, useEffect } from 'react';

interface SMSPreviewProps {
  content: string;
  recipientName?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

export default function SMSPreview({
  content,
  recipientName = 'Contact',
  editable = false,
  onEdit,
}: SMSPreviewProps) {
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
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 320,
      }}
    >
      {/* iMessage-like header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F9F9F9',
        }}
      >
        <span style={{ color: '#007AFF', fontSize: 16, cursor: 'pointer' }}>‹ Messages</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{recipientName}</span>
        <span style={{ color: '#007AFF', fontSize: 18, cursor: 'pointer' }}>ⓘ</span>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: '#FFFFFF',
        }}
      >
        {/* Timestamp */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#8E8E93',
            marginBottom: 4,
          }}
        >
          Aujourd&apos;hui 14:32
        </div>

        {/* Incoming message */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              maxWidth: '75%',
              background: '#E9E9EB',
              borderRadius: '18px 18px 18px 6px',
              padding: '10px 14px',
              fontSize: 15,
              lineHeight: 1.4,
              color: '#1A1A1A',
            }}
          >
            Bonjour, merci pour votre message.
          </div>
        </div>

        {/* Outgoing message (the generated content) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div
            style={{
              maxWidth: '75%',
              background: '#007AFF',
              borderRadius: '18px 18px 6px 18px',
              padding: '10px 14px',
              fontSize: 15,
              lineHeight: 1.4,
              color: '#FFFFFF',
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
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: '#FFFFFF',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  padding: 0,
                  overflow: 'hidden',
                }}
              />
            ) : (
              <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
            )}
          </div>
        </div>

        {/* Delivery status */}
        <div style={{ textAlign: 'right', fontSize: 11, color: '#8E8E93', paddingRight: 4 }}>
          Distribué
        </div>
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '8px 8px',
          borderTop: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#F9F9F9',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#E5E5E5',
            color: '#8E8E93',
            fontSize: 18,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          📷
        </span>
        <div
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 18,
            border: '1px solid #E5E5E5',
            background: '#FFFFFF',
            fontSize: 14,
            color: '#8E8E93',
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          iMessage
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#007AFF',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ↑
        </div>
      </div>
    </div>
  );
}
