'use client';

import { useState } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/export/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { setLoading(false); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `freenzy-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* best effort */ }
    setLoading(false);
  }

  return (
    <button className="btn btn-secondary" onClick={download} disabled={loading}>
      {loading ? 'Export…' : 'Export CSV'}
    </button>
  );
}
