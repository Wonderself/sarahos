'use client';

import { useEffect } from 'react';

export default function ProfileRedirect() {
  useEffect(() => {
    window.location.href = '/client/account';
  }, []);

  return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="animate-pulse text-base text-tertiary">
        Redirection vers Mon Compte...
      </div>
    </div>
  );
}
