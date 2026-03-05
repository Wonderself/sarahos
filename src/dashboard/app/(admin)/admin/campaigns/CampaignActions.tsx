'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, API_BASE } from '@/lib/client-fetch';
import { useToast } from '../../../../components/Toast';

interface CampaignActionsProps {
  campaignId: string;
  currentStatus: string;
}

export function CampaignActions({ campaignId, currentStatus }: CampaignActionsProps) {
  const [loading, setLoading] = useState('');
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  if (currentStatus !== 'pending_approval') return null;

  async function updateStatus(newStatus: 'approved' | 'rejected') {
    setLoading(newStatus);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
        throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
      }

      showSuccess(newStatus === 'approved' ? 'Campagne approuvée' : 'Campagne rejetée');
      router.refresh();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        className="btn btn-primary btn-sm"
        style={{ background: '#22c55e', borderColor: '#22c55e', fontSize: 11, padding: '3px 8px' }}
        onClick={() => updateStatus('approved')}
        disabled={!!loading}
      >
        {loading === 'approved' ? '...' : 'Approuver'}
      </button>
      <button
        className="btn btn-danger btn-sm"
        style={{ fontSize: 11, padding: '3px 8px' }}
        onClick={() => updateStatus('rejected')}
        disabled={!!loading}
      >
        {loading === 'rejected' ? '...' : 'Rejeter'}
      </button>
    </div>
  );
}
