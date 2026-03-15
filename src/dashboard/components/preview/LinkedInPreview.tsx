'use client';

import React, { useRef, useEffect } from 'react';

interface LinkedInPreviewProps {
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

const MAX_LINES_COLLAPSED = 5;
const CHAR_PER_LINE_APPROX = 55;

export default function LinkedInPreview({
  content,
  authorName = 'Vous',
  editable = false,
  onEdit,
}: LinkedInPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = React.useState(false);

  const isTruncated =
    !expanded && content.length > MAX_LINES_COLLAPSED * CHAR_PER_LINE_APPROX;
  const displayText = isTruncated
    ? content.slice(0, MAX_LINES_COLLAPSED * CHAR_PER_LINE_APPROX)
    : content;

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  const reactions = [
    { icon: '👍', label: "J'aime" },
    { icon: '💬', label: 'Commenter' },
    { icon: '🔄', label: 'Partager' },
    { icon: '📨', label: 'Envoyer' },
  ];

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
      {/* Author header */}
      <div style={{ padding: '12px 16px 0 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#DDE7F0',
            color: '#0A66C2',
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
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{authorName}</div>
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>1st · 1h · 🌐</div>
        </div>
        <div style={{ color: '#6B6B6B', fontSize: 20, cursor: 'pointer' }}>···</div>
      </div>

      {/* Post body */}
      <div style={{ padding: '12px 16px' }}>
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
                fontSize: 14,
                lineHeight: 1.5,
                color: '#1A1A1A',
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#9B9B9B', marginTop: 4 }}>
              {content.length} caractères
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, lineHeight: 1.5, color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>
            {displayText}
            {isTruncated && (
              <span
                onClick={() => setExpanded(true)}
                style={{ color: '#6B6B6B', cursor: 'pointer', fontWeight: 500 }}
              >
                ...voir plus
              </span>
            )}
          </div>
        )}
      </div>

      {/* Engagement counts */}
      <div
        style={{
          padding: '0 16px 8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#6B6B6B',
        }}
      >
        <span>👍 12</span>
        <span>3 commentaires · 1 partage</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#E5E5E5', margin: '0 16px' }} />

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          padding: '4px 8px',
        }}
      >
        {reactions.map((r) => (
          <button
            key={r.label}
            type="button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 0',
              minHeight: 44,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: '#6B6B6B',
              fontWeight: 500,
              borderRadius: 4,
            }}
          >
            <span style={{ fontSize: 16 }}>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
