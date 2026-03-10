'use client';

import { useState } from 'react';
import Link from 'next/link';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

const SERVICES = [
  {
    id: 'corporate',
    icon: '\ud83c\udfac',
    title: 'Video corporate',
    subtitle: 'Presentation d\'entreprise',
    description:
      'Videos institutionnelles haut de gamme pour presenter votre entreprise, vos valeurs et votre equipe. Script, tournage et post-production inclus.',
    price: 'A partir de 199 EUR',
    delivery: '3-5 jours',
  },
  {
    id: 'social',
    icon: '\ud83d\udcf1',
    title: 'Contenu reseaux sociaux',
    subtitle: 'Reels, TikTok, Shorts',
    description:
      'Contenus courts et percutants optimises pour chaque plateforme. Formats verticaux, sous-titres automatiques, musique tendance integree.',
    price: 'A partir de 49 EUR/video',
    delivery: '24-48h',
  },
  {
    id: 'podcast',
    icon: '\ud83c\udfa4',
    title: 'Podcasts video',
    subtitle: 'Enregistrement & montage',
    description:
      'Production complete de podcasts video : mise en scene multi-camera, montage dynamique, habillage graphique et diffusion multi-plateforme.',
    price: 'A partir de 99 EUR/episode',
    delivery: '2-3 jours',
  },
  {
    id: 'formation',
    icon: '\ud83d\udcda',
    title: 'Videos de formation',
    subtitle: 'Tutoriels & e-learning',
    description:
      'Modules de formation structures avec animations, screen recording, voix-off professionnelle et chapitrage interactif.',
    price: 'A partir de 299 EUR',
    delivery: '5-7 jours',
  },
  {
    id: 'ecommerce',
    icon: '\ud83d\uded2',
    title: 'Videos produit e-commerce',
    subtitle: 'Mise en valeur produit',
    description:
      'Videos produit sur fond neutre ou en situation, rotation 360, zoom details, ideal pour booster vos fiches produit et conversions.',
    price: 'A partir de 79 EUR/produit',
    delivery: '2-3 jours',
  },
  {
    id: 'motion',
    icon: '\ud83c\udfa8',
    title: 'Motion design',
    subtitle: 'Animations & infographies',
    description:
      'Animations 2D/3D, infographies animees, logos animes et transitions. Ideal pour expliquer des concepts complexes avec style.',
    price: 'A partir de 149 EUR',
    delivery: '3-5 jours',
  },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Selectionnez un budget' },
  { value: '<500', label: 'Moins de 500 EUR' },
  { value: '500-2000', label: '500 - 2 000 EUR' },
  { value: '2000-5000', label: '2 000 - 5 000 EUR' },
  { value: '>5000', label: 'Plus de 5 000 EUR' },
];

const meta = PAGE_META['video-pro'];

