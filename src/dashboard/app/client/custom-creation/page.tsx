'use client';

import { useState } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useVisitorDraftObject } from '../../../lib/useVisitorDraft';

// Pre-built marketplace modules
const MARKETPLACE_MODULES = [
  { id: 'mod-invoice', name: 'Facturation Auto', emoji: '🧾', category: 'Finance', desc: 'Génération automatique de factures, devis et relances clients.', author: 'Freenzy Team', downloads: 234, rating: 4.8 },
  { id: 'mod-crm-mini', name: 'Mini CRM', emoji: '📞', category: 'Commercial', desc: 'Gestion de contacts, suivi de pipeline et relances automatiques.', author: 'Pierre D.', downloads: 189, rating: 4.6 },
  { id: 'mod-newsletter', name: 'Newsletter IA', emoji: '✉️', category: 'Marketing', desc: 'Rédaction et envoi automatique de newsletters personnalisées.', author: 'Freenzy Team', downloads: 312, rating: 4.9 },
  { id: 'mod-inventory', name: 'Gestion de Stock', emoji: '📦', category: 'Logistique', desc: 'Suivi de stock en temps réel avec alertes de réapprovisionnement.', author: 'Marie L.', downloads: 145, rating: 4.5 },
  { id: 'mod-hr-onboard', name: 'Onboarding RH', emoji: '🎓', category: 'RH', desc: 'Parcours d\'intégration automatisé pour les nouveaux employés.', author: 'Freenzy Team', downloads: 98, rating: 4.7 },
  { id: 'mod-expense', name: 'Notes de Frais', emoji: '🧮', category: 'Finance', desc: 'Scan de reçus, catégorisation et export comptable automatique.', author: 'Thomas R.', downloads: 276, rating: 4.8 },
  { id: 'mod-booking', name: 'Prise de RDV', emoji: '📅', category: 'Service Client', desc: 'Système de réservation en ligne avec rappels automatiques.', author: 'Freenzy Team', downloads: 421, rating: 4.9 },
  { id: 'mod-survey', name: 'Sondages & Feedback', emoji: '📊', category: 'Marketing', desc: 'Création de sondages clients avec analyse IA des résultats.', author: 'Julie M.', downloads: 167, rating: 4.4 },
  { id: 'mod-contracts', name: 'Gestion Contrats', emoji: '📝', category: 'Juridique', desc: 'Génération, suivi et renouvellement automatique des contrats.', author: 'Freenzy Team', downloads: 203, rating: 4.7 },
  { id: 'mod-social-auto', name: 'Auto-Post Social', emoji: '🤖', category: 'Marketing', desc: 'Planification et publication automatique sur tous les réseaux.', author: 'Maxime B.', downloads: 389, rating: 4.6 },
  { id: 'mod-chatbot', name: 'Chatbot Site Web', emoji: '💬', category: 'Service Client', desc: 'Widget chatbot IA intégrable sur votre site en 2 minutes.', author: 'Freenzy Team', downloads: 512, rating: 4.9 },
  { id: 'mod-reporting', name: 'Reporting Auto', emoji: '📈', category: 'Management', desc: 'Rapports hebdomadaires générés par IA avec graphiques.', author: 'Nicolas P.', downloads: 234, rating: 4.5 },
];

const CATEGORIES = ['Tous', 'Finance', 'Commercial', 'Marketing', 'RH', 'Service Client', 'Logistique', 'Juridique', 'Management'];

