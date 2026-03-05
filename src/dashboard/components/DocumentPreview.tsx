'use client';

import { useState } from 'react';

interface Section {
  title: string;
  content: string;
  tokenEstimate: number;
}

interface DocumentPreviewProps {
  filename: string;
  sections: Section[];
  totalTokens: number;
  onConfirm: (selectedSections: number[]) => void;
  onCancel: () => void;
}

export default function DocumentPreview({ filename, sections, totalTokens, onConfirm, onCancel }: DocumentPreviewProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(sections.map((_, i) => i)));
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const selectedTokens = sections
    .filter((_, i) => selected.has(i))
    .reduce((sum, s) => sum + s.tokenEstimate, 0);

  const tokenRatio = totalTokens > 0 ? selectedTokens / 8000 : 0;
  const tokenColor = tokenRatio < 0.3 ? '#22c55e' : tokenRatio < 0.7 ? '#eab308' : '#ef4444';

  const toggleSection = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(sections.map((_, i) => i)));
  const selectNone = () => setSelected(new Set());

  return (
    <div style={{
      borderRadius: 12, border: '1px solid #e5e7eb', background: 'white',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', background: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>
          Debrief du document
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          {filename} — {sections.length} section(s), ~{totalTokens} tokens total
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: '8px 16px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe',
        fontSize: 11, color: '#1e40af', lineHeight: 1.5,
      }}>
        Seul le texte utile est conserve en memoire, pas le fichier original. Selectionnez les sections a garder pour enrichir le contexte de vos agents.
      </div>

      {/* Token impact bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Impact sur le contexte</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: tokenColor }}>~{selectedTokens} tokens</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: tokenColor, width: `${Math.min(tokenRatio * 100, 100)}%`,
            transition: 'width 0.3s, background 0.3s',
          }} />
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: 'right' }}>
          max ~8000 tokens de contexte par conversation
        </div>
      </div>

      {/* Section selection buttons */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #e5e7eb' }}>
        <button onClick={selectAll} style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
          background: 'white', cursor: 'pointer', color: '#4b5563',
        }}>
          Tout selectionner
        </button>
        <button onClick={selectNone} style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
          background: 'white', cursor: 'pointer', color: '#4b5563',
        }}>
          Tout deselectionner
        </button>
      </div>

      {/* Sections list */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{
            padding: '10px 16px', borderBottom: '1px solid #f3f4f6',
            background: selected.has(idx) ? '#f0fdf4' : '#fafafa',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={selected.has(idx)}
                onChange={() => toggleSection(idx)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f' }}>{section.title}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>~{section.tokenEstimate} tokens</div>
              </div>
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                style={{
                  fontSize: 10, color: '#6366f1', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '2px 6px',
                }}
              >
                {expandedIdx === idx ? 'Masquer' : 'Apercu'}
              </button>
            </div>

            {expandedIdx === idx && (
              <div style={{
                marginTop: 8, padding: 10, borderRadius: 6, background: '#f8fafc',
                border: '1px solid #e5e7eb', fontSize: 11, color: '#4b5563',
                lineHeight: 1.5, maxHeight: 150, overflowY: 'auto',
                whiteSpace: 'pre-wrap', fontFamily: 'monospace',
              }}>
                {section.content.slice(0, 500)}{section.content.length > 500 ? '...' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {selected.size}/{sections.length} sections selectionnees
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: 'white', color: '#6b7280', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(Array.from(selected))}
            disabled={selected.size === 0}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: selected.size > 0 ? '#6366f1' : '#94a3b8',
              color: 'white', fontSize: 12, fontWeight: 600,
              cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Confirmer et sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
