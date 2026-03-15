'use client';

import React, { useRef, useEffect } from 'react';

interface TwitterPreviewProps {
  content: string;
  authorName?: string;
  handle?: string;
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

const MAX_CHARS = 280;

function renderTweetText(text: string): React.ReactNode[] {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return (
        <span key={i} style={{ color: '#1D9BF0' }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function TwitterPreview({
  content,
  authorName = 'Vous',
  handle = '@vous',
  editable = false,
  onEdit,
}: TwitterPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  const isOverLimit = content.length > MAX_CHARS;

  const engagements = [
    { icon: '💬', count: '12' },
    { icon: '🔄', count: '34' },
    { icon: '❤️', count: '156' },
    { icon: '📊', count: '2,4K' },
  ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EFF3F4',
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px 0 16px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#CFE8FC',
            color: '#1D9BF0',
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{ fontWeight: 700, fontSize: 15, color: '#0F1419' }}
            >
              {authorName}
            </span>
            <span style={{ fontSize: 15, color: '#536471' }}>
              {handle}
            </span>
            <span style={{ fontSize: 15, color: '#536471' }}>· 2h</span>
          </div>
        </div>
      </div>

      {/* Tweet body */}
      <div style={{ padding: '8px 16px 12px 66px' }}>
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
                fontSize: 15,
                lineHeight: 1.5,
                color: '#0F1419',
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: 13,
                color: isOverLimit ? '#F4212E' : '#536471',
                marginTop: 4,
                fontWeight: isOverLimit ? 600 : 400,
              }}
            >
              {content.length}/{MAX_CHARS}
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              color: '#0F1419',
              whiteSpace: 'pre-wrap',
            }}
          >
            {renderTweetText(content)}
          </div>
        )}
      </div>

      {/* Engagement row */}
      <div
        style={{
          padding: '0 16px 8px 66px',
          display: 'flex',
          gap: 24,
          fontSize: 13,
          color: '#536471',
        }}
      >
        {engagements.map((e) => (
          <span
            key={e.icon}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 15 }}>{e.icon}</span>
            {e.count}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#EFF3F4', margin: '0 16px' }} />

      {/* Bottom actions */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 16,
          fontSize: 14,
          color: '#536471',
        }}
      >
        <span style={{ cursor: 'pointer' }}>🔖</span>
        <span style={{ cursor: 'pointer' }}>📤</span>
      </div>
    </div>
  );
}
