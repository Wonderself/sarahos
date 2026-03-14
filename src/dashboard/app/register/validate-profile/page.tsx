'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditableField from '../../../components/onboarding/EditableField';
import ProfileCard from '../../../components/onboarding/ProfileCard';

interface IntelligenceResult {
  entreprise?: {
    nom?: string;
    siret?: string;
    forme_juridique?: string;
    date_creation?: string;
    code_naf?: string;
    libelle_naf?: string;
    adresse?: string;
    source?: string;
  };
  google_business?: {
    found?: boolean;
    rating?: number;
    review_count?: number;
    name?: string;
  };
  web?: {
    site_url?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  analyse?: {
    activite_resume?: string;
    profession_detectee?: string;
  };
  concurrents?: Array<{
    nom: string;
    rating?: number;
    review_count?: number;
  }>;
  opportunites?: Array<{
    priority: 'haute' | 'moyenne' | 'basse';
    title: string;
    description: string;
    agent_recommande?: string;
  }>;
}

interface Step1Data {
  prenom?: string;
  nom?: string;
  email?: string;
}

export default function ValidateProfilePage() {
  const router = useRouter();
  const [intel, setIntel] = useState<IntelligenceResult>({});
  const [step1, setStep1] = useState<Step1Data>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ignoredOpps, setIgnoredOpps] = useState<Set<number>>(new Set());

  // Editable fields state
  const [fields, setFields] = useState({
    fullName: '',
    entreprise: '',
    siret: '',
    forme_juridique: '',
    date_creation: '',
    code_naf: '',
    adresse: '',
    site_url: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    activite_resume: '',
  });

  useEffect(() => {
    try {
      const intelRaw = sessionStorage.getItem('freenzy_intelligence_result');
      const step1Raw = sessionStorage.getItem('freenzy_register_step1');
      const intelData: IntelligenceResult = intelRaw ? JSON.parse(intelRaw) : {};
      const step1Data: Step1Data = step1Raw ? JSON.parse(step1Raw) : {};
      setIntel(intelData);
      setStep1(step1Data);
      setFields({
        fullName: [step1Data.prenom, step1Data.nom].filter(Boolean).join(' '),
        entreprise: intelData.entreprise?.nom || '',
        siret: intelData.entreprise?.siret || '',
        forme_juridique: intelData.entreprise?.forme_juridique || '',
        date_creation: intelData.entreprise?.date_creation || '',
        code_naf: [intelData.entreprise?.code_naf, intelData.entreprise?.libelle_naf].filter(Boolean).join(' — '),
        adresse: intelData.entreprise?.adresse || '',
        site_url: intelData.web?.site_url || '',
        linkedin: intelData.web?.linkedin || '',
        facebook: intelData.web?.facebook || '',
        instagram: intelData.web?.instagram || '',
        activite_resume: intelData.analyse?.activite_resume || '',
      });
    } catch {
      // No data found
    }
    setLoading(false);
  }, []);

  const updateField = (key: keyof typeof fields) => (val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const [editingResume, setEditingResume] = useState(false);

  const handleReset = () => {
    sessionStorage.removeItem('freenzy_intelligence_result');
    sessionStorage.removeItem('freenzy_register_step1');
    router.push('/register/step1');
  };

  const handleValidate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        business_info: {
          fullName: fields.fullName,
          entreprise: fields.entreprise,
          siret: fields.siret,
          forme_juridique: fields.forme_juridique,
          date_creation: fields.date_creation,
          code_naf: fields.code_naf,
          adresse: fields.adresse,
          site_url: fields.site_url,
          linkedin: fields.linkedin,
          facebook: fields.facebook,
          instagram: fields.instagram,
        },
        user_profiles: {
          activite_resume: fields.activite_resume,
          profession_detectee: intel.analyse?.profession_detectee,
          google_business: intel.google_business,
          concurrents: intel.concurrents,
          opportunites: intel.opportunites?.filter((_, i) => !ignoredOpps.has(i)),
        },
      };

