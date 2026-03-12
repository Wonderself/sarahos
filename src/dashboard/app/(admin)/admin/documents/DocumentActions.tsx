'use client';

import { useState } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';
import { useToast } from '../../../../components/Toast';
import { useRouter } from 'next/navigation';

interface Props {
  documentId: string;
  filename: string;
}

export default function DocumentActions({ documentId, filename }: Props) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Supprimer ${filename} ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as Record<string, string>).error ?? `Erreur ${res.status}`);
      }
      showSuccess(`${filename} supprime`);
      router.refresh();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={`Supprimer ${filename}`}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        border: 'none',
        fontSize: 14,
        cursor: loading ? 'wait' : 'pointer',
        background: '#fee2e2',
        color: '#dc2626',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : '🗑️'}
    </button>
  );
}
