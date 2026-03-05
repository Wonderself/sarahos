'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ALL_AGENTS } from '../../../../lib/agent-config';
import AgentAvatar from '../../../../components/visio/AgentAvatar';
import VisioControls from '../../../../components/visio/VisioControls';
import TranscriptPanel, { TranscriptMessage } from '../../../../components/visio/TranscriptPanel';

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

export default function VisioCallPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const agent = ALL_AGENTS.find(a => a.id === agentId);

  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [listeningStatus, setListeningStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const startTimeRef = useRef(Date.now());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const autoRecordRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef = useRef(false);

  const session = getSession();
  const token = session.token ?? '';

  // Start mic capture on mount
  const retryMic = useCallback(() => {
    setMicError(null);
    setIsTextMode(false);
  }, []);

  useEffect(() => {
    if (isTextMode && !micError) return;
    if (isTextMode) return;

    let cancelled = false;
    async function startMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        setMicError(null);

        // Audio level monitoring
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        function updateLevel() {
          if (cancelled) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        }
        updateLevel();
      } catch (err) {
        console.error('[Visio] Mic error:', err);
        const e = err as DOMException;
        if (e.name === 'NotAllowedError') {
          setMicError('Permission micro refusee. Cliquez sur l\'icone cadenas dans la barre d\'adresse pour autoriser le micro.');
        } else if (e.name === 'NotFoundError') {
          setMicError('Aucun microphone detecte. Verifiez que votre micro est branche et fonctionne.');
        } else if (e.name === 'NotReadableError') {
          setMicError('Le microphone est utilise par une autre application. Fermez les autres apps utilisant le micro.');
        } else {
          setMicError(`Erreur micro: ${e.message || 'Impossible d\'acceder au microphone.'}`);
        }
        setIsTextMode(true);
      }
    }
    startMic();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [isTextMode, micError]);

  // Continuous voice recording with voice activity detection
  const startAutoRecording = useCallback(() => {
    if (!streamRef.current || isMuted || isTextMode || processingRef.current) return;
    autoRecordRef.current = true;

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      let hasVoice = false;

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false);
        if (chunks.length === 0 || !hasVoice) {
          // No voice detected, restart listening
          if (autoRecordRef.current && !processingRef.current) {
            setTimeout(() => startAutoRecording(), 200);
          }
          return;
        }
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (blob.size < 500) {
          if (autoRecordRef.current && !processingRef.current) {
            setTimeout(() => startAutoRecording(), 200);
          }
          return;
        }
        await processVoiceInput(blob);
      };

      recorder.start(100);
      recorderRef.current = recorder;
      setIsRecording(true);
      setListeningStatus('listening');

      // Voice activity detection: monitor audio levels
      const checkVoiceActivity = () => {
        if (!analyserRef.current || recorder.state !== 'recording') return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (avg > 15) { // Voice detected
          hasVoice = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasVoice && !silenceTimerRef.current) {
          // Voice was active, now silence — wait 1.5s then stop
          silenceTimerRef.current = setTimeout(() => {
            if (recorder.state === 'recording') recorder.stop();
            silenceTimerRef.current = null;
          }, 1500);
        }

        if (recorder.state === 'recording') {
          setTimeout(checkVoiceActivity, 100);
        }
      };
      checkVoiceActivity();

      // Hard max 15s
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 15000);
    } catch {
      setIsRecording(false);
    }
  }, [isMuted, isTextMode]);

  // Auto-start recording when mic is ready and not muted
  useEffect(() => {
    if (!isTextMode && !isMuted && streamRef.current && !processingRef.current && !isSpeaking) {
      const timer = setTimeout(() => startAutoRecording(), 500);
      return () => clearTimeout(timer);
    }
    return () => { autoRecordRef.current = false; };
  }, [isTextMode, isMuted, isSpeaking, startAutoRecording]);

  // Stop recording
  const stopRecording = useCallback(() => {
    autoRecordRef.current = false;
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  // Process voice → STT → LLM → TTS
  const processVoiceInput = async (audioBlob: Blob) => {
    setProcessing(true);
    processingRef.current = true;
    setListeningStatus('processing');
    try {
      // 1. STT
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
      const sttRes = await fetch('/api/voice/stt', { method: 'POST', body: formData });
      if (!sttRes.ok) throw new Error('STT failed');
      const sttData = await sttRes.json();
      const userText = sttData.transcript || sttData.text || '';
      if (!userText.trim()) {
        setProcessing(false);
        processingRef.current = false;
        setListeningStatus('listening');
        // Restart listening
        if (autoRecordRef.current) setTimeout(() => startAutoRecording(), 300);
        return;
      }

      // Add user message
      const userMsg: TranscriptMessage = { id: `u-${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);

      // 2. LLM + TTS
      await sendToAgent(userText);
    } catch {
      // Silent fail
    }
    setProcessing(false);
    processingRef.current = false;
    // Auto-restart listening after agent finishes speaking
    if (!isSpeaking && autoRecordRef.current) {
      setListeningStatus('listening');
      setTimeout(() => startAutoRecording(), 500);
    }
  };

  // Process text input
  const sendTextMessage = async () => {
    if (!textInput.trim() || processing) return;
    const text = textInput.trim();
    setTextInput('');
    setProcessing(true);

    const userMsg: TranscriptMessage = { id: `u-${Date.now()}`, role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    await sendToAgent(text);
    setProcessing(false);
  };

  // Send to LLM and get TTS response
  const sendToAgent = async (userText: string) => {
    try {
      const systemPrompt = agent
        ? `Tu es ${agent.name}, ${agent.role} chez Freenzy.io. Tu es en appel visio avec l'utilisateur. Reponds de facon naturelle, conversationnelle et concise (2-3 phrases max). ${agent.systemPrompt}`
        : 'Tu es un agent Freenzy.io en appel visio.';

      const chatMessages = messages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      chatMessages.push({ role: 'user', content: userText });

      // LLM call via chat stream
      const llmRes = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          system: systemPrompt,
          token,
          agentName: agent?.id || 'fz-assistante',
          stream: false,
        }),
      });

      let agentText = '';
      if (llmRes.ok) {
        const data = await llmRes.json();
        agentText = data.content || data.message || data.text || '';
      }

      if (!agentText) agentText = 'Je suis la. Comment puis-je vous aider ?';

      // Add agent message
      const agentMsg: TranscriptMessage = { id: `a-${Date.now()}`, role: 'agent', text: agentText, timestamp: Date.now() };
      setMessages(prev => [...prev, agentMsg]);

      // 3. TTS
      setIsSpeaking(true);
      setListeningStatus('speaking');
      try {
        const ttsRes = await fetch('/api/voice/elevenlabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: agentText.slice(0, 500),
            gender: agent?.gender === 'M' ? 'male' : 'female',
          }),
        });
        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => {
            setIsSpeaking(false);
            setListeningStatus('listening');
            URL.revokeObjectURL(url);
            // Restart auto-recording after speaking
            processingRef.current = false;
            if (autoRecordRef.current) setTimeout(() => startAutoRecording(), 500);
          };
          await audio.play();
        } else {
          setIsSpeaking(false);
          setListeningStatus('listening');
          processingRef.current = false;
          if (autoRecordRef.current) setTimeout(() => startAutoRecording(), 500);
        }
      } catch {
        setIsSpeaking(false);
        setListeningStatus('listening');
        processingRef.current = false;
        if (autoRecordRef.current) setTimeout(() => startAutoRecording(), 500);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const hangup = () => {
    setCallActive(false);
    autoRecordRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopRecording();
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    router.push('/client/visio');
  };

  if (!agent) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 15, color: '#6b7280' }}>Agent non trouve</div>
        <a href="/client/visio" style={{ fontSize: 13, color: '#6366f1', marginTop: 12, display: 'inline-block' }}>Retour a la liste</a>
      </div>
    );
  }

  if (!callActive) return null;

  return (
    <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Top bar */}
      <div style={{
        padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{agent.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{agent.name}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>— {agent.role}</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isTextMode && !isMuted && listeningStatus === 'listening' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
              Ecoute active
            </span>
          )}
          {listeningStatus === 'processing' && (
            <span style={{ color: '#f59e0b' }}>Transcription...</span>
          )}
          {listeningStatus === 'speaking' && (
            <span style={{ color: '#6366f1' }}>Parle...</span>
          )}
          <span>~3x credits</span>
        </div>
      </div>

      {/* Mic error banner */}
      {micError && (
        <div style={{
          padding: '10px 16px', background: '#fef2f2', borderBottom: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 16 }}>🎙️</span>
          <span style={{ flex: 1, fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>{micError}</span>
          <button
            onClick={retryMic}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #dc2626',
              background: 'white', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reessayer
          </button>
          <a
            href="/client/visio/diagnostic"
            style={{ fontSize: 12, color: '#6366f1', textDecoration: 'underline' }}
          >
            Diagnostic audio
          </a>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Agent side */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #1e293b, #0f172a)',
        }}>
          <AgentAvatar
            name={agent.name}
            emoji={agent.emoji}
            color={agent.color}
            isSpeaking={isSpeaking}
            size={180}
          />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: 'white' }}>{agent.name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            {isSpeaking ? 'Parle...' : processing ? 'Reflechit...' : isRecording ? 'Vous ecoute...' : isTextMode ? 'Mode texte' : 'En ligne'}
          </div>
          {!isTextMode && !isMuted && !isSpeaking && !processing && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, opacity: 0.7 }}>
              Parlez normalement — transcription automatique
            </div>
          )}

          {/* Controls */}
          <div style={{ marginTop: 32 }}>
            <VisioControls
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(m => !m)}
              isTextMode={isTextMode}
              onToggleMode={() => setIsTextMode(m => !m)}
              onHangup={hangup}
              audioLevel={audioLevel}
              startTime={startTimeRef.current}
            />
          </div>
        </div>

        {/* Transcript side */}
        <div style={{
          width: 360, borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column',
          background: 'white',
        }}>
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid #e5e7eb',
            fontSize: 12, fontWeight: 700, color: '#6b7280',
          }}>
            Transcription
          </div>

          <TranscriptPanel
            messages={messages}
            agentName={agent.name}
            agentEmoji={agent.emoji}
            agentColor={agent.color}
          />

          {/* Text input (always visible in text mode, or as fallback) */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendTextMessage(); }}
              placeholder={isTextMode ? 'Tapez votre message...' : 'Ou tapez ici...'}
              disabled={processing}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={sendTextMessage}
              disabled={processing || !textInput.trim()}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#6366f1', color: 'white', fontSize: 12, fontWeight: 700,
                cursor: processing ? 'wait' : 'pointer', opacity: processing ? 0.6 : 1,
              }}
            >
              ↵
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
