'use client';

import { useState } from 'react';
import { useToast } from '../../../../components/Toast';

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
  const { showSuccess, showError } = useToast();

  async function doAction(action: string) {
    setLoading(action);
    try {
      await callAction(action, { id: agentId });
      showSuccess(`Agent ${action === 'pauseAgent' ? 'mis en pause' : 'repris'}`);
      window.location.reload();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div className="flex gap-8" style={{ marginTop: 12 }}>
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
