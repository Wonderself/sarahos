'use client';

import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger mount animation after a short delay
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const trendColor =
    trend === 'up'
      ? 'var(--success)'
      : trend === 'down'
        ? 'var(--danger)'
        : 'var(--text-muted)';

  const trendBgColor =
    trend === 'up'
      ? 'var(--success-muted)'
      : trend === 'down'
        ? 'var(--danger-muted)'
        : 'var(--bg-tertiary)';

  const trendArrow =
    trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';

  const changeSign = change >= 0 ? '+' : '';

  return (
    <div
      className="card"
      style={{
        padding: 16,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Header row: icon + trend badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: trendBgColor,
            color: trendColor,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span>{trendArrow}</span>
          <span>{changeSign}{change}%</span>
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>

      {/* Title */}
      <div
        className="text-sm text-secondary"
        style={{ fontWeight: 500 }}
      >
        {title}
      </div>
    </div>
  );
}
