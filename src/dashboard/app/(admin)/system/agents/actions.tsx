'use client';

import { useState } from 'react';

async function callAction(action: string, params: Record<string, unknown>) {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

export function AgentActions({ agentId, status }: { agentId: string; status: string }) {
  const [loading, setLoading] = useState('');

  async function doAction(action: string) {
    setLoading(action);
    try {
      await callAction(action, { id: agentId });
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
      {status === 'IDLE' || status === 'BUSY' ? (
        <button onClick={() => doAction('pauseAgent')} className="btn btn-danger btn-xs" disabled={!!loading}>
          {loading === 'pauseAgent' ? '...' : 'Pause'}
        </button>
      ) : status === 'DISABLED' ? (
        <button onClick={() => doAction('resumeAgent')} className="btn btn-primary btn-xs" disabled={!!loading}>
          {loading === 'resumeAgent' ? '...' : 'Resume'}
        </button>
      ) : null}
    </div>
  );
}
