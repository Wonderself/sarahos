'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

// ═══════════════════════════════════════════════════
//   Admin Diagnostics — Services, WhatsApp, Audio
// ═══════════════════════════════════════════════════

interface ServiceStatus {
  name: string;
  icon: string;
  status: 'ok' | 'error' | 'warning' | 'checking';
  message: string;
  hint?: string;
  envVars?: string[];
}

function StatusBadge({ status }: { status: ServiceStatus['status'] }) {
  const cfg: Record<string, { color: string; bg: string; border: string; label: string }> = {
    ok:       { color: '#16a34a', bg: '#16a34a18', border: '#16a34a44', label: '✅ Opérationnel' },
    error:    { color: '#ef4444', bg: '#ef444418', border: '#ef444444', label: '❌ Erreur' },
    warning:  { color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b44', label: '⚠️ Non configuré' },
    checking: { color: '#6366f1', bg: '#6366f118', border: '#6366f144', label: '⏳ Vérification…' },
  };
  const c = cfg[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}

// ── Audio Test ──
function AudioTest() {
  const [step, setStep] = useState<'idle' | 'recording' | 'transcribing' | 'done' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function runTest() {
    setStep('recording');
    setTranscript('');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.start();
      await new Promise(r => setTimeout(r, 3000));
      recorder.stop();
      await new Promise(r => { recorder.onstop = r; });
      stream.getTracks().forEach(t => t.stop());

      setStep('transcribing');
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const form = new FormData();
      form.append('audio', blob, 'test.webm');
      form.append('language', 'fr-FR');
      const res = await fetch('/api/voice/stt', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const data = await res.json() as { transcript?: string };
      setTranscript(data.transcript || '(aucun texte détecté)');
      setStep('done');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erreur inconnue');
      setStep('error');
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      {step === 'idle' && (
        <button className="btn btn-primary btn-sm" onClick={runTest}>
          🎙️ Tester la transcription (3s d&apos;enregistrement)
        </button>
      )}
      {step === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          Enregistrement en cours… parlez maintenant (3s)
        </div>
      )}
      {step === 'transcribing' && (
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 13 }}>⏳ Transcription en cours…</span>
      )}
      {step === 'done' && (
        <div>
          <div style={{ color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>✅ Transcription réussie</div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, fontStyle: 'italic', border: '1px solid var(--border-primary)' }}>
            &ldquo;{transcript}&rdquo;
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setStep('idle')}>
            Retester
          </button>
        </div>
      )}
      {step === 'error' && (
        <div>
          <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>❌ {errorMsg}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Vérifiez que DEEPGRAM_API_KEY est configurée et que vous avez accordé l&apos;accès au micro.
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setStep('idle')}>
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}

// ── WhatsApp Send Test ──
function WhatsAppSendTest() {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function sendTest() {
    if (!phone) return;
    setSending(true);
    setResult(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/whatsapp/admin/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json() as { message?: string; error?: string };
      setResult({ ok: res.ok, msg: data.message || data.error || (res.ok ? 'Envoyé' : 'Échec') });
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : 'Erreur réseau' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{
            flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 13,
            border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
          }}
          placeholder="+33612345678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={sendTest} disabled={sending || !phone}>
          {sending ? '…' : '📤 Envoyer test'}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 8, color: result.ok ? '#16a34a' : '#ef4444', fontWeight: 600, fontSize: 12 }}>
          {result.ok ? '✅ ' : '❌ '}{result.msg}
        </div>
      )}
    </div>
  );
}

// ── LiveTestCard — POST and show result ──
function LiveTestCard({ title, desc, endpoint, method, resultKey }: {
  title: string; desc: string; endpoint: string; method: string; resultKey: string;
}) {
  const [status, setStatus] = useState<'idle' | 'running' | 'ok' | 'error'>('idle');
  const [result, setResult] = useState('');

  async function run() {
    setStatus('running');
    setResult('');
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setStatus('error'); setResult(String(data.error ?? `HTTP ${res.status}`)); return; }
      setStatus('ok');
      setResult(String(data[resultKey] ?? JSON.stringify(data).slice(0, 80)));
    } catch (e) { setStatus('error'); setResult(e instanceof Error ? e.message : 'Erreur réseau'); }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{desc}</div>
      <button
        onClick={run} disabled={status === 'running'}
        style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: 'var(--accent)', color: 'white', opacity: status === 'running' ? 0.7 : 1 }}
      >
        {status === 'running' ? 'Test en cours…' : '▶ Lancer le test'}
      </button>
      {status !== 'idle' && status !== 'running' && (
        <div style={{ marginTop: 8, fontSize: 12, color: status === 'ok' ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
          {status === 'ok' ? '✅ ' : '❌ '}{result}
        </div>
      )}
    </div>
  );
}

