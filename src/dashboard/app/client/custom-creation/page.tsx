'use client';

import { useState } from 'react';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useVisitorDraftObject } from '../../../lib/useVisitorDraft';
import { CU, pageContainer, headerRow, emojiIcon, tabBar } from '../../../lib/page-styles';

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
      <div style={{ ...pageContainer(isMobile), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>✅</div>
          <div style={CU.emptyTitle}>Demande envoyée !</div>
          <div style={CU.emptyDesc}>
            Notre équipe va étudier votre projet et vous recontacter sous 48h.
            Vous recevrez une notification dans votre tableau de bord.
          </div>
          <button
            onClick={() => { setSubmitted(false); setShowOrderForm(false); clearOrderDraft(); }}
            style={CU.btnPrimary}
          >
            Retour aux modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{meta.title}</h1>
            <p style={CU.pageSubtitle}>
              Installez des modules gratuits ou commandez du sur mesure.
              Nos équipes boostées à l&apos;IA livrent 5X plus vite et 5X moins cher.
            </p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
      </div>
      <PageExplanation pageId="custom-creation" text={PAGE_META['custom-creation']?.helpText} />

      {/* Tabs */}
      <div style={tabBar()}>
        {[
          { id: 'marketplace' as const, label: 'Marketplace', icon: '🛍️', count: MARKETPLACE_MODULES.length },
          { id: 'custom' as const, label: 'Sur mesure', icon: '🔧' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? CU.tabActive : CU.tab}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && (
              <span style={{ ...CU.badge, marginLeft: 8, fontSize: 10 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* === MARKETPLACE TAB === */}
      {activeTab === 'marketplace' && (
        <>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={CU.badgeSuccess}>
              {installedModules.length} module{installedModules.length > 1 ? 's' : ''} installé{installedModules.length > 1 ? 's' : ''}
            </span>
            <span style={{ ...CU.badge, padding: '4px 10px' }}>
              {MARKETPLACE_MODULES.length} modules disponibles
            </span>
            <span style={{ ...CU.badge, padding: '4px 10px' }}>
              100% Gratuit
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...CU.input, marginBottom: 16 }}
          />

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 700 : 500,
                  background: activeCategory === cat ? CU.accent : CU.bg,
                  color: activeCategory === cat ? '#fff' : CU.textSecondary,
                  border: `1px solid ${CU.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Module grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filteredModules.map(mod => {
              const isInstalled = installedModules.includes(mod.id);
              return (
                <div key={mod.id} style={{ ...CU.card, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                  {/* Module header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 28 }}>{mod.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{mod.name}</div>
                      <div style={{ fontSize: 12, color: CU.textMuted }}>{mod.category}</div>
                    </div>
                    <span style={{ ...CU.badge, fontWeight: 800, fontSize: 12 }}>
                      Gratuit
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: CU.textSecondary }}>{mod.desc}</p>

                  {/* Author + stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: CU.textMuted }}>
                    <span>par {mod.author}</span>
                    <span>•</span>
                    <span>⭐ {mod.rating}</span>
                    <span>•</span>
                    <span>{mod.downloads} installs</span>
                  </div>

                  {/* Install button */}
                  <button
                    onClick={() => toggleInstall(mod.id)}
                    style={{
                      ...(isInstalled ? { ...CU.btnGhost, color: CU.success, borderColor: CU.success } : CU.btnPrimary),
                      width: '100%',
                      marginTop: 'auto',
                    }}
                  >
                    {isInstalled ? <>✅ Installé — Désinstaller</> : '➕ Installer'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div style={CU.emptyState}>
              <div style={CU.emptyEmoji}>🔍</div>
              <div style={CU.emptyDesc}>Aucun module trouvé pour cette recherche.</div>
            </div>
          )}

          {/* Become a creator CTA */}
          <div style={{
            ...CU.card, marginTop: 24, padding: 24, textAlign: 'center',
            background: CU.bgSecondary,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: CU.text }}>Devenez créateur de modules</div>
            <p style={{ fontSize: 13, maxWidth: 500, margin: '0 auto 16px', color: CU.textSecondary, lineHeight: 1.5 }}>
              Vous avez une idée de module ? Créez-le et soyez crédité(e) ! Votre nom apparaît
              sur le module et il est disponible gratuitement pour toute la communauté.
            </p>
            <button
              style={CU.btnPrimary}
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
          <div style={{ ...CU.card, marginBottom: 20, padding: 20, background: CU.bgSecondary }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>
                Pourquoi nous sommes différents
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: CU.textSecondary }}>
              Nos équipes utilisent l&apos;IA comme accélérateur à chaque étape : analyse, conception,
              développement, tests et déploiement. Résultat : des projets livrés <strong>5X plus vite</strong> et
              à un coût <strong>5X inférieur</strong> au marché traditionnel, sans compromis sur la qualité.
            </p>
          </div>

          {/* Service cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 32 }}>
            {CUSTOM_SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => openOrderForm(service.id)}
                style={{
                  ...CU.cardHoverable,
                  padding: 20, textAlign: 'left' as const,
                  border: selectedService === service.id ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
                  background: selectedService === service.id ? CU.bgSecondary : CU.bg,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{service.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: CU.text }}>{service.label}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 12px', color: CU.textSecondary }}>{service.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...CU.badgeSuccess, fontSize: 12, fontWeight: 800 }}>
                    {service.price}
                  </span>
                  <span style={{ fontSize: 12, color: CU.textMuted }}>Délai : {service.delay}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ ...CU.card, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: CU.text }}>Pourquoi choisir Freenzy.io ?</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 8 : 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: CU.textMuted }}></div>
              <div style={{ fontWeight: 700, color: CU.textMuted, textAlign: 'center' }}>Marché traditionnel</div>
              <div style={{ fontWeight: 700, color: CU.text, textAlign: 'center' }}>Freenzy.io</div>

              <div style={{ fontSize: 13, color: CU.text }}>Site web</div>
              <div style={{ fontSize: 13, textAlign: 'center', color: CU.textMuted }}>2 000 - 10 000€</div>
              <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', color: CU.success }}>490 - 2 000€</div>

              <div style={{ fontSize: 13, color: CU.text }}>Application mobile</div>
              <div style={{ fontSize: 13, textAlign: 'center', color: CU.textMuted }}>15 000 - 80 000€</div>
              <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', color: CU.success }}>3 000 - 16 000€</div>

              <div style={{ fontSize: 13, color: CU.text }}>Logiciel métier</div>
              <div style={{ fontSize: 13, textAlign: 'center', color: CU.textMuted }}>20 000 - 100 000€</div>
              <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', color: CU.success }}>4 000 - 20 000€</div>

              <div style={{ fontSize: 13, color: CU.text }}>Délai moyen</div>
              <div style={{ fontSize: 13, textAlign: 'center', color: CU.textMuted }}>2 - 6 mois</div>
              <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', color: CU.success }}>1 - 6 semaines</div>
            </div>
          </div>

          {/* Trust section */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <div style={{ ...CU.card, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: CU.text }}>🔒 Processus transparent</div>
              <ul style={{ fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 16, color: CU.textSecondary }}>
                <li>Devis détaillé sous 48h</li>
                <li>Validation humaine à chaque étape</li>
                <li>Suivi en temps réel dans votre dashboard</li>
                <li>Paiement échelonné possible</li>
              </ul>
            </div>
            <div style={{ ...CU.card, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: CU.text }}>⚡ Notre expertise</div>
              <ul style={{ fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 16, color: CU.textSecondary }}>
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
        <div style={CU.overlay}>
          <div style={{
            ...CU.modal,
            maxWidth: isMobile ? 'calc(100vw - 32px)' : 560,
            maxHeight: isMobile ? '95vh' : '80vh',
            padding: isMobile ? '16px 16px' : '24px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ ...CU.pageTitle, fontSize: 20 }}>
                Faire une demande
              </h2>
              <button
                onClick={() => setShowOrderForm(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: CU.textMuted }}
              >
                ✖
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={CU.label}>Nom complet *</label>
                <input
                  value={orderForm.contactName}
                  onChange={e => setOrderForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Votre nom"
                  style={CU.input}
                />
              </div>

              <div>
                <label style={CU.label}>Email *</label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                  style={CU.input}
                />
              </div>

              <div>
                <label style={CU.label}>Téléphone (optionnel)</label>
                <input
                  value={orderForm.phone}
                  onChange={e => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                  style={CU.input}
                />
              </div>

              <div>
                <label style={CU.label}>Description du besoin *</label>
                <textarea
                  value={orderForm.description}
                  onChange={e => setOrderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre besoin en détail : fonctionnalités souhaitées, public cible, contraintes..."
                  rows={4}
                  style={CU.textarea}
                />
              </div>

              <div>
                <label style={CU.label}>Budget estimatif</label>
                <input
                  value={orderForm.budget}
                  onChange={e => setOrderForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Ex: 500€, 2000€, pas de limite..."
                  style={CU.input}
                />
              </div>

              <div>
                <label style={CU.label}>Urgence</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'urgent', label: 'Urgent' },
                    { id: 'tres_urgent', label: 'Très urgent' },
                  ].map(u => (
                    <button
                      key={u.id}
                      onClick={() => setOrderForm(prev => ({ ...prev, urgency: u.id }))}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: orderForm.urgency === u.id ? 700 : 500,
                        background: orderForm.urgency === u.id ? CU.accent : CU.bg,
                        color: orderForm.urgency === u.id ? '#fff' : CU.textSecondary,
                        border: `1px solid ${CU.border}`,
                        cursor: 'pointer',
                      }}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: CU.danger, fontSize: 12, fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                style={{ ...CU.btnPrimary, width: '100%', marginTop: 4, opacity: submitting ? 0.7 : 1, fontWeight: 700 }}
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>

              <p style={{ fontSize: 12, textAlign: 'center', margin: 0, color: CU.textMuted }}>
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
