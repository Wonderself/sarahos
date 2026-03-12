'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 4: ENTREPRISE
// ═══════════════════════════════════════════════════

export default function UserEnterpriseTab({ userId, json, loading, showToast, onUpdate }: {
  userId: string;
  json: string;
  loading: boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onUpdate: (json: string) => void;
}) {
  const [text, setText] = useState(json);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    setText(json);
    setParseError(null);
  }, [json]);

  if (loading) {
    return <div style={styles.loadingSpinner}>Chargement du profil entreprise...</div>;
  }

  const handleTextChange = (value: string) => {
    setText(value);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'JSON invalide');
    }
  };

  const handleSave = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      showToast('JSON invalide, verifiez la syntaxe', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${userId}/company`, {
        method: 'PATCH',
        body: JSON.stringify(parsed),
      });
      onUpdate(JSON.stringify(parsed, null, 2));
      showToast('Profil entreprise mis a jour', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Parse for display
  let companyObj: Record<string, unknown> = {};
  try {
    companyObj = JSON.parse(text);
  } catch {
    // keep empty
  }

  const companyFields = ['name', 'industry', 'size', 'website', 'address', 'phone', 'siret', 'vatNumber', 'description'];
  const hasCompanyData = Object.keys(companyObj).length > 0;

  return (
    <div>
      {/* Formatted Display */}
      {hasCompanyData && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏢 Apercu du profil</div>
          <div style={styles.grid2}>
            {companyFields.map(field => {
              const value = companyObj[field];
              if (value === undefined || value === null || value === '') return null;
              return (
                <div key={field} style={styles.infoRow}>
                  <span style={styles.infoLabel}>{field}</span>
                  <span style={styles.infoValue}>{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* JSON Editor */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>📝 Editeur JSON</div>
        <div style={styles.formGroup}>
          <textarea
            style={{
              ...styles.textarea,
              borderColor: parseError ? 'var(--danger)' : 'var(--border-secondary)',
            }}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            rows={12}
          />
          {parseError && (
            <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
              ⚠️ {parseError}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{ ...styles.btnPrimary, opacity: saving || !!parseError ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving || !!parseError}
          >
            {saving ? 'Sauvegarde...' : <>💾 Sauvegarder</>}
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => {
              try {
                const formatted = JSON.stringify(JSON.parse(text), null, 2);
                setText(formatted);
                setParseError(null);
              } catch {
                showToast('Impossible de formater: JSON invalide', 'error');
              }
            }}
          >
            Formater
          </button>
        </div>
      </div>
    </div>
  );
}
