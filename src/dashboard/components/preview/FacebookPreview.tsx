'use client';

import React, { useRef, useEffect } from 'react';

interface FacebookPreviewProps {
  content: string;
  authorName?: string;
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

export default function FacebookPreview({
  content,
  authorName = 'Vous',
  editable = false,
  onEdit,
}: FacebookPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  const actions = [
    { icon: '👍', label: "J'aime" },
    { icon: '💬', label: 'Commenter' },
    { icon: '↗️', label: 'Partager' },
  ];

  return (
    <div
      style={{
        background: '#F0F2F5',
        borderRadius: 8,
        padding: 12,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {/* Author header */}
        <div
          style={{
            padding: '12px 16px 0 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#E7F3FF',
              color: '#1877F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {getInitials(authorName)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#050505' }}>
              {authorName}
            </div>
            <div style={{ fontSize: 12, color: '#65676B' }}>
              Il y a 2 heures · 🌐
            </div>
          </div>
          <div
            style={{
              color: '#65676B',
              fontSize: 20,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '50%',
            }}
          >
            ···
          </div>
        </div>

        {/* Post body */}
        <div style={{ padding: '12px 16px' }}>
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
                lineHeight: 1.6,
                color: '#050505',
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: '#050505',
                whiteSpace: 'pre-wrap',
              }}
            >
              {content}
            </div>
          )}
        </div>

        {/* Engagement counts */}
        <div
          style={{
            padding: '0 16px 8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#65676B',
          }}
        >
          <span>👍😂❤️ 47</span>
          <span>12 commentaires · 3 partages</span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#E5E5E5', margin: '0 16px' }} />

        {/* Action bar */}
        <div style={{ display: 'flex', padding: '4px 8px' }}>
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 0',
                minHeight: 44,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: '#65676B',
                fontWeight: 600,
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
