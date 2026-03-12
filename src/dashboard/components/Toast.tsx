'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    const timer = setTimeout(() => removeToast(id), duration);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  const showSuccess = useCallback((m: string) => showToast(m, 'success'), [showToast]);
  const showError   = useCallback((m: string) => showToast(m, 'error', 6000), [showToast]);
  const showInfo    = useCallback((m: string) => showToast(m, 'info'), [showToast]);
  const showWarning = useCallback((m: string) => showToast(m, 'warning', 5000), [showToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, []);

  const ICONS: Record<ToastType, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
    success: { bg: '#fff', border: '#E5E5E5', text: 'var(--text-primary)' },
    error:   { bg: '#fff', border: '#E5E5E5', text: 'var(--danger, #dc2626)' },
    info:    { bg: '#fff', border: '#E5E5E5', text: 'var(--text-primary)' },
    warning: { bg: '#fff', border: '#E5E5E5', text: 'var(--text-primary)' },
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          display: 'flex', flexDirection: 'column', gap: 8,
          zIndex: 9999, maxWidth: 360, width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const c = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                pointerEvents: 'all',
                animation: 'toastIn 0.2s ease',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{ICONS[toast.type]}</span>
              <span style={{ flex: 1, fontSize: 13, color: c.text, lineHeight: 1.5 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Fermer"
                style={{
                  flexShrink: 0, width: 20, height: 20, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  color: c.text, opacity: 0.6, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 14 }}>✕</span>
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ─── ErrorBanner (inline) ─────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorBanner({ message, onDismiss, type = 'error' }: ErrorBannerProps) {
  const COLORS = {
    error:   { bg: '#fff', border: '#E5E5E5', text: 'var(--danger, #dc2626)', icon: '❌' },
    warning: { bg: '#fff', border: '#E5E5E5', text: 'var(--text-primary)', icon: '⚠️' },
    info:    { bg: '#fff', border: '#E5E5E5', text: 'var(--text-primary)', icon: 'ℹ️' },
  };
  const c = COLORS[type];
  return (
    <div
      role="alert"
      style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: '10px 14px', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <span style={{ fontSize: 15 }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: c.text, lineHeight: 1.5 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Fermer"
          style={{
            width: 20, height: 20, border: 'none', background: 'transparent',
            cursor: 'pointer', color: c.text, opacity: 0.6, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 14 }}>✕</span>
        </button>
      )}
    </div>
  );
}
