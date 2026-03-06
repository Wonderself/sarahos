'use client';

import { useEffect, useRef } from 'react';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  agentName: string;
  agentEmoji: string;
  agentColor: string;
}

export default function TranscriptPanel({ messages, agentName, agentEmoji, agentColor }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', fontSize: 13, padding: 20,
      }}>
        La transcription apparaitra ici...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {messages.map(msg => (
        <div key={msg.id} style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: msg.role === 'user' ? '#e0e7ff' : `${agentColor}20`,
            fontSize: 14,
          }}>
            {msg.role === 'user' ? <span className="material-symbols-rounded" style={{ fontSize: 14 }}>person</span> : <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{agentEmoji}</span>}
          </div>
          <div style={{
            maxWidth: '80%', padding: '8px 12px', borderRadius: 12,
            background: msg.role === 'user' ? '#eef2ff' : '#f8fafc',
            border: `1px solid ${msg.role === 'user' ? '#c7d2fe' : '#e2e8f0'}`,
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
              {msg.role === 'user' ? 'Vous' : agentName} — {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{msg.text}</div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
