'use client';

import { AudienceType, AUDIENCE_CONFIGS } from '../lib/audience-data';

const AUDIENCES: AudienceType[] = ['particulier', 'freelance', 'entreprise'];

interface AudienceSwitcherProps {
  audience: AudienceType | null;
  onChange: (value: AudienceType | null) => void;
  variant?: 'dark' | 'light';
}

export default function AudienceSwitcher({ audience, onChange, variant = 'dark' }: AudienceSwitcherProps) {
  const isDark = variant === 'dark';
  const activeIndex = audience ? AUDIENCES.indexOf(audience) : -1;

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      height: 44,
      borderRadius: 22,
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      padding: 3,
      gap: 0,
    }}>
      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          height: 'calc(100% - 6px)',
          width: `calc(${100 / 3}% - 2px)`,
          borderRadius: 20,
          background: '#5b6cf7',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
          transform: activeIndex >= 0 ? `translateX(${activeIndex * 100}%)` : 'translateX(0)',
          opacity: activeIndex >= 0 ? 1 : 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Segments */}
      {AUDIENCES.map((a) => {
        const cfg = AUDIENCE_CONFIGS[a];
        const isActive = audience === a;

        return (
          <button
            key={a}
            onClick={() => onChange(isActive ? null : a)}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: '100%',
              flex: 1,
              minWidth: 0,
              padding: '0 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: 20,
              transition: 'color 0.25s',
              color: isActive
                ? '#fff'
                : isDark ? 'rgba(255,255,255,0.45)' : '#6b7280',
              fontFamily: 'var(--font-display), -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 18 }}
            >
              {cfg.materialIcon}
            </span>
            <span className="audience-switcher-label">{cfg.label}</span>
          </button>
        );
      })}

      {/* CSS for mobile icon-only mode */}
      <style>{`
        @media (max-width: 480px) {
          .audience-switcher-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}
