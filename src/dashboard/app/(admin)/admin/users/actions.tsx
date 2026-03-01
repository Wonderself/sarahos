'use client';

import { useState } from 'react';

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

export function UserActions({ userId, userName, isActive }: { userId: string; userName: string; isActive: boolean }) {
  const [loading, setLoading] = useState('');

  async function doAction(action: string, params: Record<string, unknown>, confirm?: string) {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(action);
    try {
      await callAction(action, params);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading('');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button
        onClick={() => {
          const amount = window.prompt('Crédits à déposer (en micro-credits, ex: 100000000 = 100 cr):');
          if (!amount) return;
          doAction('depositCrédits', { userId, amount: Number(amount) });
        }}
        className="btn btn-primary btn-xs"
        disabled={loading === 'depositCrédits'}
      >
        {loading === 'depositCrédits' ? '...' : '💰 Crédits'}
      </button>
      <button
        onClick={() => {
          const role = window.prompt(`Nouveau rôle pour ${userName}? (admin, operator, viewer):`);
          if (!role) return;
          doAction('updateUser', { id: userId, data: { role } });
        }}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'updateUser'}
      >
        {loading === 'updateUser' ? '...' : 'Role'}
      </button>
      <button
        onClick={() => {
          const tier = window.prompt(`Nouveau tier pour ${userName} ? (paid, free, demo, guest) :`);
          if (!tier) return;
          doAction('updateUser', { id: userId, data: { tier } });
        }}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'updateUser'}
      >
        Tier
      </button>
      <button
        onClick={() => doAction('resetUserKey', { id: userId }, `Régénérer la clé API de ${userName}?`)}
        className="btn btn-secondary btn-xs"
        disabled={loading === 'resetUserKey'}
      >
        {loading === 'resetUserKey' ? '...' : 'Reset Key'}
      </button>
      {isActive ? (
        <button
          onClick={() => doAction('deleteUser', { id: userId }, `Désactiver ${userName}?`)}
          className="btn btn-danger btn-xs"
          disabled={loading === 'deleteUser'}
        >
          {loading === 'deleteUser' ? '...' : 'Désactiver'}
        </button>
      ) : (
        <button
          onClick={() => doAction('updateUser', { id: userId, data: { isActive: true } })}
          className="btn btn-primary btn-xs"
          disabled={loading === 'updateUser'}
        >
          Réactiver
        </button>
      )}
    </div>
  );
}

export function CreateUserButton() {
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const email = window.prompt('Email du nouvel utilisateur:');
    if (!email) return;
    const name = window.prompt('Nom complet:');
    if (!name) return;
    const role = window.prompt('Role (admin, operator, viewer):', 'viewer');
    if (!role) return;
    const tier = window.prompt('Tier (paid, free, demo, guest):', 'free');
    if (!tier) return;

    setLoading(true);
    try {
      await callAction('createUser', { email, displayName: name, role, tier });
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCreate} className="btn btn-primary" disabled={loading}>
      {loading ? 'Création...' : '+ Nouveau User'}
    </button>
  );
}

export function DepositButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDeposit() {
    const amount = window.prompt('Montant en micro-crédits (100000000 = 100 cr) :');
    if (!amount) return;
    setLoading(true);
    try {
      await callAction('depositCrédits', { userId, amount: Number(amount) });
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDeposit} className="btn btn-primary btn-xs" disabled={loading}>
      {loading ? '...' : '💰 Déposer'}
    </button>
  );
}
