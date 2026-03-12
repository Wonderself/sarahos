'use client';

import { useEffect } from 'react';
import AuthRequired from '../../../components/AuthRequired';

export default function ProfileRedirect() {
  useEffect(() => {
    window.location.href = '/client/account';
  }, []);

  return (
    <AuthRequired pageName="Mon Profil">
    <div className="flex-center client-page-scrollable" style={{ height: '60vh' }}>
      <div className="animate-pulse text-base" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>
        \ud83d\udc64 Redirection vers Mon Compte...
      </div>
    </div>
    </AuthRequired>
  );
}
