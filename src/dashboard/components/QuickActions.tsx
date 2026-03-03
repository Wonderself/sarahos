'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

// ─── Component ────────────────────────────────────────────

export default function QuickActions({ actions }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 900,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Action Menu */}
      <div
        ref={menuRef}
        role="menu"
        aria-expanded={isOpen}
        style={{
          position: 'absolute',
          bottom: 64,
          right: 0,
          minWidth: 220,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease',
        }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            role="menuitem"
            onClick={() => handleActionClick(action)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: i < actions.length - 1 ? '1px solid var(--border-primary)' : 'none',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              textAlign: 'left',
              transition: 'background 0.12s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>
              {action.icon}
            </span>
            <span style={{ flex: 1 }}>{action.label}</span>
            {action.shortcut && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}
              >
                {action.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Fermer les actions rapides' : 'Actions rapides'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--accent), #a855f7)',
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(99, 102, 241, 0.5)';
          if (!isOpen) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
          (e.currentTarget as HTMLButtonElement).style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        }}
      >
        +
      </button>
    </div>
  );
}
