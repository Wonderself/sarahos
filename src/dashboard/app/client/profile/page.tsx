'use client';

import { useEffect } from 'react';
import { CU } from '../../../lib/page-styles';
import AuthRequired from '../../../components/AuthRequired';

export default function ProfileRedirect() {
  useEffect(() => {
    window.location.href = '/client/account';
  }, []);

  return (
    <AuthRequired pageName="Mon Profil">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: CU.textMuted, fontSize: 14 }}>
        👤 Redirection vers Mon Compte...
      </div>
    </div>
    </AuthRequired>
  );
}
