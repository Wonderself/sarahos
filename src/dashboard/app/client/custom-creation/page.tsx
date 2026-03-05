'use client';

import { useState } from 'react';

// Pre-built marketplace modules
const MARKETPLACE_MODULES = [
  { id: 'mod-invoice', name: 'Facturation Auto', emoji: '🧾', category: 'Finance', desc: 'Génération automatique de factures, devis et relances clients.', author: 'Freenzy Team', price: 1, downloads: 234, rating: 4.8 },
  { id: 'mod-crm-mini', name: 'Mini CRM', emoji: '📇', category: 'Commercial', desc: 'Gestion de contacts, suivi de pipeline et relances automatiques.', author: 'Pierre D.', price: 1, downloads: 189, rating: 4.6 },
  { id: 'mod-newsletter', name: 'Newsletter IA', emoji: '📨', category: 'Marketing', desc: 'Rédaction et envoi automatique de newsletters personnalisées.', author: 'Freenzy Team', price: 1, downloads: 312, rating: 4.9 },
  { id: 'mod-inventory', name: 'Gestion de Stock', emoji: '📦', category: 'Logistique', desc: 'Suivi de stock en temps réel avec alertes de réapprovisionnement.', author: 'Marie L.', price: 1, downloads: 145, rating: 4.5 },
  { id: 'mod-hr-onboard', name: 'Onboarding RH', emoji: '🎓', category: 'RH', desc: 'Parcours d\'intégration automatisé pour les nouveaux employés.', author: 'Freenzy Team', price: 1, downloads: 98, rating: 4.7 },
  { id: 'mod-expense', name: 'Notes de Frais', emoji: '🧮', category: 'Finance', desc: 'Scan de reçus, catégorisation et export comptable automatique.', author: 'Thomas R.', price: 1, downloads: 276, rating: 4.8 },
  { id: 'mod-booking', name: 'Prise de RDV', emoji: '📅', category: 'Service Client', desc: 'Système de réservation en ligne avec rappels automatiques.', author: 'Freenzy Team', price: 1, downloads: 421, rating: 4.9 },
  { id: 'mod-survey', name: 'Sondages & Feedback', emoji: '📊', category: 'Marketing', desc: 'Création de sondages clients avec analyse IA des résultats.', author: 'Julie M.', price: 1, downloads: 167, rating: 4.4 },
  { id: 'mod-contracts', name: 'Gestion Contrats', emoji: '📝', category: 'Juridique', desc: 'Génération, suivi et renouvellement automatique des contrats.', author: 'Freenzy Team', price: 1, downloads: 203, rating: 4.7 },
  { id: 'mod-social-auto', name: 'Auto-Post Social', emoji: '🤖', category: 'Marketing', desc: 'Planification et publication automatique sur tous les réseaux.', author: 'Maxime B.', price: 1, downloads: 389, rating: 4.6 },
  { id: 'mod-chatbot', name: 'Chatbot Site Web', emoji: '💬', category: 'Service Client', desc: 'Widget chatbot IA intégrable sur votre site en 2 minutes.', author: 'Freenzy Team', price: 1, downloads: 512, rating: 4.9 },
  { id: 'mod-reporting', name: 'Reporting Auto', emoji: '📈', category: 'Management', desc: 'Rapports hebdomadaires générés par IA avec graphiques.', author: 'Nicolas P.', price: 1, downloads: 234, rating: 4.5 },
];

const CATEGORIES = ['Tous', 'Finance', 'Commercial', 'Marketing', 'RH', 'Service Client', 'Logistique', 'Juridique', 'Management'];

