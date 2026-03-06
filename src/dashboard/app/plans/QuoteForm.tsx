'use client';

import { useState } from 'react';

const BUDGET_OPTIONS = [
  '< 500 EUR/mois',
  '500-2000 EUR/mois',
  '2000-5000 EUR/mois',
  '> 5000 EUR/mois',
];

const INDUSTRY_OPTIONS = [
  'Tech / SaaS',
  'Finance / Banque',
  'Commerce / Retail',
  'Sante',
  'Immobilier',
  'Conseil / Services',
  'Industrie',
  'Education',
  'Autre',
];

export default function QuoteForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    estimatedUsers: '',
    needs: '',
    budgetRange: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const payload = {
        ...form,
        estimatedUsers: form.estimatedUsers ? parseInt(form.estimatedUsers, 10) : undefined,
        phone: form.phone || undefined,
        industry: form.industry || undefined,
        needs: form.needs || undefined,
        budgetRange: form.budgetRange || undefined,
      };

      const res = await fetch('/api/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  if (status === 'success') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          maxWidth: 500, width: '100%', padding: 48, textAlign: 'center',
          background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>&#x2705;</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Demande envoyee !</h3>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>
            Merci pour votre interet. Notre equipe vous contactera sous 24h pour discuter de votre projet White-Label.
          </p>
          <button onClick={onClose} className="btn btn-primary"
            style={{ padding: '12px 32px', fontSize: 15, borderRadius: 12, background: '#111827' }}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.12)',
    fontSize: 15, background: '#fff',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 14, fontWeight: 500,
    marginBottom: 6, color: '#374151',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflowY: 'auto',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        maxWidth: 600, width: '100%', padding: 40,
        maxHeight: '90vh', overflowY: 'auto',
        background: '#fff', borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Demande de devis Entreprise</h3>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 6 }}>White-Label SaaS — Instance dediee</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
            color: '#9ca3af', padding: 4, lineHeight: 1,
          }}>&#x2715;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Societe *</label>
              <input style={inputStyle} required minLength={2} maxLength={200}
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                placeholder="Nom de votre entreprise" />
            </div>
            <div>
              <label style={labelStyle}>Nom du contact *</label>
              <input style={inputStyle} required minLength={2} maxLength={200}
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                placeholder="Prenom Nom" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" style={inputStyle} required
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@entreprise.com" />
            </div>
            <div>
              <label style={labelStyle}>Telephone</label>
              <input style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Secteur d&apos;activite</label>
              <select style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                <option value="">Selectionnez...</option>
                {INDUSTRY_OPTIONS.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nombre d&apos;utilisateurs</label>
              <input type="number" style={inputStyle} min={1}
                onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                value={form.estimatedUsers} onChange={e => setForm(f => ({ ...f, estimatedUsers: e.target.value }))}
                placeholder="Ex: 50" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Budget mensuel estime</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BUDGET_OPTIONS.map(opt => (
                <button type="button" key={opt}
                  onClick={() => setForm(f => ({ ...f, budgetRange: f.budgetRange === opt ? '' : opt }))}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    border: form.budgetRange === opt ? '2px solid #111827' : '1px solid rgba(0,0,0,0.12)',
                    background: form.budgetRange === opt ? 'rgba(0,0,0,0.04)' : 'transparent',
                    color: form.budgetRange === opt ? '#111827' : '#6b7280',
                    fontWeight: form.budgetRange === opt ? 600 : 400,
                    transition: 'all 0.2s',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Besoins specifiques</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} maxLength={2000}
              onFocus={e => { e.target.style.borderColor = '#5b6cf7'; e.target.style.boxShadow = '0 0 0 3px rgba(91,108,247,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
              value={form.needs} onChange={e => setForm(f => ({ ...f, needs: e.target.value }))}
              placeholder="Decrivez vos besoins : nombre d'agents, integrations souhaitees, contraintes de securite..." />
          </div>

          {status === 'error' && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 16,
              background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', fontSize: 14,
            }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={status === 'sending'}
            style={{
              padding: '14px', fontSize: 15, fontWeight: 600,
              borderRadius: 12, background: '#111827',
              transition: 'opacity 0.2s',
              opacity: status === 'sending' ? 0.7 : 1,
            }}>
            {status === 'sending' ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
          </button>

          <p className="text-center" style={{ fontSize: 13, color: '#9ca3af', marginTop: 16 }}>
            Vos donnees sont confidentielles. Nous vous repondrons sous 24h ouvrables.
          </p>
        </form>
      </div>
    </div>
  );
}