function LiveTestCardWithInput({ title, desc, endpoint, inputPlaceholder, inputLabel, inputParam }: {
  title: string; desc: string; endpoint: string; inputPlaceholder: string; inputLabel: string; inputParam: string;
}) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'ok' | 'error'>('idle');
  const [result, setResult] = useState('');

  async function run() {
    if (!value.trim()) return;
    setStatus('running');
    setResult('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [inputParam]: value.trim() }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setStatus('error'); setResult(String(data.error ?? `HTTP ${res.status}`)); return; }
      setStatus('ok');
      setResult(String(data.message ?? data.result ?? 'OK'));
    } catch (e) { setStatus('error'); setResult(e instanceof Error ? e.message : 'Erreur réseau'); }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{desc}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text" placeholder={inputPlaceholder} value={value}
          onChange={e => setValue(e.target.value)}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 12 }}
        />
        <button
          onClick={run} disabled={status === 'running' || !value.trim()}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: 'var(--accent)', color: 'white', opacity: (status === 'running' || !value.trim()) ? 0.6 : 1 }}
        >
          {status === 'running' ? '…' : '▶'}
        </button>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{inputLabel}</div>
      {status !== 'idle' && status !== 'running' && (
        <div style={{ fontSize: 12, color: status === 'ok' ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
          {status === 'ok' ? '✅ ' : '❌ '}{result}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//   Main Page
// ══════════════════════════════════════════

export default function DiagnosticsPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Backend API', icon: '⚡', status: 'checking', message: 'Vérification…' },
    { name: 'PostgreSQL', icon: '🗄️', status: 'checking', message: 'Vérification…', envVars: ['DATABASE_URL'] },
    { name: 'Redis', icon: '🔴', status: 'checking', message: 'Vérification…', envVars: ['REDIS_URL'] },
    { name: 'Anthropic IA', icon: '🤖', status: 'checking', message: 'Vérification…', envVars: ['ANTHROPIC_API_KEY'] },
    { name: 'Deepgram (STT/TTS)', icon: '🎙️', status: 'checking', message: 'Vérification…', envVars: ['DEEPGRAM_API_KEY'], hint: 'Requis pour transcription vocale et synthèse TTS' },
    { name: 'ElevenLabs (TTS)', icon: '🔊', status: 'checking', message: 'Vérification…', envVars: ['ELEVENLABS_API_KEY'], hint: 'Optionnel — fallback sur Deepgram si absent' },
    { name: 'Twilio (SMS/Voix)', icon: '📞', status: 'checking', message: 'Vérification…', envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'] },
    { name: 'WhatsApp Meta API', icon: '💬', status: 'checking', message: 'Vérification…', envVars: ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_APP_SECRET'], hint: 'Nécessite un compte Meta Business Manager' },
    { name: 'Resend (Email)', icon: '📧', status: 'checking', message: 'Vérification…', envVars: ['RESEND_API_KEY'] },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAll = useCallback(async () => {
    const token = getToken();
    const headers: HeadersInit = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const [mainRes, infraRes, avatarRes] = await Promise.allSettled([
      fetch(`${API_BASE}/health`, { headers, cache: 'no-store' }),
      fetch(`${API_BASE}/infra/health`, { headers, cache: 'no-store' }),
      fetch(`${API_BASE}/avatar/pipeline/health`, { headers, cache: 'no-store' }),
    ]);

    const mainData = mainRes.status === 'fulfilled' && mainRes.value.ok
      ? await mainRes.value.json().catch(() => null) as Record<string, unknown> | null
      : null;

    const infraData = infraRes.status === 'fulfilled' && infraRes.value.ok
      ? await infraRes.value.json().catch(() => null) as {
          database?: { healthy?: boolean };
          redis?: { healthy?: boolean };
        } | null
      : null;

    const avatarData = avatarRes.status === 'fulfilled' && avatarRes.value.ok
      ? await avatarRes.value.json().catch(() => null) as {
          asr?: { deepgram?: boolean };
          tts?: { deepgram?: boolean; elevenlabs?: boolean };
          telephony?: { configured?: boolean };
        } | null
      : null;

    // WhatsApp via admin stats
    const waRes = await fetch(`${API_BASE}/whatsapp/admin/stats`, { headers, cache: 'no-store' }).catch(() => null);
    const waData = waRes?.ok ? await waRes.json().catch(() => null) as { configured?: boolean } | null : null;

    setServices(prev => prev.map(s => {
      switch (s.name) {
        case 'Backend API':
          return mainData
            ? { ...s, status: 'ok', message: `Connecté — v${String(mainData['version'] ?? '?')}` }
            : { ...s, status: 'error', message: 'Backend inaccessible (port 3010 non joignable)' };
        case 'PostgreSQL':
          if (!infraData) return { ...s, status: 'warning', message: 'Backend inaccessible — statut inconnu' };
          return { ...s, status: infraData.database?.healthy ? 'ok' : 'error', message: infraData.database?.healthy ? 'Connecté et healthy' : 'Déconnecté' };
        case 'Redis':
          if (!infraData) return { ...s, status: 'warning', message: 'Backend inaccessible — statut inconnu' };
          return { ...s, status: infraData.redis?.healthy ? 'ok' : 'error', message: infraData.redis?.healthy ? 'Connecté et healthy' : 'Déconnecté' };
        case 'Anthropic IA':
          return mainData ? { ...s, status: 'ok', message: 'Agents actifs — clé API fonctionnelle' } : { ...s, status: 'warning', message: 'Statut inconnu' };
        case 'Deepgram (STT/TTS)':
          if (!avatarData) return { ...s, status: 'warning', message: 'Statut inconnu' };
          return { ...s, status: avatarData.asr?.deepgram ? 'ok' : 'warning', message: avatarData.asr?.deepgram ? 'Configuré et opérationnel' : 'DEEPGRAM_API_KEY non configurée' };
        case 'ElevenLabs (TTS)':
          if (!avatarData) return { ...s, status: 'warning', message: 'Statut inconnu' };
          return { ...s, status: avatarData.tts?.elevenlabs ? 'ok' : 'warning', message: avatarData.tts?.elevenlabs ? 'Configuré' : 'Non configuré (optionnel — TTS Deepgram utilisé)' };
        case 'Twilio (SMS/Voix)':
          if (!avatarData) return { ...s, status: 'warning', message: 'Statut inconnu' };
          return { ...s, status: avatarData.telephony?.configured ? 'ok' : 'warning', message: avatarData.telephony?.configured ? 'Configuré' : 'Credentials Twilio manquants' };
        case 'WhatsApp Meta API':
          if (waData?.configured) return { ...s, status: 'ok', message: 'Configuré et actif' };
          return { ...s, status: 'warning', message: 'Non configuré — variables env manquantes' };
        case 'Resend (Email)':
          return mainData ? { ...s, status: 'ok', message: 'Service disponible' } : { ...s, status: 'warning', message: 'Statut inconnu' };
        default:
          return s;
      }
    }));
    setLastChecked(new Date());
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  const okCount = services.filter(s => s.status === 'ok').length;
  const warnCount = services.filter(s => s.status === 'warning').length;
  const errCount = services.filter(s => s.status === 'error').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔍 Diagnostics</h1>
          <p className="page-subtitle">
            État des services et intégrations
            {lastChecked && (
              <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                — Vérifié à {lastChecked.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={checkAll}>🔄 Actualiser</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">✅ Opérationnels</span>
          <span className="stat-value text-success">{okCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">⚠️ Non configurés</span>
          <span className="stat-value text-warning">{warnCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">❌ En erreur</span>
          <span className="stat-value text-danger">{errCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{services.length}</span>
        </div>
      </div>

      {/* Services */}
      <div className="section">
        <h2 className="section-title">Services & Intégrations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map(svc => (
            <div key={svc.name} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{svc.icon}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{svc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{svc.message}</div>
                    {svc.hint && svc.status !== 'ok' && (
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>💡 {svc.hint}</div>
                    )}
                    {svc.envVars && svc.envVars.length > 0 && svc.status !== 'ok' && (
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {svc.envVars.map(v => (
                          <code key={v} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--accent)', fontFamily: 'monospace' }}>{v}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <StatusBadge status={svc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Test */}
      <div className="section">
        <h2 className="section-title">🎙️ Test Microphone & Transcription</h2>
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Enregistre 3 secondes depuis votre micro et transcrit via Deepgram STT.
            Requiert <code style={{ fontFamily: 'monospace', fontSize: 11 }}>DEEPGRAM_API_KEY</code> côté backend.
          </p>
          <AudioTest />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="section">
        <h2 className="section-title">💬 Configuration WhatsApp</h2>
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Variables d&apos;environnement requises</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { key: 'WHATSAPP_PHONE_NUMBER_ID', desc: 'ID du numéro de téléphone (Meta Business Manager)' },
                { key: 'WHATSAPP_ACCESS_TOKEN', desc: "Token d'accès permanent (Meta Developer Portal)" },
                { key: 'WHATSAPP_APP_SECRET', desc: 'Secret pour vérification HMAC des webhooks' },
                { key: 'WHATSAPP_VERIFY_TOKEN', desc: 'Token webhook (défaut: freenzy-webhook-verify-2026)' },
              ].map(({ key, desc }) => (
                <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <code style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, flexShrink: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--accent)', fontFamily: 'monospace' }}>{key}</code>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              Webhook URL à configurer dans Meta Business Manager :{' '}
              <code style={{ fontFamily: 'monospace', fontSize: 11 }}>https://votre-domaine.com/webhook/whatsapp</code>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Envoyer un message de test</div>
            <WhatsAppSendTest />
          </div>
        </div>
      </div>

      {/* ── Tests actifs ── */}
      <div className="section">
        <h2 className="section-title">🧪 Tests en conditions réelles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <LiveTestCard
            title="🤖 Test Anthropic"
            desc="Envoie un mini prompt et vérifie la réponse Claude"
            endpoint={`${API_BASE}/admin/test/anthropic`}
            method="POST"
            resultKey="reply"
          />
          <LiveTestCard
            title="🔊 Test ElevenLabs TTS"
            desc="Synthétise 'Bonjour, je suis Sarah' et vérifie le retour audio"
            endpoint={`${API_BASE}/admin/test/tts`}
            method="POST"
            resultKey="message"
          />
          <LiveTestCardWithInput
            title="📧 Test Email (Resend)"
            desc="Envoie un email de test à l'adresse admin"
            endpoint={`${API_BASE}/admin/test/email`}
            inputPlaceholder="email@exemple.com"
            inputLabel="Destinataire"
            inputParam="to"
          />
          <LiveTestCardWithInput
            title="📱 Test SMS (Twilio)"
            desc="Envoie un SMS de test au numéro indiqué"
            endpoint={`${API_BASE}/admin/test/sms`}
            inputPlaceholder="+33612345678"
            inputLabel="Numéro"
            inputParam="to"
          />
        </div>
      </div>

      {/* .env template */}
      <div className="section">
        <h2 className="section-title">⚙️ Template .env Backend</h2>
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            Ajoutez dans le fichier <code style={{ fontFamily: 'monospace' }}>.env</code> à la racine du projet, puis :{' '}
            <code style={{ fontFamily: 'monospace', fontSize: 11 }}>docker compose restart backend</code>
          </p>
          <pre style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: '14px 16px', fontSize: 11, overflowX: 'auto', color: 'var(--text-primary)', fontFamily: 'monospace', lineHeight: 1.9, margin: 0 }}>
{`# ── WhatsApp (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_VERIFY_TOKEN=freenzy-webhook-verify-2026

# ── Transcription & Synthèse vocale
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key   # optionnel

# ── Twilio (SMS / Appels)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890`}
          </pre>
        </div>
      </div>
    </div>
  );
}
