'use client';

import { useState } from 'react';
import { useToast } from '../../../../components/Toast';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

export default function CronActions({ jobName }: { jobName: string }) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  async function runNow() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/crons/${encodeURIComponent(jobName)}/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json() as { ok: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        showSuccess(`✅ ${jobName} exécuté avec succès`);
      } else {
        showError(`❌ ${data.error ?? data.message ?? 'Erreur inconnue'}`);
      }
    } catch {
      showError(`❌ Erreur réseau`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="btn btn-ghost btn-xs"
      onClick={runNow}
      disabled={loading}
      title={`Déclencher ${jobName} maintenant`}
    >
      {loading ? '…' : '▶ Run'}
    </button>
  );
}