export default function VideoProPage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    brief: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.service || !form.brief) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const session = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('fz_session') ?? '{}')
        : {};
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/video-pro/quotes',
          method: 'POST',
          token: session.token,
          data: form,
        }),
      });

      if (!res.ok) {
        let existing: unknown[] = [];
        try { existing = JSON.parse(localStorage.getItem('fz_video_pro_quotes') ?? '[]'); } catch { /* */ }
        existing.push({ ...form, createdAt: new Date().toISOString(), status: 'pending' });
        localStorage.setItem('fz_video_pro_quotes', JSON.stringify(existing));
      }

      setSubmitted(true);
    } catch {
      let existing: unknown[] = [];
      try { existing = JSON.parse(localStorage.getItem('fz_video_pro_quotes') ?? '[]'); } catch { /* */ }
      existing.push({ ...form, createdAt: new Date().toISOString(), status: 'pending' });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrder = (serviceId: string) => {
    setForm(prev => ({ ...prev, service: serviceId }));
    const el = document.getElementById('devis-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#10b981' }}>\u2705</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 8 }}>
          Demande envoyee avec succes !
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.6, marginBottom: 24 }}>
          Notre equipe de production va etudier votre brief et vous recontacter sous 24 a 48h
          avec une proposition detaillee et un planning de realisation.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', phone: '', service: '', brief: '', budget: '' });
          }}
          style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600, borderRadius: 10,
            background: 'var(--fz-accent, #0EA5E9)', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Retour aux services
        </button>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? 12 : undefined }}>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{meta.emoji}</span>
          <div>
            <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{meta.title}</h1>
            <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{meta.subtitle}</p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
      </div>
      <PageExplanation pageId="video-pro" text={PAGE_META['video-pro']?.helpText} />

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--fz-accent, #0EA5E9) 0%, #6d28d9 50%, #06b6d4 100%)',
        borderRadius: 16, padding: isMobile ? '28px 18px' : '48px 36px', marginBottom: 36, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Freenzy.io Production
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.03em' }}>
            <span className="fz-logo-word">Video Pro</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            Productions video professionnelles assistees par <span className="fz-logo-word">IA</span>.
            De l&apos;idee au produit fini, nos <span className="fz-logo-word">assistants</span> et nos experts creent vos contenus video avec qualite et rapidite.
          </p>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16, marginBottom: 36,
      }}>
        {SERVICES.map(svc => (
          <div
            key={svc.id}
            style={{
              background: 'var(--fz-bg, #FFFFFF)', borderRadius: 14, border: 'none',
              padding: '24px 20px', display: 'flex', flexDirection: 'column',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--fz-accent, #0EA5E9)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.12)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--fz-border, #E2E8F0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 2 }}>
              {svc.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fz-accent, #0EA5E9)', fontWeight: 600, marginBottom: 10 }}>
              {svc.subtitle}
            </div>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', lineHeight: 1.6, flex: 1, margin: '0 0 16px 0' }}>
              {svc.description}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderTop: '1px solid var(--fz-border, #E2E8F0)', marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{svc.price}</div>
                <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{svc.delivery}</div>
              </div>
            </div>
            <button
              onClick={() => handleOrder(svc.id)}
              style={{
                width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 600,
                borderRadius: 10, border: '2px solid var(--fz-accent, #0EA5E9)', background: 'transparent',
                color: 'var(--fz-accent, #0EA5E9)', cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--fz-accent, #0EA5E9)';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--fz-accent, #0EA5E9)';
              }}
            >
              Commander
            </button>
          </div>
        ))}
      </div>

      {/* Studio Creatif Link */}
      <div style={{
        background: 'var(--accent-muted)', borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 40,
        border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 4 }}>
            Ou creez vous-meme dans notre Studio Creatif
          </div>
          <div style={{ fontSize: 12, color: 'var(--fz-text-muted)' }}>
            Generez vos propres videos et photos guidees par nos assistants IA, en toute autonomie.
          </div>
        </div>
        <Link
          href="/client/studio"
          style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'var(--fz-accent, #0EA5E9)', color: '#fff', textDecoration: 'none',
            transition: 'background 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#6d28d9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--fz-accent, #0EA5E9)'; }}
        >
          Ouvrir le Studio
        </Link>
      </div>

      {/* Devis Section */}
      <div id="devis-section" style={{
        background: 'var(--fz-bg, #FFFFFF)', borderRadius: 16, border: 'none',
        padding: '32px 28px', marginBottom: 40,
        boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 4 }}>
          Demander un devis
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 24 }}>
          Decrivez votre projet et recevez une proposition personnalisee sous 48h.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
              Nom complet *
            </label>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Votre nom"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
              Telephone (optionnel)
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>

          {/* Service Select */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
              Service souhaite *
            </label>
            <select
              value={form.service}
              onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
                background: 'var(--fz-bg, #FFFFFF)', outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            >
              <option value="">Selectionnez un service</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brief */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
            Brief du projet *
          </label>
          <textarea
            value={form.brief}
            onChange={e => setForm(prev => ({ ...prev, brief: e.target.value }))}
            placeholder="Decrivez votre projet : objectif de la video, public cible, messages cles, references visuelles, contraintes particulieres..."
            rows={4}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
              resize: 'vertical', outline: 'none', transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; }}
          />
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4, display: 'block' }}>
            Budget estimatif
          </label>
          <select
            value={form.budget}
            onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', fontSize: 13, fontFamily: 'var(--font-sans)',
              background: 'var(--fz-bg, #FFFFFF)', outline: 'none', transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--fz-accent, #0EA5E9)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; }}
          >
            {BUDGET_OPTIONS.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: '#fef2f2',
            color: '#dc2626', fontSize: 12, fontWeight: 500, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '13px 0', fontSize: 14, fontWeight: 700,
            borderRadius: 10, background: 'var(--fz-accent, #0EA5E9)', color: '#fff', border: 'none',
            cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
            transition: 'background 0.15s', fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--fz-accent, #0EA5E9)'; }}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
        </button>

        <p style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          Notre equipe de production analysera votre brief et vous enverra une proposition detaillee sous 48h.
        </p>
      </div>
    </div>
  );
}
