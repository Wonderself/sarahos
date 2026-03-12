'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? null;
  } catch { return null; }
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
        const notes = window.prompt('Notes (optionnel):');
        if (notes === null) return; // user cancelled
        setLoading(true);
        try {
          await apiFetch(`/autopilot/proposals/${proposalId}/decide`, {
            method: 'POST',
            body: JSON.stringify({ decision: 'approved', notes }),
          });
          router.refresh();
        } catch {
          alert('Erreur lors de l\'approbation');
        } finally {
          setLoading(false);
        }
      }}
      className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-sm hover:bg-[#333333] disabled:opacity-50"
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
        const notes = window.prompt('Raison du refus:');
        if (!notes) return;
        setLoading(true);
        try {
          await apiFetch(`/autopilot/proposals/${proposalId}/decide`, {
            method: 'POST',
            body: JSON.stringify({ decision: 'denied', notes }),
          });
          router.refresh();
        } catch {
          alert('Erreur lors du refus');
        } finally {
          setLoading(false);
        }
      }}
      className="px-3 py-1.5 bg-[#DC2626] text-white rounded-lg text-sm hover:bg-[#b91c1c] disabled:opacity-50"
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
        try {
          await apiFetch(`/autopilot/proposals/${proposalId}/rollback`, {
            method: 'POST',
            body: '{}',
          });
          router.refresh();
        } catch {
          alert('Erreur lors du rollback');
        } finally {
          setLoading(false);
        }
      }}
      className="px-3 py-1.5 bg-[#9B9B9B] text-white rounded-lg text-sm hover:bg-[#6B6B6B] disabled:opacity-50"
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
        className="px-2 py-1.5 bg-[#F7F7F7] text-[#1A1A1A] rounded-lg text-sm border border-[rgba(0,0,0,0.08)]"
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
          try {
            await apiFetch('/autopilot/audit/trigger', {
              method: 'POST',
              body: JSON.stringify({ type }),
            });
            router.refresh();
          } catch {
            alert('Erreur lors du déclenchement de l\'audit');
          } finally {
            setLoading(false);
          }
        }}
        className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-sm hover:bg-[#333333] disabled:opacity-50"
      >
        {loading ? 'Audit en cours...' : 'Lancer audit'}
      </button>
    </div>
  );
}
