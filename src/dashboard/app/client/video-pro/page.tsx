'use client';

import { useState } from 'react';
import Link from 'next/link';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

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
      <div style={pageContainer(isMobile)}>
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>✅</div>
          <div style={CU.emptyTitle}>Demande envoyee avec succes !</div>
          <div style={CU.emptyDesc}>
            Notre equipe de production va etudier votre brief et vous recontacter sous 24 a 48h
            avec une proposition detaillee et un planning de realisation.
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: '', email: '', phone: '', service: '', brief: '', budget: '' });
            }}
            style={CU.btnPrimary}
          >
            Retour aux services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer(isMobile)}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={CU.pageTitle}>{meta.title}</h1>
              <HelpBubble text={meta.helpText} />
            </div>
            <p style={CU.pageSubtitle}>{meta.subtitle}</p>
          </div>
        </div>
      </div>
      <PageExplanation pageId="video-pro" text={PAGE_META['video-pro']?.helpText} />

      {/* Hero Section */}
      <div style={{
        background: CU.bgSecondary,
        borderRadius: 8, padding: isMobile ? '28px 18px' : '48px 36px', marginBottom: 36,
        border: `1px solid ${CU.border}`,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: CU.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Freenzy.io Production
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: CU.text, marginBottom: 8, letterSpacing: '-0.03em' }}>
            Video Pro
          </h2>
          <p style={{ fontSize: 16, color: CU.textSecondary, lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            Productions video professionnelles assistees par IA.
            De l&apos;idee au produit fini, nos assistants et nos experts creent vos contenus video avec qualite et rapidite.
          </p>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div style={{
        ...cardGrid(isMobile, 2),
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
        marginBottom: 36,
      }}>
        {SERVICES.map(svc => (
          <div
            key={svc.id}
            style={{
              ...CU.cardHoverable, padding: '24px 20px', display: 'flex', flexDirection: 'column',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = CU.bgSecondary;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = CU.bg;
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: CU.text, marginBottom: 2 }}>
              {svc.title}
            </div>
            <div style={{ fontSize: 12, color: CU.textSecondary, fontWeight: 600, marginBottom: 10 }}>
              {svc.subtitle}
            </div>
            <p style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.6, flex: 1, margin: '0 0 16px 0' }}>
              {svc.description}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderTop: `1px solid ${CU.border}`, marginBottom: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{svc.price}</div>
                <div style={{ fontSize: 11, color: CU.textMuted }}>{svc.delivery}</div>
              </div>
            </div>
            <button
              onClick={() => handleOrder(svc.id)}
              style={{
                ...CU.btnGhost,
                width: '100%', padding: '10px 0', minHeight: 44,
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = CU.accent;
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = CU.bg;
                (e.currentTarget as HTMLButtonElement).style.color = CU.textSecondary;
              }}
            >
              Commander
            </button>
          </div>
        ))}
      </div>

      {/* Studio Creatif Link */}
      <div style={{
        background: CU.bgSecondary, borderRadius: 8, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 40,
        border: `1px solid ${CU.border}`,
      }}>
        <div>
          <div style={{ ...CU.sectionTitle, marginBottom: 4 }}>
            Ou creez vous-meme dans notre Studio Creatif
          </div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>
            Generez vos propres videos et photos guidees par nos assistants IA, en toute autonomie.
          </div>
        </div>
        <Link
          href="/client/studio"
          style={{
            ...CU.btnPrimary,
            padding: '10px 20px', textDecoration: 'none', height: 'auto',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
        >
          Ouvrir le Studio
        </Link>
      </div>

      {/* Devis Section */}
      <div id="devis-section" style={{
        ...CU.card, padding: isMobile ? '24px 16px' : '32px 28px', marginBottom: 40,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: CU.text, marginBottom: 4 }}>
          Demander un devis
        </h2>
        <p style={{ fontSize: 13, color: CU.textMuted, marginBottom: 24 }}>
          Decrivez votre projet et recevez une proposition personnalisee sous 48h.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Name */}
          <div>
            <label style={CU.label}>Nom complet *</label>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Votre nom"
              style={CU.input}
              onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={CU.label}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="votre@email.com"
              style={CU.input}
              onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Phone */}
          <div>
            <label style={CU.label}>Telephone (optionnel)</label>
            <input
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+33 6 12 34 56 78"
              style={CU.input}
              onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; }}
            />
          </div>

          {/* Service Select */}
          <div>
            <label style={CU.label}>Service souhaite *</label>
            <select
              value={form.service}
              onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
              style={{ ...CU.select, width: '100%' }}
              onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
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
          <label style={CU.label}>Brief du projet *</label>
          <textarea
            value={form.brief}
            onChange={e => setForm(prev => ({ ...prev, brief: e.target.value }))}
            placeholder="Decrivez votre projet : objectif de la video, public cible, messages cles, references visuelles, contraintes particulieres..."
            rows={4}
            style={CU.textarea}
            onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; }}
          />
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 20 }}>
          <label style={CU.label}>Budget estimatif</label>
          <select
            value={form.budget}
            onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
            style={{ ...CU.select, width: '100%' }}
            onFocus={e => { e.currentTarget.style.borderColor = CU.accent; }}
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
            color: CU.danger, fontSize: 12, fontWeight: 500, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            ...CU.btnPrimary,
            width: '100%', padding: '13px 0', fontSize: 14, fontWeight: 700, minHeight: 44,
            height: 'auto',
            cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = submitting ? '0.7' : '1'; }}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
        </button>

        <p style={{ fontSize: 11, color: CU.textMuted, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          Notre equipe de production analysera votre brief et vous enverra une proposition detaillee sous 48h.
        </p>
      </div>
    </div>
  );
}
