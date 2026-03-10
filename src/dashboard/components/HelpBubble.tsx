'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface HelpBubbleProps {
  text: string;
  size?: number;
}

export default function HelpBubble({ text, size = 16 }: HelpBubbleProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setAbove(spaceBelow < 160);
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, reposition]);

  return (
    <span
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      onMouseEnter={() => { setOpen(true); reposition(); }}
      onMouseLeave={() => setOpen(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--fz-bg-tertiary, #F1F5F9)',
        color: 'var(--fz-text-muted, #94A3B8)',
        fontSize: size * 0.625,
        fontWeight: 700,
        cursor: 'help',
        marginLeft: 6,
        verticalAlign: 'middle',
        flexShrink: 0,
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      ?
      {open && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            [above ? 'bottom' : 'top']: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'var(--fz-bg, #FFFFFF)',
            border: '1px solid var(--fz-border, #E2E8F0)',
            borderRadius: 'var(--fz-radius-md, 10px)',
            boxShadow: 'var(--fz-shadow-tooltip, 0 4px 16px rgba(0,0,0,0.12))',
            padding: '10px 14px',
            maxWidth: 280,
            minWidth: 180,
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--fz-text-secondary, #64748B)',
            fontWeight: 400,
            textAlign: 'left',
            whiteSpace: 'normal',
            pointerEvents: 'auto',
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              [above ? 'bottom' : 'top']: -6,
              left: '50%',
              transform: `translateX(-50%) rotate(${above ? '225deg' : '45deg'})`,
              width: 10,
              height: 10,
              background: 'var(--fz-bg, #FFFFFF)',
              border: '1px solid var(--fz-border, #E2E8F0)',
              borderBottom: 'none',
              borderRight: 'none',
            }}
          />
          {text}
        </div>
      )}
    </span>
  );
}
