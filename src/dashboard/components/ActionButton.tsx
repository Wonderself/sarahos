'use client';

import { useState } from 'react';

interface ActionButtonProps {
  action: string;
  params?: Record<string, unknown>;
  label: string;
  className?: string;
  confirmMessage?: string;
  onSuccess?: (data: unknown) => void;
}

export function ActionButton({ action, params = {}, label, className = 'btn btn-secondary btn-xs', confirmMessage, onSuccess }: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Erreur: ${data.error ?? res.statusText}`);
      } else {
        setResult('OK');
        onSuccess?.(data);
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      setResult(`Erreur: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button onClick={handleClick} disabled={loading} className={className} style={{ opacity: loading ? 0.5 : 1 }}>
        {loading ? '...' : label}
      </button>
      {result && (
        <span style={{ fontSize: 10, color: result === 'OK' ? 'var(--success)' : 'var(--danger)', position: 'absolute', top: -14, left: 0, whiteSpace: 'nowrap' }}>
          {result}
        </span>
      )}
    </span>
  );
}

// ─── Prompt-based action (shows input dialog) ───
interface PromptActionProps {
  action: string;
  paramKey: string;
  extraParams?: Record<string, unknown>;
  label: string;
  placeholder: string;
  className?: string;
  inputType?: string;
}

export function PromptAction({ action, paramKey, extraParams = {}, label, placeholder, className = 'btn btn-secondary btn-xs', inputType = 'text' }: PromptActionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    const value = window.prompt(placeholder);
    if (!value) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, [paramKey]: inputType === 'number' ? Number(value) : value, ...extraParams }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(`Erreur: ${data.error ?? res.statusText}`);
      } else {
        setResult('OK');
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (e) {
      setResult(`Erreur: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button onClick={handleClick} disabled={loading} className={className} style={{ opacity: loading ? 0.5 : 1 }}>
        {loading ? '...' : label}
      </button>
      {result && (
        <span style={{ fontSize: 10, color: result === 'OK' ? 'var(--success)' : 'var(--danger)', position: 'absolute', top: -14, left: 0, whiteSpace: 'nowrap' }}>
          {result}
        </span>
      )}
    </span>
  );
}
