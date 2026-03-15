'use client';

import React, { useRef, useEffect } from 'react';

interface InstagramPreviewProps {
  content: string;
  authorName?: string;
  imageUrl?: string;
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

const MAX_CAPTION_LINES = 3;
const CHAR_PER_LINE_APPROX = 50;

export default function InstagramPreview({
  content,
  authorName = 'freenzy.io',
  imageUrl,
  editable = false,
  onEdit,
}: InstagramPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = React.useState(false);

  const isTruncated =
    !expanded && content.length > MAX_CAPTION_LINES * CHAR_PER_LINE_APPROX;
  const displayText = isTruncated
    ? content.slice(0, MAX_CAPTION_LINES * CHAR_PER_LINE_APPROX)
    : content;

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  // Extract hashtags from content for blue coloring
  const renderCaption = (text: string): React.ReactNode => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} style={{ color: '#00376B' }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

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
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Avatar with gradient ring */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
            padding: 2,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#FAFAFA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#1A1A1A',
            }}
          >
            {getInitials(authorName)}
          </div>
        </div>

        {/* Username */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>
            {authorName}
          </span>
          <span style={{ color: '#9B9B9B', fontSize: 13 }}>•</span>
          <span
            style={{
              color: '#0095F6',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Suivre
          </span>
        </div>

        {/* Menu */}
        <span style={{ color: '#1A1A1A', fontSize: 18, cursor: 'pointer', letterSpacing: 2 }}>
          ···
        </span>
      </div>

      {/* Image area */}
      <div
        style={{
          width: '100%',
          paddingBottom: '100%',
          position: 'relative',
          background: imageUrl ? 'transparent' : '#F0F0F0',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Publication Instagram"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              color: '#FFFFFF',
            }}
          >
            <span style={{ fontSize: 48, marginBottom: 8 }}>📷</span>
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
              Image générée par l&apos;IA
            </span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div
        style={{
          padding: '10px 12px 6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>♡</span>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>💬</span>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>📤</span>
        </div>
        <span style={{ fontSize: 22, cursor: 'pointer' }}>🔖</span>
      </div>

      {/* Likes */}
      <div style={{ padding: '0 12px 4px 12px' }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>
          123 J&apos;aime
        </span>
      </div>

      {/* Caption */}
      <div style={{ padding: '0 12px 8px 12px' }}>
        {editable ? (
          <>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A', marginRight: 6 }}>
                {authorName}
              </span>
            </div>
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
            <div style={{ textAlign: 'right', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
              {content.length} caractères
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, lineHeight: 1.4, color: '#1A1A1A' }}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>{authorName}</span>
            <span style={{ whiteSpace: 'pre-wrap' }}>{renderCaption(displayText)}</span>
            {isTruncated && (
              <span
                onClick={() => setExpanded(true)}
                style={{ color: '#9B9B9B', cursor: 'pointer', fontSize: 13 }}
              >
                ...plus
              </span>
            )}
          </div>
        )}
      </div>

      {/* Comments link */}
      <div style={{ padding: '0 12px 4px 12px' }}>
        <span style={{ fontSize: 13, color: '#9B9B9B', cursor: 'pointer' }}>
          Voir les 12 commentaires
        </span>
      </div>

      {/* Timestamp */}
      <div style={{ padding: '0 12px 10px 12px' }}>
        <span style={{ fontSize: 10, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Il y a 2 heures
        </span>
      </div>
    </div>
  );
}
