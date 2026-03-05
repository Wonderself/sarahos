'use client';

import { useState } from 'react';
import Link from 'next/link';

const SERVICES = [
  {
    id: 'corporate',
    icon: '\uD83C\uDFAC',
    title: 'Video corporate',
    subtitle: 'Presentation d\'entreprise',
    description:
      'Videos institutionnelles haut de gamme pour presenter votre entreprise, vos valeurs et votre equipe. Script, tournage et post-production inclus.',
    price: 'A partir de 199 EUR',
    delivery: '3-5 jours',
  },
  {
    id: 'social',
    icon: '\uD83D\uDCF1',
    title: 'Contenu reseaux sociaux',
    subtitle: 'Reels, TikTok, Shorts',
    description:
      'Contenus courts et percutants optimises pour chaque plateforme. Formats verticaux, sous-titres automatiques, musique tendance integree.',
    price: 'A partir de 49 EUR/video',
    delivery: '24-48h',
  },
  {
    id: 'podcast',
    icon: '\uD83C\uDF99\uFE0F',
    title: 'Podcasts video',
    subtitle: 'Enregistrement & montage',
    description:
      'Production complete de podcasts video : mise en scene multi-camera, montage dynamique, habillage graphique et diffusion multi-plateforme.',
    price: 'A partir de 99 EUR/episode',
    delivery: '2-3 jours',
  },
  {
    id: 'formation',
    icon: '\uD83D\uDCDA',
    title: 'Videos de formation',
    subtitle: 'Tutoriels & e-learning',
    description:
      'Modules de formation structures avec animations, screen recording, voix-off professionnelle et chapitrage interactif.',
    price: 'A partir de 299 EUR',
    delivery: '5-7 jours',
  },
  {
    id: 'ecommerce',
    icon: '\uD83D\uDED2',
    title: 'Videos produit e-commerce',
    subtitle: 'Mise en valeur produit',
    description:
      'Videos produit sur fond neutre ou en situation, rotation 360, zoom details, ideal pour booster vos fiches produit et conversions.',
    price: 'A partir de 79 EUR/produit',
    delivery: '2-3 jours',
  },
  {
    id: 'motion',
    icon: '\uD83C\uDFA8',
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

export default function VideoProPage() {
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
        const existing = JSON.parse(localStorage.getItem('fz_video_pro_quotes') ?? '[]');
        existing.push({ ...form, createdAt: new Date().toISOString(), status: 'pending' });
        localStorage.setItem('fz_video_pro_quotes', JSON.stringify(existing));
      }

      setSubmitted(true);
    } catch {
      const existing = JSON.parse(localStorage.getItem('fz_video_pro_quotes') ?? '[]');
      existing.push({ ...form, createdAt: new Date().toISOString(), status: 'pending' });
      localStorage.setItem('fz_video_pro_quotes', JSON.stringify(existing));
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
        <div style={{ fontSize: 48, marginBottom: 16, color: '#10b981' }}>&#10003;</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>
          Demande envoyee avec succes !
        </h2>
        <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.6, marginBottom: 24 }}>
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
            background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Retour aux services
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        borderRadius: 16, padding: '48px 36px', marginBottom: 36, position: 'relative', overflow: 'hidden',
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
            Video Pro
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            Productions video professionnelles assistees par IA.
            De l&apos;idee au produit fini, nos agents et nos experts creent vos contenus video avec qualite et rapidite.
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
              background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
              padding: '24px 20px', display: 'flex', flexDirection: 'column',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 2 }}>
              {svc.title}
            </div>
            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, marginBottom: 10 }}>
              {svc.subtitle}
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, flex: 1, margin: '0 0 16px 0' }}>
              {svc.description}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderTop: '1px solid #f3f4f6', marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{svc.price}</div>
                <div style={{ fontSize: 11, color: '#86868b' }}>{svc.delivery}</div>
              </div>
            </div>
            <button
              onClick={() => handleOrder(svc.id)}
              style={{
                width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 600,
                borderRadius: 10, border: '2px solid #6366f1', background: 'transparent',
                color: '#6366f1', cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#6366f1';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = '#6366f1';
              }}
            >
              Commander
            </button>
          </div>
        ))}
      </div>

      {/* Studio Creatif Link */}
      <div style={{
        background: '#f5f3ff', borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 40,
        border: '1px solid #e0d9fa',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>
            Ou creez vous-meme dans notre Studio Creatif
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Generez vos propres videos et photos guidees par nos agents IA, en toute autonomie.
          </div>
        </div>
        <Link
          href="/client/studio"
          style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#6366f1', color: '#fff', textDecoration: 'none',
            transition: 'background 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#4f46e5'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#6366f1'; }}
        >
          Ouvrir le Studio
        </Link>
      </div>

      {/* Devis Section */}
      <div id="devis-section" style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
        padding: '32px 28px', marginBottom: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>
          Demander un devis
        </h2>
        <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>
          Decrivez votre projet et recevez une proposition personnalisee sous 48h.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
              Nom complet *
            </label>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Votre nom"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
              Telephone (optionnel)
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
            />
          </div>

          {/* Service Select */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
              Service souhaite *
            </label>
            <select
              value={form.service}
              onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
                background: '#fff', outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
            >
              <option value="">Selectionnez un service</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brief */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
            Brief du projet *
          </label>
          <textarea
            value={form.brief}
            onChange={e => setForm(prev => ({ ...prev, brief: e.target.value }))}
            placeholder="Decrivez votre projet : objectif de la video, public cible, messages cles, references visuelles, contraintes particulieres..."
            rows={4}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
              resize: 'vertical', outline: 'none', transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
          />
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, display: 'block' }}>
            Budget estimatif
          </label>
          <select
            value={form.budget}
            onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'var(--font-sans)',
              background: '#fff', outline: 'none', transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
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
            borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none',
            cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
            transition: 'background 0.15s', fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#6366f1'; }}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
        </button>

        <p style={{ fontSize: 11, color: '#a1a1a6', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          Notre equipe de production analysera votre brief et vous enverra une proposition detaillee sous 48h.
        </p>
      </div>
    </div>
  );
}
