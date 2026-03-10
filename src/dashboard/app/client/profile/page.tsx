'use client';

import { useEffect } from 'react';

export default function ProfileRedirect() {
  useEffect(() => {
    window.location.href = '/client/account';
  }, []);

  return (
    <div className="flex-center client-page-scrollable" style={{ height: '60vh' }}>
      <div className="animate-pulse text-base" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
        \ud83d\udc64 Redirection vers Mon Compte...
      </div>
    </div>
  );
}
