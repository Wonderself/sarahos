'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fz-token');
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  return res;
}

export function ApproveButton({ proposalId }: { proposalId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const notes = window.prompt('Notes (optionnel):') ?? '';
        await apiFetch(`/autopilot/proposals/${proposalId}/decide`, {
          method: 'POST',
          body: JSON.stringify({ decision: 'approved', notes }),
        });
        router.refresh();
      }}
      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? '...' : 'Approuver'}
    </button>
  );
}

export function DenyButton({ proposalId }: { proposalId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const notes = window.prompt('Raison du refus:');
        if (!notes) { setLoading(false); return; }
        await apiFetch(`/autopilot/proposals/${proposalId}/decide`, {
          method: 'POST',
          body: JSON.stringify({ decision: 'denied', notes }),
        });
        router.refresh();
      }}
      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? '...' : 'Refuser'}
    </button>
  );
}

export function RollbackButton({ proposalId }: { proposalId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (!confirm('Rollback cette action ? L\'état précédent sera restauré.')) return;
        setLoading(true);
        await apiFetch(`/autopilot/proposals/${proposalId}/rollback`, {
          method: 'POST',
          body: '{}',
        });
        router.refresh();
      }}
      className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50"
    >
      {loading ? '...' : 'Rollback'}
    </button>
  );
}

export function TriggerAuditButton() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('combined');
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="px-2 py-1.5 bg-gray-700 text-white rounded-lg text-sm border border-gray-600"
      >
        <option value="combined">Audit combiné</option>
        <option value="health">Santé</option>
        <option value="business">Business</option>
        <option value="security">Sécurité</option>
      </select>
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await apiFetch('/autopilot/audit/trigger', {
            method: 'POST',
            body: JSON.stringify({ type }),
          });
          setLoading(false);
          router.refresh();
        }}
        className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Audit en cours...' : 'Lancer audit'}
      </button>
    </div>
  );
}
