'use client';

import { useState, useRef, useCallback } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { btn: 32, icon: 14 },
  md: { btn: 40, icon: 18 },
  lg: { btn: 48, icon: 22 },
};

export default function VoiceInput({ onTranscript, disabled, size = 'md', className }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const s = SIZES[size];

  const startRecording = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        if (chunksRef.current.length === 0) return;

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setProcessing(true);

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          formData.append('language', 'fr');

          const res = await fetch('/api/voice/stt', { method: 'POST', body: formData });
          const data = await res.json();

          if (res.ok && data.transcript) {
            onTranscript(data.transcript);
          } else {
            setError(data.error || 'Transcription failed');
          }
        } catch {
          setError('Erreur de transcription');
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch {
      setError('Microphone non disponible');
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  }, []);

  const handleClick = () => {
    if (disabled || processing) return;
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || processing}
        title={recording ? 'Arreter l\'enregistrement' : processing ? 'Transcription en cours...' : 'Dicter (microphone)'}
        style={{
          width: s.btn, height: s.btn, borderRadius: '50%', border: 'none',
          cursor: disabled || processing ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: recording ? '#ef4444' : processing ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          color: recording ? 'white' : 'var(--text-secondary)',
          transition: 'all 0.2s ease',
          animation: recording ? 'voicePulse 1.5s ease-in-out infinite' : 'none',
          opacity: disabled ? 0.4 : 1,
          fontFamily: 'var(--font-sans)',
        }}
      >
        {processing ? (
          <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        ) : (
          <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}
      </button>

      {recording && (
        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(duration)}
        </span>
      )}

      {error && (
        <span style={{ fontSize: 10, color: '#ef4444', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {error}
        </span>
      )}

      <style jsx>{`
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
