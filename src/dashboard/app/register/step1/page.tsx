'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E5E5',
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#1A1A1A',
  marginBottom: 4,
  display: 'block',
};

export default function RegisterStep1() {
  const router = useRouter();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rue, setRue] = useState('');
  const [ville, setVille] = useState('');
  const [cp, setCp] = useState('');
  const [pays, setPays] = useState('France');
  const [siteWeb, setSiteWeb] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!prenom.trim()) e.prenom = 'Prénom requis';
    if (!nom.trim()) e.nom = 'Nom requis';
    if (!companyName.trim()) e.companyName = 'Nom d\'entreprise ou activité requis';
    if (!ville.trim()) e.ville = 'Ville requise';
    if (!cp.trim()) e.cp = 'Code postal requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const data = {
      prenom: prenom.trim(),
      nom: nom.trim(),
      company_name: companyName.trim(),
      rue: rue.trim(),
      ville: ville.trim(),
      cp: cp.trim(),
      pays,
      site_web: siteWeb.trim(),
    };

    sessionStorage.setItem('freenzy_register_step1', JSON.stringify(data));
    router.push('/register/analyzing');
  }

  function fieldGroup(
    label: string,
    value: string,
    setter: (v: string) => void,
    key: string,
    opts?: { placeholder?: string; required?: boolean; autoFocus?: boolean; type?: string; helpText?: string }
  ) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          {label} {opts?.required !== false && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
        <input
          type={opts?.type || 'text'}
          value={value}
          onChange={(e) => setter(e.target.value)}
          placeholder={opts?.placeholder}
          autoFocus={opts?.autoFocus}
          style={{
            ...inputStyle,
            borderColor: errors[key] ? '#DC2626' : '#E5E5E5',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = errors[key] ? '#DC2626' : '#E5E5E5'; }}
        />
        {errors[key] && (
          <span style={{ fontSize: 12, color: '#DC2626', marginTop: 2, display: 'block' }}>{errors[key]}</span>
        )}
        {opts?.helpText && (
          <span style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2, display: 'block' }}>{opts.helpText}</span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '-0.3px',
          }}>
            freenzy.io
          </div>
          <div style={{ fontSize: 13, color: '#9B9B9B', marginTop: 4 }}>
            Étape 1/4 — Parlez-nous de vous
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4,
          backgroundColor: '#E5E5E5',
          borderRadius: 2,
          marginBottom: 32,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: '25%',
            backgroundColor: '#1A1A1A',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: '0 0 8px 0',
        }}>
          Avant tout, qui êtes-vous ?
        </h1>
        <p style={{
          fontSize: 14,
          color: '#6B6B6B',
          margin: '0 0 28px 0',
          lineHeight: 1.5,
        }}>
          2 minutes pour un espace 100% adapté à votre activité
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
            <div style={{ flex: 1 }}>
              {fieldGroup('Prénom', prenom, setPrenom, 'prenom', {
                placeholder: 'Marie', required: true, autoFocus: true,
              })}
            </div>
            <div style={{ flex: 1 }}>
              {fieldGroup('Nom', nom, setNom, 'nom', {
                placeholder: 'Dupont', required: true,
              })}
            </div>
          </div>

          {fieldGroup('Nom entreprise / activité', companyName, setCompanyName, 'companyName', {
            placeholder: 'Plomberie Dupont ou mon prénom si particulier',
            required: true,
            helpText: 'Vous êtes particulier ? Tapez simplement votre prénom et nom',
          })}

          {/* Address section */}
          <div style={{
            borderTop: '1px solid #E5E5E5',
            paddingTop: 20,
            marginTop: 8,
            marginBottom: 0,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
              Adresse
            </div>

            {fieldGroup('Rue', rue, setRue, 'rue', {
              placeholder: '12 rue de la Paix', required: false,
            })}

            <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
              <div style={{ flex: 2 }}>
                {fieldGroup('Ville', ville, setVille, 'ville', {
                  placeholder: 'Lyon', required: true,
                })}
              </div>
              <div style={{ flex: 1 }}>
                {fieldGroup('Code postal', cp, setCp, 'cp', {
                  placeholder: '69001', required: true,
                })}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Pays</label>
              <select
                value={pays}
                onChange={(e) => setPays(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none' as const,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%239B9B9B\' fill=\'none\' stroke-width=\'1.5\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  cursor: 'pointer',
                }}
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Website */}
          <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: 20, marginTop: 8 }}>
            {fieldGroup('Site web', siteWeb, setSiteWeb, 'siteWeb', {
              placeholder: 'https://votre-site.com', required: false, type: 'url',
            })}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: 48,
              backgroundColor: submitting ? '#6B6B6B' : '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.2s',
              marginTop: 8,
            }}
          >
            {submitting ? 'Chargement...' : 'Laisser Freenzy analyser mon profil \u2192'}
          </button>
        </form>

        {/* Disclaimer */}
        <p style={{
          fontSize: 11,
          color: '#9B9B9B',
          textAlign: 'center',
          marginTop: 16,
          lineHeight: 1.5,
        }}>
          Notre IA recherche les informations publiques disponibles sur vous et votre entreprise pour pr\u00e9-remplir votre profil. Vous validez tout avant utilisation. Aucune donn\u00e9e n&apos;est partag\u00e9e sans votre accord.
        </p>
      </div>
    </div>
  );
}
