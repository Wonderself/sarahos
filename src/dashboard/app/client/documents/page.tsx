'use client';

import { useState, useRef, useMemo } from 'react';
import { DEFAULT_AGENTS } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(text: string): string {
  const safe = escapeHtml(text);
  return safe
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px;color:var(--text-primary)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px;color:var(--text-primary)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:28px 0 12px;color:var(--text-primary)">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<div style="padding-left:16px;margin:2px 0">&bull; $1</div>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, (_, content) => `<div style="padding-left:16px;margin:2px 0">${content}</div>`)
    // Horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border-primary);margin:16px 0">')
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

interface GeneratedDoc {
  id: string;
  title: string;
  templateId: string;
  content: string;
  createdAt: string;
  tokens: number;
  cost: number;
}

interface DocField {
  key: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'select' | 'chips';
  options?: string[];
  helpText?: string;
  required?: boolean;
}

interface DocTemplate {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  fields: DocField[];
  color: string;
}

const TEMPLATES: DocTemplate[] = [
  {
    id: 'email-pro',
    icon: '📧',
    title: 'Email professionnel',
    description: 'Rédigez un email professionnel adapté à votre contexte: prospection, relance, partenariat, etc.',
    category: 'Communication',
    color: '#6366f1',
    prompt: 'Rédige un email professionnel. Destinataire: {recipient}. Objet: {subject}. Contexte: {context}. Ton: professionnel mais chaleureux. Format: objet, corps, signature.',
    fields: [
      { key: 'recipient', label: 'Destinataire', placeholder: 'Nom et relation (ex: "Jean Dupont, client potentiel")', type: 'input', required: true },
      { key: 'subject', label: 'Objet de l\'email', placeholder: 'Présentation de nos services, relance devis...', type: 'input', required: true },
      { key: 'context', label: 'Contexte supplémentaire', placeholder: 'Informations clés, ton souhaité...', type: 'textarea', helpText: 'Plus vous donnez de contexte, meilleur sera le résultat' },
    ],
  },
  {
    id: 'proposal',
    icon: '📋',
    title: 'Proposition commerciale',
    description: 'Générez une proposition complète: contexte, solution, tarification, prochaines étapes.',
    category: 'Commercial',
    color: '#a855f7',
    prompt: 'Crée une proposition commerciale professionnelle. Client: {client}. Besoin: {need}. Notre solution: {solution}. Budget indicatif: {budget}. Structure: executive summary, contexte, solution proposée, planning, tarification, conditions.',
    fields: [
      { key: 'client', label: 'Client', placeholder: 'Nom de l\'entreprise et contact', type: 'input', required: true },
      { key: 'need', label: 'Besoin identifié', placeholder: 'Décrivez le besoin du client...', type: 'textarea', required: true },
      { key: 'solution', label: 'Solution proposée', placeholder: 'Votre offre et ses avantages...', type: 'textarea', required: true },
      { key: 'budget', label: 'Budget indicatif', placeholder: 'Fourchette de prix', type: 'input' },
    ],
  },
  {
    id: 'business-plan',
    icon: '🎯',
    title: 'Business Plan',
    description: 'Structurez votre plan d\'affaires: vision, marché, stratégie, projections financières.',
    category: 'Stratégie',
    color: '#ec4899',
    prompt: 'Crée un business plan professionnel. Projet: {project}. Marché cible: {market}. Différenciateur: {usp}. Objectifs à 1 an: {goals}. Structure: executive summary, analyse marché, proposition de valeur, modèle économique, stratégie go-to-market, équipe, projections financières, plan d\'action.',
    fields: [
      { key: 'project', label: 'Nom du projet', placeholder: 'Nom et description courte', type: 'input', required: true },
      { key: 'market', label: 'Marché cible', placeholder: 'Décrivez votre marché, taille, tendances...', type: 'textarea', required: true },
      { key: 'usp', label: 'Avantage concurrentiel', placeholder: 'Ce qui vous différencie...', type: 'textarea', required: true },
      { key: 'goals', label: 'Objectifs à 1 an', placeholder: 'CA, clients, produit...', type: 'input' },
    ],
  },
  {
    id: 'social-post',
    icon: '📱',
    title: 'Post réseaux sociaux',
    description: 'Créez du contenu engageant pour LinkedIn, Instagram, Twitter/X, Facebook.',
    category: 'Marketing',
    color: '#22c55e',
    prompt: 'Crée un post pour {platform}. Sujet: {topic}. Objectif: {goal}. Ton: {tone}. Inclus des hashtags pertinents. Format adapté à la plateforme.',
    fields: [
      { key: 'platform', label: 'Plateforme', placeholder: 'Choisissez une plateforme', type: 'select', options: ['LinkedIn', 'Instagram', 'Twitter/X', 'Facebook', 'TikTok'], required: true },
      { key: 'topic', label: 'Sujet du post', placeholder: 'De quoi parle le post?', type: 'textarea', required: true },
      { key: 'goal', label: 'Objectif', placeholder: '', type: 'chips', options: ['Engagement', 'Leads', 'Notoriété', 'Recrutement', 'Événement'], helpText: 'Sélectionnez un ou plusieurs objectifs' },
      { key: 'tone', label: 'Ton souhaité', placeholder: '', type: 'chips', options: ['Professionnel', 'Décontracté', 'Inspirant', 'Humoristique', 'Éducatif'] },
    ],
  },
  {
    id: 'meeting-notes',
    icon: '📝',
    title: 'Compte-rendu de réunion',
    description: 'Structurez vos notes de réunion: participants, décisions, actions, deadlines.',
    category: 'Organisation',
    color: '#f59e0b',
    prompt: 'Crée un compte-rendu de réunion professionnel. Participants: {participants}. Sujet: {subject}. Points discutés: {notes}. Structure: date, participants, ordre du jour, décisions prises, plan d\'action avec responsables et deadlines, prochaine réunion.',
    fields: [
      { key: 'participants', label: 'Participants', placeholder: 'Noms et roles', type: 'input', required: true },
      { key: 'subject', label: 'Sujet de la réunion', placeholder: 'Ordre du jour principal', type: 'input', required: true },
      { key: 'notes', label: 'Notes brutes', placeholder: 'Copiez vos notes de réunion ici, même en vrac...', type: 'textarea', helpText: `Collez vos notes brutes, ${DEFAULT_AGENTS.find(a => a.id === 'sarah-assistante')!.name} les structurera pour vous` },
    ],
  },
  {
    id: 'job-description',
    icon: '🤝',
    title: 'Fiche de poste',
    description: 'Rédigez une offre d\'emploi attractive et complète pour recruter les meilleurs talents.',
    category: 'RH',
    color: '#14b8a6',
    prompt: 'Crée une fiche de poste attractive. Poste: {position}. Entreprise: {company}. Missions principales: {missions}. Profil recherché: {profile}. Structure: titre accrocheur, présentation entreprise, missions, profil, avantages, processus de recrutement.',
    fields: [
      { key: 'position', label: 'Intitulé du poste', placeholder: 'Ex: Développeur Full-Stack Senior', type: 'input', required: true },
      { key: 'company', label: 'Description entreprise', placeholder: 'Secteur, taille, culture...', type: 'textarea' },
      { key: 'missions', label: 'Missions principales', placeholder: 'Listez les missions...', type: 'textarea', required: true },
      { key: 'profile', label: 'Profil recherché', placeholder: 'Compétences, expérience, qualités...', type: 'textarea' },
    ],
  },
  {
    id: 'newsletter',
    icon: '📰',
    title: 'Newsletter',
    description: 'Créez une newsletter engageante pour vos clients ou votre équipe.',
    category: 'Marketing',
    color: '#3b82f6',
    prompt: 'Crée une newsletter professionnelle. Thème principal: {theme}. Public cible: {audience}. Actualités: {news}. Call-to-action: {cta}. Structure: titre accrocheur, introduction, articles/sections, conclusion avec CTA.',
    fields: [
      { key: 'theme', label: 'Thème principal', placeholder: 'Le sujet central de cette newsletter', type: 'input' },
      { key: 'audience', label: 'Public cible', placeholder: 'Clients, prospects, équipe interne...', type: 'input' },
      { key: 'news', label: 'Actualités à partager', placeholder: 'Listez les infos, nouveautés, annonces...', type: 'textarea' },
      { key: 'cta', label: 'Call-to-action', placeholder: 'Que voulez-vous que le lecteur fasse?', type: 'input' },
    ],
  },
  {
    id: 'legal-contract',
    icon: '⚖️',
    title: 'Modèle de contrat',
    description: 'Générez un brouillon de contrat: NDA, prestation, partenariat. À faire valider par un juriste.',
    category: 'Juridique',
    color: '#6b7280',
    prompt: 'Crée un brouillon de contrat. Type: {contractType}. Parties: {parties}. Objet: {object}. Conditions spéciales: {conditions}. DISCLAIMER: Ce document est un brouillon et doit être validé par un professionnel du droit. Structure: parties, objet, obligations, durée, conditions financières, confidentialité, résiliation, droit applicable.',
    fields: [
      { key: 'contractType', label: 'Type de contrat', placeholder: 'Choisissez un type', type: 'select', options: ['NDA / Confidentialité', 'Prestation de service', 'Partenariat', 'Contrat commercial', 'CGV', 'Licence'], required: true },
      { key: 'parties', label: 'Parties impliquées', placeholder: 'Noms et rôles des parties', type: 'input', required: true },
      { key: 'object', label: 'Objet du contrat', placeholder: 'Décrivez l\'objet...', type: 'textarea', required: true },
      { key: 'conditions', label: 'Conditions spéciales', placeholder: 'Durée, montant, exclusivité...', type: 'textarea' },
    ],
  },
  {
    id: 'rapport',
    icon: '📊',
    title: 'Rapport',
    description: 'Générez un rapport professionnel: analyse, résultats, recommandations.',
    category: 'Stratégie',
    color: '#6366f1',
    prompt: 'Crée un rapport professionnel. Sujet: {subject}. Type: {reportType}. Données et observations: {data}. Public cible: {audience}. Structure: titre, résumé exécutif, contexte, analyse détaillée, résultats clés, recommandations, conclusion.',
    fields: [
      { key: 'subject', label: 'Sujet du rapport', placeholder: 'Analyse des ventes Q1, audit technique...', type: 'input', required: true },
      { key: 'reportType', label: 'Type de rapport', placeholder: 'Choisissez un type', type: 'select', options: ['Analyse', 'Audit', 'Bilan', 'Étude de marché', 'Performance', 'Incident', 'Progrès'], required: true },
      { key: 'data', label: 'Données et observations', placeholder: 'Collez vos chiffres, notes, constats...', type: 'textarea', helpText: 'Plus les données sont précises, meilleur sera le rapport', required: true },
      { key: 'audience', label: 'Public cible', placeholder: '', type: 'chips', options: ['Direction', 'Équipe', 'Clients', 'Investisseurs', 'Board'], helpText: 'Pour qui est ce rapport ?' },
    ],
  },
  {
    id: 'presentation',
    icon: '🖥️',
    title: 'Présentation',
    description: 'Structurez une présentation slide par slide avec notes speaker.',
    category: 'Communication',
    color: '#a855f7',
    prompt: 'Crée une présentation structurée slide par slide. Sujet: {subject}. Objectif: {goal}. Durée: {duration}. Public: {audience}. Pour chaque slide: titre, contenu principal (3-5 points max), notes speaker. Inclus: slide de titre, agenda, contenu, conclusion, slide de contact/CTA.',
    fields: [
      { key: 'subject', label: 'Sujet de la présentation', placeholder: 'Résultats trimestriels, pitch produit...', type: 'input', required: true },
      { key: 'goal', label: 'Objectif', placeholder: 'Choisissez un objectif', type: 'select', options: ['Informer', 'Convaincre', 'Former', 'Vendre', 'Présenter des résultats'], required: true },
      { key: 'duration', label: 'Durée estimée', placeholder: 'Choisissez une durée', type: 'select', options: ['5 minutes', '10 minutes', '20 minutes', '30 minutes', '1 heure'] },
      { key: 'audience', label: 'Public cible', placeholder: 'Décrivez votre audience...', type: 'input', helpText: 'Adaptez le niveau de détail à votre public' },
    ],
  },
  {
    id: 'brief-creatif',
    icon: '🎨',
    title: 'Brief créatif',
    description: 'Rédigez un brief créatif complet pour agence, designer ou équipe interne.',
    category: 'Marketing',
    color: '#ec4899',
    prompt: 'Crée un brief créatif professionnel. Projet: {project}. Objectif: {goal}. Cible: {target}. Ton souhaité: {tone}. Contraintes: {constraints}. Structure: contexte, objectifs, cible, message clé, ton et style, références visuelles, livrables attendus, planning.',
    fields: [
      { key: 'project', label: 'Nom du projet', placeholder: 'Campagne été 2026, refonte logo...', type: 'input', required: true },
      { key: 'goal', label: 'Objectif du projet', placeholder: 'Augmenter la notoriété, lancer un produit...', type: 'textarea', required: true },
      { key: 'target', label: 'Cible', placeholder: 'Millennials urbains, PME tech...', type: 'input', required: true },
      { key: 'tone', label: 'Ton et style', placeholder: '', type: 'chips', options: ['Premium', 'Fun', 'Minimaliste', 'Corporate', 'Audacieux', 'Élégant', 'Tech'] },
      { key: 'constraints', label: 'Contraintes', placeholder: 'Budget, délais, charte graphique...', type: 'textarea', helpText: 'Budget, délais, éléments obligatoires' },
    ],
  },
];

const CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)));

