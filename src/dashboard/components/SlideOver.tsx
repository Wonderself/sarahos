'use client';

import { useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: SlideOverProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const widths: Record<string, number> = { sm: 380, md: 480, lg: 600 };

  return (
    <>
      {/* Overlay */}
      <div
        className="slide-over-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="slide-over"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: widths[size] }}
      >
        <div className="slide-over-header">
          <div>
            <h2 className="slide-over-title">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted" style={{ marginTop: 3 }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="slide-over-close"
            aria-label="Fermer"
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        <div className="slide-over-body">
          {children}
        </div>

        {footer && (
          <div className="slide-over-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
