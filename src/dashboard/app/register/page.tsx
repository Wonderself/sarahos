'use client';

import { useEffect } from 'react';

export default function RegisterRedirect() {
  useEffect(() => {
    window.location.href = '/login?mode=register';
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: 14,
    }}>
      Redirection vers l&apos;inscription...
    </div>
  );
}
