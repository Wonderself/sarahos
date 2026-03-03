'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Shortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  shortcuts: Shortcut[];
  isOpen?: boolean;
  onClose?: () => void;
}

function formatKeyCombo(shortcut: Shortcut): string[] {
  const keys: string[] = [];
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.shiftKey) keys.push('Shift');
  if (shortcut.altKey) keys.push('Alt');
  keys.push(shortcut.key === ' ' ? 'Espace' : shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
  return keys;
}

function groupByCategory(shortcuts: Shortcut[]): Record<string, Shortcut[]> {
  const groups: Record<string, Shortcut[]> = {};
  for (const s of shortcuts) {
    const cat = s.category || 'Autre';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  }
  return groups;
}

const CATEGORY_ORDER = ['Navigation', 'Actions', 'Edition', 'Autre'];

export default function KeyboardShortcutsModal({ shortcuts, isOpen: externalOpen, onClose }: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const close = useCallback(() => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, onClose]);

  // Listen for Shift+? to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (target.isContentEditable) return;

      // Shift + ? (key is '?' when shift is held)
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        if (isControlled && onClose) {
          // toggle: if open, close; if closed, we can't open from here unless parent handles it
          // For uncontrolled mode we toggle
        } else {
          setInternalOpen(prev => !prev);
        }
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, isControlled, onClose]);

  if (!isOpen) return null;

  const grouped = groupByCategory(shortcuts);
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a)) -
              (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b))
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 520,
        maxHeight: '80vh',
        zIndex: 9999,
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-secondary)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Raccourcis clavier
          </h2>
          <button
            onClick={close}
            aria-label="Fermer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 18,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            &times;
          </button>
        </div>

        {/* Shortcut list */}
        <div style={{
          padding: '12px 20px 20px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {sortedCategories.map(category => (
            <div key={category} style={{ marginBottom: 20 }}>
              <h3 style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
                marginTop: 0,
              }}>
                {category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {grouped[category].map((shortcut, i) => {
                  const keys = formatKeyCombo(shortcut);
                  return (
                    <div
                      key={`${category}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                      }}>
                        {shortcut.description}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 24,
                              height: 24,
                              padding: '0 6px',
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: 'inherit',
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-secondary)',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: '0 1px 0 var(--border-secondary)',
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {shortcuts.length === 0 && (
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              textAlign: 'center',
              margin: '40px 0',
            }}>
              Aucun raccourci configure
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)',
        }}>
          <span style={{
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            Appuyez sur <kbd style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 18,
              padding: '0 4px',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 4,
              boxShadow: '0 1px 0 var(--border-secondary)',
              margin: '0 2px',
            }}>Esc</kbd> pour fermer
          </span>
        </div>
      </div>
    </>
  );
}