const CUSTOM_SERVICES = [
  { id: 'custom-module-simple', emoji: '📦', label: 'Module simple', desc: 'Un module fonctionnel standard adapté à votre besoin', price: 'Faire une demande', delay: '48-72h' },
  { id: 'custom-module-complex', emoji: '⚙️', label: 'Module avancé', desc: 'Module complexe avec intégrations et logique métier', price: 'Faire une demande', delay: '1-2 semaines' },
  { id: 'custom-website', emoji: '🌐', label: 'Site web sur mesure', desc: 'Site vitrine, e-commerce ou webapp — 5X plus rapide et 5X moins cher que le marché', price: 'Faire une demande', delay: '1-3 semaines' },
  { id: 'custom-software', emoji: '💻', label: 'Logiciel sur mesure', desc: 'Application métier, SaaS, outil interne — Nos équipes boostées à l\'IA', price: 'Faire une demande', delay: '2-6 semaines' },
  { id: 'custom-mobile', emoji: '📱', label: 'Application mobile', desc: 'iOS & Android natif ou cross-platform — Design + Développement', price: 'Faire une demande', delay: '3-8 semaines' },
  { id: 'custom-automation', emoji: '🔗', label: 'Automatisation & API', desc: 'Intégrations Zapier, API sur mesure, workflows automatisés', price: 'Faire une demande', delay: '48h-1 semaine' },
];

const meta = PAGE_META['custom-creation'];

