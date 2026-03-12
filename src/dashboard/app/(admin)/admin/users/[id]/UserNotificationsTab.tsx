'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, CHANNELS } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 7: NOTIFICATIONS
// ═══════════════════════════════════════════════════

export default function UserNotificationsTab({ userId, showToast }: {
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [channel, setChannel] = useState('in_app');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()) {
      showToast('Le sujet est requis', 'error');
      return;
    }
    if (!body.trim()) {
      showToast('Le corps du message est requis', 'error');
      return;
    }
    setSending(true);
    try {
      await apiFetch(`/admin/users/${userId}/notify`, {
        method: 'POST',
        body: JSON.stringify({ channel, subject, body }),
      });
      showToast(`Notification envoyee via ${channel}`, 'success');
      setSubject('');
      setBody('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur d\'envoi', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔔 Envoyer une notification</div>

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Canal</label>
            <select
              style={styles.select}
              value={channel}
              onChange={e => setChannel(e.target.value)}
            >
              {CHANNELS.map(c => (
                <option key={c} value={c}>
                  {c === 'in_app' ? 'In-App' : c === 'email' ? 'Email' : c === 'sms' ? 'SMS' : 'WhatsApp'}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Sujet</label>
            <input
              style={styles.input}
              placeholder="Sujet de la notification"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Corps du message</label>
          <textarea
            style={{ ...styles.textarea, fontFamily: 'inherit', minHeight: 120 }}
            placeholder="Contenu du message..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Channel indicators */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          {CHANNELS.map(c => (
            <div key={c} style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              background: channel === c ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
              color: channel === c ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${channel === c ? 'var(--accent)' : 'var(--border-primary)'}`,
              cursor: 'pointer',
            }} onClick={() => setChannel(c)}>
              {c === 'in_app' ? 'In-App' : c === 'email' ? 'Email' : c === 'sms' ? 'SMS' : 'WhatsApp'}
              {c !== 'in_app' && (
                <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>(stub)</span>
              )}
            </div>
          ))}
        </div>

        <button
          style={{ ...styles.btnPrimary, opacity: sending ? 0.6 : 1 }}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? 'Envoi en cours...' : <>📤 Envoyer la notification</>}
        </button>
      </div>

      {/* Info box */}
      <div style={{
        ...styles.card,
        background: '#F7F7F7',
        borderColor: 'var(--border-primary)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>ℹ️ Information sur les canaux:</strong>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><strong>In-App</strong> — Notification stockee en base, visible dans le dashboard client</li>
            <li><strong>Email</strong> — Stub (integration SMTP a venir)</li>
            <li><strong>SMS</strong> — Stub (integration Twilio a venir)</li>
            <li><strong>WhatsApp</strong> — Stub (integration WhatsApp Business a venir)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
