'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

interface VoiceStats {
  visioSessions: number;
  avgSessionDurationSec: number;
  totalTTSCalls: number;
  totalSTTCalls: number;
  deepgramUsage: number;
  elevenLabsUsage: number;
  totalVoiceCredits: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function VoiceAnalyticsPage() {
  const [stats, setStats] = useState<VoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/analytics/voice`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) { setError(`Erreur ${res.status}`); setLoading(false); return; }
        setStats(await res.json() as VoiceStats);
      } catch { setError('Impossible de contacter l\'API'); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8 admin-page-scrollable"><div className="loading-spinner" /></div>;
  if (error) return (
    <div className="p-8 max-w-5xl mx-auto admin-page-scrollable">
      <h1 className="text-2xl font-bold mb-4">Analytics — Voice &amp; Visio</h1>
      <div className="card p-6 text-center" style={{ color: 'var(--error, #ef4444)' }}>Erreur : {error}</div>
    </div>
  );

  const data = stats ?? {
    visioSessions: 0,
    avgSessionDurationSec: 0,
    totalTTSCalls: 0,
    totalSTTCalls: 0,
    deepgramUsage: 0,
    elevenLabsUsage: 0,
    totalVoiceCredits: 0,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto admin-page-scrollable">
      <h1 className="text-2xl font-bold mb-2">Analytics — Voice & Visio</h1>
      <p className="text-sm text-[var(--muted)] mb-6">Appels visio, synthese vocale, reconnaissance vocale.</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[#5b6cf7]">{data.visioSessions}</div>
          <div className="text-xs text-[var(--muted)]">Sessions visio</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{formatDuration(data.avgSessionDurationSec)}</div>
          <div className="text-xs text-[var(--muted)]">Duree moyenne</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{data.totalTTSCalls + data.totalSTTCalls}</div>
          <div className="text-xs text-[var(--muted)]">Appels TTS+STT</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{data.totalVoiceCredits.toFixed(1)}</div>
          <div className="text-xs text-[var(--muted)]">Credits voix total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Repartition TTS par provider</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `conic-gradient(#5b6cf7 ${data.deepgramUsage / Math.max(data.deepgramUsage + data.elevenLabsUsage, 1) * 360}deg, #8b7cf8 0deg)`,
            }} />
            <div>
              <div className="flex items-center gap-2 text-sm mb-1">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#5b6cf7' }} />
                Deepgram: {data.deepgramUsage} appels
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8b7cf8' }} />
                ElevenLabs: {data.elevenLabsUsage} appels
              </div>
            </div>
          </div>
        </div>

        {/* Usage breakdown */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4">Details d&apos;utilisation</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm">TTS (synthese vocale)</span>
              <span className="text-sm font-semibold">{data.totalTTSCalls} appels</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm">STT (reconnaissance vocale)</span>
              <span className="text-sm font-semibold">{data.totalSTTCalls} appels</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm">Sessions visio</span>
              <span className="text-sm font-semibold">{data.visioSessions}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold">Credits total voix</span>
              <span className="text-sm font-bold text-[#5b6cf7]">{data.totalVoiceCredits.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