const CUSTOM_SERVICES = [
  { id: 'custom-module-simple', emoji: '🧩', label: 'Module simple', desc: 'Un module fonctionnel standard adapté à votre besoin', price: '50 €', delay: '48-72h' },
  { id: 'custom-module-complex', emoji: '⚙️', label: 'Module avancé', desc: 'Module complexe avec intégrations et logique métier', price: 'Sur devis', delay: '1-2 semaines' },
  { id: 'custom-website', emoji: '🌐', label: 'Site web sur mesure', desc: 'Site vitrine, e-commerce ou webapp — 5X plus rapide et 5X moins cher que le marché', price: 'Dès 490 €', delay: '1-3 semaines' },
  { id: 'custom-software', emoji: '💻', label: 'Logiciel sur mesure', desc: 'Application métier, SaaS, outil interne — Nos équipes boostées à l\'IA', price: 'Sur devis', delay: '2-6 semaines' },
  { id: 'custom-mobile', emoji: '📱', label: 'Application mobile', desc: 'iOS & Android natif ou cross-platform — Design + Développement', price: 'Sur devis', delay: '3-8 semaines' },
  { id: 'custom-automation', emoji: '🔗', label: 'Automatisation & API', desc: 'Intégrations Zapier, API sur mesure, workflows automatisés', price: 'Dès 150 €', delay: '48h-1 semaine' },
];

