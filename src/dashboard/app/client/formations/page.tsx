'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';

const DONE_KEY = 'fz_formations_done';

/* ─── Formation Data ─── */
const FORMATIONS = [
  {
    id: 'ia-entreprise',
    icon: 'bar_chart',
    title: 'Maitriser l\'IA pour votre entreprise',
    description: 'Apprenez a integrer l\'intelligence artificielle dans vos processus metier. Decouvrez les outils, strategies et bonnes pratiques pour tirer parti de l\'IA au quotidien.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'communication-digitale',
    icon: 'chat',
    title: 'Communication digitale avancee',
    description: 'Maitrisez les leviers de la communication numerique : strategie de contenu, branding, storytelling et gestion de votre image en ligne pour maximiser votre impact.',
    level: 'Intermediaire',
    levelColor: '#f59e0b',
    duration: '3h',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'reseaux-sociaux',
    icon: 'phone_iphone',
    title: 'Reseaux sociaux pour professionnels',
    description: 'Construisez une presence professionnelle forte sur LinkedIn, Instagram et TikTok. Apprenez a creer du contenu engageant et a developper votre communaute.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h30',
    price: 'Gratuit',
    available: true,
  },
  {
    id: 'contenu-video',
    icon: 'videocam',
    title: 'Creation de contenu video',
    description: 'De la conception au montage, maitrisez la creation de videos professionnelles. Tournage smartphone, montage IA, sous-titrage automatique et diffusion multi-plateforme.',
    level: 'Intermediaire',
    levelColor: '#f59e0b',
    duration: '4h',
    price: 'Gratuit',
    available: false,
  },
  {
    id: 'email-marketing',
    icon: 'mail',
    title: 'Email marketing automatise',
    description: 'Concevez des campagnes email performantes avec l\'IA. Segmentation, personnalisation, automatisation des sequences et analyse des resultats pour un ROI optimal.',
    level: 'Avance',
    levelColor: '#ef4444',
    duration: '3h',
    price: 'Gratuit',
    available: false,
  },
  {
    id: 'seo-visibilite',
    icon: 'search',
    title: 'SEO et visibilite en ligne',
    description: 'Optimisez votre presence sur les moteurs de recherche. Mots-cles, contenu optimise, backlinks et outils IA pour ameliorer votre positionnement Google.',
    level: 'Debutant',
    levelColor: '#22c55e',
    duration: '2h',
    price: 'Gratuit',
    available: true,
  },
];

