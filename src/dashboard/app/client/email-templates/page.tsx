'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, toolbar } from '../../../lib/page-styles';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Templates Email
//  Bibliothèque de modèles email prêts à l'emploi
// ═══════════════════════════════════════════════════

type TemplateCategory = 'Marketing' | 'Transactionnel' | 'Notification' | 'Événement';

interface EmailTemplate {
  id: string;
  name: string;
  emoji: string;
  category: TemplateCategory;
  subject: string;
  description: string;
  htmlPreview: string;
  isBuiltIn: boolean;
}

interface CustomTemplate extends EmailTemplate {
  createdAt: string;
}

const STORAGE_KEY = 'fz_email_templates';

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Marketing': '#0EA5E9',
  'Transactionnel': '#059669',
  'Notification': '#2563eb',
  'Événement': '#d97706',
};

const BUILT_IN_TEMPLATES: EmailTemplate[] = [
  {
    id: 'bi-1', name: 'Newsletter', emoji: '📰', category: 'Marketing',
    subject: 'Les nouvelles de [Entreprise] — [Mois]',
    description: 'Template de newsletter mensuelle avec sections et CTA.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto"><div style="background:linear-gradient(135deg,#0EA5E9,#5b6cf7);padding:30px 20px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:22px">📰 Newsletter</h1><p style="color:#fff;opacity:0.8;margin:8px 0 0;font-size:14px">[Entreprise] — Mars 2026</p></div><div style="padding:20px;background:#fff"><h2 style="font-size:16px;color:#1a1a1a">Les temps forts du mois</h2><p style="color:#666;font-size:14px;line-height:1.6">Découvrez nos dernières actualités, nouveaux produits et événements à venir.</p><div style="background:#f7f7f7;border-radius:8px;padding:16px;margin:16px 0"><h3 style="font-size:14px;margin:0 0 8px;color:#1a1a1a">🚀 Nouvelle fonctionnalité</h3><p style="margin:0;color:#666;font-size:13px">Description de la nouveauté...</p></div><a href="#" style="display:inline-block;background:#0EA5E9;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">En savoir plus</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-2', name: 'Promo', emoji: '🏷️', category: 'Marketing',
    subject: '-[X]% sur tout le site — Offre limitée !',
    description: 'Email promotionnel avec code promo et compte à rebours.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto"><div style="background:#dc2626;padding:30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:36px">-30%</h1><p style="color:#fff;font-size:16px;margin:8px 0 0">SUR TOUT LE SITE</p></div><div style="padding:20px;background:#fff;text-align:center"><p style="font-size:18px;color:#1a1a1a;font-weight:700">Offre flash — 48h seulement</p><div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:8px;padding:14px;margin:16px 0"><span style="font-size:20px;font-weight:800;color:#dc2626;letter-spacing:4px">PROMO30</span></div><a href="#" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">J'en profite</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-3', name: 'Bienvenue', emoji: '👋', category: 'Transactionnel',
    subject: 'Bienvenue chez [Entreprise] !',
    description: 'Email d\'accueil pour les nouveaux inscrits.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto"><div style="background:linear-gradient(135deg,#059669,#10b981);padding:30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:24px">👋 Bienvenue !</h1></div><div style="padding:20px;background:#fff"><p style="font-size:15px;color:#1a1a1a;line-height:1.6">Bonjour [Prénom],</p><p style="color:#666;font-size:14px;line-height:1.6">Merci de nous avoir rejoint ! Votre compte est prêt. Voici vos premiers pas :</p><div style="margin:16px 0"><div style="padding:10px;border-left:3px solid #059669;margin:8px 0;font-size:13px;color:#333">1. Complétez votre profil</div><div style="padding:10px;border-left:3px solid #059669;margin:8px 0;font-size:13px;color:#333">2. Explorez les fonctionnalités</div><div style="padding:10px;border-left:3px solid #059669;margin:8px 0;font-size:13px;color:#333">3. Invitez votre équipe</div></div><a href="#" style="display:inline-block;background:#059669;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Commencer</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-4', name: 'Abandon panier', emoji: '🛒', category: 'Marketing',
    subject: 'Vous avez oublié quelque chose...',
    description: 'Relance pour les paniers abandonnés.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="padding:30px;text-align:center"><span style="font-size:48px">🛒</span><h2 style="color:#1a1a1a;margin:12px 0 8px">Oups, vous avez oublié quelque chose !</h2><p style="color:#666;font-size:14px">Votre panier vous attend. Finalisez votre commande avant qu'il ne soit trop tard.</p><div style="background:#f7f7f7;border-radius:8px;padding:16px;margin:16px 0;text-align:left"><p style="font-weight:600;color:#1a1a1a;margin:0 0 4px;font-size:14px">[Produit]</p><p style="color:#666;margin:0;font-size:13px">[Prix] €</p></div><a href="#" style="display:inline-block;background:#0EA5E9;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700">Reprendre ma commande</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-5', name: 'Relance', emoji: '🔄', category: 'Marketing',
    subject: 'Ça fait longtemps ! On a des nouveautés',
    description: 'Email de réengagement pour les utilisateurs inactifs.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><span style="font-size:48px">🔄</span><h2 style="color:#1a1a1a;margin:12px 0">On pense à vous !</h2><p style="color:#666;font-size:14px;line-height:1.6">Ça fait un moment qu'on ne vous a pas vu. Découvrez ce qui a changé depuis votre dernière visite.</p><a href="#" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">Voir les nouveautés</a></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-6', name: 'Événement', emoji: '🎪', category: 'Événement',
    subject: 'Invitation — [Événement] le [Date]',
    description: 'Invitation à un événement avec détails et RSVP.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto"><div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:22px">🎪 Vous êtes invité(e) !</h1></div><div style="padding:20px;background:#fff"><h2 style="font-size:18px;color:#1a1a1a;text-align:center">[Nom de l'événement]</h2><div style="display:flex;gap:16px;justify-content:center;margin:16px 0"><div style="text-align:center"><div style="font-size:12px;color:#999">DATE</div><div style="font-weight:700;color:#1a1a1a">[Date]</div></div><div style="text-align:center"><div style="font-size:12px;color:#999">LIEU</div><div style="font-weight:700;color:#1a1a1a">[Lieu]</div></div></div><p style="color:#666;font-size:14px;text-align:center">[Description]</p><div style="text-align:center"><a href="#" style="display:inline-block;background:#d97706;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Confirmer ma présence</a></div></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-7', name: 'Anniversaire', emoji: '🎂', category: 'Notification',
    subject: 'Joyeux anniversaire [Prénom] ! 🎉',
    description: 'Email d\'anniversaire avec offre spéciale.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><span style="font-size:64px">🎂</span><h2 style="color:#1a1a1a;margin:12px 0">Joyeux anniversaire !</h2><p style="color:#666;font-size:14px">Pour fêter ça, on vous offre un cadeau spécial :</p><div style="background:#fef3c7;border-radius:8px;padding:16px;margin:16px 0"><span style="font-size:24px;font-weight:800;color:#d97706">-20% sur votre prochaine commande</span></div><a href="#" style="display:inline-block;background:#d97706;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Utiliser mon cadeau</a></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-8', name: 'Black Friday', emoji: '🖤', category: 'Marketing',
    subject: 'BLACK FRIDAY — Jusqu\'à -70% !',
    description: 'Template Black Friday avec design sombre.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto"><div style="background:#1a1a1a;padding:30px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0;font-size:28px">🖤 BLACK FRIDAY</h1><p style="color:#fbbf24;font-size:20px;font-weight:800;margin:8px 0 0">-70%</p></div><div style="background:#111;padding:20px;text-align:center;border-radius:0 0 12px 12px"><p style="color:#ccc;font-size:14px">Les meilleures offres de l'année. Ne les manquez pas.</p><a href="#" style="display:inline-block;background:#fbbf24;color:#1a1a1a;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:800;font-size:16px;margin-top:12px">SHOPPER</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-9', name: 'Lancement produit', emoji: '🚀', category: 'Marketing',
    subject: 'Nouveau ! Découvrez [Produit]',
    description: 'Annonce de lancement d\'un nouveau produit.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center"><span style="font-size:48px">🚀</span><h2 style="color:#fff;margin:12px 0 0">C'est nouveau !</h2></div><div style="padding:20px;text-align:center"><h3 style="font-size:20px;color:#1a1a1a">[Nom du produit]</h3><p style="color:#666;font-size:14px;line-height:1.6">[Description courte du produit et ses bénéfices principaux]</p><a href="#" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Découvrir</a></div></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-10', name: 'Sondage', emoji: '📊', category: 'Notification',
    subject: 'Votre avis compte ! (2 min)',
    description: 'Demande de feedback avec sondage rapide.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><span style="font-size:48px">📊</span><h2 style="color:#1a1a1a;margin:12px 0">Votre avis compte !</h2><p style="color:#666;font-size:14px">Aidez-nous à nous améliorer en répondant à ce sondage de 2 minutes.</p><div style="display:flex;justify-content:center;gap:8px;margin:20px 0"><span style="font-size:32px;cursor:pointer">😡</span><span style="font-size:32px;cursor:pointer">😐</span><span style="font-size:32px;cursor:pointer">🙂</span><span style="font-size:32px;cursor:pointer">😊</span><span style="font-size:32px;cursor:pointer">🤩</span></div><a href="#" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Répondre au sondage</a></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-11', name: 'Réactivation', emoji: '💡', category: 'Marketing',
    subject: 'On vous manque ? Revenez avec -15%',
    description: 'Email de réactivation avec offre incitative.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><span style="font-size:48px">💡</span><h2 style="color:#1a1a1a;margin:12px 0">Ça fait longtemps !</h2><p style="color:#666;font-size:14px;line-height:1.6">On a plein de nouveautés à vous montrer. Pour fêter vos retrouvailles :</p><div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0"><span style="font-size:22px;font-weight:800;color:#059669">-15% avec le code RETOUR15</span></div><a href="#" style="display:inline-block;background:#059669;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Revenir</a></div>`,
    isBuiltIn: true,
  },
  {
    id: 'bi-12', name: 'Merci', emoji: '❤️', category: 'Transactionnel',
    subject: 'Merci pour votre commande !',
    description: 'Confirmation et remerciement post-achat.',
    htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><span style="font-size:48px">❤️</span><h2 style="color:#1a1a1a;margin:12px 0">Merci [Prénom] !</h2><p style="color:#666;font-size:14px;line-height:1.6">Votre commande #[Numéro] a bien été enregistrée. Vous recevrez un email de suivi dès l'expédition.</p><div style="background:#f7f7f7;border-radius:8px;padding:16px;margin:16px 0;text-align:left"><p style="font-weight:600;margin:0 0 4px;font-size:14px;color:#1a1a1a">Récapitulatif</p><p style="color:#666;margin:0;font-size:13px">[Produit] — [Prix] €</p></div><a href="#" style="display:inline-block;background:#0EA5E9;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Suivre ma commande</a></div>`,
    isBuiltIn: true,
  },
];

