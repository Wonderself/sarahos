'use client';

import { useState } from 'react';
import QuoteForm from './QuoteForm';

const FEATURES = [
  { icon: '&#x1F3E2;', text: 'Instance dediee sur nos serveurs' },
  { icon: '&#x1F310;', text: 'Domaine personnalise (votre-entreprise.freenzy.io)' },
  { icon: '&#x1F511;', text: 'Vos propres cles API Anthropic' },
  { icon: '&#x1F512;', text: 'Isolation complete des donnees' },
  { icon: '&#x2B50;', text: 'Support prioritaire & SLA garanti' },
  { icon: '&#x1F3A8;', text: 'Personnalisation agents & branding' },
  { icon: '&#x1F393;', text: 'Formation equipe incluse' },
  { icon: '&#x1F6E1;', text: '100% securise — aucun code source partage' },
];

export default function EnterpriseSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="landing-enterprise-section" style={{
        maxWidth: 860, margin: '0 auto 20px', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 40px)',
        borderRadius: 24,
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#fafafa',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Badge */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: '#111827',
          color: 'white', fontSize: 10, fontWeight: 600,
          padding: '5px 18px', borderRadius: '0 0 0 12px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          SUR DEVIS
        </div>

        <div className="text-center" style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>&#x1F3E2;</div>
          <h3 className="section-heading" style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 10, letterSpacing: '-0.02em' }}>
            <span className="fz-accent-word">Entreprise</span> — White-Label SaaS
          </h3>
          <p className="section-subheading" style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Votre propre plateforme Freenzy.io, <span className="fz-accent-word">sur mesure</span>. Instance dédiée, sécurité maximale, branding personnalisé.
          </p>
        </div>

        <div className="lp-enterprise-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10, marginBottom: 36,
        }}>
          {FEATURES.map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12,
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: f.icon }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => setShowForm(true)} className="btn btn-primary"
            style={{
              padding: '14px 36px', fontSize: 15, fontWeight: 600,
              background: '#111827',
              border: 'none', borderRadius: 12,
            }}>
            Demander un devis personnalise
          </button>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>
            Reponse sous 24h ouvrables
          </p>
        </div>
      </div>

      {showForm && <QuoteForm onClose={() => setShowForm(false)} />}

    </>
  );
}
