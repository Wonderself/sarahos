'use client';

import { useState } from 'react';

export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const [loading, setLoading] = useState('');

  async function decide(decision: 'APPROVED' | 'DENIED') {
    const reason = decision === 'DENIED' ? window.prompt('Raison du refus:') ?? '' : '';
    setLoading(decision);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decideApproval', id: approvalId, decision, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => decide('APPROVED')} className="btn btn-primary btn-sm" disabled={!!loading}>
        {loading === 'APPROVED' ? '...' : 'Approuver'}
      </button>
      <button onClick={() => decide('DENIED')} className="btn btn-danger btn-sm" disabled={!!loading}>
        {loading === 'DENIED' ? '...' : 'Refuser'}
      </button>
    </div>
  );
}
