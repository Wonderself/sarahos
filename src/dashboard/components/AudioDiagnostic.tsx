'use client';

import { useState, useRef, useCallback } from 'react';

interface DiagStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'ok' | 'error';
  detail?: string;
}

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

export default function AudioDiagnostic() {
  const [steps, setSteps] = useState<DiagStep[]>([
    { id: 'permissions', label: 'Permission microphone', status: 'pending' },
    { id: 'devices', label: 'Peripheriques audio detectes', status: 'pending' },
    { id: 'capture', label: 'Capture microphone (3s)', status: 'pending' },
    { id: 'stt', label: 'Reconnaissance vocale (Deepgram STT)', status: 'pending' },
    { id: 'tts-deepgram', label: 'Synthese vocale Deepgram', status: 'pending' },
    { id: 'tts-elevenlabs', label: 'Synthese vocale ElevenLabs', status: 'pending' },
    { id: 'playback', label: 'Lecture audio', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const updateStep = useCallback((id: string, update: Partial<DiagStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...update } : s));
  }, []);

  const runDiagnostic = async () => {
    setRunning(true);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const, detail: undefined })));

    // 1. Permissions
    updateStep('permissions', { status: 'running' });
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      updateStep('permissions', { status: 'ok', detail: 'Acces microphone accorde' });
    } catch (err) {
      updateStep('permissions', { status: 'error', detail: `Refuse ou non disponible: ${(err as Error).message}` });
      setRunning(false);
      return;
    }

    // 2. Devices
    updateStep('devices', { status: 'running' });
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
      updateStep('devices', { status: 'ok', detail: `${audioInputs.length} micro(s), ${audioOutputs.length} sortie(s)` });
    } catch {
      updateStep('devices', { status: 'error', detail: 'Impossible d\'enumerer les peripheriques' });
    }

    // 3. Capture
    updateStep('capture', { status: 'running' });
    let audioBlob: Blob | null = null;
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);
      await new Promise(r => setTimeout(r, 3000));
      recorder.stop();
      await new Promise<void>(r => { recorder.onstop = () => r(); });
      audioBlob = new Blob(chunks, { type: 'audio/webm' });
      updateStep('capture', { status: 'ok', detail: `${(audioBlob.size / 1024).toFixed(1)} Ko captures en 3s` });
    } catch (err) {
      updateStep('capture', { status: 'error', detail: `Erreur capture: ${(err as Error).message}` });
    }

    // Stop mic stream
    stream.getTracks().forEach(t => t.stop());

    // 4. STT
    updateStep('stt', { status: 'running' });
    if (audioBlob) {
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'diagnostic.webm');
        const res = await fetch('/api/voice/stt', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          const transcript = data.transcript || data.text || '';
          updateStep('stt', { status: 'ok', detail: transcript ? `Transcrit: "${transcript.slice(0, 80)}"` : 'Audio recu mais aucun texte detecte (parlez plus fort ou plus pres du micro)' });
        } else {
          updateStep('stt', { status: 'error', detail: `HTTP ${res.status}` });
        }
      } catch (err) {
        updateStep('stt', { status: 'error', detail: (err as Error).message });
      }
    } else {
      updateStep('stt', { status: 'error', detail: 'Pas d\'audio a envoyer' });
    }

    // 5. TTS Deepgram
    updateStep('tts-deepgram', { status: 'running' });
    let ttsBlob: Blob | null = null;
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ text: 'Test audio. Votre systeme fonctionne correctement.', gender: 'F' }),
      });
      if (res.ok) {
        ttsBlob = await res.blob();
        updateStep('tts-deepgram', { status: 'ok', detail: `${(ttsBlob.size / 1024).toFixed(1)} Ko generes` });
      } else {
        updateStep('tts-deepgram', { status: 'error', detail: `HTTP ${res.status}` });
      }
    } catch (err) {
      updateStep('tts-deepgram', { status: 'error', detail: (err as Error).message });
    }

    // 6. TTS ElevenLabs
    updateStep('tts-elevenlabs', { status: 'running' });
    try {
      const statusRes = await fetch('/api/voice/elevenlabs');
      const statusData = await statusRes.json();
      if (statusData.configured) {
        const res = await fetch('/api/voice/elevenlabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Test ElevenLabs. Voix premium active.' }),
        });
        if (res.ok) {
          const blob = await res.blob();
          updateStep('tts-elevenlabs', { status: 'ok', detail: `Premium actif — ${(blob.size / 1024).toFixed(1)} Ko` });
          if (!ttsBlob) ttsBlob = blob;
        } else {
          updateStep('tts-elevenlabs', { status: 'error', detail: `HTTP ${res.status}` });
        }
      } else {
        updateStep('tts-elevenlabs', { status: 'ok', detail: 'Cle non configuree — fallback Deepgram actif' });
      }
    } catch (err) {
      updateStep('tts-elevenlabs', { status: 'error', detail: (err as Error).message });
    }

    // 7. Playback
    updateStep('playback', { status: 'running' });
    if (ttsBlob) {
      try {
        const url = URL.createObjectURL(ttsBlob);
        const audio = new Audio(url);
        audio.volume = 0.5;
        await audio.play();
        await new Promise(r => { audio.onended = r; setTimeout(r, 5000); });
        URL.revokeObjectURL(url);
        updateStep('playback', { status: 'ok', detail: 'Audio joue avec succes' });
      } catch (err) {
        updateStep('playback', { status: 'error', detail: `Erreur lecture: ${(err as Error).message}` });
      }
    } else {
      updateStep('playback', { status: 'error', detail: 'Pas d\'audio TTS a jouer' });
    }

    setRunning(false);
  };

  const statusIcon = (s: DiagStep['status']) => {
    switch (s) {
      case 'ok': return '✅';
      case 'error': return '✕';
      case 'running': return '⏳';
      default: return '⬜';
    }
  };

  const okCount = steps.filter(s => s.status === 'ok').length;
  const errCount = steps.filter(s => s.status === 'error').length;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Diagnostic Audio</h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Verifie le micro, la reconnaissance vocale et la synthese vocale.
      </p>

      <button
        onClick={runDiagnostic}
        disabled={running}
        style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: running ? '#9B9B9B' : '#1A1A1A', color: 'white',
          fontSize: 14, fontWeight: 700, cursor: running ? 'wait' : 'pointer',
          marginBottom: 20,
        }}
      >
        {running ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map(step => (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
            borderRadius: 10, border: '1px solid #e5e7eb',
            background: step.status === 'ok' ? '#F7F7F7' : step.status === 'error' ? '#fef2f2' : step.status === 'running' ? '#F7F7F7' : 'white',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{statusIcon(step.status)}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{step.label}</div>
              {step.detail && (
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{step.detail}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!running && (okCount > 0 || errCount > 0) && (
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 10,
          background: errCount === 0 ? '#F7F7F7' : '#F7F7F7',
          border: `1px solid ${errCount === 0 ? '#E5E5E5' : '#E5E5E5'}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: errCount === 0 ? '#1A1A1A' : '#6B6B6B' }}>
            {errCount === 0 ? 'Tout fonctionne !' : `${errCount} probleme(s) detecte(s)`}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {okCount}/{steps.length} tests reussis
          </div>
        </div>
      )}
    </div>
  );
}
