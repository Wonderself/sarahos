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
  // ─── Tech (5) ───────────────────────────────────────────────────
  {
    id: 'tech-spec',
    icon: '🏗️',
    title: 'Spécification technique',
    description: 'Rédigez une spécification technique détaillée pour votre projet: architecture, fonctionnalités, contraintes et livrables.',
    category: 'Tech',
    color: '#3b82f6',
    prompt: 'Rédige une spécification technique complète en utilisant le framework C4 pour l\'architecture et les user stories au format Gherkin pour les fonctionnalités. Projet: {projectName}. Fonctionnalités à spécifier: {features}. Stack technique: {techStack}. Contraintes: {constraints}. Structure: résumé exécutif, contexte et objectifs, architecture (diagramme C4 textuel), spécifications fonctionnelles détaillées, exigences non-fonctionnelles (performance, sécurité, scalabilité), stack technique recommandée, plan de livraison, critères d\'acceptance.',
    fields: [
      { key: 'projectName', label: 'Nom du projet', placeholder: 'Ex: Plateforme de gestion des commandes v2', type: 'input', required: true },
      { key: 'features', label: 'Fonctionnalités à spécifier', placeholder: 'Décrivez les fonctionnalités principales à détailler...', type: 'textarea', required: true },
      { key: 'techStack', label: 'Stack technique', placeholder: 'React, Node.js, PostgreSQL, AWS...', type: 'input' },
      { key: 'constraints', label: 'Contraintes', placeholder: 'Budget, délais, compatibilité, performances...', type: 'textarea' },
    ],
  },
  {
    id: 'api-doc',
    icon: '🔌',
    title: 'Documentation API',
    description: 'Générez une documentation API claire et complète au format OpenAPI/Swagger avec exemples de requêtes et réponses.',
    category: 'Tech',
    color: '#0ea5e9',
    prompt: 'Crée une documentation API professionnelle au standard OpenAPI 3.0. Utilise le format RESTful avec les bonnes pratiques (versioning, pagination, codes HTTP appropriés). API: {apiName}. Endpoints: {endpoints}. Méthode d\'authentification: {authMethod}. Structure: introduction, base URL, authentification, endpoints détaillés (méthode, URL, paramètres, body, réponses avec exemples JSON), codes d\'erreur, rate limiting, guide de démarrage rapide.',
    fields: [
      { key: 'apiName', label: 'Nom de l\'API', placeholder: 'Ex: API Gestion des Utilisateurs v1', type: 'input', required: true },
      { key: 'endpoints', label: 'Description des endpoints', placeholder: 'Listez les endpoints: GET /users, POST /orders, etc. avec une brève description...', type: 'textarea', required: true },
      { key: 'authMethod', label: 'Méthode d\'authentification', placeholder: 'Choisissez une méthode', type: 'select', options: ['API Key', 'Bearer Token (JWT)', 'OAuth 2.0', 'Basic Auth', 'Aucune'] },
    ],
  },
  {
    id: 'postmortem',
    icon: '🔥',
    title: 'Post-mortem incident',
    description: 'Documentez un incident technique avec l\'analyse des causes racines, la timeline et les actions correctives.',
    category: 'Tech',
    color: '#ef4444',
    prompt: 'Rédige un post-mortem d\'incident selon le framework blameless post-mortem de Google SRE. Utilise la méthode des 5 Pourquoi pour l\'analyse des causes racines. Incident: {incidentTitle}. Timeline: {timeline}. Impact: {impact}. Cause racine identifiée: {rootCause}. Structure: résumé exécutif (sévérité, durée, impact), timeline détaillée, analyse des causes racines (5 Pourquoi), impact métier et technique, actions de remédiation immédiates, actions préventives à long terme, leçons apprises, métriques de suivi.',
    fields: [
      { key: 'incidentTitle', label: 'Titre de l\'incident', placeholder: 'Ex: Indisponibilité API paiement pendant 2h', type: 'input', required: true },
      { key: 'timeline', label: 'Timeline de l\'incident', placeholder: 'Décrivez chronologiquement: détection, diagnostic, résolution...', type: 'textarea', required: true },
      { key: 'impact', label: 'Impact', placeholder: 'Nombre d\'utilisateurs affectés, perte de CA, SLA impacté...', type: 'textarea', required: true },
      { key: 'rootCause', label: 'Cause racine', placeholder: 'Quelle est la cause racine identifiée ou suspectée?', type: 'textarea' },
    ],
  },
  {
    id: 'tech-audit',
    icon: '🔍',
    title: 'Audit technique',
    description: 'Réalisez un audit technique complet de votre système: architecture, dette technique, sécurité et recommandations.',
    category: 'Tech',
    color: '#6366f1',
    prompt: 'Réalise un audit technique complet en suivant les frameworks TOGAF pour l\'architecture et OWASP pour la sécurité. Évalue la dette technique selon le modèle SQALE. Système: {systemName}. Périmètre: {scope}. Stack actuelle: {currentStack}. Structure: résumé exécutif, périmètre de l\'audit, analyse de l\'architecture actuelle, évaluation de la dette technique (score SQALE), audit de sécurité (top 10 OWASP), performance et scalabilité, qualité du code, recommandations priorisées (quick wins vs long terme), roadmap de remédiation, estimation des coûts.',
    fields: [
      { key: 'systemName', label: 'Nom du système', placeholder: 'Ex: Plateforme e-commerce MonSite.fr', type: 'input', required: true },
      { key: 'scope', label: 'Périmètre de l\'audit', placeholder: 'Backend, frontend, infrastructure, sécurité, base de données...', type: 'textarea', required: true },
      { key: 'currentStack', label: 'Stack actuelle', placeholder: 'Technologies, versions, hébergement...', type: 'textarea' },
    ],
  },
  {
    id: 'release-notes',
    icon: '🚀',
    title: 'Notes de version',
    description: 'Rédigez des notes de version claires et structurées pour communiquer les nouveautés à vos utilisateurs.',
    category: 'Tech',
    color: '#22c55e',
    prompt: 'Rédige des notes de version professionnelles en suivant le standard Keep a Changelog et le Semantic Versioning. Adopte un ton accessible pour les utilisateurs non-techniques tout en étant précis pour les développeurs. Version: {version}. Nouvelles fonctionnalités: {newFeatures}. Corrections de bugs: {bugFixes}. Breaking changes: {breakingChanges}. Structure: titre avec numéro de version et date, résumé des points clés, nouvelles fonctionnalités (avec descriptions), améliorations, corrections de bugs, breaking changes (avec guide de migration), dépréciations, notes de mise à jour.',
    fields: [
      { key: 'version', label: 'Numéro de version', placeholder: 'Ex: v2.3.0', type: 'input', required: true },
      { key: 'newFeatures', label: 'Nouvelles fonctionnalités', placeholder: 'Listez les nouvelles fonctionnalités ajoutées...', type: 'textarea', required: true },
      { key: 'bugFixes', label: 'Corrections de bugs', placeholder: 'Listez les bugs corrigés...', type: 'textarea' },
      { key: 'breakingChanges', label: 'Breaking changes', placeholder: 'Changements incompatibles avec les versions précédentes...', type: 'textarea' },
    ],
  },
  // ─── Finance (4) ────────────────────────────────────────────────
  {
    id: 'budget-prev',
    icon: '💶',
    title: 'Budget prévisionnel',
    description: 'Élaborez un budget prévisionnel détaillé avec projections de revenus, charges et trésorerie.',
    category: 'Finance',
    color: '#f59e0b',
    prompt: 'Crée un budget prévisionnel professionnel en utilisant la méthode Zero-Based Budgeting (ZBB) et l\'approche bottom-up. Intègre des scénarios optimiste, réaliste et pessimiste. Période: {period}. Sources de revenus: {revenueSources}. Catégories de dépenses: {expenseCategories}. Hypothèses de croissance: {growthAssumptions}. Structure: résumé exécutif, hypothèses clés, prévisions de revenus (par source), budget des charges (fixes et variables), compte de résultat prévisionnel, plan de trésorerie mensuel, seuil de rentabilité, analyse de sensibilité, KPIs financiers à suivre.',
    fields: [
      { key: 'period', label: 'Période', placeholder: 'Ex: Année 2026, Q1-Q2 2026...', type: 'input', required: true },
      { key: 'revenueSources', label: 'Sources de revenus', placeholder: 'Abonnements SaaS, prestations, licences, e-commerce...', type: 'textarea', required: true },
      { key: 'expenseCategories', label: 'Catégories de dépenses', placeholder: 'Salaires, hébergement, marketing, loyer, outils...', type: 'textarea', required: true },
      { key: 'growthAssumptions', label: 'Hypothèses de croissance', placeholder: 'Taux de croissance prévu, nouveaux clients/mois, panier moyen...', type: 'textarea' },
    ],
  },
  {
    id: 'analyse-financiere',
    icon: '📊',
    title: 'Analyse financière',
    description: 'Réalisez une analyse financière approfondie: ratios, tendances, diagnostic et recommandations stratégiques.',
    category: 'Finance',
    color: '#f97316',
    prompt: 'Réalise une analyse financière complète en utilisant les méthodes de Dupont Analysis pour la rentabilité et l\'analyse par les ratios financiers (liquidité, solvabilité, rentabilité, activité). Entreprise: {companyName}. Données financières: {financialData}. Période d\'analyse: {analysisPeriod}. Structure: résumé exécutif, présentation de l\'entreprise, analyse du bilan (structure financière, fonds de roulement, BFR), analyse du compte de résultat (SIG), tableau des ratios clés avec interprétation, analyse de la trésorerie, benchmarking sectoriel, diagnostic financier (forces/faiblesses), recommandations stratégiques.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise à analyser', type: 'input', required: true },
      { key: 'financialData', label: 'Données financières', placeholder: 'CA, résultat net, capitaux propres, dettes, trésorerie... Collez vos chiffres clés.', type: 'textarea', required: true, helpText: 'Plus les données sont complètes, plus l\'analyse sera pertinente' },
      { key: 'analysisPeriod', label: 'Période d\'analyse', placeholder: 'Ex: 2023-2025, dernier exercice fiscal...', type: 'input' },
    ],
  },
  {
    id: 'facture-devis',
    icon: '🧾',
    title: 'Facture / Devis',
    description: 'Générez un devis ou une facture professionnelle conforme aux obligations légales françaises.',
    category: 'Finance',
    color: '#78716c',
    prompt: 'Crée un document de facturation professionnel conforme aux obligations légales françaises (Article L441-3 du Code de commerce). Inclus toutes les mentions obligatoires. Client: {clientName}. Articles/Services: {items}. Conditions de paiement: {paymentTerms}. Structure: en-tête (coordonnées émetteur), informations client, numéro et date du document, tableau détaillé (désignation, quantité, prix unitaire HT, TVA, montant TTC), sous-total HT, TVA détaillée par taux, total TTC, conditions de paiement, mentions légales obligatoires (pénalités de retard, indemnité forfaitaire), conditions générales.',
    fields: [
      { key: 'clientName', label: 'Nom du client', placeholder: 'Nom de l\'entreprise ou du particulier', type: 'input', required: true },
      { key: 'items', label: 'Articles / Services', placeholder: 'Listez les prestations: description, quantité, prix unitaire...', type: 'textarea', required: true, helpText: 'Détaillez chaque ligne: prestation, quantité, prix unitaire HT' },
      { key: 'paymentTerms', label: 'Conditions de paiement', placeholder: 'Choisissez les conditions', type: 'select', options: ['Paiement à réception', '30 jours fin de mois', '30 jours net', '45 jours fin de mois', '60 jours net', 'Acompte 30% + solde à livraison'] },
    ],
  },
  {
    id: 'rapport-investisseurs',
    icon: '🏦',
    title: 'Rapport investisseurs',
    description: 'Préparez un rapport trimestriel pour vos investisseurs avec métriques clés, jalons et perspectives.',
    category: 'Finance',
    color: '#a855f7',
    prompt: 'Rédige un rapport investisseurs professionnel en suivant les standards de reporting VC/PE. Utilise le framework des métriques SaaS (ARR, MRR, churn, LTV/CAC, NRR) si applicable. Trimestre: {quarter}. Métriques clés: {keyMetrics}. Jalons atteints: {milestones}. Perspectives: {outlook}. Structure: lettre du CEO, tableau de bord KPIs (avec évolution vs trimestre précédent), faits marquants du trimestre, analyse des métriques financières, métriques produit/croissance, utilisation des fonds (burn rate, runway), jalons atteints vs prévus, roadmap du prochain trimestre, risques et défis, besoins et prochaines étapes.',
    fields: [
      { key: 'quarter', label: 'Trimestre', placeholder: 'Ex: Q1 2026', type: 'input', required: true },
      { key: 'keyMetrics', label: 'Métriques clés', placeholder: 'ARR, MRR, nombre de clients, CA, croissance, churn rate...', type: 'textarea', required: true },
      { key: 'milestones', label: 'Jalons atteints', placeholder: 'Lancement produit, recrutements, partenariats, levée de fonds...', type: 'textarea' },
      { key: 'outlook', label: 'Perspectives', placeholder: 'Objectifs du prochain trimestre, défis identifiés...', type: 'textarea' },
    ],
  },
  // ─── ESG/RSE (3) ────────────────────────────────────────────────
  {
    id: 'bilan-carbone',
    icon: '🌍',
    title: 'Bilan carbone simplifié',
    description: 'Réalisez un bilan carbone simplifié de votre entreprise selon les scopes 1, 2 et 3 du GHG Protocol.',
    category: 'ESG',
    color: '#16a34a',
    prompt: 'Réalise un bilan carbone simplifié en suivant la méthodologie du GHG Protocol et les facteurs d\'émission de l\'ADEME (Base Carbone). Organise les émissions par Scope 1 (émissions directes), Scope 2 (énergie) et Scope 3 (chaîne de valeur). Entreprise: {companyName}. Périmètre: {scope}. Sources d\'énergie: {energySources}. Transports: {transport}. Structure: résumé exécutif, méthodologie utilisée, périmètre organisationnel et opérationnel, bilan Scope 1 (combustion, véhicules de fonction, fuites de gaz), bilan Scope 2 (électricité, chauffage), bilan Scope 3 (déplacements, achats, numérique, déchets), synthèse des émissions par catégorie, benchmarking sectoriel, plan de réduction avec objectifs chiffrés, recommandations priorisées par impact.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise', type: 'input', required: true },
      { key: 'scope', label: 'Périmètre', placeholder: 'Nombre de salariés, locaux (m²), activité principale...', type: 'textarea', required: true },
      { key: 'energySources', label: 'Sources d\'énergie', placeholder: 'Électricité (kWh), gaz (m³), fioul, énergies renouvelables...', type: 'textarea' },
      { key: 'transport', label: 'Transports', placeholder: 'Flotte véhicules, déplacements domicile-travail, voyages d\'affaires...', type: 'textarea' },
    ],
  },
  {
    id: 'rapport-rse',
    icon: '🌱',
    title: 'Rapport RSE/CSRD',
    description: 'Préparez votre rapport RSE conforme à la directive CSRD avec les indicateurs environnementaux, sociaux et de gouvernance.',
    category: 'ESG',
    color: '#10b981',
    prompt: 'Rédige un rapport RSE professionnel conforme à la directive européenne CSRD (Corporate Sustainability Reporting Directive) et aux standards ESRS (European Sustainability Reporting Standards). Intègre les principes de double matérialité. Entreprise: {companyName}. Secteur: {sector}. Engagements clés: {commitments}. Indicateurs: {metrics}. Structure: message de la direction, présentation de la démarche RSE, analyse de double matérialité, pilier environnemental (climat, biodiversité, économie circulaire), pilier social (conditions de travail, diversité, droits humains), pilier gouvernance (éthique, anti-corruption, chaîne d\'approvisionnement), tableau de bord des indicateurs ESRS, objectifs et trajectoire, plan d\'action, taxonomie verte (part du CA éligible).',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise', type: 'input', required: true },
      { key: 'sector', label: 'Secteur d\'activité', placeholder: 'Tech, industrie, services, retail...', type: 'input', required: true },
      { key: 'commitments', label: 'Engagements clés', placeholder: 'Neutralité carbone 2030, parité H/F, zéro déchet...', type: 'textarea' },
      { key: 'metrics', label: 'Indicateurs disponibles', placeholder: 'Émissions CO2, taux de diversité, turnover, formations, déchets recyclés...', type: 'textarea', helpText: 'Listez tous les indicateurs ESG dont vous disposez' },
    ],
  },
  {
    id: 'politique-diversite',
    icon: '🤝',
    title: 'Politique diversité & inclusion',
    description: 'Élaborez une politique D&I structurée avec objectifs mesurables, plan d\'action et indicateurs de suivi.',
    category: 'ESG',
    color: '#8b5cf6',
    prompt: 'Rédige une politique diversité et inclusion complète en s\'appuyant sur le cadre légal français (loi Rixain, index égalité professionnelle) et les bonnes pratiques internationales (standards GRI, principes de l\'ONU). Entreprise: {companyName}. Données RH actuelles: {workforceStats}. Objectifs: {objectives}. Structure: préambule et engagement de la direction, cadre légal et normatif, état des lieux (données chiffrées), axes stratégiques (genre, handicap, âge, origines, LGBTQ+), objectifs SMART par axe, plan d\'action détaillé (recrutement inclusif, sensibilisation, aménagements, mentorat), gouvernance D&I (comité, référents), indicateurs de suivi et reporting, calendrier de déploiement, budget estimatif.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise', type: 'input', required: true },
      { key: 'workforceStats', label: 'Données RH actuelles', placeholder: 'Effectif total, répartition H/F, taux de handicap, pyramide des âges...', type: 'textarea', required: true, helpText: 'Ces données permettront un état des lieux précis' },
      { key: 'objectives', label: 'Objectifs', placeholder: 'Index égalité > 85, 6% RQTH, parité dans le management...', type: 'textarea' },
    ],
  },
  // ─── RH (3) ─────────────────────────────────────────────────────
  {
    id: 'plan-formation',
    icon: '🎓',
    title: 'Plan de formation annuel',
    description: 'Construisez un plan de développement des compétences structuré avec budget, calendrier et indicateurs de ROI.',
    category: 'RH',
    color: '#7c3aed',
    prompt: 'Crée un plan de formation annuel professionnel en utilisant le modèle Kirkpatrick pour l\'évaluation du ROI et la méthode ADDIE pour la conception pédagogique. Intègre les obligations légales françaises (CPF, entretien professionnel). Département: {department}. Écarts de compétences identifiés: {skillsGaps}. Budget: {budget}. Objectifs: {objectives}. Structure: contexte et enjeux stratégiques, diagnostic des compétences (matrice skills gap), axes de formation prioritaires, catalogue des formations (intitulé, modalité, durée, coût, prestataire), calendrier annuel, budget détaillé par axe, indicateurs de suivi (modèle Kirkpatrick: réaction, apprentissage, transfert, résultats), plan de communication interne, processus de validation et suivi.',
    fields: [
      { key: 'department', label: 'Département / Équipe', placeholder: 'Ex: Équipe développement, service commercial, toute l\'entreprise...', type: 'input', required: true },
      { key: 'skillsGaps', label: 'Écarts de compétences', placeholder: 'Compétences manquantes ou à renforcer: IA, management, vente consultative...', type: 'textarea', required: true },
      { key: 'budget', label: 'Budget formation', placeholder: 'Budget annuel alloué, ex: 50 000€', type: 'input' },
      { key: 'objectives', label: 'Objectifs', placeholder: 'Monter en compétences IA, certifier l\'équipe, réduire le turnover...', type: 'textarea' },
    ],
  },
  {
    id: 'entretien-annuel',
    icon: '📋',
    title: 'Grille d\'entretien annuel',
    description: 'Préparez une grille d\'évaluation complète pour les entretiens annuels avec critères, objectifs SMART et plan de développement.',
    category: 'RH',
    color: '#14b8a6',
    prompt: 'Crée une grille d\'entretien annuel professionnel en utilisant la méthode OKR pour les objectifs et le framework SMART pour les critères d\'évaluation. Intègre l\'approche 360° et les bonnes pratiques de management bienveillant. Poste: {position}. Critères d\'évaluation: {evaluationCriteria}. Objectifs: {objectives}. Structure: informations générales (collaborateur, poste, manager, date), bilan de la période écoulée (réalisations, objectifs atteints/non atteints), évaluation des compétences métier (grille de notation), évaluation des compétences comportementales (soft skills), points forts et axes d\'amélioration, nouveaux objectifs SMART pour la période suivante, plan de développement individuel, souhaits d\'évolution et mobilité, synthèse et signatures.',
    fields: [
      { key: 'position', label: 'Poste évalué', placeholder: 'Ex: Chef de projet digital, Développeur senior...', type: 'input', required: true },
      { key: 'evaluationCriteria', label: 'Critères d\'évaluation', placeholder: 'Compétences techniques, soft skills, KPIs spécifiques au poste...', type: 'textarea', required: true },
      { key: 'objectives', label: 'Objectifs de la période', placeholder: 'Objectifs fixés lors du dernier entretien, résultats attendus...', type: 'textarea' },
    ],
  },
  {
    id: 'onboarding-guide',
    icon: '🚀',
    title: 'Guide d\'onboarding',
    description: 'Créez un guide d\'intégration complet pour accueillir vos nouveaux collaborateurs de manière structurée et engageante.',
    category: 'RH',
    color: '#ec4899',
    prompt: 'Crée un guide d\'onboarding complet en suivant le modèle des 4C de Talya Bauer (Conformité, Clarification, Culture, Connexion). Inclus un parcours structuré sur les 90 premiers jours. Poste: {position}. Département: {department}. Durée d\'intégration: {duration}. Contacts clés: {keyContacts}. Structure: mot de bienvenue, présentation de l\'entreprise (histoire, valeurs, culture), organigramme et contacts clés, parcours jour 1 (administratif, accès, poste de travail), semaine 1 (découverte équipe, outils, processus), mois 1 (formation, premiers objectifs), plan 30-60-90 jours avec jalons, checklist administrative (mutuelle, transports, badge), ressources et outils, FAQ du nouvel arrivant, programme de parrainage/buddy.',
    fields: [
      { key: 'position', label: 'Poste du nouvel arrivant', placeholder: 'Ex: Développeur frontend, Responsable marketing...', type: 'input', required: true },
      { key: 'department', label: 'Département', placeholder: 'Ex: Équipe Produit, Direction commerciale...', type: 'input', required: true },
      { key: 'duration', label: 'Durée d\'intégration', placeholder: 'Choisissez la durée', type: 'select', options: ['1 semaine', '2 semaines', '1 mois', '2 mois', '3 mois'] },
      { key: 'keyContacts', label: 'Contacts clés', placeholder: 'Manager, buddy, RH, IT... (noms et rôles)', type: 'textarea' },
    ],
  },
  // ─── Commercial (3) ─────────────────────────────────────────────
  {
    id: 'script-vente',
    icon: '🎯',
    title: 'Script de vente SPIN/MEDDIC',
    description: 'Construisez un script de vente structuré avec les méthodologies SPIN Selling et MEDDIC pour qualifier et convertir vos prospects.',
    category: 'Commercial',
    color: '#f97316',
    prompt: 'Crée un script de vente professionnel combinant les méthodologies SPIN Selling (Situation, Problème, Implication, Need-payoff) et MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion). Produit/Service: {product}. Cible: {targetAudience}. Objections principales: {objections}. Proposition de valeur: {valueProposition}. Structure: accroche et prise de contact, questions de découverte SPIN (situation, problème, implication, besoin), qualification MEDDIC (grille de scoring), présentation de la solution alignée aux douleurs, traitement des objections (avec réponses types), négociation et closing, séquence de relance (J+1, J+3, J+7), métriques de conversion à suivre.',
    fields: [
      { key: 'product', label: 'Produit / Service', placeholder: 'Décrivez votre offre en quelques lignes...', type: 'textarea', required: true },
      { key: 'targetAudience', label: 'Cible', placeholder: 'DSI de PME, DRH grands comptes, fondateurs de startups...', type: 'input', required: true },
      { key: 'objections', label: 'Objections principales', placeholder: 'Trop cher, on a déjà un outil, pas le bon moment...', type: 'textarea' },
      { key: 'valueProposition', label: 'Proposition de valeur', placeholder: 'Gain de temps de 40%, ROI en 3 mois, réduction des erreurs...', type: 'textarea' },
    ],
  },
  {
    id: 'etude-concurrence',
    icon: '🔎',
    title: 'Étude concurrentielle Porter',
    description: 'Analysez votre environnement concurrentiel avec les 5 forces de Porter et une matrice de positionnement.',
    category: 'Commercial',
    color: '#64748b',
    prompt: 'Réalise une étude concurrentielle complète en utilisant le modèle des 5 forces de Porter et une matrice de positionnement stratégique. Intègre une analyse des avantages compétitifs durables (framework VRIO). Marché: {market}. Concurrents principaux: {competitors}. Différenciation: {differentiation}. Structure: résumé exécutif, présentation du marché (taille, croissance, tendances), analyse des 5 forces de Porter (rivalité, nouveaux entrants, substituts, pouvoir fournisseurs, pouvoir clients), fiches concurrents détaillées (offre, pricing, forces, faiblesses, parts de marché estimées), matrice de positionnement, analyse VRIO de vos avantages concurrentiels, opportunités et menaces, recommandations stratégiques.',
    fields: [
      { key: 'market', label: 'Marché', placeholder: 'Ex: SaaS de gestion RH en France, e-commerce mode premium...', type: 'input', required: true },
      { key: 'competitors', label: 'Concurrents principaux', placeholder: 'Listez les concurrents directs et indirects avec leurs offres...', type: 'textarea', required: true },
      { key: 'differentiation', label: 'Votre différenciation', placeholder: 'Ce qui vous distingue: technologie, prix, service, UX...', type: 'textarea' },
    ],
  },
  {
    id: 'pricing-strategy',
    icon: '💰',
    title: 'Stratégie de pricing',
    description: 'Définissez votre stratégie de tarification avec analyse de la valeur, positionnement et modèles de prix.',
    category: 'Commercial',
    color: '#eab308',
    prompt: 'Élabore une stratégie de pricing complète en utilisant le framework de Value-Based Pricing et le modèle de Van Westendorp pour la sensibilité au prix. Intègre les principes de la psychologie des prix. Produit: {product}. Prix actuel: {currentPrice}. Prix concurrents: {competitorPrices}. Métriques de valeur: {valueMetrics}. Structure: analyse de la valeur perçue, benchmark concurrentiel (tableau comparatif), analyse de sensibilité au prix (Van Westendorp), modèles de pricing recommandés (freemium, tiered, usage-based, flat rate), grille tarifaire proposée avec justification, stratégie de packaging (bundles, add-ons), tactiques de pricing psychologique, projections de revenus par scénario, plan de migration (si changement de prix), A/B tests recommandés.',
    fields: [
      { key: 'product', label: 'Produit / Service', placeholder: 'Décrivez votre offre et ses fonctionnalités clés...', type: 'textarea', required: true },
      { key: 'currentPrice', label: 'Prix actuel', placeholder: 'Ex: 49€/mois, 990€/an, sur devis...', type: 'input' },
      { key: 'competitorPrices', label: 'Prix concurrents', placeholder: 'Concurrent A: 39€/mois, Concurrent B: 79€/mois...', type: 'textarea' },
      { key: 'valueMetrics', label: 'Métriques de valeur', placeholder: 'Ce que vos clients valorisent le plus: nb utilisateurs, volume, fonctionnalités...', type: 'textarea' },
    ],
  },
  // ─── Stratégie (3) ──────────────────────────────────────────────
  {
    id: 'swot-analysis',
    icon: '📐',
    title: 'Analyse SWOT complète',
    description: 'Réalisez une analyse SWOT approfondie avec matrice croisée et recommandations stratégiques actionnables.',
    category: 'Stratégie',
    color: '#6366f1',
    prompt: 'Réalise une analyse SWOT complète avec matrice croisée (TOWS). Utilise le framework pour générer des stratégies concrètes: SO (exploiter), WO (renforcer), ST (défendre), WT (éviter). Entreprise/Projet: {companyProject}. Contexte: {context}. Données marché: {marketData}. Structure: résumé exécutif, méthodologie, analyse interne (forces avec preuves, faiblesses avec impacts), analyse externe (opportunités avec potentiel, menaces avec probabilité), matrice SWOT visuelle, matrice croisée TOWS avec stratégies concrètes, priorisation des actions (matrice impact/effort), plan d\'action recommandé avec quick wins et projets structurants, indicateurs de suivi.',
    fields: [
      { key: 'companyProject', label: 'Entreprise / Projet', placeholder: 'Nom et description rapide de l\'entité à analyser', type: 'input', required: true },
      { key: 'context', label: 'Contexte', placeholder: 'Situation actuelle, enjeux, raison de l\'analyse...', type: 'textarea', required: true },
      { key: 'marketData', label: 'Données marché', placeholder: 'Taille du marché, tendances, positionnement actuel, concurrence...', type: 'textarea' },
    ],
  },
  {
    id: 'pestel-analysis',
    icon: '🌐',
    title: 'Analyse PESTEL',
    description: 'Analysez votre macro-environnement avec le cadre PESTEL: Politique, Économique, Socioculturel, Technologique, Écologique, Légal.',
    category: 'Stratégie',
    color: '#0284c7',
    prompt: 'Réalise une analyse PESTEL approfondie en évaluant chaque facteur selon son impact (fort/moyen/faible) et sa probabilité. Complète avec une analyse des tendances et signaux faibles. Entreprise: {company}. Marché/Pays cible: {targetMarket}. Industrie: {industry}. Structure: résumé exécutif, méthodologie, facteurs Politiques (régulation, stabilité, politique fiscale), facteurs Économiques (croissance, inflation, taux de change, pouvoir d\'achat), facteurs Socioculturels (démographie, modes de vie, valeurs), facteurs Technologiques (innovations, digitalisation, IA, cybersécurité), facteurs Écologiques (réglementations environnementales, RSE, transition énergétique), facteurs Légaux (droit du travail, RGPD, propriété intellectuelle), matrice d\'impact croisée, signaux faibles à surveiller, recommandations stratégiques.',
    fields: [
      { key: 'company', label: 'Entreprise', placeholder: 'Nom et secteur d\'activité', type: 'input', required: true },
      { key: 'targetMarket', label: 'Marché / Pays cible', placeholder: 'France, Europe, marchés émergents...', type: 'input', required: true },
      { key: 'industry', label: 'Industrie', placeholder: 'Tech/SaaS, retail, santé, industrie, fintech...', type: 'input' },
    ],
  },
  {
    id: 'okr-planning',
    icon: '🎯',
    title: 'Planning OKR trimestriel',
    description: 'Définissez vos OKR (Objectives & Key Results) trimestriels alignés sur la stratégie avec un système de scoring.',
    category: 'Stratégie',
    color: '#a855f7',
    prompt: 'Crée un planning OKR trimestriel en suivant la méthodologie de John Doerr (Measure What Matters). Utilise le système de scoring 0.0-1.0 et la méthode CRAFT (Create, Refine, Align, Finalize, Transmit) pour la définition des objectifs. Équipe: {team}. Trimestre: {quarter}. Priorités stratégiques: {priorities}. Structure: rappel de la vision et mission, bilan OKR du trimestre précédent (si applicable), priorités stratégiques pour le trimestre, OKR de niveau entreprise (2-3 objectifs, 3-5 KR chacun), OKR de l\'équipe/département alignés, grille de scoring avec cibles (0.3 = minimum, 0.7 = cible, 1.0 = stretch), plan de check-in hebdomadaire, rituels recommandés (weekly, mid-quarter review), template de suivi, conseils pour éviter les erreurs courantes.',
    fields: [
      { key: 'team', label: 'Équipe / Département', placeholder: 'Ex: Équipe Produit, Direction Marketing, Startup entière...', type: 'input', required: true },
      { key: 'quarter', label: 'Trimestre', placeholder: 'Ex: Q2 2026', type: 'input', required: true },
      { key: 'priorities', label: 'Priorités stratégiques', placeholder: 'Croissance utilisateurs, amélioration rétention, lancement international, rentabilité...', type: 'textarea', required: true },
    ],
  },
  // ─── Communication (2) ──────────────────────────────────────────
  {
    id: 'plan-com-crise',
    icon: '🛡️',
    title: 'Plan de communication de crise',
    description: 'Préparez un plan de gestion de crise complet avec messages clés, porte-paroles et procédures d\'escalade.',
    category: 'Communication',
    color: '#ef4444',
    prompt: 'Élabore un plan de communication de crise professionnel en suivant le modèle de Situational Crisis Communication Theory (SCCT) de Timothy Coombs. Intègre les principes du crisis management (rapidité, transparence, empathie). Type de crise: {crisisType}. Parties prenantes: {stakeholders}. Messages clés: {keyMessages}. Structure: procédure d\'alerte et d\'activation, cellule de crise (composition, rôles, contacts), cartographie des parties prenantes (matrice pouvoir/intérêt), évaluation de la gravité (grille de scoring), messages clés par cible (employés, clients, médias, autorités, partenaires), éléments de langage (Q&A), stratégie média (communiqué type, réseaux sociaux, dark site), timeline des actions (H+1, H+4, H+24, J+3, J+7), procédure de désescalade, bilan post-crise et retour d\'expérience.',
    fields: [
      { key: 'crisisType', label: 'Type de crise', placeholder: 'Fuite de données, défaut produit, bad buzz, crise RH, accident...', type: 'input', required: true },
      { key: 'stakeholders', label: 'Parties prenantes', placeholder: 'Employés, clients, médias, investisseurs, régulateurs, partenaires...', type: 'textarea', required: true },
      { key: 'keyMessages', label: 'Messages clés', placeholder: 'Points essentiels à communiquer, valeurs de l\'entreprise, engagements...', type: 'textarea' },
    ],
  },
  {
    id: 'media-kit',
    icon: '📰',
    title: 'Kit média / Dossier de presse',
    description: 'Créez un dossier de presse professionnel pour présenter votre entreprise aux journalistes et influenceurs.',
    category: 'Communication',
    color: '#8b5cf6',
    prompt: 'Crée un kit média / dossier de presse professionnel en suivant les standards des relations presse. Utilise la méthode de la pyramide inversée pour structurer l\'information. Entreprise: {companyName}. Faits clés: {keyFacts}. Porte-parole: {spokesperson}. Actualités récentes: {recentNews}. Structure: page de garde, sommaire, communiqué de presse (actualité principale), présentation de l\'entreprise (histoire, mission, vision), chiffres clés (CA, effectifs, clients, croissance), biographies des dirigeants, produits/services phares, témoignages clients, visuels et logos (guide d\'utilisation), revue de presse (couverture médiatique), informations pratiques et contact presse, FAQ journalistes.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise', type: 'input', required: true },
      { key: 'keyFacts', label: 'Faits clés', placeholder: 'Date de création, CA, effectifs, clients majeurs, levées de fonds...', type: 'textarea', required: true },
      { key: 'spokesperson', label: 'Porte-parole', placeholder: 'Nom, titre, parcours résumé du/des porte-parole(s)...', type: 'textarea' },
      { key: 'recentNews', label: 'Actualités récentes', placeholder: 'Lancement produit, partenariat, levée de fonds, prix remportés...', type: 'textarea' },
    ],
  },
  // ─── Juridique (2) ──────────────────────────────────────────────
  {
    id: 'rgpd-audit',
    icon: '🔒',
    title: 'Audit RGPD',
    description: 'Évaluez votre conformité RGPD avec un audit structuré: registre des traitements, analyse des risques et plan de mise en conformité.',
    category: 'Juridique',
    color: '#64748b',
    prompt: 'Réalise un audit RGPD complet en suivant les recommandations de la CNIL et les exigences du Règlement Général sur la Protection des Données (UE 2016/679). Utilise la méthode PIA (Privacy Impact Assessment) pour l\'analyse des risques. Entreprise: {companyName}. Types de données collectées: {dataTypes}. Sous-traitants: {processors}. Structure: résumé exécutif (score de conformité estimé), périmètre de l\'audit, registre des traitements (finalité, base légale, durée de conservation, destinataires), analyse des droits des personnes (accès, rectification, effacement, portabilité), évaluation des mesures de sécurité techniques et organisationnelles, analyse des risques (matrice probabilité/impact), sous-traitants et transferts hors UE, analyse PIA pour les traitements sensibles, plan de mise en conformité priorisé, modèles de documents (registre, mentions d\'information, formulaire de consentement), checklist de conformité.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Nom de l\'entreprise', type: 'input', required: true },
      { key: 'dataTypes', label: 'Types de données collectées', placeholder: 'Identité, email, paiement, géolocalisation, données sensibles...', type: 'textarea', required: true, helpText: 'Listez toutes les catégories de données personnelles traitées' },
      { key: 'processors', label: 'Sous-traitants', placeholder: 'Hébergeur (AWS, OVH...), CRM (HubSpot...), analytics (Google...), paiement (Stripe...)...', type: 'textarea' },
    ],
  },
  {
    id: 'politique-confidentialite',
    icon: '📜',
    title: 'Politique de confidentialité',
    description: 'Rédigez une politique de confidentialité conforme au RGPD avec toutes les mentions obligatoires pour votre site ou application.',
    category: 'Juridique',
    color: '#78716c',
    prompt: 'Rédige une politique de confidentialité complète et conforme au RGPD (articles 13 et 14) et à la loi Informatique et Libertés. Le document doit être clair, accessible et couvrir toutes les mentions obligatoires exigées par la CNIL. Entreprise: {companyName}. Site/Application: {websiteApp}. Données collectées: {dataCollected}. Durée de conservation: {retentionPeriod}. Structure: identité et coordonnées du responsable de traitement, coordonnées du DPO (si applicable), finalités et bases légales de chaque traitement, catégories de données collectées, destinataires des données, transferts hors UE (le cas échéant), durées de conservation par catégorie, droits des utilisateurs (accès, rectification, effacement, limitation, portabilité, opposition), modalités d\'exercice des droits, politique de cookies (catégories, finalités, durée), mesures de sécurité, mise à jour de la politique, droit de réclamation auprès de la CNIL. DISCLAIMER: Ce document est un modèle à faire valider par un professionnel du droit.',
    fields: [
      { key: 'companyName', label: 'Nom de l\'entreprise', placeholder: 'Raison sociale complète', type: 'input', required: true },
      { key: 'websiteApp', label: 'Site web / Application', placeholder: 'URL du site ou nom de l\'application', type: 'input', required: true },
      { key: 'dataCollected', label: 'Données collectées', placeholder: 'Nom, email, téléphone, adresse IP, cookies, données de paiement...', type: 'textarea', required: true, helpText: 'Listez toutes les données personnelles collectées sur votre site/app' },
      { key: 'retentionPeriod', label: 'Durées de conservation', placeholder: 'Données clients: 3 ans après dernier achat, prospects: 3 ans, logs: 1 an...', type: 'textarea' },
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
