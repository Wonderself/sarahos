'use client';

import { useState, useCallback, useRef } from 'react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB, formatFileSize } from '../lib/document-utils';
import DocumentPreview from './DocumentPreview';

interface Section {
  title: string;
  content: string;
  tokenEstimate: number;
}

interface PreviewData {
  filename: string;
  sections: Section[];
  totalTokens: number;
  file: File;
}

interface DocumentUploaderProps {
  agentContext: string;
  token: string;
  onUploadComplete?: () => void;
}

export default function DocumentUploader({ agentContext, token, onUploadComplete }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewFile = useCallback(async (file: File) => {
    setError('');
    setSuccess('');
    setPreview(null);

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo)`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload?action=preview', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur preview' }));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      const data = await res.json();
      setPreview({
        filename: file.name,
        sections: data.sections ?? [],
        totalTokens: data.totalTokens ?? 0,
        file,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [token]);

  const confirmUpload = useCallback(async (selectedSections: number[]) => {
    if (!preview) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', preview.file);
      formData.append('agentContext', agentContext);
      formData.append('selectedSections', JSON.stringify(selectedSections));

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur upload' }));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      const doc = await res.json();
      const keptCount = selectedSections.length;
      const totalCount = preview.sections.length;
      setSuccess(
        `${preview.filename} sauvegarde (${formatFileSize(preview.file.size)}, ${keptCount}/${totalCount} sections, ~${doc.tokenEstimate ?? 0} tokens)`
      );
      setPreview(null);
      onUploadComplete?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }, [preview, agentContext, token, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) previewFile(file);
  }, [previewFile]);

  // If preview is showing, render that instead of the drop zone
  if (preview) {
    return (
      <div style={{ marginBottom: 16 }}>
        <DocumentPreview
          filename={preview.filename}
          sections={preview.sections}
          totalTokens={preview.totalTokens}
          onConfirm={confirmUpload}
          onCancel={() => setPreview(null)}
        />
        {uploading && (
          <div style={{ fontSize: 12, color: '#6366f1', marginTop: 8, textAlign: 'center' }}>
            Sauvegarde en cours...
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#6366f1' : '#e5e7eb'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? 'rgba(99,102,241,0.04)' : '#fafafa',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={e => { const f = e.target.files?.[0]; if (f) previewFile(f); }}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div style={{ fontSize: 13, color: '#6366f1' }}>Analyse du document...</div>
        ) : (
          <>
            <div style={{ fontSize: 22, marginBottom: 6 }}>+</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Glissez un fichier ici ou cliquez pour selectionner
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              PDF, Word, Excel, CSV, TXT, images — max {MAX_FILE_SIZE_MB} Mo
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
              Seul le texte utile est conserve — vous pourrez selectionner les sections a garder
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</div>
      )}
      {success && (
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>{success}</div>
      )}
    </div>
  );
}