const BENEFITS = [
  { icon: '🎯', title: 'Sur mesure', desc: 'Formations adaptees a votre secteur et vos objectifs' },
  { icon: '👤', title: 'Expert dedie', desc: 'Formateur specialise avec experience terrain' },
  { icon: '📈', title: 'Resultats concrets', desc: 'Exercices pratiques et plan d\'action personnalise' },
  { icon: '🔄', title: 'Suivi post-formation', desc: '30 jours d\'accompagnement apres chaque session' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  formations: string[];
  context: string;
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  formations: [],
  context: '',
};

interface FormationRequest extends FormData {
  createdAt: string;
  status: string;
}

export default function FormationsPage() {
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  // Formation requests synced to backend
  const { data: requests, setData: setRequests } = useUserData<FormationRequest[]>('formation_requests', [], 'fz_formation_requests');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_KEY);
      if (raw) setDoneIds(new Set(JSON.parse(raw) as string[]));
    } catch { /* */ }
  }, []);

  function toggleDone(id: string) {
    setDoneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(DONE_KEY, JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  }

  const filteredFormations = FORMATIONS.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
  });

  const doneCount = FORMATIONS.filter(f => doneIds.has(f.id)).length;

  const toggleFormation = (id: string) => {
    setForm(prev => ({
      ...prev,
      formations: prev.formations.includes(id)
        ? prev.formations.filter(f => f !== id)
        : [...prev.formations, id],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || form.formations.length === 0) {
      setError('Veuillez remplir votre nom, email et selectionner au moins une formation.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setError('');

    setRequests(prev => [...prev, {
      ...form,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }]);

    setSubmitted(true);
    setForm({ ...emptyForm });
  };

  /* ─── Styles ─── */
  const accent = '#7c3aed';

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--fz-bg, #FFFFFF)',
    borderRadius: 16,
    padding: '28px 24px',
    border: '1px solid var(--fz-border, #E2E8F0)',
    transition: 'box-shadow 0.25s, transform 0.25s',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    border: '1px solid var(--fz-border, #E2E8F0)',
    borderRadius: 10,
    outline: 'none',
    fontFamily: 'inherit',
    background: 'var(--fz-bg-secondary, #F8FAFC)',
    color: 'var(--fz-text, #1E293B)',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--fz-text-secondary, #64748B)',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div className="client-page-scrollable" style={{ background: 'var(--fz-bg, #FFFFFF)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24, padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{PAGE_META.formations.emoji}</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fz-text, #1E293B)', margin: 0 }}>{PAGE_META.formations.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--fz-text-secondary, #64748B)', margin: '2px 0 0' }}>{PAGE_META.formations.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.formations.helpText} />
        </div>
      </div>

      {/* ── Benefits Bar ── */}
      <section style={{ ...sectionStyle, marginBottom: 48 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{
              background: 'var(--fz-bg, #FFFFFF)',
              borderRadius: 14,
              padding: '20px 18px',
              border: '1px solid var(--fz-border, #E2E8F0)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Formation Cards Grid ── */}
      <section style={{ ...sectionStyle, marginBottom: 56 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--fz-text, #1E293B)',
            letterSpacing: '-0.03em',
            marginBottom: 8,
          }}>
            Nos formations
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fz-text-secondary, #64748B)', maxWidth: 480, margin: '0 auto' }}>
            Des programmes concus pour vous rendre <span className="fz-logo-word">autonome</span> rapidement, avec des cas pratiques adaptes a votre activite.
          </p>
        </div>

        {/* Search + progress */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 36px', fontSize: 14,
                border: '1px solid var(--fz-border, #E2E8F0)', borderRadius: 10, outline: 'none',
                fontFamily: 'inherit', background: 'var(--fz-bg, #FFFFFF)', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = accent)}
              onBlur={e => (e.currentTarget.style.borderColor = '')}
            />
          </div>
          {doneCount > 0 && (
            <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, flexShrink: 0 }}>
              ✅ {doneCount}/{FORMATIONS.length} terminée{doneCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {filteredFormations.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--fz-text-muted, #94A3B8)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div>Aucune formation ne correspond à votre recherche.</div>
              <button onClick={() => setSearch('')} style={{ marginTop: 10, fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réinitialiser</button>
            </div>
          )}
          {filteredFormations.map(f => (
            <div
              key={f.id}
              style={{
                ...cardStyle,
                position: 'relative',
                opacity: f.available ? 1 : 0.85,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(124,58,237,0.12)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Unavailable badge */}
              {!f.available && (
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#92400e',
                  letterSpacing: '0.02em',
                }}>
                  Bientot disponible
                </div>
              )}

              {/* Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${accent}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}>
                  🎓
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--fz-text, #1E293B)',
                    lineHeight: 1.3,
                    marginBottom: 0,
                  }}>
                    {f.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 13,
                color: 'var(--fz-text-secondary, #64748B)',
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}>
                {f.description}
              </p>

              {/* Meta: Level, Duration, Price */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                paddingTop: 8,
                borderTop: '1px solid var(--fz-border, #E2E8F0)',
              }}>
                {/* Level Badge */}
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  background: `${f.levelColor}18`,
                  color: f.levelColor,
                }}>
                  {f.level}
                </span>

                {/* Duration */}
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--fz-text-secondary, #64748B)',
                  fontWeight: 500,
                }}>
                  ⏱️ {f.duration}
                </span>

                {/* Price */}
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 13,
                  fontWeight: 700,
                  color: accent,
                }}>
                  {f.price}
                </span>
              </div>

              {/* Inscription note for unavailable */}
              {!f.available && (
                <div style={{
                  fontSize: 11,
                  color: '#92400e',
                  background: '#fffbeb',
                  padding: '8px 12px',
                  borderRadius: 8,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}>
                  Inscrivez-vous pour etre informe de la disponibilite
                </div>
              )}

              {/* Done toggle */}
              {f.available && (
                <button
                  onClick={() => toggleDone(f.id)}
                  style={{
                    width: '100%', padding: '8px 0', fontSize: 12, fontWeight: 600,
                    borderRadius: 8, border: `1px solid ${doneIds.has(f.id) ? '#22c55e' : '#e5e7eb'}`,
                    background: doneIds.has(f.id) ? '#f0fdf4' : 'transparent',
                    color: doneIds.has(f.id) ? '#16a34a' : '#9ca3af',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  {doneIds.has(f.id) ? <>✅ Terminée</> : 'Marquer comme terminée'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA / Quote Request Section ── */}
      <section style={sectionStyle}>
        <div style={{
          background: 'var(--fz-bg, #FFFFFF)',
          borderRadius: 20,
          padding: 'clamp(24px, 4vw, 48px)',
          border: '1px solid var(--fz-border, #E2E8F0)',
          maxWidth: 680,
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--fz-text, #1E293B)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}>
              Faire une demande
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
              Decrivez vos besoins et nous vous proposons un programme sur mesure adapte a votre activite.
            </p>
          </div>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 24px',
              background: '#f0fdf4',
              borderRadius: 14,
              border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>
                Demande envoyee !
              </h3>
              <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.6, marginBottom: 20 }}>
                Merci pour votre interet. Nous reviendrons vers vous sous 24 a 48 heures avec une proposition personnalisee.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid #bbf7d0',
                  background: 'var(--fz-bg, #FFFFFF)',
                  color: '#15803d',
                  cursor: 'pointer',
                }}
              >
                Faire une autre demande
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                }}>
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = '')}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  placeholder="jean@entreprise.com"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = '')}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Telephone</label>
                <input
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = '')}
                />
              </div>

              {/* Formation Selection */}
              <div>
                <label style={labelStyle}>Formation(s) souhaitee(s) *</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {FORMATIONS.map(f => {
                    const selected = form.formations.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFormation(f.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: `1.5px solid ${selected ? accent : 'var(--fz-border, #E2E8F0)'}`,
                          background: selected ? `${accent}08` : '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.2s, background 0.2s',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: `2px solid ${selected ? accent : 'var(--border-secondary)'}`,
                          background: selected ? accent : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: '#fff',
                          flexShrink: 0,
                          transition: 'background 0.2s, border-color 0.2s',
                        }}>
                          {selected ? '✓' : ''}
                        </span>
                        <span style={{ fontSize: 16 }}>🎓</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
                            {f.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 1 }}>
                            {f.level} &middot; {f.duration}
                            {!f.available && <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: 6 }}>Bientot</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Context / Needs */}
              <div>
                <label style={labelStyle}>Vos besoins / contexte</label>
                <textarea
                  placeholder="Decrivez votre entreprise, vos objectifs et le contexte de cette demande de formation..."
                  value={form.context}
                  onChange={e => setForm(prev => ({ ...prev, context: e.target.value }))}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: 100,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = '')}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  background: `linear-gradient(135deg, ${accent}, #06b6d4)`,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, transform 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.99)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                Envoyer ma demande
              </button>

              <p style={{
                fontSize: 11,
                color: 'var(--fz-text-muted, #94A3B8)',
                textAlign: 'center',
                lineHeight: 1.5,
                margin: 0,
              }}>
                Vos donnees sont utilisees uniquement pour traiter votre demande. Reponse sous 24 a 48h.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
