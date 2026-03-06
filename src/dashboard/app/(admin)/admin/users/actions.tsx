'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlideOver } from '../../../../components/SlideOver';
import { useToast } from '../../../../components/Toast';

// ─── Shared action caller ─────────────────────────────────────────────────────

async function callAction(action: string, params: Record<string, unknown>) {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

// ─── CreateUserButton ─────────────────────────────────────────────────────────

export function CreateUserButton() {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('viewer');
  const [tier, setTier] = useState('free');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs['email'] = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) errs['email'] = 'Email invalide';
    if (!name.trim()) errs['name'] = 'Nom requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleClose() {
    setIsOpen(false);
    setEmail(''); setName(''); setRole('viewer'); setTier('free'); setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await callAction('createUser', {
        email: email.trim(),
        displayName: name.trim(),
        role,
        tier,
      });
      toast.showSuccess(`Utilisateur "${name.trim()}" créé avec succès`);
      handleClose();
      router.refresh();
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + Nouveau User
      </button>

      <SlideOver
        isOpen={isOpen}
        onClose={handleClose}
        title="Créer un utilisateur"
        subtitle="Le mot de passe sera envoyé par email"
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleClose}>
              Annuler
            </button>
            <button
              className="btn btn-primary"
              form="create-user-form"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Création…' : '+ Créer'}
            </button>
          </>
        }
      >
        <form id="create-user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className={`input${errors['email'] ? ' input-error' : ''}`}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
            {errors['email'] && <p className="form-error">{errors['email']}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Nom complet *</label>
            <input
              className={`input${errors['name'] ? ' input-error' : ''}`}
              type="text"
              placeholder="Jean Dupont"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            {errors['name'] && <p className="form-error">{errors['name']}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rôle</label>
              <select
                className="select"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="viewer">Viewer</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tier</label>
              <select
                className="select"
                value={tier}
                onChange={e => setTier(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="demo">Demo</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginTop: 16, fontSize: 12 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>info</span> Un email de bienvenue avec les identifiants sera envoye automatiquement.
          </div>
        </form>
      </SlideOver>
    </>
  );
}

// ─── DepositButton (used in user detail page) ─────────────────────────────────

export function DepositButton({ userId, userName }: { userId: string; userName?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  function handleClose() {
    setIsOpen(false);
    setAmount('');
    setDesc('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const credits = parseFloat(amount);
    if (!credits || credits <= 0) return;
    setLoading(true);
    try {
      await callAction('depositCredits', {
        userId,
        amount: Math.round(credits * 1_000_000),
        description: desc || 'Dépôt admin',
      });
      toast.showSuccess(`${credits} crédits déposés avec succès`);
      handleClose();
      router.refresh();
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary btn-xs" onClick={() => setIsOpen(true)}>
        <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>savings</span> Deposer
      </button>

      <SlideOver
        isOpen={isOpen}
        onClose={handleClose}
        title="Déposer des crédits"
        subtitle={userName ? `Pour ${userName}` : undefined}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleClose}>Annuler</button>
            <button
              className="btn btn-primary"
              form="deposit-btn-form"
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
            >
              {loading ? 'En cours...' : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>savings</span> Deposer</>}
            </button>
          </>
        }
      >
        <form id="deposit-btn-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Montant (crédits)</label>
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              placeholder="Ex: 100"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              required
            />
            <p className="form-hint">1 crédit = 1 000 000 micro-crédits</p>
          </div>
          <div className="form-group">
            <label className="form-label">Motif (optionnel)</label>
            <input
              className="input"
              type="text"
              placeholder="Dépôt admin, bonus…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </form>
      </SlideOver>
    </>
  );
}