const ALL_CATEGORIES: TemplateCategory[] = ['Marketing', 'Transactionnel', 'Notification', 'Événement'];

export default function EmailTemplatesPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['email-templates'];

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCtaText, setEditCtaText] = useState('En savoir plus');
  const [copied, setCopied] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<TemplateCategory>('Marketing');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomTemplates(JSON.parse(stored));
    } catch { /* */ }
  }, []);

  function saveCustom(list: CustomTemplate[]) {
    setCustomTemplates(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* */ }
  }

  const allTemplates: EmailTemplate[] = [...BUILT_IN_TEMPLATES, ...customTemplates];
  const filtered = activeCategory === 'all' ? allTemplates : allTemplates.filter(t => t.category === activeCategory);

  function handleCopyHtml(t: EmailTemplate) {
    navigator.clipboard.writeText(t.htmlPreview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCreateCustom() {
    if (!newName.trim() || !newSubject.trim()) return;
    const custom: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: newName, emoji: '📝', category: newCategory,
      subject: newSubject, description: newDescription || 'Template personnalisé',
      htmlPreview: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;text-align:center"><h2 style="color:#1a1a1a">${newName}</h2><p style="color:#666;font-size:14px">${newDescription || 'Votre contenu ici...'}</p><a href="#" style="display:inline-block;background:${CATEGORY_COLORS[newCategory]};color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Action</a></div>`,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    saveCustom([custom, ...customTemplates]);
    setNewName(''); setNewSubject(''); setNewDescription(''); setShowCreate(false);
  }

  function handleDeleteCustom(id: string) {
    saveCustom(customTemplates.filter(t => t.id !== id));
  }

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta?.emoji}</span>
          <h1 style={CU.pageTitle}>
            {meta?.title}
            <HelpBubble text={meta?.helpText || ''} />
          </h1>
        </div>
        <p style={CU.pageSubtitle}>{meta?.subtitle}</p>
      </div>
      <PageExplanation pageId="email-templates" text={PAGE_META['email-templates']?.helpText} />

      {/* Filters + Create */}
      <div style={{ ...toolbar(), justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCategory('all')} style={
            activeCategory === 'all' ? { ...CU.btnPrimary, height: 28, fontSize: 12 } : CU.btnSmall
          }>Tous ({allTemplates.length})</button>
          {ALL_CATEGORIES.map(cat => {
            const count = allTemplates.filter(t => t.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={
                activeCategory === cat
                  ? { ...CU.btnPrimary, height: 28, fontSize: 12, background: CATEGORY_COLORS[cat] }
                  : CU.btnSmall
              }>{cat} ({count})</button>
            );
          })}
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={CU.btnPrimary}>➕ Créer</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...CU.card, marginBottom: 20, padding: isMobile ? 16 : 20 }}>
          <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>
            ➕ Nouveau template personnalisé
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input placeholder="Nom du template *" value={newName} onChange={e => setNewName(e.target.value)}
                style={{ ...CU.input, flex: 2, minWidth: 180 }} />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as TemplateCategory)}
                style={{ ...CU.select, flex: 1, minWidth: 140 }}>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input placeholder="Objet de l'email *" value={newSubject} onChange={e => setNewSubject(e.target.value)}
              style={CU.input} />
            <input placeholder="Description (optionnel)" value={newDescription} onChange={e => setNewDescription(e.target.value)}
              style={CU.input} />
            <button onClick={handleCreateCustom} style={{ ...CU.btnPrimary, alignSelf: 'flex-start' }}>Créer le template</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={cardGrid(isMobile, 3)}>
        {filtered.map(t => (
          <div key={t.id} style={{ ...CU.cardHoverable, position: 'relative' }}
            onClick={() => { setPreviewTemplate(t); setEditMode(false); setEditTitle(t.name); setEditSubject(t.subject); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: CU.text }}>{t.name}</div>
                <span style={{
                  ...CU.badge,
                  background: `${CATEGORY_COLORS[t.category]}20`, color: CATEGORY_COLORS[t.category],
                }}>{t.category}</span>
              </div>
              {!t.isBuiltIn && (
                <button onClick={e => { e.stopPropagation(); handleDeleteCustom(t.id); }} style={{
                  background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: CU.danger,
                }}>🗑️</button>
              )}
            </div>
            <div style={{ fontSize: 12, color: CU.textSecondary, marginBottom: 8 }}>{t.description}</div>
            {/* Mini preview */}
            <div style={{
              background: '#fff', borderRadius: 8, padding: 8, border: `1px solid ${CU.border}`,
              height: 100, overflow: 'hidden', transform: 'scale(0.5)', transformOrigin: 'top left',
              width: '200%', pointerEvents: 'none',
            }} dangerouslySetInnerHTML={{ __html: t.htmlPreview }} />
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div style={CU.overlay} onClick={() => setPreviewTemplate(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            ...CU.modal, maxWidth: 650, maxHeight: '85vh',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ ...CU.sectionTitle, fontSize: 18 }}>
                {previewTemplate.emoji} {previewTemplate.name}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditMode(!editMode)} style={
                  editMode ? { ...CU.btnPrimary, height: 28, fontSize: 12 } : CU.btnSmall
                }>🎨 Personnaliser</button>
                <button onClick={() => setPreviewTemplate(null)} style={{
                  background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: CU.textMuted,
                }}>✕</button>
              </div>
            </div>

            {editMode && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre"
                  style={CU.input} />
                <input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Objet"
                  style={CU.input} />
                <input value={editCtaText} onChange={e => setEditCtaText(e.target.value)} placeholder="Texte du bouton CTA"
                  style={CU.input} />
              </div>
            )}

            <div style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 12 }}>
              <strong>Objet :</strong> {editMode ? editSubject : previewTemplate.subject}
            </div>
            <div style={{ background: CU.bgSecondary, borderRadius: 8, padding: 16, border: `1px solid ${CU.border}` }}
              dangerouslySetInnerHTML={{ __html: previewTemplate.htmlPreview }} />
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={() => handleCopyHtml(previewTemplate)} style={CU.btnPrimary}>
                {copied ? '✅ Copié !' : '📋 Copier HTML'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