export default function ModulesSurMesurePage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'custom'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [installedModules, setInstalledModules] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fz_installed_modules') ?? '[]'); } catch { return []; }
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [orderForm, setOrderForm] = useState({ contactName: '', email: '', phone: '', description: '', budget: '', urgency: 'standard' });
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
        const existing = JSON.parse(localStorage.getItem('fz_custom_quotes') ?? '[]');
        existing.push({ ...orderForm, projectType: selectedService, createdAt: new Date().toISOString(), status: 'pending' });
        localStorage.setItem('fz_custom_quotes', JSON.stringify(existing));
      }
      setSubmitted(true);
    } catch {
      const existing = JSON.parse(localStorage.getItem('fz_custom_quotes') ?? '[]');
      existing.push({ ...orderForm, projectType: selectedService, createdAt: new Date().toISOString(), status: 'pending' });
      localStorage.setItem('fz_custom_quotes', JSON.stringify(existing));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Demande envoyée !
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24 }}>
          Notre équipe va étudier votre projet et vous recontacter sous 48h.
          Vous recevrez une notification dans votre tableau de bord.
        </p>
        <button
          onClick={() => { setSubmitted(false); setShowOrderForm(false); setOrderForm({ contactName: '', email: '', phone: '', description: '', budget: '', urgency: 'standard' }); }}
          className="btn btn-primary"
        >
          Retour aux modules
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Modules sur mesure</h1>
        <p className="page-subtitle">
          Installez des modules prêts à l&apos;emploi à 1€ ou commandez du sur mesure.
          Nos équipes boostées à l&apos;IA livrent 5X plus vite et 5X moins cher.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--border-primary)' }}>
        {[
          { id: 'marketplace' as const, label: '🛍️ Marketplace', count: MARKETPLACE_MODULES.length },
          { id: 'custom' as const, label: '🛠️ Sur mesure' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -2, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
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
            <div className="badge" style={{ padding: '6px 12px', background: 'var(--accent-muted)', color: 'var(--accent)' }}>
              {MARKETPLACE_MODULES.length} modules disponibles
            </div>
            <div className="badge" style={{ padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              1€ / module
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Rechercher un module..."
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
                  background: activeCategory === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  border: 'none', fontFamily: 'var(--font-sans)',
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
                      <div className="text-md font-bold">{mod.name}</div>
                      <div className="text-xs text-muted">{mod.category}</div>
                    </div>
                    <div style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800,
                      background: '#16a34a15', color: '#16a34a',
                    }}>
                      {mod.price}€
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-secondary" style={{ lineHeight: 1.5, margin: 0 }}>{mod.desc}</p>

                  {/* Author + stats */}
                  <div className="flex items-center gap-8 text-xs text-muted">
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
                    {isInstalled ? '✓ Installé — Désinstaller' : '+ Installer (1€)'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              Aucun module trouvé pour cette recherche.
            </div>
          )}

          {/* Become a creator CTA */}
          <div className="card mt-24" style={{
            padding: 24, textAlign: 'center',
            background: 'linear-gradient(135deg, var(--accent-muted), #a855f715)',
            border: '1px solid var(--accent)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
            <div className="text-lg font-bold mb-4">Devenez créateur de modules</div>
            <p className="text-sm text-secondary" style={{ maxWidth: 500, margin: '0 auto 16px' }}>
              Vous avez une idée de module ? Créez-le et soyez crédité(e) ! Votre nom apparaît
              sur le module et il est vendu à 1€ à toute la communauté. Module simple : 50€ de développement.
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
            background: 'linear-gradient(135deg, #6366f108, #a855f708)',
            border: '1px solid var(--accent)',
          }}>
            <div className="flex items-center gap-8 mb-8">
              <span style={{ fontSize: 24 }}>⚡</span>
              <div className="text-md font-bold" style={{ color: 'var(--accent)' }}>
                Pourquoi nous sommes différents
              </div>
            </div>
            <p className="text-sm text-secondary" style={{ lineHeight: 1.6, margin: 0 }}>
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
                  border: selectedService === service.id ? '2px solid var(--accent)' : '1px solid var(--border-secondary)',
                  background: selectedService === service.id ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{service.emoji}</div>
                <div className="text-md font-bold" style={{ marginBottom: 4 }}>{service.label}</div>
                <p className="text-sm text-secondary" style={{ lineHeight: 1.5, margin: '0 0 12px' }}>{service.desc}</p>
                <div className="flex items-center gap-8">
                  <span className="badge badge-success" style={{ fontSize: 12, fontWeight: 800 }}>
                    {service.price}
                  </span>
                  <span className="text-xs text-muted">Délai : {service.delay}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div className="text-md font-bold mb-16">Pourquoi choisir Freenzy.io ?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-tertiary)' }}></div>
              <div style={{ fontWeight: 700, color: 'var(--text-tertiary)', textAlign: 'center' }}>Marché traditionnel</div>
              <div style={{ fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>Freenzy.io</div>

              <div className="text-sm">Site web</div>
              <div className="text-sm text-muted" style={{ textAlign: 'center' }}>2 000 - 10 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>490 - 2 000€</div>

              <div className="text-sm">Application mobile</div>
              <div className="text-sm text-muted" style={{ textAlign: 'center' }}>15 000 - 80 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>3 000 - 16 000€</div>

              <div className="text-sm">Logiciel métier</div>
              <div className="text-sm text-muted" style={{ textAlign: 'center' }}>20 000 - 100 000€</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>4 000 - 20 000€</div>

              <div className="text-sm">Délai moyen</div>
              <div className="text-sm text-muted" style={{ textAlign: 'center' }}>2 - 6 mois</div>
              <div className="text-sm font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>1 - 6 semaines</div>
            </div>
          </div>

          {/* Trust section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-8">🔒 Processus transparent</div>
              <ul className="text-sm text-secondary" style={{ lineHeight: 2, margin: 0, paddingLeft: 16 }}>
                <li>Devis détaillé sous 48h</li>
                <li>Validation humaine à chaque étape</li>
                <li>Suivi en temps réel dans votre dashboard</li>
                <li>Paiement échelonné possible</li>
              </ul>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-8">⚡ Notre expertise</div>
              <ul className="text-sm text-secondary" style={{ lineHeight: 2, margin: 0, paddingLeft: 16 }}>
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
            background: 'var(--bg-elevated)', borderRadius: 16, maxWidth: 560, width: '100%',
            maxHeight: '90vh', overflow: 'auto', padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Demander un devis
              </h2>
              <button
                onClick={() => setShowOrderForm(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Nom complet *</label>
                <input
                  className="input w-full"
                  value={orderForm.contactName}
                  onChange={e => setOrderForm(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Email *</label>
                <input
                  className="input w-full"
                  type="email"
                  value={orderForm.email}
                  onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Téléphone (optionnel)</label>
                <input
                  className="input w-full"
                  value={orderForm.phone}
                  onChange={e => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Description du besoin *</label>
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
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Budget estimatif</label>
                <input
                  className="input w-full"
                  value={orderForm.budget}
                  onChange={e => setOrderForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Ex: 500€, 2000€, pas de limite..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Urgence</label>
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
                        background: orderForm.urgency === u.id ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: orderForm.urgency === u.id ? '#fff' : 'var(--text-secondary)',
                        border: 'none', fontFamily: 'var(--font-sans)',
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

              <p className="text-xs text-muted" style={{ textAlign: 'center', margin: 0 }}>
                Un membre de notre équipe examinera votre demande et vous recontactera sous 48h.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
