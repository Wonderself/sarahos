'use client';

import { useState } from 'react';

export function BatchApproveButton({ pendingIds }: { pendingIds: string[] }) {
  const [loading, setLoading] = useState(false);

  async function approveAll() {
    if (!window.confirm(`Approuver les ${pendingIds.length} demande(s) en attente ?`)) return;
    setLoading(true);
    try {
      for (const id of pendingIds) {
        await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'decideApproval', id, decision: 'APPROVED', reason: '' }),
        });
      }
      window.location.reload();
    } catch { /* best effort */ }
    setLoading(false);
  }

  if (pendingIds.length === 0) return null;
  return (
    <button className="btn btn-primary" onClick={approveAll} disabled={loading}>
      {loading ? '...' : `Approuver tout (${pendingIds.length})`}
    </button>
  );
}

export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const [loading, setLoading] = useState('');

  async function decide(decision: 'APPROVED' | 'DENIED') {
    let reason = '';
    if (decision === 'DENIED') {
      const input = window.prompt('Raison du refus:');
      if (input === null) return; // user cancelled
      reason = input;
    }
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
