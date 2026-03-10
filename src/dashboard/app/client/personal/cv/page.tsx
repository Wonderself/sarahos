'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '../../../../components/Toast';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';
import HelpBubble from '../../../../components/HelpBubble';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill { name: string; level: 'débutant' | 'intermédiaire' | 'avancé' | 'expert' }
interface Experience { employer: string; title: string; start: string; end?: string; current?: boolean; description?: string }
interface Education { school: string; degree: string; field?: string; year?: string }
interface Language { name: string; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'natif' }

interface CVProfile {
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary?: string;
  skills?: Skill[];
  experiences?: Experience[];
  education?: Education[];
  languages?: Language[];
  career_goals?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

function completeness(p: CVProfile): { score: number; items: { label: string; done: boolean }[] } {
  const items = [
    { label: 'Prénom & Nom', done: !!(p.first_name && p.last_name) },
    { label: 'Titre professionnel', done: !!p.title },
    { label: 'Email & Téléphone', done: !!(p.email && p.phone) },
    { label: 'LinkedIn / Localisation', done: !!(p.linkedin || p.location) },
    { label: 'Résumé professionnel', done: !!(p.summary && p.summary.length > 20) },
    { label: 'Compétences (3+)', done: (p.skills?.length ?? 0) >= 3 },
    { label: 'Expériences (1+)', done: (p.experiences?.length ?? 0) >= 1 },
    { label: 'Formation', done: (p.education?.length ?? 0) >= 1 },
    { label: 'Langues', done: (p.languages?.length ?? 0) >= 1 },
    { label: 'Objectifs de carrière', done: !!(p.career_goals && p.career_goals.length > 10) },
  ];
  const done = items.filter(i => i.done).length;
  return { score: Math.round((done / items.length) * 100), items };
}

const SKILL_LEVELS: Skill['level'][] = ['débutant', 'intermédiaire', 'avancé', 'expert'];
const LANG_LEVELS: Language['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'natif'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CVPage() {
  const { showError, showSuccess } = useToast();
  const [profile, setProfile] = useState<CVProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [openSection, setOpenSection] = useState<string | null>('info');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalCall<{ profile: CVProfile }>('/personal/cv/profile');
      setProfile(res.profile ?? {});
    } catch { /* first time, empty profile */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(p: CVProfile) {
    setSaving(true);
    try {
      await portalCall('/personal/cv/profile', 'PUT', p);
      setSaved(true);
      showSuccess('CV sauvegardé');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de sauvegarde';
      setError(msg);
      showError(msg);
    }
    setSaving(false);
  }

  function update(patch: Partial<CVProfile>) {
    const updated = { ...profile, ...patch };
    setProfile(updated);
    save(updated);
  }

  // Skills
  function addSkill() {
    const name = prompt('Nom de la compétence :');
    if (!name) return;
    const skills = [...(profile.skills ?? []), { name, level: 'intermédiaire' as Skill['level'] }];
    update({ skills });
  }
  function removeSkill(i: number) {
    const skills = (profile.skills ?? []).filter((_, idx) => idx !== i);
    update({ skills });
  }
  function updateSkillLevel(i: number, level: Skill['level']) {
    const skills = (profile.skills ?? []).map((s, idx) => idx === i ? { ...s, level } : s);
    update({ skills });
  }

  // Experiences
  function addExperience() {
    const experiences = [...(profile.experiences ?? []), { employer: '', title: '', start: '', current: false }];
    setProfile(p => ({ ...p, experiences }));
  }
  function updateExperience(i: number, patch: Partial<Experience>) {
    const experiences = (profile.experiences ?? []).map((e, idx) => idx === i ? { ...e, ...patch } : e);
    setProfile(p => ({ ...p, experiences }));
  }
  function removeExperience(i: number) {
    const experiences = (profile.experiences ?? []).filter((_, idx) => idx !== i);
    update({ experiences });
  }

  // Education
  function addEducation() {
    const education = [...(profile.education ?? []), { school: '', degree: '' }];
    setProfile(p => ({ ...p, education }));
  }
  function updateEducation(i: number, patch: Partial<Education>) {
    const education = (profile.education ?? []).map((e, idx) => idx === i ? { ...e, ...patch } : e);
    setProfile(p => ({ ...p, education }));
  }
  function removeEducation(i: number) {
    const education = (profile.education ?? []).filter((_, idx) => idx !== i);
    update({ education });
  }

  // Languages
  function addLanguage() {
    const languages = [...(profile.languages ?? []), { name: '', level: 'B2' as Language['level'] }];
    setProfile(p => ({ ...p, languages }));
  }
  function updateLanguage(i: number, patch: Partial<Language>) {
    const languages = (profile.languages ?? []).map((l, idx) => idx === i ? { ...l, ...patch } : l);
    setProfile(p => ({ ...p, languages }));
  }
  function removeLanguage(i: number) {
    const languages = (profile.languages ?? []).filter((_, idx) => idx !== i);
    update({ languages });
  }

  function copyMarkdown() {
    const lines = [
      `# ${profile.first_name ?? ''} ${profile.last_name ?? ''}`,
      profile.title ? `**${profile.title}**` : '',
      profile.email ? `📧 ${profile.email}` : '',
      profile.phone ? `📱 ${profile.phone}` : '',
      profile.linkedin ? `🔗 ${profile.linkedin}` : '',
      profile.location ? `[location] ${profile.location}` : '',
      '',
      profile.summary ? `## Résumé\n${profile.summary}` : '',
      '',
      (profile.skills?.length ?? 0) > 0 ? `## Compétences\n${(profile.skills ?? []).map(s => `- ${s.name} (${s.level})`).join('\n')}` : '',
      '',
      (profile.experiences?.length ?? 0) > 0 ? `## Expériences\n${(profile.experiences ?? []).map(e => `**${e.title}** @ ${e.employer} (${e.start}${e.current ? ' - présent' : (e.end ? ` - ${e.end}` : '')})\n${e.description ?? ''}`).join('\n\n')}` : '',
      '',
      (profile.education?.length ?? 0) > 0 ? `## Formation\n${(profile.education ?? []).map(e => `**${e.degree}** — ${e.school}${e.year ? ` (${e.year})` : ''}`).join('\n')}` : '',
      '',
      (profile.languages?.length ?? 0) > 0 ? `## Langues\n${(profile.languages ?? []).map(l => `- ${l.name} : ${l.level}`).join('\n')}` : '',
      '',
      profile.career_goals ? `## Objectifs\n${profile.career_goals}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => { /* */ });
  }

  const comp = completeness(profile);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📄</div>
        <div className="text-md text-tertiary animate-pulse">Chargement de votre CV...</div>
      </div>
    );
  }

  const AccordionSection = ({ id, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fz-text, #1E293B)', fontWeight: 700, fontSize: 14,
        }}
      >
        <span>{icon} {title}</span>
        <span style={{ fontSize: 18, transform: openSection === id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {openSection === id && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--fz-border, #E2E8F0)' }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 4 }}>
            <Link href="/client/personal" style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', textDecoration: 'none' }}>← Agents personnels</Link>
          </div>
          <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{PAGE_META.cv.emoji} {PAGE_META.cv.title}</h1>
          <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{PAGE_META.cv.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <HelpBubble text={PAGE_META.cv.helpText} />
          {saved && <span style={{ fontSize: 12, color: '#22c55e' }}>✅ Sauvegardé</span>}
          {saving && <span style={{ fontSize: 12, color: '#f59e0b' }}>⏳ Sauvegarde...</span>}
          <button onClick={copyMarkdown} className="btn btn-ghost btn-sm">{copied ? <>✅ Copié !</> : <>📋 Copier Markdown</>}</button>
          <Link href="/client/chat?agent=fz-cv" className="btn btn-primary btn-sm">🤖 fz-cv</Link>
        </div>
      </div>
      <PageExplanation pageId="cv" text={PAGE_META.cv?.helpText} />

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Score */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Complétude du profil</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: comp.score >= 80 ? '#22c55e' : comp.score >= 50 ? '#f59e0b' : '#ef4444' }}>
            {comp.score}%
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--fz-bg-secondary, #F8FAFC)', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', width: `${comp.score}%`, borderRadius: 4, transition: 'width 0.6s',
            background: comp.score >= 80 ? '#22c55e' : comp.score >= 50 ? '#f59e0b' : '#ef4444',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {comp.items.map(item => (
            <span key={item.label} style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
              background: item.done ? '#22c55e20' : 'var(--fz-bg-secondary, #F8FAFC)',
              color: item.done ? '#22c55e' : 'var(--fz-text-muted, #94A3B8)',
            }}>
              {item.done ? '✅' : '○'} {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <AccordionSection id="info" title="Informations personnelles" icon="👤">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'first_name', label: 'Prénom', placeholder: 'Jean' },
            { key: 'last_name', label: 'Nom', placeholder: 'Dupont' },
            { key: 'title', label: 'Titre professionnel', placeholder: 'Développeur Full Stack' },
            { key: 'email', label: 'Email', placeholder: 'jean@example.com' },
            { key: 'phone', label: 'Téléphone', placeholder: '+33 6 ...' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/jean' },
            { key: 'location', label: 'Localisation', placeholder: 'Paris, France' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'title' ? 'span 2' : undefined }}>
              <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <input
                className="input"
                placeholder={f.placeholder}
                value={(profile as Record<string, string>)[f.key] ?? ''}
                onChange={e => update({ [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Résumé professionnel</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Décrivez votre profil en 3-5 lignes..."
              value={profile.summary ?? ''}
              onChange={e => update({ summary: e.target.value })}
              style={{ resize: 'none' }}
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="skills" title={`Compétences (${profile.skills?.length ?? 0})`} icon="💡">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {(profile.skills ?? []).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36, padding: '0 12px', borderRadius: 20, background: 'var(--fz-bg-secondary, #F8FAFC)', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' }}>
              <span style={{ fontSize: 13 }}>{s.name}</span>
              <select
                value={s.level}
                onChange={e => updateSkillLevel(i, e.target.value as Skill['level'])}
                style={{ fontSize: 10, border: 'none', background: 'none', color: 'var(--fz-text-muted, #94A3B8)', cursor: 'pointer' }}
              >
                {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addSkill} className="btn btn-ghost btn-sm">+ Ajouter une compétence</button>
      </AccordionSection>

      <AccordionSection id="experiences" title={`Expériences (${profile.experiences?.length ?? 0})`} icon="💼">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(profile.experiences ?? []).map((e, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 8, position: 'relative' }}>
              <button onClick={() => removeExperience(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted, #94A3B8)' }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>POSTE</label>
                  <input className="input" placeholder="Développeur Senior" value={e.title} onChange={ev => updateExperience(i, { title: ev.target.value })} onBlur={() => update({ experiences: profile.experiences })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>ENTREPRISE</label>
                  <input className="input" placeholder="Nom de l'entreprise" value={e.employer} onChange={ev => updateExperience(i, { employer: ev.target.value })} onBlur={() => update({ experiences: profile.experiences })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>DÉBUT</label>
                  <input className="input" placeholder="2022" value={e.start} onChange={ev => updateExperience(i, { start: ev.target.value })} onBlur={() => update({ experiences: profile.experiences })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>FIN</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="input" placeholder="2024" value={e.end ?? ''} disabled={!!e.current} onChange={ev => updateExperience(i, { end: ev.target.value })} onBlur={() => update({ experiences: profile.experiences })} />
                    <label style={{ fontSize: 11, display: 'flex', gap: 4, alignItems: 'center', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!e.current} onChange={ev => { updateExperience(i, { current: ev.target.checked, end: undefined }); update({ experiences: profile.experiences }); }} />
                      Actuel
                    </label>
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>DESCRIPTION</label>
                  <textarea className="input" rows={2} placeholder="Missions, réalisations..." value={e.description ?? ''} onChange={ev => updateExperience(i, { description: ev.target.value })} onBlur={() => update({ experiences: profile.experiences })} style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExperience} className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>+ Ajouter une expérience</button>
      </AccordionSection>

      <AccordionSection id="education" title={`Formation (${profile.education?.length ?? 0})`} icon="🎓">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(profile.education ?? []).map((e, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 8, position: 'relative' }}>
              <button onClick={() => removeEducation(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted, #94A3B8)' }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>DIPLÔME</label>
                  <input className="input" placeholder="Master, Licence..." value={e.degree} onChange={ev => updateEducation(i, { degree: ev.target.value })} onBlur={() => update({ education: profile.education })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>ÉCOLE</label>
                  <input className="input" placeholder="Nom de l'école" value={e.school} onChange={ev => updateEducation(i, { school: ev.target.value })} onBlur={() => update({ education: profile.education })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>SPÉCIALITÉ</label>
                  <input className="input" placeholder="Informatique, Finance..." value={e.field ?? ''} onChange={ev => updateEducation(i, { field: ev.target.value })} onBlur={() => update({ education: profile.education })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 3, color: 'var(--fz-text-muted, #94A3B8)' }}>ANNÉE</label>
                  <input className="input" placeholder="2021" value={e.year ?? ''} onChange={ev => updateEducation(i, { year: ev.target.value })} onBlur={() => update({ education: profile.education })} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addEducation} className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>+ Ajouter une formation</button>
      </AccordionSection>

      <AccordionSection id="languages" title={`Langues (${profile.languages?.length ?? 0})`} icon="🌐">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(profile.languages ?? []).map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="input"
                placeholder="Français"
                value={l.name}
                onChange={e => updateLanguage(i, { name: e.target.value })}
                onBlur={() => update({ languages: profile.languages })}
                style={{ flex: 1 }}
              />
              <select
                className="input"
                value={l.level}
                onChange={e => { updateLanguage(i, { level: e.target.value as Language['level'] }); update({ languages: profile.languages }); }}
                style={{ width: 100 }}
              >
                {LANG_LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <button onClick={() => removeLanguage(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--fz-text-muted, #94A3B8)' }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addLanguage} className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>+ Ajouter une langue</button>
      </AccordionSection>

      <AccordionSection id="goals" title="Objectifs de carrière" icon="🎯">
        <textarea
          className="input"
          rows={4}
          placeholder="Décrivez vos objectifs professionnels à court et long terme..."
          value={profile.career_goals ?? ''}
          onChange={e => setProfile(p => ({ ...p, career_goals: e.target.value }))}
          onBlur={() => update({ career_goals: profile.career_goals })}
          style={{ resize: 'none', width: '100%', boxSizing: 'border-box' }}
        />
      </AccordionSection>
    </div>
  );
}