export default function DocumentsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('sarah_docs') ?? '[]'); } catch { return []; }
  });
  const [viewingDoc, setViewingDoc] = useState<GeneratedDoc | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const lastFocusedFieldRef = useRef<string>('');

  function getSession() {
    try { return JSON.parse(localStorage.getItem('sarah_session') ?? '{}'); } catch { return {}; }
  }

  async function generateDocument() {
    if (!selectedTemplate) return;
    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    // Validate required fields
    const missingRequired = selectedTemplate.fields.filter(f => f.required && !fieldValues[f.key]?.trim());
    if (missingRequired.length > 0) {
      alert(`Veuillez remplir : ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);
    try {
      let prompt = selectedTemplate.prompt;
      for (const field of selectedTemplate.fields) {
        prompt = prompt.replace(`{${field.key}}`, fieldValues[field.key] ?? 'Non spécifié');
      }

      const companyProfile = localStorage.getItem('sarah_company_profile');
      if (companyProfile) {
        prompt += `\n\nContexte entreprise du client: ${companyProfile}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [
            { role: 'user', content: `Tu es ${DEFAULT_AGENTS.find(a => a.id === 'sarah-assistante')!.name}, experte en rédaction professionnelle. ${prompt}` },
          ],
          maxTokens: 4096,
          agentName: 'sarah-assistante',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');

      const doc: GeneratedDoc = {
        id: `doc-${Date.now()}`,
        title: `${selectedTemplate.title} — ${new Date().toLocaleDateString('fr-FR')}`,
        templateId: selectedTemplate.id,
        content: data.content ?? data.text ?? '',
        createdAt: new Date().toISOString(),
        tokens: data.totalTokens ?? 0,
        cost: data.billedCredits ?? 0,
      };

      const updated = [doc, ...generatedDocs];
      setGeneratedDocs(updated);
      localStorage.setItem('sarah_docs', JSON.stringify(updated));
      setViewingDoc(doc);
      setSelectedTemplate(null);
      setFieldValues({});
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setGenerating(false);
    }
  }

  function deleteDoc(id: string) {
    const updated = generatedDocs.filter(d => d.id !== id);
    setGeneratedDocs(updated);
    localStorage.setItem('sarah_docs', JSON.stringify(updated));
    if (viewingDoc?.id === id) setViewingDoc(null);
  }

  const [copied, setCopied] = useState(false);
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard not available */ });
  }

  // Viewing a document
  if (viewingDoc) {
    const tpl = TEMPLATES.find(t => t.id === viewingDoc.templateId);
    return (
      <div>
        <div className="flex items-center gap-12 mb-24">
          <button onClick={() => setViewingDoc(null)} className="btn btn-ghost btn-sm">← Retour</button>
          <div className="flex-1">
            <h2 className="font-bold" style={{ fontSize: 18 }}>{tpl?.icon} {viewingDoc.title}</h2>
            <div className="text-sm text-muted">
              {new Date(viewingDoc.createdAt).toLocaleString('fr-FR')} | {viewingDoc.tokens} tokens | {(viewingDoc.cost / 1_000_000).toFixed(4)} cr
            </div>
          </div>
          <button onClick={() => copyToClipboard(viewingDoc.content)} className="btn btn-primary btn-sm">
            {copied ? '✓ Copié !' : 'Copier'}
          </button>
          <button onClick={() => {
            const blob = new Blob([viewingDoc.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${viewingDoc.title.replace(/[^a-zA-Z0-9\-_ ]/g, '')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }} className="btn btn-secondary btn-sm">
            Exporter .txt
          </button>
        </div>
        <div className="card p-24 text-base max-w-lg" style={{
          lineHeight: 1.8, margin: '0 auto',
        }} dangerouslySetInnerHTML={{ __html: renderMarkdown(viewingDoc.content) }} />
      </div>
    );
  }

  // Template form
  if (selectedTemplate) {
    return (
      <div>
        <div className="flex items-center gap-12 mb-24">
          <button onClick={() => { setSelectedTemplate(null); setFieldValues({}); }} className="btn btn-ghost btn-sm">← Retour</button>
          <div className="flex-1">
            <h2 className="font-bold" style={{ fontSize: 18 }}>{selectedTemplate.icon} {selectedTemplate.title}</h2>
            <div className="text-md text-secondary">{selectedTemplate.description}</div>
          </div>
          <VoiceInput
            onTranscript={(t) => {
              const key = lastFocusedFieldRef.current || selectedTemplate.fields.find(f => f.type === 'textarea')?.key || '';
              if (key) setFieldValues(prev => ({ ...prev, [key]: (prev[key] ?? '') + (prev[key] ? ' ' : '') + t }));
            }}
            size="md"
          />
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          {selectedTemplate.fields.map(field => (
            <div key={field.key} className="mb-16">
              <label className="text-md font-semibold" style={{ display: 'block', marginBottom: 6 }}>
                {field.label}
                {field.required && <span className="text-danger" style={{ marginLeft: 4 }}>*</span>}
              </label>
              {field.helpText && (
                <div className="text-xs text-muted mb-4">{field.helpText}</div>
              )}
              {field.type === 'textarea' ? (
                <textarea
                  value={fieldValues[field.key] ?? ''}
                  onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  onFocus={() => { lastFocusedFieldRef.current = field.key; }}
                  className="input w-full"
                  rows={3}
                  placeholder={field.placeholder}
                  style={{ resize: 'vertical' }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={fieldValues[field.key] ?? ''}
                  onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="select w-full"
                >
                  <option value="">{field.placeholder || 'Choisissez...'}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'chips' ? (
                <div className="flex flex-wrap gap-6 mt-4">
                  {field.options?.map(opt => {
                    const selected = (fieldValues[field.key] ?? '').split(',').filter(Boolean);
                    const isSelected = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const arr = (fieldValues[field.key] ?? '').split(',').filter(Boolean);
                          const next = isSelected ? arr.filter(v => v !== opt) : [...arr, opt];
                          setFieldValues(prev => ({ ...prev, [field.key]: next.join(',') }));
                        }}
                        style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                          background: isSelected ? 'var(--accent)' : 'var(--bg-primary)',
                          color: isSelected ? 'white' : 'var(--text-tertiary)',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-secondary)'}`,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={fieldValues[field.key] ?? ''}
                  onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input w-full"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <button
            onClick={generateDocument}
            disabled={generating}
            className="btn btn-primary w-full"
            style={{ padding: '12px 0', fontSize: 15 }}
          >
            {generating ? (
              <span className="animate-pulse">{DEFAULT_AGENTS.find(a => a.id === 'sarah-assistante')!.name} rédige votre document...</span>
            ) : (
              <>✨ Générer le document</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Template gallery
  const filteredTemplates = filterCategory ? TEMPLATES.filter(t => t.category === filterCategory) : TEMPLATES;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Générateur de Documents</h1>
          <p className="page-subtitle">
            {DEFAULT_AGENTS.find(a => a.id === 'sarah-assistante')!.name} rédige pour vous : emails, propositions, contrats, posts... Choisissez un modèle et personnalisez.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-6 flex-wrap mb-16">
        <button
          onClick={() => setFilterCategory('')}
          className={!filterCategory ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
        >
          Tous
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid-2 gap-12 mb-24">
        {filteredTemplates.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => setSelectedTemplate(tpl)}
            className="card pointer w-full"
            style={{
              textAlign: 'left',
              transition: 'border-color 0.2s, transform 0.1s',
            }}
          >
            <div className="flex gap-12" style={{ alignItems: 'flex-start' }}>
              <div className="flex-center rounded-md" style={{
                width: 48, height: 48,
                fontSize: 24, background: tpl.color + '22', flexShrink: 0,
              }}>
                {tpl.icon}
              </div>
              <div>
                <div className="font-bold mb-4" style={{ fontSize: 15 }}>{tpl.title}</div>
                <div className="text-sm text-secondary" style={{ lineHeight: 1.5 }}>{tpl.description}</div>
                <span className="text-xs font-semibold rounded-sm" style={{
                  display: 'inline-block', marginTop: 8, padding: '2px 8px',
                  background: tpl.color + '15', color: tpl.color,
                }}>
                  {tpl.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Generated Documents History */}
      {generatedDocs.length > 0 && (
        <div className="section">
          <div className="section-title">Mes documents ({generatedDocs.length})</div>
          <div className="flex flex-col gap-6">
            {generatedDocs.map(doc => {
              const tpl = TEMPLATES.find(t => t.id === doc.templateId);
              return (
                <div key={doc.id} className="flex items-center gap-12 bg-secondary rounded-md" style={{
                  padding: '8px 12px',
                }}>
                  <span style={{ fontSize: 20 }}>{tpl?.icon ?? '📄'}</span>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-md font-semibold truncate">{doc.title}</div>
                    <div className="text-xs text-muted">{new Date(doc.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                  <button onClick={() => setViewingDoc(doc)} className="btn btn-ghost btn-sm">Voir</button>
                  <button onClick={() => copyToClipboard(doc.content)} className="btn btn-ghost btn-sm">Copier</button>
                  <button onClick={() => deleteDoc(doc.id)} className="btn btn-ghost btn-sm text-danger">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
