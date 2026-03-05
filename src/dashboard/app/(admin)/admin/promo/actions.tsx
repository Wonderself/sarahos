'use client';

import { useState } from 'react';
import { useToast } from '../../../../components/Toast';

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

export function CreatePromoButton() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  async function handleCreate() {
    const code = window.prompt('Code promo (ex: WELCOME2026):');
    if (!code) return;
    const effect = window.prompt('Effet (tier_upgrade, extend_demo, bonus_calls):', 'bonus_calls');
    if (!effect) return;
    const value = window.prompt('Valeur (ex: 100 pour bonus_calls, paid pour tier_upgrade):', '100');
    if (!value) return;
    const max = window.prompt('Max redemptions:', '10');
    if (!max) return;

    setLoading(true);
    try {
      await callAction('createPromo', { data: { code, effect, value: Number(value) || value, maxRedemptions: Number(max) } });
      showSuccess(`Code promo ${code} cree`);
      window.location.reload();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCreate} className="btn btn-primary" disabled={loading}>
      {loading ? 'Creation...' : '+ Nouveau Code'}
    </button>
  );
}

export function DeletePromoButton({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  async function handleDelete() {
    if (!window.confirm(`Desactiver le code ${code}?`)) return;
    setLoading(true);
    try {
      await callAction('deletePromo', { code });
      showSuccess(`Code ${code} desactive`);
      window.location.reload();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-xs" disabled={loading}>
      {loading ? '...' : 'Desactiver'}
    </button>
  );
}