export default function ModulesSurMesurePage() {
  const isMobile = useIsMobile();
  const { requireAuth, LoginModalComponent } = useAuthGuard();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'custom'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [installedModules, setInstalledModules] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fz_installed_modules') ?? '[]'); } catch { return []; }
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const { draft: orderForm, updateDraft: updateOrderForm, clearDraft: clearOrderDraft } = useVisitorDraftObject('custom_creation', {
    contactName: '', email: '', phone: '', description: '', budget: '', urgency: 'standard',
  });
  const setOrderForm = (updater: (prev: typeof orderForm) => typeof orderForm) => {
    const next = updater(orderForm);
    updateOrderForm(next);
  };
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const filteredModules = MARKETPLACE_MODULES.filter(m => {
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === 'Tous' || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  function toggleInstall(moduleId: string) {
    const next = installedModules.includes(moduleId)
      ? installedModules.filter(id => id !== moduleId)
      : [...installedModules, moduleId];
    setInstalledModules(next);
    try { localStorage.setItem('fz_installed_modules', JSON.stringify(next)); } catch { /* */ }
  }

  function openOrderForm(serviceId: string) {
    setSelectedService(serviceId);
    setShowOrderForm(true);
    setError('');
  }

  async function handleSubmitOrder() {
    if (!requireAuth('Connectez-vous pour passer une commande')) return;
    if (!orderForm.contactName || !orderForm.email || !orderForm.description) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('fz_session') ?? '{}') : {};
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/custom-creation/quotes',
          method: 'POST',
          token: session.token,
          data: { ...orderForm, projectType: selectedService },
        }),
      });
      if (!res.ok) {
        let existing: unknown[] = [];
        try { existing = JSON.parse(localStorage.getItem('fz_custom_quotes') ?? '[]'); } catch { /* */ }
        existing.push({ ...orderForm, projectType: selectedService, createdAt: new Date().toISOString(), status: 'pending' });
        localStorage.setItem('fz_custom_quotes', JSON.stringify(existing));
      }
      clearOrderDraft();
      setSubmitted(true);
    } catch {
      let existing: unknown[] = [];
      try { existing = JSON.parse(localStorage.getItem('fz_custom_quotes') ?? '[]'); } catch { /* */ }
      existing.push({ ...orderForm, projectType: selectedService, createdAt: new Date().toISOString(), status: 'pending' });
      clearOrderDraft();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fz-text, #1E293B)', marginBottom: 8 }}>
          Demande envoyée !
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.6, marginBottom: 24 }}>
          Notre équipe va étudier votre projet et vous recontacter sous 48h.
          Vous recevrez une notification dans votre tableau de bord.
        </p>
        <button
          onClick={() => { setSubmitted(false); setShowOrderForm(false); clearOrderDraft(); }}
          className="btn btn-primary"
        >
          Retour aux modules
        </button>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? 12 : undefined }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{meta.emoji}</span>
          <div>
            <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{meta.title}</h1>
            <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
              Installez des modules <span className="fz-logo-word">gratuits</span> ou commandez du sur mesure.
              Nos équipes boostées à l&apos;<span className="fz-logo-word">IA</span> livrent 5X plus vite et 5X moins cher.
            </p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
      </div>
      <PageExplanation pageId="custom-creation" text={PAGE_META['custom-creation']?.helpText} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--fz-border, #E2E8F0)' }}>
        {[
          { id: 'marketplace' as const, label: 'Marketplace', icon: '🛍️', count: MARKETPLACE_MODULES.length },
          { id: 'custom' as const, label: 'Sur mesure', icon: '🔧' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: isMobile ? '10px 14px' : '12px 24px', fontSize: isMobile ? 13 : 14, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#1A1A1A' : '#6B6B6B',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #1A1A1A' : '2px solid transparent',
              marginBottom: -2, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && (
              <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: 10 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* === MARKETPLACE TAB === */}
      {activeTab === 'marketplace' && (
        <>
          {/* Stats bar */}
          <div className="flex gap-8 flex-wrap mb-16">
            <div className="badge badge-success" style={{ padding: '6px 12px' }}>
              {installedModules.length} module{installedModules.length > 1 ? 's' : ''} installé{installedModules.length > 1 ? 's' : ''}
            </div>
            <div className="badge" style={{ padding: '6px 12px', background: '#F0F0F0', color: '#1A1A1A' }}>
              {MARKETPLACE_MODULES.length} modules disponibles
            </div>
            <div className="badge" style={{ padding: '6px 12px', background: '#F0F0F0', color: '#1A1A1A' }}>
              100% Gratuit
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input w-full mb-16"
            style={{ fontSize: 14 }}
          />

          {/* Category filters */}
          <div className="flex gap-6 flex-wrap mb-20" style={{ paddingBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full text-sm pointer"
                style={{
                  padding: '5px 14px',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  background: activeCategory === cat ? '#1A1A1A' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#6B6B6B',
                  border: '1px solid #E5E5E5', fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Module grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filteredModules.map(mod => {
              const isInstalled = installedModules.includes(mod.id);
              return (
                <div key={mod.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                  {/* Module header */}
                  <div className="flex items-center gap-8">
                    <span style={{ fontSize: 28 }}>{mod.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div className="text-md font-bold" style={{ color: 'var(--fz-text, #1E293B)' }}>{mod.name}</div>
                      <div className="text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>{mod.category}</div>
                    </div>
                    <div style={{
                      padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                      background: '#F0F0F0', color: '#1A1A1A',
                    }}>
                      Gratuit
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm" style={{ lineHeight: 1.5, margin: 0, color: 'var(--fz-text-secondary, #64748B)' }}>{mod.desc}</p>

                  {/* Author + stats */}
                  <div className="flex items-center gap-8 text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
                    <span>par {mod.author}</span>
                    <span>•</span>
                    <span>⭐ {mod.rating}</span>
                    <span>•</span>
                    <span>{mod.downloads} installs</span>
                  </div>

                  {/* Install button */}
                  <button
                    onClick={() => toggleInstall(mod.id)}
                    className={`btn btn-sm w-full ${isInstalled ? 'btn-ghost' : 'btn-primary'}`}
                    style={{
                      marginTop: 'auto',
                      ...(isInstalled ? { color: 'var(--success)', borderColor: 'var(--success)' } : {}),
                    }}
                  >
                    {isInstalled ? <>✅ Installé — Désinstaller</> : '➕ Installer'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fz-text-muted, #94A3B8)' }}>
              Aucun module trouvé pour cette recherche.
            </div>
          )}

          {/* Become a creator CTA */}
          <div className="card mt-24" style={{
            padding: 24, textAlign: 'center',
            background: '#F7F7F7',
            border: '1px solid #E5E5E5',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
            <div className="text-lg font-bold mb-4" style={{ color: 'var(--fz-text, #1E293B)' }}>Devenez créateur de modules</div>
            <p className="text-sm" style={{ maxWidth: 500, margin: '0 auto 16px', color: 'var(--fz-text-secondary, #64748B)' }}>
              Vous avez une idée de module ? Créez-le et soyez crédité(e) ! Votre nom apparaît
              sur le module et il est disponible gratuitement pour toute la communauté.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => { setActiveTab('custom'); setSelectedService('custom-module-simple'); }}
            >
              Proposer un module →
            </button>
          </div>
        </>
      )}

      {/* === CUSTOM TAB === */}
      {activeTab === 'custom' && (
        <>
          {/* AI advantage banner */}
          <div className="card mb-20" style={{
            padding: 20,
            background: '#F7F7F7',
            border: '1px solid #E5E5E5',
          }}>
            <div className="flex items-center gap-8 mb-8">
              <span style={{ fontSize: 24 }}>⚡</span>
              <div className="text-md font-bold" style={{ color: '#1A1A1A' }}>
                Pourquoi nous sommes différents
              </div>
            </div>
            <p className="text-sm" style={{ lineHeight: 1.6, margin: 0, color: 'var(--fz-text-secondary, #64748B)' }}>
              Nos équipes utilisent l&apos;IA comme accélérateur à chaque étape : analyse, conception,
              développement, tests et déploiement. Résultat : des projets livrés <strong>5X plus vite</strong> et
              à un coût <strong>5X inférieur</strong> au marché traditionnel, sans compromis sur la qualité.
            </p>
          </div>

          {/* Service cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 32 }}>
            {CUSTOM_SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => openOrderForm(service.id)}
                className="card"
                style={{
                  padding: 20, textAlign: 'left', cursor: 'pointer',
                  border: selectedService === service.id ? '2px solid #1A1A1A' : '1px solid #E5E5E5',
                  background: selectedService === service.id ? '#F7F7F7' : '#fff',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{service.emoji}</div>
                <div className="text-md font-bold" style={{ marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>{service.label}</div>
                <p className="text-sm" style={{ lineHeight: 1.5, margin: '0 0 12px', color: 'var(--fz-text-secondary, #64748B)' }}>{service.desc}</p>
                <div className="flex items-center gap-8">
                  <span className="badge badge-success" style={{ fontSize: 12, fontWeight: 800 }}>
                    {service.price}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Délai : {service.delay}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div className="text-md font-bold mb-16" style={{ color: 'var(--fz-text, #1E293B)' }}>Pourquoi choisir Freenzy.io ?</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: 'var(--fz-text-muted, #94A3B8)' }}></div>
              <div style={{ fontWeight: 700, color: 'var(--fz-text-muted, #94A3B8)', textAlign: 'center' }}>Marché traditionnel</div>
              <div style={{ fontWeight: 700, color: '#1A1A1A', textAlign: 'center' }}>Freenzy.io</div>

              <div className="text-sm" style={{ color: 'var(--fz-text, #1E293B)' }}>Site web</div>
              <div className="text-sm" style={{ textAlign: 'center', color: 'var(--fz-text-muted, #94A3B8)' }}>2 000 - 10 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>490 - 2 000€</div>

              <div className="text-sm" style={{ color: 'var(--fz-text, #1E293B)' }}>Application mobile</div>
              <div className="text-sm" style={{ textAlign: 'center', color: 'var(--fz-text-muted, #94A3B8)' }}>15 000 - 80 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>3 000 - 16 000€</div>

              <div className="text-sm" style={{ color: 'var(--fz-text, #1E293B)' }}>Logiciel métier</div>
              <div className="text-sm" style={{ textAlign: 'center', color: 'var(--fz-text-muted, #94A3B8)' }}>20 000 - 100 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>4 000 - 20 000€</div>

              <div className="text-sm" style={{ color: 'var(--fz-text, #1E293B)' }}>Délai moyen</div>
              <div className="text-sm" style={{ textAlign: 'center', color: 'var(--fz-text-muted, #94A3B8)' }}>2 - 6 mois</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>1 - 6 semaines</div>
            </div>
          </div>

          {/* Trust section */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-8" style={{ color: 'var(--fz-text, #1E293B)' }}>🔒 Processus transparent</div>
              <ul className="text-sm" style={{ lineHeight: 2, margin: 0, paddingLeft: 16, color: 'var(--fz-text-secondary, #64748B)' }}>
                <li>Devis détaillé sous 48h</li>
                <li>Validation humaine à chaque étape</li>
                <li>Suivi en temps réel dans votre dashboard</li>
                <li>Paiement échelonné possible</li>
              </ul>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-8" style={{ color: 'var(--fz-text, #1E293B)' }}>⚡ Notre expertise</div>
              <ul className="text-sm" style={{ lineHeight: 2, margin: 0, paddingLeft: 16, color: 'var(--fz-text-secondary, #64748B)' }}>
                <li>Équipe développeurs seniors + IA</li>
                <li>Stack moderne (React, Next.js, Node)</li>
                <li>Hébergement & maintenance inclus</li>
                <li>Support prioritaire 6 mois</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* === ORDER FORM MODAL === */}
      {showOrderForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--fz-bg, #FFFFFF)', borderRadius: 8, maxWidth: isMobile ? 'calc(100vw - 32px)' : 560, width: '100%',
            maxHeight: isMobile ? '95vh' : '90vh', overflow: 'auto', padding: isMobile ? '16px 16px' : '28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fz-text, #1E293B)', margin: 0 }}>
                Faire une demande
              </h2>
              <button
                onClick={() => setShowOrderForm(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--fz-text-muted, #94A3B8)' }}
              >
                ✖
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Nom complet *</label>
                <input
                  className="input w-full"
                  value={orderForm.contactName}
                  onChange={e => setOrderForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Email *</label>
                <input
                  className="input w-full"
                  type="email"
                  value={orderForm.email}
                  onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Téléphone (optionnel)</label>
                <input
                  className="input w-full"
                  value={orderForm.phone}
                  onChange={e => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Description du besoin *</label>
                <textarea
                  className="input w-full"
                  value={orderForm.description}
                  onChange={e => setOrderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre besoin en détail : fonctionnalités souhaitées, public cible, contraintes..."
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Budget estimatif</label>
                <input
                  className="input w-full"
                  value={orderForm.budget}
                  onChange={e => setOrderForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Ex: 500€, 2000€, pas de limite..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Urgence</label>
                <div className="flex gap-6">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'urgent', label: 'Urgent' },
                    { id: 'tres_urgent', label: 'Très urgent' },
                  ].map(u => (
                    <button
                      key={u.id}
                      onClick={() => setOrderForm(prev => ({ ...prev, urgency: u.id }))}
                      className="rounded-full text-sm pointer"
                      style={{
                        padding: '6px 16px',
                        fontWeight: orderForm.urgency === u.id ? 700 : 500,
                        background: orderForm.urgency === u.id ? '#1A1A1A' : '#fff',
                        color: orderForm.urgency === u.id ? '#fff' : '#6B6B6B',
                        border: '1px solid #E5E5E5', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary w-full font-bold"
                onClick={handleSubmitOrder}
                disabled={submitting}
                style={{ marginTop: 4, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>

              <p className="text-xs" style={{ textAlign: 'center', margin: 0, color: 'var(--fz-text-muted, #94A3B8)' }}>
                Un membre de notre équipe examinera votre demande et vous recontactera sous 48h.
              </p>
            </div>
          </div>
        </div>
      )}
      {LoginModalComponent}
    </div>
  );
}
