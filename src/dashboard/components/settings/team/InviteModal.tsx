'use client';

import { useState, type CSSProperties } from 'react';

// ─── Notion Palette ───────────────────────────────────────────
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  accent: '#0EA5E9',
  danger: '#DC2626',
} as const;

// ─── Types ────────────────────────────────────────────────────
type Role = 'viewer' | 'member' | 'admin';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
}

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: 'viewer', label: 'Lecteur', desc: 'Peut consulter les donnees sans modifier' },
  { value: 'member', label: 'Membre', desc: 'Acces standard, peut utiliser les agents' },
  { value: 'admin', label: 'Admin', desc: 'Gestion complete de l\'equipe et parametres' },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Styles ───────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: C.bg,
    borderRadius: 12,
    padding: 24,
    maxWidth: 460,
    width: '90%',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: C.text,
    margin: 0,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    margin: 0,
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: C.secondary,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 40,
    padding: '0 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 14,
    color: C.text,
    background: C.bg,
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: C.danger,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  roleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  roleOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  roleOptionActive: {
    borderColor: C.accent,
    background: `${C.accent}08`,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: `2px solid ${C.border}`,
    marginTop: 2,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: C.accent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: C.accent,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: C.text,
  },
  roleDesc: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: C.border,
    margin: '20px 0',
  },
  preview: {
    background: C.bgSecondary,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: C.secondary,
    marginBottom: 8,
  },
  previewLine: {
    fontSize: 13,
    color: C.text,
    lineHeight: 1.6,
  },
  previewMuted: {
    color: C.muted,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancel: {
    height: 36,
    padding: '0 16px',
    background: C.bg,
    color: C.secondary,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnInvite: {
    height: 36,
    padding: '0 20px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

// ─── Component ────────────────────────────────────────────────
export default function InviteModal({ open, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [touched, setTouched] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!open) return null;

  const emailValid = isValidEmail(email);
  const canSubmit = emailValid && role;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (!showPreview) {
      setShowPreview(true);
      return;
    }
    onInvite(email, role);
    setEmail('');
    setRole('member');
    setTouched(false);
    setShowPreview(false);
    onClose();
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setTouched(false);
    setShowPreview(false);
    onClose();
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.value === role);

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.title}>Inviter un membre</h2>
        <p style={styles.subtitle}>Envoyez une invitation par email pour rejoindre votre organisation.</p>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Adresse email</label>
          <input
            type="email"
            style={{
              ...styles.input,
              ...(touched && !emailValid ? styles.inputError : {}),
            }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="collegue@entreprise.com"
            autoFocus
          />
          {touched && !emailValid && email.length > 0 && (
            <div style={styles.errorText}>Adresse email invalide</div>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Role</label>
          <div style={styles.roleGroup}>
            {ROLE_OPTIONS.map(opt => (
              <div
                key={opt.value}
                style={{
                  ...styles.roleOption,
                  ...(role === opt.value ? styles.roleOptionActive : {}),
                }}
                onClick={() => setRole(opt.value)}
              >
                <div
                  style={{
                    ...styles.radio,
                    ...(role === opt.value ? styles.radioActive : {}),
                  }}
                >
                  {role === opt.value && <div style={styles.radioDot} />}
                </div>
                <div>
                  <div style={styles.roleLabel}>{opt.label}</div>
                  <div style={styles.roleDesc}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showPreview && canSubmit && (
          <>
            <div style={styles.divider} />
            <div style={styles.preview}>
              <div style={styles.previewTitle}>Apercu de l&apos;invitation</div>
              <div style={styles.previewLine}>
                <span style={styles.previewMuted}>A :</span> {email}
              </div>
              <div style={styles.previewLine}>
                <span style={styles.previewMuted}>Role :</span> {selectedRole?.label}
              </div>
              <div style={{ ...styles.previewLine, marginTop: 8, fontSize: 12, color: C.muted }}>
                Un email d&apos;invitation sera envoye avec un lien d&apos;activation valable 7 jours.
              </div>
            </div>
          </>
        )}

        <div style={styles.actions}>
          <button style={styles.btnCancel} onClick={handleClose}>
            Annuler
          </button>
          <button
            style={{
              ...styles.btnInvite,
              ...(!canSubmit ? styles.btnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {showPreview ? 'Confirmer l\'envoi' : 'Apercu'}
          </button>
        </div>
      </div>
    </div>
  );
}
