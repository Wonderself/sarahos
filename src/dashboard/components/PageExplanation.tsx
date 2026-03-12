'use client';

import { useState, useEffect } from 'react';

interface PageExplanationProps {
  pageId: string;
  text?: string;
}

export default function PageExplanation({ pageId, text }: PageExplanationProps) {
  const storageKey = `fz_page_explained_${pageId}`;
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) setVisible(true);
    } catch { /* */ }
  }, [storageKey]);

  if (!visible || !text) return null;

  const dismiss = () => {
    setVisible(false);
    if (dontShow) {
      try { localStorage.setItem(storageKey, '1'); } catch { /* */ }
    }
  };

  const dismissForever = () => {
    setVisible(false);
    try { localStorage.setItem(storageKey, '1'); } catch { /* */ }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      marginBottom: 8,
      background: 'var(--fz-bg-secondary, #F8FAFC)',
      border: '1px solid var(--fz-border-light, #F1F5F9)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--fz-text-secondary, #64748B)',
      lineHeight: 1.5,
    }}>
      <span style={{ flex: 1 }}>{text}</span>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
        <input
          type="checkbox"
          checked={dontShow}
          onChange={(e) => {
            setDontShow(e.target.checked);
            if (e.target.checked) dismissForever();
          }}
          style={{ width: 12, height: 12, accentColor: 'var(--text-primary, #1a1a1a)' }}
        />
        Ne plus afficher
      </label>
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
          color: 'var(--fz-text-muted, #94A3B8)', padding: '0 2px', lineHeight: 1,
        }}
      >×</button>
    </div>
  );
}
