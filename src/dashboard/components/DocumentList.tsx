'use client';

import { useState, useEffect, useCallback } from 'react';
import { FILE_TYPE_ICONS, FILE_TYPE_COLORS, formatFileSize, formatTokenEstimate, MAX_STORAGE_MB } from '../lib/document-utils';

interface Document {
  id: string;
  originalFilename: string;
  fileType: string;
  sizeBytes: number;
  tokenEstimate: number;
  agentContext: string;
  createdAt: string;
}

interface DocumentListProps {
  agentContext?: string;
  token: string;
  refreshKey?: number;
}

export default function DocumentList({ agentContext, token, refreshKey }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [storage, setStorage] = useState({ totalBytes: 0, docCount: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const url = `/api/upload${agentContext ? `?context=${agentContext}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setDocs(data.documents ?? []);
      setStorage(data.storage ?? { totalBytes: 0, docCount: 0 });
    } catch { /* ignore */ }
    setLoading(false);
  }, [agentContext, token]);

  useEffect(() => { fetchDocs(); }, [fetchDocs, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/upload/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id));
        fetchDocs(); // refresh storage stats
      }
    } catch { /* ignore */ }
    setDeleting(null);
  };

  if (loading) return <div style={{ fontSize: 12, color: '#9B9B9B', padding: 12 }}>Chargement...</div>;

  const usedPercent = Math.min(100, (storage.totalBytes / (MAX_STORAGE_MB * 1024 * 1024)) * 100);

  return (
    <div>
      {/* Storage bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>{storage.docCount} document{storage.docCount !== 1 ? 's' : ''}</span>
          <span>{formatFileSize(storage.totalBytes)} / {MAX_STORAGE_MB} Mo</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: usedPercent > 80 ? '#ef4444' : usedPercent > 50 ? '#9B9B9B' : '#1A1A1A',
            width: `${usedPercent}%`, transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {docs.length === 0 && (
        <div style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', padding: 16 }}>
          Aucun document uploade
        </div>
      )}

      {docs.map(doc => (
        <div key={doc.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
          borderBottom: '1px solid #f3f4f6', fontSize: 13,
        }}>
          <span style={{
            display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            color: 'white', background: FILE_TYPE_COLORS[doc.fileType] ?? '#6b7280',
          }}>
            {FILE_TYPE_ICONS[doc.fileType] ?? 'FILE'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1d1d1f' }}>
              {doc.originalFilename}
            </div>
            <div style={{ fontSize: 11, color: '#9B9B9B' }}>
              {formatFileSize(doc.sizeBytes)} — {formatTokenEstimate(doc.tokenEstimate)}
            </div>
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            style={{
              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
              fontSize: 16, padding: '2px 6px', opacity: deleting === doc.id ? 0.4 : 1,
            }}
            title="Supprimer"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
