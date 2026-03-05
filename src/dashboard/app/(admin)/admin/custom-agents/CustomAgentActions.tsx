'use client';

import { useState } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';
import { useToast } from '../../../../components/Toast';
import { useRouter } from 'next/navigation';

interface Props {
  agentId: string;
  isActive: boolean;
}

export default function CustomAgentActions({ agentId, isActive }: Props) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/custom-agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as Record<string, string>).error ?? `Erreur ${res.status}`);
      }
      showSuccess(isActive ? 'Agent desactive' : 'Agent active');
      router.refresh();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de la mise a jour');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        padding: '4px 12px',
        borderRadius: 6,
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        background: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#16a34a' : '#dc2626',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : isActive ? 'Actif' : 'Inactif'}
    </button>
  );
}
