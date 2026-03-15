'use client';

import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  greeting: string;
  subtitle: string;
  accentColor: string;
  userName: string;
  profession: string;
}

export default function HeroSection({
  greeting,
  subtitle,
  accentColor,
  userName,
  profession,
}: HeroSectionProps) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <div
      style={{
        padding: '28px 24px',
        borderRadius: 8,
        border: '1px solid #E5E5E5',
        background: '#FFFFFF',
      }}
    >
      {/* Top row: greeting + date */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1A1A1A',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {greeting}
            {userName ? `, ${userName}` : ''} 👋
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#6B6B6B',
              margin: '6px 0 0',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#9B9B9B',
            whiteSpace: 'nowrap',
          }}
        >
          {currentDate}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 20,
          flexWrap: 'wrap',
        }}
      >
        <StatBadge label="Profession" value={profession || 'Non renseignée'} accent={accentColor} />
        <StatBadge label="Crédits restants" value="--" accent={accentColor} />
        <StatBadge label="Agents actifs" value="--" accent={accentColor} />
        <StatBadge label="Tâches en cours" value="--" accent={accentColor} />
      </div>
    </div>
  );
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: 6,
        background: '#FAFAFA',
        border: '1px solid #E5E5E5',
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: accent }}>
        {value}
      </div>
    </div>
  );
}
