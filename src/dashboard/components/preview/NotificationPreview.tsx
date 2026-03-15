'use client';

import React, { useRef, useEffect } from 'react';

interface NotificationPreviewProps {
  content: string;
  appName?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

export default function NotificationPreview({
  content,
  appName = 'Freenzy',
  editable = false,
  onEdit,
}: NotificationPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  // Split content: first line = title, rest = body
  const lines = content.split('\n');
  const notifTitle = lines[0] || 'Nouvelle notification';
  const notifBody = lines.slice(1).join(' ').trim() || '';

  // Faint app icon grid for home screen mockup
  const appIcons = ['📷', '🎵', '📱', '💬', '🗺️', '⚙️', '📧', '🌐', '📅', '💰', '🎮', '📝'];

  return (
    <div
      style={{
        background: '#1C1C1E',
        borderRadius: 36,
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        padding: '0 4px',
        maxWidth: 380,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Dynamic Island / Notch */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 10,
          paddingBottom: 4,
        }}
      >
        <div
          style={{
            width: 120,
            height: 28,
            borderRadius: 20,
            background: '#000000',
          }}
        />
      </div>

      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 24px 8px 24px',
          fontSize: 14,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        <span>14:32</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12 }}>
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Notification card */}
      <div style={{ padding: '8px 12px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            borderRadius: 14,
            padding: '12px 14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          {/* App icon + name + time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              🤖
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                flex: 1,
              }}
            >
              {appName}
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              maintenant
            </span>
          </div>

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
                fontSize: 13,
                lineHeight: 1.4,
                color: '#FFFFFF',
                fontFamily: 'inherit',
                background: 'transparent',
                padding: 0,
                overflow: 'hidden',
              }}
            />
          ) : (
            <>
              {/* Title */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: 2,
                }}
              >
                {notifTitle}
              </div>
              {/* Body */}
              {notifBody && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {truncate(notifBody, 120)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Home screen mockup (faint grid) */}
      <div
        style={{
          padding: '24px 28px 20px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          justifyItems: 'center',
        }}
      >
        {appIcons.map((icon, i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              opacity: 0.35,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Home indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.3)',
          }}
        />
      </div>
    </div>
  );
}