      await fetch('/api/profile/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      sessionStorage.setItem('freenzy_validated_profile', JSON.stringify(payload));
      router.push('/onboarding');
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColors: Record<string, { bg: string; text: string }> = {
    haute: { bg: '#FEE2E2', text: '#DC2626' },
    moyenne: { bg: '#FEF3C7', text: '#D97706' },
    basse: { bg: '#DBEAFE', text: '#2563EB' },
  };

  const gmb = intel.google_business;
  const concurrents = intel.concurrents || [];
  const opportunites = intel.opportunites || [];
  const visibleOpps = opportunites.filter((_, i) => !ignoredOpps.has(i));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', color: '#9B9B9B' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #E5E5E5',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>freenzy.io</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6B6B6B' }}>Etape 2/4</span>
          <div style={{ width: 120, height: 4, background: '#E5E5E5', borderRadius: 2 }}>
            <div style={{ width: '50%', height: '100%', background: '#1A1A1A', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          Voici ce que nous avons trouve sur vous
        </h1>
        <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 32 }}>
          Verifiez et modifiez si necessaire — tout est editable
        </p>

        {/* SECTION A — IDENTITE */}
        <ProfileCard title="Votre identite" icon="🏢">
          <EditableField label="Prenom et Nom" value={fields.fullName} onSave={updateField('fullName')} />
          <EditableField label="Entreprise" value={fields.entreprise} onSave={updateField('entreprise')} />
          <EditableField
            label="SIRET"
            value={fields.siret}
            onSave={updateField('siret')}
            source={intel.entreprise?.source}
          />
          <EditableField label="Forme juridique" value={fields.forme_juridique} onSave={updateField('forme_juridique')} />
          <EditableField label="Date de creation" value={fields.date_creation} onSave={updateField('date_creation')} />
          <EditableField label="Code NAF et libelle" value={fields.code_naf} onSave={updateField('code_naf')} />
          <EditableField label="Adresse complete" value={fields.adresse} onSave={updateField('adresse')} />
        </ProfileCard>

        {/* SECTION B — PRESENCE EN LIGNE */}
        <ProfileCard title="Presence en ligne" icon="🌐">
          {/* Google My Business */}
          <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: gmb?.found ? '#22C55E' : '#9B9B9B',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: '#6B6B6B', minWidth: 140 }}>Google My Business</span>
            {gmb?.found ? (
              <span style={{ fontSize: 14, color: '#1A1A1A' }}>
                ⭐ {gmb.rating}/5 ({gmb.review_count} avis)
              </span>
            ) : (
              <span style={{ fontSize: 14, color: '#9B9B9B' }}>Non trouve</span>
            )}
          </div>

          {/* Site web */}
          <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: fields.site_url ? '#22C55E' : '#9B9B9B',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: '#6B6B6B', minWidth: 140 }}>Site web</span>
            {fields.site_url ? (
              <EditableField label="" value={fields.site_url} onSave={updateField('site_url')} type="url" />
            ) : (
              <button
                onClick={() => updateField('site_url')('https://')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#1A1A1A',
                  fontWeight: 500,
                }}
              >
                ➕ Ajouter
              </button>
            )}
          </div>

          {/* LinkedIn */}
          {fields.linkedin && (
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#6B6B6B', minWidth: 140 }}>LinkedIn</span>
              <span style={{ fontSize: 14, color: '#1A1A1A' }}>{fields.linkedin}</span>
            </div>
          )}

          {/* Facebook */}
          {fields.facebook && (
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#6B6B6B', minWidth: 140 }}>Facebook</span>
              <span style={{ fontSize: 14, color: '#1A1A1A' }}>{fields.facebook}</span>
            </div>
          )}

          {/* Instagram */}
          {fields.instagram && (
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#6B6B6B', minWidth: 140 }}>Instagram</span>
              <span style={{ fontSize: 14, color: '#1A1A1A' }}>{fields.instagram}</span>
            </div>
          )}
        </ProfileCard>

        {/* SECTION C — CE QUE FREENZY A COMPRIS */}
        <ProfileCard title="Ce que Freenzy a compris" icon="🧠" variant="blue">
          {editingResume ? (
            <textarea
              value={fields.activite_resume}
              onChange={(e) => setFields((prev) => ({ ...prev, activite_resume: e.target.value }))}
              onBlur={() => setEditingResume(false)}
              autoFocus
              style={{
                width: '100%',
                minHeight: 80,
                fontSize: 14,
                color: '#1A1A1A',
                border: '1px solid #BFDBFE',
                borderRadius: 8,
                padding: 12,
                outline: 'none',
                background: '#FFFFFF',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div>
              <p style={{ fontSize: 14, color: '#1A1A1A', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>
                {fields.activite_resume || 'Aucune analyse disponible'}
              </p>
              <button
                onClick={() => setEditingResume(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#6B6B6B',
                  padding: 0,
                }}
              >
                ✏️ Modifier
              </button>
            </div>
          )}
          {intel.analyse?.profession_detectee && (
            <div
              style={{
                marginTop: 12,
                display: 'inline-block',
                background: '#DBEAFE',
                color: '#1E40AF',
                fontSize: 13,
                padding: '4px 12px',
                borderRadius: 20,
                fontWeight: 500,
              }}
            >
              Profil detecte : {intel.analyse.profession_detectee}
            </div>
          )}
        </ProfileCard>

        {/* SECTION D — CONCURRENTS */}
        <ProfileCard title="Concurrents locaux" icon="📍">
          {concurrents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {concurrents.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < concurrents.length - 1 ? '1px solid #E5E5E5' : 'none',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#1A1A1A' }}>{c.nom}</span>
                  <span style={{ fontSize: 13, color: '#6B6B6B' }}>
                    {c.rating ? `⭐ ${c.rating}/5` : ''} {c.review_count ? `(${c.review_count} avis)` : ''}
                  </span>
                </div>
              ))}
              {gmb?.found && gmb.rating && concurrents.some((c) => c.rating) && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#FAFAFA',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#6B6B6B',
                  }}
                >
                  Votre note : ⭐ {gmb.rating}/5 — Moyenne concurrents :{' '}
                  ⭐{' '}
                  {(
                    concurrents.filter((c) => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) /
                    concurrents.filter((c) => c.rating).length
                  ).toFixed(1)}
                  /5
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#9B9B9B' }}>Aucun concurrent identifie dans votre zone</p>
          )}
        </ProfileCard>

        {/* SECTION E — OPPORTUNITES */}
        {visibleOpps.length > 0 && (
          <ProfileCard title="Opportunites" icon="⚡" variant="amber">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {opportunites.map((opp, i) => {
                if (ignoredOpps.has(i)) return null;
                const pColor = priorityColors[opp.priority] || priorityColors.basse;
                return (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: pColor.bg,
                            color: pColor.text,
                            padding: '2px 8px',
                            borderRadius: 12,
                            textTransform: 'uppercase',
                          }}
                        >
                          {opp.priority}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{opp.title}</span>
                      </div>
                      <button
                        onClick={() => setIgnoredOpps((prev) => new Set(prev).add(i))}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: '#9B9B9B',
                        }}
                      >
                        Ignorer
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0, marginBottom: 4 }}>{opp.description}</p>
                    {opp.agent_recommande && (
                      <span style={{ fontSize: 12, color: '#9B9B9B' }}>
                        Agent recommande : {opp.agent_recommande}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </ProfileCard>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#9B9B9B', marginBottom: 24 }}>
            Vous pouvez modifier ou supprimer n&apos;importe quelle information
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleReset}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 14,
                color: '#6B6B6B',
                cursor: 'pointer',
              }}
            >
              Tout supprimer et repartir de zero
            </button>
            <button
              onClick={handleValidate}
              disabled={submitting}
              style={{
                background: '#1A1A1A',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 14,
                color: '#FFFFFF',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Validation...' : 'Valider et personnaliser mon espace →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
