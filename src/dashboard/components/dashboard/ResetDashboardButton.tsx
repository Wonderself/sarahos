'use client';

import React, { useState } from 'react';

export default function ResetDashboardButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Réinitialiser le tableau de bord ? Cette action rétablira la configuration par défaut.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });

      if (!res.ok) throw new Error('Erreur lors de la réinitialisation');

      setDone(true);
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setLoading(false);
      alert('Impossible de réinitialiser le tableau de bord.');
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading || done}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid #E5E5E5',
        borderRadius: 6,
        background: hovered && !loading && !done ? '#FAFAFA' : '#FFFFFF',
        color: loading ? '#9B9B9B' : '#6B6B6B',
        cursor: loading || done ? 'default' : 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {done ? '✓ Réinitialisé' : loading ? 'Réinitialisation...' : '↻ Réinitialiser le tableau de bord'}
    </button>
  );
}
