'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import DOMPurify from 'isomorphic-dompurify';
import { DEFAULT_AGENTS } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';
import { useToast } from '../../../components/Toast';

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
  // ═══════════════════════════════════════════════════════════════
  // BUSINESS TEMPLATES (25)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'email-pro',
    icon: 'mail',
    title: 'Email professionnel',
    description: 'Rédigez un email professionnel adapté à votre contexte: prospection, relance, partenariat, etc.',
    category: 'Communication',
    color: '#5b6cf7',
    prompt: 'Rédige un email professionnel. Destinataire: {recipient}. Objet: {subject}. Contexte: {context}. Ton: professionnel mais chaleureux. Format: objet, corps, signature.',
    fields: [
      { key: 'recipient', label: 'Destinataire', placeholder: 'Nom et relation (ex: "Jean Dupont, client potentiel")', type: 'input', required: true },
      { key: 'subject', label: 'Objet de l\'email', placeholder: 'Présentation de nos services, relance devis...', type: 'input', required: true },
      { key: 'context', label: 'Contexte supplémentaire', placeholder: 'Informations clés, ton souhaité...', type: 'textarea', helpText: 'Plus vous donnez de contexte, meilleur sera le résultat' },
    ],
  },
  {
    id: 'proposal',
    icon: 'assignment',
    title: 'Proposition commerciale',
    description: 'Générez une proposition complète: contexte, solution, tarification, prochaines étapes.',
    category: 'Commercial',
    color: '#8b7cf8',
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
    icon: 'target',
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
    icon: 'phone_iphone',
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
    icon: 'edit_note',
    title: 'Compte-rendu de réunion',
    description: 'Structurez vos notes de réunion: participants, décisions, actions, deadlines.',
    category: 'Organisation',
    color: '#f59e0b',
    prompt: 'Crée un compte-rendu de réunion professionnel. Participants: {participants}. Sujet: {subject}. Points discutés: {notes}. Structure: date, participants, ordre du jour, décisions prises, plan d\'action avec responsables et deadlines, prochaine réunion.',
    fields: [
      { key: 'participants', label: 'Participants', placeholder: 'Noms et roles', type: 'input', required: true },
      { key: 'subject', label: 'Sujet de la réunion', placeholder: 'Ordre du jour principal', type: 'input', required: true },
      { key: 'notes', label: 'Notes brutes', placeholder: 'Copiez vos notes de réunion ici, même en vrac...', type: 'textarea', helpText: `Collez vos notes brutes, ${DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name} les structurera pour vous` },
    ],
  },
  {
    id: 'job-description',
    icon: 'handshake',
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
    icon: 'newspaper',
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
    icon: 'balance',
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
    icon: 'bar_chart',
    title: 'Rapport',
    description: 'Générez un rapport professionnel: analyse, résultats, recommandations.',
    category: 'Stratégie',
    color: '#5b6cf7',
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
    icon: 'computer',
    title: 'Présentation',
    description: 'Structurez une présentation slide par slide avec notes speaker.',
    category: 'Communication',
    color: '#8b7cf8',
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
    icon: 'palette',
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
  {
    id: 'devis-facture',
    icon: 'receipt',
    title: 'Devis / Facture',
    description: 'Générez un devis ou une facture professionnelle avec toutes les mentions légales obligatoires.',
    category: 'Commercial',
    color: '#8b7cf8',
    prompt: 'Crée un {docType} professionnel conforme à la législation française. Client: {client}. Prestations détaillées: {prestations}. Conditions: {conditions}. Structure: en-tête avec coordonnées, numéro du document, date, coordonnées client, tableau détaillé des prestations (description, quantité, prix unitaire HT, montant HT), sous-total HT, TVA applicable, total TTC, conditions de paiement, mentions légales obligatoires (SIRET, TVA intracommunautaire, etc.).',
    fields: [
      { key: 'docType', label: 'Type de document', placeholder: 'Choisissez', type: 'select', options: ['Devis', 'Facture', 'Facture proforma', 'Avoir'], required: true },
      { key: 'client', label: 'Client', placeholder: 'Nom de l\'entreprise, adresse, contact', type: 'textarea', required: true },
      { key: 'prestations', label: 'Prestations / Produits', placeholder: 'Listez chaque prestation avec quantité et prix unitaire...', type: 'textarea', required: true, helpText: 'Détaillez chaque ligne : description, quantité, prix unitaire HT' },
      { key: 'conditions', label: 'Conditions de paiement', placeholder: 'Paiement à 30 jours, acompte 30%...', type: 'input' },
    ],
  },
  {
    id: 'plan-marketing-digital',
    icon: 'trending_up',
    title: 'Plan marketing digital',
    description: 'Élaborez un plan marketing digital complet avec objectifs, canaux, budget et KPIs mesurables.',
    category: 'Marketing',
    color: '#22c55e',
    prompt: 'Crée un plan marketing digital complet et actionnable. Entreprise/Produit: {product}. Objectifs: {objectives}. Budget mensuel: {budget}. Cible: {target}. Structure détaillée: 1) Analyse de la situation actuelle, 2) Objectifs SMART, 3) Personas cibles, 4) Stratégie par canal (SEO, SEA, réseaux sociaux, email marketing, content marketing), 5) Calendrier éditorial mensuel, 6) Répartition du budget par canal, 7) KPIs et tableaux de suivi, 8) Outils recommandés, 9) Planning de mise en oeuvre sur 3 mois.',
    fields: [
      { key: 'product', label: 'Entreprise / Produit', placeholder: 'Décrivez votre entreprise ou produit à promouvoir...', type: 'textarea', required: true },
      { key: 'objectives', label: 'Objectifs', placeholder: '', type: 'chips', options: ['Notoriété', 'Acquisition clients', 'Fidélisation', 'E-commerce', 'Génération de leads', 'Branding'], required: true },
      { key: 'budget', label: 'Budget mensuel', placeholder: 'Ex: 2000€/mois, 500€/mois...', type: 'input' },
      { key: 'target', label: 'Cible principale', placeholder: 'Décrivez votre client idéal (âge, intérêts, localisation...)', type: 'textarea', required: true },
    ],
  },
  {
    id: 'cahier-des-charges',
    icon: 'architecture',
    title: 'Cahier des charges',
    description: 'Rédigez un cahier des charges technique ou fonctionnel complet pour votre projet.',
    category: 'Organisation',
    color: '#f59e0b',
    prompt: 'Crée un cahier des charges professionnel et détaillé. Projet: {project}. Type: {cdcType}. Contexte et besoins: {context}. Contraintes: {constraints}. Structure: 1) Présentation du projet et contexte, 2) Objectifs et périmètre, 3) Description fonctionnelle détaillée, 4) Spécifications techniques, 5) Contraintes (budget, délais, techniques), 6) Livrables attendus, 7) Planning prévisionnel, 8) Critères de recette et validation, 9) Annexes.',
    fields: [
      { key: 'project', label: 'Nom du projet', placeholder: 'Refonte site web, application mobile, outil interne...', type: 'input', required: true },
      { key: 'cdcType', label: 'Type de cahier des charges', placeholder: 'Choisissez', type: 'select', options: ['Fonctionnel', 'Technique', 'Fonctionnel et technique', 'Graphique / UX'], required: true },
      { key: 'context', label: 'Contexte et besoins', placeholder: 'Décrivez le contexte du projet, les problèmes à résoudre, les besoins utilisateurs...', type: 'textarea', required: true, helpText: 'Soyez le plus précis possible pour un CDC exploitable' },
      { key: 'constraints', label: 'Contraintes', placeholder: 'Budget, délais, technologies imposées, hébergement...', type: 'textarea' },
    ],
  },
  {
    id: 'communique-presse',
    icon: 'campaign',
    title: 'Communiqué de presse',
    description: 'Rédigez un communiqué de presse professionnel pour vos annonces et événements.',
    category: 'Communication',
    color: '#5b6cf7',
    prompt: 'Crée un communiqué de presse professionnel au format journalistique. Entreprise: {company}. Annonce: {announcement}. Contexte: {context}. Citation du porte-parole: {quote}. Structure: titre accrocheur (< 10 mots), sous-titre, chapô (résumé en 2-3 lignes), corps du texte en pyramide inversée (le plus important en premier), citation du dirigeant/porte-parole, boilerplate entreprise, contact presse. Respecte le style journalistique : phrases courtes, paragraphes concis, ton factuel.',
    fields: [
      { key: 'company', label: 'Entreprise', placeholder: 'Nom, secteur, taille...', type: 'input', required: true },
      { key: 'announcement', label: 'Annonce principale', placeholder: 'Lancement produit, levée de fonds, partenariat, événement...', type: 'textarea', required: true },
      { key: 'context', label: 'Contexte et chiffres clés', placeholder: 'Données, statistiques, contexte marché...', type: 'textarea', helpText: 'Les journalistes aiment les chiffres concrets' },
      { key: 'quote', label: 'Citation du porte-parole', placeholder: 'Nom et titre du porte-parole + idée de la citation', type: 'input' },
    ],
  },
  {
    id: 'analyse-swot',
    icon: 'search',
    title: 'Analyse SWOT',
    description: 'Réalisez une analyse SWOT complète avec matrice et recommandations stratégiques.',
    category: 'Stratégie',
    color: '#ec4899',
    prompt: 'Réalise une analyse SWOT complète et actionnable. Entreprise/Projet: {subject}. Secteur: {sector}. Informations disponibles: {info}. Structure: 1) Présentation du contexte, 2) Matrice SWOT détaillée (Forces, Faiblesses, Opportunités, Menaces — minimum 5 points par quadrant), 3) Analyse croisée (stratégies SO, WO, ST, WT), 4) Recommandations stratégiques prioritaires, 5) Plan d\'action immédiat (quick wins). Sois concret et spécifique, évite les généralités.',
    fields: [
      { key: 'subject', label: 'Entreprise / Projet', placeholder: 'Nom et description courte', type: 'input', required: true },
      { key: 'sector', label: 'Secteur d\'activité', placeholder: 'Tech, restauration, e-commerce, conseil...', type: 'input', required: true },
      { key: 'info', label: 'Informations clés', placeholder: 'Décrivez la situation actuelle, concurrents, ressources, défis...', type: 'textarea', required: true, helpText: 'Plus vous fournissez d\'informations, plus l\'analyse sera pertinente' },
    ],
  },
  {
    id: 'plan-formation',
    icon: 'school',
    title: 'Plan de formation',
    description: 'Concevez un plan de formation structuré pour développer les compétences de vos équipes.',
    category: 'RH',
    color: '#14b8a6',
    prompt: 'Crée un plan de formation professionnel et détaillé. Équipe/Poste: {team}. Compétences à développer: {skills}. Durée: {duration}. Niveau actuel: {level}. Structure: 1) Objectifs pédagogiques, 2) Public cible et prérequis, 3) Programme détaillé par module (objectifs, contenu, durée, méthode), 4) Calendrier de formation, 5) Méthodes pédagogiques (présentiel, e-learning, cas pratiques, mises en situation), 6) Ressources et supports nécessaires, 7) Évaluation des acquis (quiz, mise en pratique), 8) Suivi post-formation, 9) Budget estimatif.',
    fields: [
      { key: 'team', label: 'Équipe / Poste concerné', placeholder: 'Commerciaux, managers, développeurs...', type: 'input', required: true },
      { key: 'skills', label: 'Compétences à développer', placeholder: 'Listez les compétences visées...', type: 'textarea', required: true },
      { key: 'duration', label: 'Durée disponible', placeholder: 'Choisissez', type: 'select', options: ['1 journée', '2-3 jours', '1 semaine', '1 mois', 'Programme sur 3 mois', 'Programme annuel'] },
      { key: 'level', label: 'Niveau actuel', placeholder: 'Choisissez', type: 'select', options: ['Débutant', 'Intermédiaire', 'Avancé', 'Mixte (plusieurs niveaux)'] },
    ],
  },
  {
    id: 'tableau-bord-kpi',
    icon: 'bar_chart',
    title: 'Tableau de bord KPI',
    description: 'Concevez un tableau de bord avec les KPIs essentiels pour piloter votre activité.',
    category: 'Finance',
    color: '#16a34a',
    prompt: 'Conçois un tableau de bord KPI complet et actionnable. Activité: {activity}. Département: {department}. Objectifs stratégiques: {objectives}. Structure: 1) Vue d\'ensemble (5-7 KPIs stratégiques avec formules de calcul), 2) KPIs opérationnels par département, 3) Fréquence de mise à jour recommandée pour chaque KPI, 4) Seuils d\'alerte (vert/orange/rouge), 5) Sources de données, 6) Visualisations recommandées (graphiques, jauges, tableaux), 7) Template de rapport mensuel, 8) Métriques de benchmarking sectorielles.',
    fields: [
      { key: 'activity', label: 'Type d\'activité', placeholder: 'SaaS, e-commerce, agence, industrie...', type: 'input', required: true },
      { key: 'department', label: 'Département', placeholder: '', type: 'chips', options: ['Direction générale', 'Commercial', 'Marketing', 'Finance', 'RH', 'Production', 'Service client'], required: true },
      { key: 'objectives', label: 'Objectifs stratégiques', placeholder: 'Croissance CA, rentabilité, satisfaction client...', type: 'textarea', required: true },
    ],
  },
  {
    id: 'procedure-interne',
    icon: 'assignment',
    title: 'Procédure interne',
    description: 'Documentez vos processus internes avec des étapes claires et des responsabilités définies.',
    category: 'Organisation',
    color: '#f59e0b',
    prompt: 'Crée une procédure interne professionnelle et facilement applicable. Processus: {process}. Service concerné: {department}. Description: {description}. Structure: 1) Objet et champ d\'application, 2) Documents de référence, 3) Définitions et abréviations, 4) Responsabilités (matrice RACI), 5) Logigramme du processus (étapes numérotées avec description détaillée, responsable, documents associés, outils utilisés), 6) Points de contrôle, 7) Gestion des exceptions, 8) Indicateurs de performance, 9) Historique des révisions. Format clair avec puces et tableaux.',
    fields: [
      { key: 'process', label: 'Nom du processus', placeholder: 'Onboarding client, gestion des réclamations, validation des dépenses...', type: 'input', required: true },
      { key: 'department', label: 'Service concerné', placeholder: 'Commercial, RH, Comptabilité, IT...', type: 'input', required: true },
      { key: 'description', label: 'Description du processus', placeholder: 'Décrivez les grandes étapes actuelles et les problèmes rencontrés...', type: 'textarea', required: true, helpText: 'Décrivez le processus tel qu\'il est ou tel que vous le souhaitez' },
    ],
  },
  {
    id: 'etude-marche',
    icon: 'language',
    title: 'Étude de marché',
    description: 'Réalisez une étude de marché structurée pour valider votre projet ou orienter votre stratégie.',
    category: 'Stratégie',
    color: '#ec4899',
    prompt: 'Crée une étude de marché approfondie et structurée. Marché cible: {market}. Produit/Service: {product}. Zone géographique: {zone}. Structure: 1) Résumé exécutif, 2) Méthodologie, 3) Analyse macro-environnement (PESTEL), 4) Taille du marché et tendances (TAM/SAM/SOM), 5) Segmentation du marché, 6) Analyse de la demande (profils clients, comportements d\'achat), 7) Analyse concurrentielle (5 forces de Porter, benchmarking détaillé), 8) Analyse de l\'offre, 9) Facteurs clés de succès, 10) Opportunités et menaces, 11) Recommandations stratégiques.',
    fields: [
      { key: 'market', label: 'Marché cible', placeholder: 'Le marché que vous souhaitez étudier...', type: 'input', required: true },
      { key: 'product', label: 'Produit / Service', placeholder: 'Décrivez votre offre ou projet...', type: 'textarea', required: true },
      { key: 'zone', label: 'Zone géographique', placeholder: 'France, Europe, mondial, ville spécifique...', type: 'input' },
    ],
  },
  {
    id: 'script-vente',
    icon: 'call',
    title: 'Script de vente',
    description: 'Créez un script de vente téléphonique ou en face-à-face avec gestion des objections.',
    category: 'Commercial',
    color: '#8b7cf8',
    prompt: 'Crée un script de vente complet et naturel. Produit/Service: {product}. Cible: {target}. Type d\'appel: {callType}. Structure: 1) Accroche et présentation (3 variantes), 2) Questions de découverte (10 questions ouvertes stratégiques), 3) Pitch produit adapté aux besoins découverts, 4) Argumentation par bénéfice (pas par fonctionnalité), 5) Gestion des 10 objections les plus courantes (prix, timing, concurrent, décideur absent, etc.) avec réponses naturelles, 6) Closing (3 techniques), 7) Relance si pas de décision. Le ton doit être naturel et conversationnel, pas robotique.',
    fields: [
      { key: 'product', label: 'Produit / Service vendu', placeholder: 'Décrivez ce que vous vendez et ses avantages clés...', type: 'textarea', required: true },
      { key: 'target', label: 'Cible', placeholder: 'DG de PME, responsable marketing, particulier...', type: 'input', required: true },
      { key: 'callType', label: 'Type d\'appel', placeholder: 'Choisissez', type: 'select', options: ['Prospection à froid', 'Relance après contact', 'Suite à une demande entrante', 'Rendez-vous physique', 'Démo produit'] },
    ],
  },
  {
    id: 'guide-onboarding',
    icon: 'rocket_launch',
    title: 'Guide d\'onboarding',
    description: 'Créez un guide d\'accueil complet pour intégrer efficacement vos nouveaux collaborateurs.',
    category: 'RH',
    color: '#14b8a6',
    prompt: 'Crée un guide d\'onboarding complet et engageant. Poste: {position}. Entreprise: {company}. Durée d\'intégration: {duration}. Structure: 1) Message de bienvenue, 2) Présentation de l\'entreprise (histoire, valeurs, culture, organigramme), 3) Checklist administrative (documents, accès, équipement), 4) Programme jour par jour — Semaine 1 (détaillé heure par heure le jour 1), 5) Programme semaines 2-4, 6) Objectifs à 30/60/90 jours, 7) Contacts clés et mentors, 8) Outils et ressources internes, 9) FAQ du nouvel arrivant, 10) Évaluation de la période d\'essai.',
    fields: [
      { key: 'position', label: 'Poste concerné', placeholder: 'Développeur, commercial, manager...', type: 'input', required: true },
      { key: 'company', label: 'Contexte entreprise', placeholder: 'Secteur, taille, culture, valeurs, outils utilisés...', type: 'textarea', required: true },
      { key: 'duration', label: 'Durée d\'intégration', placeholder: 'Choisissez', type: 'select', options: ['1 semaine', '2 semaines', '1 mois', '3 mois (période d\'essai)'] },
    ],
  },
  {
    id: 'politique-confidentialite',
    icon: 'lock',
    title: 'Politique de confidentialité',
    description: 'Générez une politique de confidentialité conforme RGPD pour votre site web ou application.',
    category: 'Juridique',
    color: '#6b7280',
    prompt: 'Crée une politique de confidentialité complète et conforme au RGPD. Entreprise: {company}. Type de service: {serviceType}. Données collectées: {dataCollected}. DISCLAIMER: Ce document est un brouillon et doit être validé par un juriste spécialisé en protection des données. Structure: 1) Identité du responsable du traitement, 2) Données personnelles collectées et finalités, 3) Base légale du traitement, 4) Destinataires des données, 5) Transferts hors UE, 6) Durée de conservation, 7) Droits des personnes (accès, rectification, suppression, portabilité, opposition), 8) Cookies et traceurs, 9) Sécurité des données, 10) DPO et contact, 11) Mise à jour de la politique.',
    fields: [
      { key: 'company', label: 'Entreprise', placeholder: 'Raison sociale, adresse, SIRET...', type: 'input', required: true },
      { key: 'serviceType', label: 'Type de service', placeholder: 'Choisissez', type: 'select', options: ['Site web vitrine', 'E-commerce', 'Application mobile', 'SaaS / Plateforme en ligne', 'Application interne'], required: true },
      { key: 'dataCollected', label: 'Données collectées', placeholder: 'Email, nom, adresse, paiement, cookies, géolocalisation...', type: 'textarea', required: true, helpText: 'Listez toutes les données personnelles que vous collectez' },
    ],
  },
  {
    id: 'plan-communication',
    icon: 'campaign',
    title: 'Plan de communication',
    description: 'Élaborez un plan de communication complet avec messages clés, canaux et calendrier.',
    category: 'Communication',
    color: '#5b6cf7',
    prompt: 'Crée un plan de communication stratégique complet. Entreprise/Projet: {project}. Objectif: {objective}. Cibles: {targets}. Budget: {budget}. Structure: 1) Diagnostic de communication actuel, 2) Objectifs de communication (notoriété, image, comportement), 3) Cibles prioritaires et secondaires avec personas, 4) Messages clés par cible, 5) Stratégie créative (concept, ton, univers visuel), 6) Plan d\'actions par canal (digital, print, événementiel, RP, interne), 7) Calendrier sur 6 mois, 8) Budget détaillé par action, 9) KPIs et mesure des résultats, 10) Plan de crise.',
    fields: [
      { key: 'project', label: 'Entreprise / Projet', placeholder: 'Nom et contexte...', type: 'input', required: true },
      { key: 'objective', label: 'Objectif principal', placeholder: 'Lancement produit, repositionnement, événement, recrutement...', type: 'textarea', required: true },
      { key: 'targets', label: 'Cibles', placeholder: 'Clients B2B, grand public, presse, collaborateurs...', type: 'input', required: true },
      { key: 'budget', label: 'Budget communication', placeholder: 'Fourchette budgétaire disponible', type: 'input' },
    ],
  },
  {
    id: 'pitch-deck',
    icon: 'work',
    title: 'Pitch deck investisseur',
    description: 'Structurez un pitch deck percutant pour convaincre des investisseurs ou partenaires.',
    category: 'Commercial',
    color: '#8b7cf8',
    prompt: 'Crée un pitch deck investisseur percutant et structuré slide par slide. Startup/Projet: {startup}. Stade: {stage}. Montant recherché: {amount}. Métriques clés: {metrics}. Structure (12-15 slides): 1) Titre + baseline, 2) Le problème (douleur marché), 3) La solution, 4) Taille du marché (TAM/SAM/SOM), 5) Produit / Démo, 6) Business model, 7) Traction et métriques clés, 8) Concurrence (positionnement), 9) Avantage compétitif / Moat, 10) Équipe, 11) Roadmap produit, 12) Projections financières 3 ans, 13) Utilisation des fonds (camembert), 14) L\'ask (montant, valorisation, conditions), 15) Coordonnées. Pour chaque slide: titre accrocheur, 3-5 points clés, notes speaker.',
    fields: [
      { key: 'startup', label: 'Startup / Projet', placeholder: 'Nom, description en 1 phrase, stade de développement...', type: 'textarea', required: true },
      { key: 'stage', label: 'Stade', placeholder: 'Choisissez', type: 'select', options: ['Pré-seed / Idée', 'Seed / MVP', 'Série A / Product-Market Fit', 'Série B+ / Scale'], required: true },
      { key: 'amount', label: 'Montant recherché', placeholder: 'Ex: 500K€, 2M€...', type: 'input' },
      { key: 'metrics', label: 'Métriques clés', placeholder: 'MRR, utilisateurs, croissance, NPS...', type: 'textarea', helpText: 'Les chiffres concrets font la différence' },
    ],
  },
  // ═══════════════════════════════════════════════════════════════
  // PERSONAL TEMPLATES (25)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cv-resume',
    icon: 'description',
    title: 'CV / Résumé',
    description: 'Créez un CV professionnel et percutant adapté au poste que vous visez.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Crée un CV professionnel optimisé pour le poste visé. Profil: {profile}. Poste visé: {targetJob}. Expériences: {experience}. Compétences: {skills}. Structure: 1) En-tête (nom, titre professionnel, coordonnées), 2) Accroche professionnelle (3-4 lignes percutantes), 3) Expériences professionnelles (du plus récent au plus ancien, avec résultats chiffrés), 4) Formation, 5) Compétences techniques et soft skills, 6) Langues, 7) Centres d\'intérêt pertinents. Utilise des verbes d\'action, quantifie les réalisations, adapte le vocabulaire au secteur visé.',
    fields: [
      { key: 'profile', label: 'Votre profil', placeholder: 'Nom, titre actuel, années d\'expérience, secteur...', type: 'textarea', required: true },
      { key: 'targetJob', label: 'Poste visé', placeholder: 'Intitulé du poste, entreprise cible, secteur...', type: 'input', required: true },
      { key: 'experience', label: 'Expériences clés', placeholder: 'Listez vos postes, missions et réalisations principales...', type: 'textarea', required: true, helpText: 'Mentionnez des chiffres : CA généré, équipe managée, projets livrés...' },
      { key: 'skills', label: 'Compétences', placeholder: 'Techniques, langues, outils, soft skills...', type: 'textarea' },
    ],
  },
  {
    id: 'lettre-motivation',
    icon: 'mail',
    title: 'Lettre de motivation',
    description: 'Rédigez une lettre de motivation convaincante et personnalisée pour votre candidature.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige une lettre de motivation percutante et personnalisée. Poste visé: {targetJob}. Entreprise: {company}. Mon parcours: {background}. Mes motivations: {motivation}. Structure: 1) Accroche originale (pas "Je me permets de..."), 2) Paragraphe "Vous" (ce que vous savez de l\'entreprise et pourquoi elle vous attire), 3) Paragraphe "Moi" (vos compétences clés avec exemples concrets), 4) Paragraphe "Nous" (ce que vous apporterez ensemble), 5) Conclusion avec appel à l\'action. Ton: professionnel mais authentique, avec de la personnalité.',
    fields: [
      { key: 'targetJob', label: 'Poste visé', placeholder: 'Intitulé exact du poste', type: 'input', required: true },
      { key: 'company', label: 'Entreprise et contexte', placeholder: 'Nom de l\'entreprise, ce qui vous attire chez elle...', type: 'textarea', required: true },
      { key: 'background', label: 'Votre parcours', placeholder: 'Formation, expériences pertinentes, réalisations clés...', type: 'textarea', required: true },
      { key: 'motivation', label: 'Vos motivations', placeholder: 'Pourquoi ce poste? Pourquoi cette entreprise?', type: 'textarea' },
    ],
  },
  {
    id: 'budget-personnel',
    icon: 'savings',
    title: 'Budget personnel',
    description: 'Planifiez votre budget mensuel avec un suivi clair de vos revenus et dépenses.',
    category: 'Finance perso',
    color: '#059669',
    prompt: 'Crée un plan de budget personnel mensuel détaillé et actionnable. Revenus mensuels: {income}. Situation: {situation}. Objectifs financiers: {goals}. Structure: 1) Tableau des revenus (salaire net, revenus complémentaires), 2) Charges fixes (loyer, assurances, abonnements, crédits — détaillées), 3) Charges variables (alimentation, transport, loisirs, vêtements), 4) Épargne recommandée (règle 50/30/20 adaptée), 5) Tableau récapitulatif avec pourcentages, 6) Conseils d\'optimisation personnalisés, 7) Astuces pour réduire chaque poste de dépense, 8) Template de suivi mensuel. Sois bienveillant et réaliste.',
    fields: [
      { key: 'income', label: 'Revenus mensuels nets', placeholder: 'Ex: 2500€ salaire + 300€ freelance', type: 'input', required: true },
      { key: 'situation', label: 'Situation', placeholder: '', type: 'chips', options: ['Célibataire', 'En couple', 'Famille', 'Étudiant', 'Retraité'], required: true },
      { key: 'goals', label: 'Objectifs financiers', placeholder: 'Épargne d\'urgence, voyage, achat immobilier, remboursement dettes...', type: 'textarea' },
    ],
  },
  {
    id: 'plan-alimentaire',
    icon: 'restaurant',
    title: 'Plan alimentaire',
    description: 'Recevez un plan de repas hebdomadaire équilibré adapté à vos besoins et préférences.',
    category: 'Bien-être',
    color: '#10b981',
    prompt: 'Crée un plan alimentaire hebdomadaire complet et équilibré. Objectif: {goal}. Régime/Restrictions: {diet}. Contraintes: {constraints}. Structure: 1) Objectif nutritionnel et apports recommandés, 2) Liste des aliments à privilégier, 3) Planning semaine complète (lundi à dimanche) avec pour chaque jour: petit-déjeuner, déjeuner, collation, dîner (détail des portions), 4) Liste de courses optimisée par rayon, 5) 3 recettes rapides favorites, 6) Conseils de préparation (meal prep), 7) Astuces pratiques au quotidien. Sois réaliste et gourmand, pas restrictif.',
    fields: [
      { key: 'goal', label: 'Objectif', placeholder: '', type: 'chips', options: ['Perte de poids', 'Prise de masse', 'Équilibre', 'Performance sportive', 'Énergie au quotidien'], required: true },
      { key: 'diet', label: 'Régime / Restrictions', placeholder: '', type: 'chips', options: ['Sans restriction', 'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Halal', 'Casher', 'Faible en sucre'] },
      { key: 'constraints', label: 'Contraintes pratiques', placeholder: 'Budget, temps de préparation, allergies, nombre de personnes...', type: 'textarea', helpText: 'Précisez vos contraintes pour un plan vraiment applicable' },
    ],
  },
  {
    id: 'programme-fitness',
    icon: 'fitness_center',
    title: 'Programme fitness',
    description: 'Obtenez un programme d\'entraînement personnalisé adapté à vos objectifs et votre niveau.',
    category: 'Bien-être',
    color: '#10b981',
    prompt: 'Crée un programme de fitness personnalisé sur 4 semaines. Objectif: {goal}. Niveau: {level}. Équipement disponible: {equipment}. Disponibilité: {availability}. Structure: 1) Évaluation du profil et objectifs réalistes, 2) Programme semaine type (jour par jour) avec: nom de l\'exercice, nombre de séries x répétitions, temps de repos, vidéo/description du mouvement, 3) Progression sur 4 semaines (augmentation charges/volume), 4) Échauffement et retour au calme, 5) Conseils nutrition de base, 6) Conseils récupération (sommeil, stretching), 7) Indicateurs de progression à suivre.',
    fields: [
      { key: 'goal', label: 'Objectif', placeholder: '', type: 'chips', options: ['Perte de poids', 'Prise de muscle', 'Cardio/Endurance', 'Souplesse', 'Tonus général', 'Prépa sportive'], required: true },
      { key: 'level', label: 'Niveau actuel', placeholder: 'Choisissez', type: 'select', options: ['Grand débutant', 'Débutant (< 6 mois)', 'Intermédiaire (6 mois-2 ans)', 'Avancé (2+ ans)'], required: true },
      { key: 'equipment', label: 'Équipement disponible', placeholder: '', type: 'chips', options: ['Aucun (poids du corps)', 'Haltères', 'Bandes élastiques', 'Salle de sport complète', 'Tapis de yoga', 'Barre de traction'] },
      { key: 'availability', label: 'Disponibilité', placeholder: 'Choisissez', type: 'select', options: ['2 séances/semaine', '3 séances/semaine', '4 séances/semaine', '5 séances/semaine', '6 séances/semaine'] },
    ],
  },
  {
    id: 'objectifs-annee',
    icon: 'target',
    title: 'Objectifs de l\'année',
    description: 'Définissez et structurez vos objectifs annuels dans tous les domaines de votre vie.',
    category: 'Développement personnel',
    color: '#8b5cf6',
    prompt: 'Crée un plan d\'objectifs annuels complet et motivant. Domaines prioritaires: {domains}. Situation actuelle: {currentSituation}. Rêve/Vision: {vision}. Structure: 1) Vision à 1 an (ce que votre vie idéale ressemble dans 12 mois), 2) Objectifs par domaine (professionnel, financier, santé, relations, développement personnel, loisirs) — chaque objectif formulé en SMART, 3) Top 3 des objectifs prioritaires, 4) Découpage en objectifs trimestriels, 5) Habitudes quotidiennes à mettre en place, 6) Obstacles anticipés et stratégies, 7) Système de récompenses, 8) Template de revue mensuelle. Sois ambitieux mais réaliste.',
    fields: [
      { key: 'domains', label: 'Domaines prioritaires', placeholder: '', type: 'chips', options: ['Carrière', 'Finance', 'Santé', 'Relations', 'Développement personnel', 'Créativité', 'Voyage', 'Spiritualité'], required: true },
      { key: 'currentSituation', label: 'Situation actuelle', placeholder: 'Décrivez brièvement où vous en êtes dans les domaines choisis...', type: 'textarea', required: true },
      { key: 'vision', label: 'Votre vision / Rêve', placeholder: 'Qu\'aimeriez-vous avoir accompli dans 12 mois?', type: 'textarea' },
    ],
  },
  {
    id: 'journal-gratitude',
    icon: 'volunteer_activism',
    title: 'Journal de gratitude',
    description: 'Recevez des prompts de gratitude personnalisés pour cultiver le bien-être au quotidien.',
    category: 'Développement personnel',
    color: '#8b5cf6',
    prompt: 'Crée un programme de journal de gratitude personnalisé sur 30 jours. Thème: {theme}. Moment préféré: {timing}. Contexte: {context}. Structure: 1) Introduction aux bienfaits de la gratitude (scientifiques et pratiques), 2) Comment utiliser ce journal (5 minutes/jour), 3) 30 prompts quotidiens uniques et profonds (pas de simples "listez 3 choses"), classés par thème: — Semaine 1: Gratitude pour le présent — Semaine 2: Gratitude relationnelle — Semaine 3: Gratitude pour soi-même — Semaine 4: Gratitude et vision positive, 4) Exercice bonus hebdomadaire (lettre de gratitude, méditation, acte de gentillesse), 5) Bilan mensuel de gratitude. Les prompts doivent être introspectifs, variés et inspirants.',
    fields: [
      { key: 'theme', label: 'Thème principal', placeholder: '', type: 'chips', options: ['Général', 'Travail', 'Relations', 'Santé', 'Croissance personnelle', 'Nature', 'Créativité'], required: true },
      { key: 'timing', label: 'Moment préféré', placeholder: 'Choisissez', type: 'select', options: ['Le matin au réveil', 'Le soir avant de dormir', 'Pause déjeuner', 'Quand j\'en ressens le besoin'] },
      { key: 'context', label: 'Contexte personnel', placeholder: 'Période de vie, défis actuels, ce que vous cherchez...', type: 'textarea', helpText: 'Optionnel mais permet des prompts plus personnalisés' },
    ],
  },
  {
    id: 'discours-toast',
    icon: 'mic',
    title: 'Discours / Toast',
    description: 'Rédigez un discours mémorable pour un mariage, anniversaire, départ ou tout événement.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige un discours mémorable et émouvant. Occasion: {occasion}. Relation avec la personne: {relationship}. Anecdotes: {anecdotes}. Ton: {tone}. Structure: 1) Accroche captivante (humour, citation, question), 2) Introduction et contexte, 3) Corps du discours avec anecdotes personnelles et émotions, 4) Message principal / leçon de vie, 5) Toast ou conclusion inspirante. Durée cible: 3-5 minutes (environ 500-800 mots). Le discours doit alterner humour et émotion, être authentique et personnel.',
    fields: [
      { key: 'occasion', label: 'Occasion', placeholder: '', type: 'select', options: ['Mariage (témoin)', 'Mariage (parent)', 'Anniversaire', 'Départ à la retraite', 'Pot de départ', 'Bar/Bat Mitzvah', 'Baptême', 'Événement professionnel', 'Autre célébration'], required: true },
      { key: 'relationship', label: 'Votre relation', placeholder: 'Ami d\'enfance, collègue, frère/soeur, parent...', type: 'input', required: true },
      { key: 'anecdotes', label: 'Anecdotes et souvenirs', placeholder: 'Listez 2-3 anecdotes, moments partagés, traits de caractère...', type: 'textarea', required: true, helpText: 'Les anecdotes personnelles font les meilleurs discours' },
      { key: 'tone', label: 'Ton souhaité', placeholder: '', type: 'chips', options: ['Émouvant', 'Humoristique', 'Solennel', 'Léger', 'Nostalgique'] },
    ],
  },
  {
    id: 'lettre-reclamation',
    icon: 'markunread_mailbox',
    title: 'Lettre de réclamation',
    description: 'Rédigez une lettre de réclamation efficace auprès d\'une administration ou entreprise.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige une lettre de réclamation formelle et efficace. Destinataire: {recipient}. Objet de la réclamation: {subject}. Détails du problème: {details}. Structure: 1) En-tête avec coordonnées expéditeur et destinataire, 2) Lieu et date, 3) Objet précis, 4) Références (numéro client, contrat, commande), 5) Exposé des faits (chronologique, factuel), 6) Préjudice subi, 7) Demande précise (remboursement, réparation, indemnisation), 8) Délai de réponse souhaité, 9) Mention des recours possibles si non-réponse, 10) Formule de politesse. Ton: ferme mais courtois, factuel, sans émotion excessive. Mentionner les articles de loi pertinents si applicable.',
    fields: [
      { key: 'recipient', label: 'Destinataire', placeholder: 'Entreprise, administration, assurance, banque...', type: 'input', required: true },
      { key: 'subject', label: 'Objet de la réclamation', placeholder: 'Facture erronée, produit défectueux, service non rendu...', type: 'input', required: true },
      { key: 'details', label: 'Détails du problème', placeholder: 'Décrivez la situation chronologiquement: dates, montants, échanges précédents...', type: 'textarea', required: true, helpText: 'Soyez factuel et précis: dates, montants, références' },
    ],
  },
  {
    id: 'plan-voyage',
    icon: 'flight',
    title: 'Plan de voyage',
    description: 'Planifiez votre voyage de A à Z avec un itinéraire détaillé et des conseils pratiques.',
    category: 'Loisirs',
    color: '#06b6d4',
    prompt: 'Crée un plan de voyage complet et détaillé. Destination: {destination}. Durée: {duration}. Budget: {budget}. Style de voyage: {style}. Structure: 1) Aperçu de la destination (climat, meilleure période, formalités), 2) Budget estimatif détaillé (transport, hébergement, repas, activités), 3) Itinéraire jour par jour (matin, après-midi, soir) avec adresses et prix, 4) Hébergements recommandés par gamme de prix, 5) Restaurants et spécialités à goûter, 6) Activités et visites incontournables, 7) Bons plans et astuces locales, 8) Checklist de préparation avant le départ, 9) Mots utiles dans la langue locale, 10) Contacts et numéros d\'urgence.',
    fields: [
      { key: 'destination', label: 'Destination', placeholder: 'Pays, ville, région...', type: 'input', required: true },
      { key: 'duration', label: 'Durée du voyage', placeholder: 'Choisissez', type: 'select', options: ['Week-end (2-3 jours)', '1 semaine', '10 jours', '2 semaines', '3 semaines', '1 mois+'], required: true },
      { key: 'budget', label: 'Budget par personne', placeholder: 'Choisissez', type: 'select', options: ['Backpacker (< 50€/jour)', 'Économique (50-100€/jour)', 'Confort (100-200€/jour)', 'Premium (200€+/jour)'] },
      { key: 'style', label: 'Style de voyage', placeholder: '', type: 'chips', options: ['Culture/Musées', 'Nature/Rando', 'Plage/Farniente', 'Gastronomie', 'Aventure', 'Famille', 'Romantique'] },
    ],
  },
  {
    id: 'lettre-resiliation',
    icon: 'content_cut',
    title: 'Lettre de résiliation',
    description: 'Rédigez une lettre de résiliation conforme pour tout type d\'abonnement ou contrat.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige une lettre de résiliation formelle et juridiquement conforme. Service à résilier: {service}. Raison: {reason}. Références: {references}. Structure: 1) En-tête complet (expéditeur + destinataire), 2) Lieu et date, 3) Objet: "Résiliation du contrat n°...", 4) Rappel du contrat (type, date de souscription, références), 5) Demande de résiliation claire avec date d\'effet souhaitée, 6) Motif (si loi Chatel, loi Hamon, ou motif légitime — citer l\'article de loi), 7) Demande de confirmation écrite, 8) Demande de remboursement au prorata si applicable, 9) Formule de politesse. Mention: "Lettre recommandée avec accusé de réception". Ton: formel et direct.',
    fields: [
      { key: 'service', label: 'Service / Contrat', placeholder: '', type: 'select', options: ['Téléphone / Internet', 'Assurance', 'Salle de sport', 'Abonnement streaming', 'Abonnement presse', 'Bail / Location', 'Mutuelle', 'Électricité / Gaz', 'Autre abonnement'], required: true },
      { key: 'reason', label: 'Motif de résiliation', placeholder: 'Déménagement, augmentation tarifaire, fin d\'engagement, insatisfaction...', type: 'input', required: true },
      { key: 'references', label: 'Références du contrat', placeholder: 'Numéro client, numéro de contrat, date de souscription...', type: 'input', helpText: 'Ces références accélèrent le traitement de votre demande' },
    ],
  },
  {
    id: 'bilan-competences',
    icon: 'explore',
    title: 'Bilan de compétences',
    description: 'Réalisez un auto-bilan de vos compétences pour orienter votre carrière ou une reconversion.',
    category: 'Développement personnel',
    color: '#8b5cf6',
    prompt: 'Crée un bilan de compétences personnel structuré et approfondi. Parcours: {background}. Domaine actuel: {currentField}. Aspirations: {aspirations}. Structure: 1) Synthèse du parcours professionnel, 2) Inventaire des compétences techniques (hard skills), 3) Inventaire des compétences comportementales (soft skills), 4) Analyse des réalisations clés et points de fierté, 5) Identification des valeurs professionnelles, 6) Environnement de travail idéal, 7) Points de force et axes d\'amélioration, 8) Métiers et secteurs compatibles avec votre profil, 9) Compétences à développer pour atteindre vos aspirations, 10) Plan d\'action concret (formations, networking, expériences à chercher). Sois bienveillant et encourageant.',
    fields: [
      { key: 'background', label: 'Votre parcours', placeholder: 'Formation, postes occupés, secteurs, durées...', type: 'textarea', required: true },
      { key: 'currentField', label: 'Domaine actuel', placeholder: 'Votre métier et secteur actuels...', type: 'input', required: true },
      { key: 'aspirations', label: 'Aspirations / Envies', placeholder: 'Ce qui vous attire, ce que vous aimeriez faire, ce qui vous manque...', type: 'textarea', helpText: 'Soyez honnête, il n\'y a pas de mauvaise réponse' },
    ],
  },
  {
    id: 'liste-courses',
    icon: 'storefront',
    title: 'Liste de courses optimisée',
    description: 'Générez une liste de courses intelligente organisée par rayon avec astuces économiques.',
    category: 'Organisation perso',
    color: '#eab308',
    prompt: 'Crée une liste de courses optimisée et intelligente. Nombre de personnes: {people}. Repas prévus: {meals}. Budget: {budget}. Structure: 1) Liste organisée par rayon (fruits & légumes, boulangerie, crèmerie, viandes/poissons, épicerie, surgelés, boissons, hygiène/entretien) pour faire les courses efficacement, 2) Quantités adaptées au nombre de personnes, 3) Estimation du coût total, 4) Alternatives économiques pour chaque catégorie, 5) Produits de saison à privilégier ce mois-ci, 6) Basiques à vérifier dans les placards avant de partir, 7) Astuces anti-gaspi.',
    fields: [
      { key: 'people', label: 'Nombre de personnes', placeholder: 'Choisissez', type: 'select', options: ['1 personne', '2 personnes', '3-4 personnes (famille)', '5-6 personnes', '7+ personnes'], required: true },
      { key: 'meals', label: 'Repas prévus cette semaine', placeholder: 'Décrivez les repas prévus ou le type de cuisine souhaitée...', type: 'textarea', required: true, helpText: 'Ex: 5 déjeuners au bureau, 7 dîners maison, 1 brunch dimanche...' },
      { key: 'budget', label: 'Budget courses hebdomadaire', placeholder: 'Choisissez', type: 'select', options: ['Serré (< 40€)', 'Modéré (40-80€)', 'Confortable (80-120€)', 'Sans contrainte'] },
    ],
  },
  {
    id: 'routine-matin',
    icon: 'wb_twilight',
    title: 'Routine du matin',
    description: 'Concevez une routine matinale sur mesure pour démarrer chaque journée avec énergie.',
    category: 'Bien-être',
    color: '#10b981',
    prompt: 'Crée une routine matinale personnalisée et réaliste. Heure de réveil: {wakeUpTime}. Temps disponible: {duration}. Objectifs: {goals}. Structure: 1) Pourquoi une routine matinale change tout (bénéfices concrets), 2) Routine minute par minute (heure de chaque activité), 3) Variante jour de semaine vs week-end, 4) Préparation la veille au soir (5 actions clés), 5) Conseils pour chaque étape (méditation guidée, exercice, nutrition, journaling), 6) Plan d\'implémentation progressif sur 3 semaines (commencer petit), 7) Solutions pour les jours difficiles (routine express 15 min), 8) Habitudes à éviter le matin.',
    fields: [
      { key: 'wakeUpTime', label: 'Heure de réveil souhaitée', placeholder: 'Choisissez', type: 'select', options: ['5h00', '5h30', '6h00', '6h30', '7h00', '7h30', '8h00'], required: true },
      { key: 'duration', label: 'Temps disponible le matin', placeholder: 'Choisissez', type: 'select', options: ['30 minutes', '45 minutes', '1 heure', '1h30', '2 heures'], required: true },
      { key: 'goals', label: 'Vos priorités matinales', placeholder: '', type: 'chips', options: ['Énergie physique', 'Clarté mentale', 'Productivité', 'Bien-être émotionnel', 'Créativité', 'Spiritualité'], helpText: 'Sélectionnez vos priorités pour personnaliser la routine' },
    ],
  },
  {
    id: 'plan-epargne',
    icon: 'account_balance',
    title: 'Plan d\'épargne',
    description: 'Élaborez une stratégie d\'épargne personnalisée pour atteindre vos objectifs financiers.',
    category: 'Finance perso',
    color: '#059669',
    prompt: 'Crée un plan d\'épargne personnalisé et réaliste. Revenus: {income}. Épargne actuelle: {savings}. Objectif: {goal}. Horizon: {horizon}. Structure: 1) Diagnostic financier rapide, 2) Objectif chiffré et timeline, 3) Capacité d\'épargne mensuelle recommandée, 4) Stratégie de répartition (épargne de précaution, projets moyen terme, long terme), 5) Produits d\'épargne recommandés pour chaque objectif (Livret A, LDDS, PEL, assurance-vie, PEA — avec avantages/inconvénients), 6) Plan d\'action mois par mois pour la première année, 7) Automatisation de l\'épargne (virements programmés), 8) Astuces pour épargner plus sans se priver, 9) Erreurs à éviter.',
    fields: [
      { key: 'income', label: 'Revenus nets mensuels', placeholder: 'Ex: 2800€', type: 'input', required: true },
      { key: 'savings', label: 'Épargne actuelle', placeholder: 'Montant total déjà épargné et placements actuels...', type: 'input' },
      { key: 'goal', label: 'Objectif d\'épargne', placeholder: '', type: 'chips', options: ['Épargne de précaution', 'Achat immobilier', 'Voyage', 'Retraite', 'Études enfants', 'Projet personnel', 'Liberté financière'], required: true },
      { key: 'horizon', label: 'Horizon', placeholder: 'Choisissez', type: 'select', options: ['6 mois', '1 an', '2-3 ans', '5 ans', '10 ans', '20+ ans'] },
    ],
  },
  {
    id: 'checklist-demenagement',
    icon: 'inventory_2',
    title: 'Checklist déménagement',
    description: 'Obtenez une checklist complète pour organiser votre déménagement sans stress.',
    category: 'Organisation perso',
    color: '#eab308',
    prompt: 'Crée une checklist de déménagement ultra-complète et chronologique. Type de déménagement: {moveType}. Date prévue: {date}. Situation: {situation}. Structure: 1) 3 mois avant (résiliation, recherche déménageurs, tri), 2) 2 mois avant (formalités administratives, devis), 3) 1 mois avant (cartons, changements d\'adresse — liste exhaustive des organismes), 4) 2 semaines avant (préparatifs finaux, voisinage), 5) 1 semaine avant (valise essentielle, frigo, derniers cartons), 6) Jour J (checklist point par point, plan de chargement), 7) Première semaine après (installation, vérifications compteurs), 8) Premier mois après (restants administratifs). Chaque étape avec checkbox, responsable, et deadline. Inclure les astuces d\'organisation et les pièges à éviter.',
    fields: [
      { key: 'moveType', label: 'Type de déménagement', placeholder: 'Choisissez', type: 'select', options: ['Location → Location', 'Location → Propriété', 'Propriété → Location', 'Propriété → Propriété', 'International'], required: true },
      { key: 'date', label: 'Date prévue', placeholder: 'Ex: 15 juin 2026', type: 'input', required: true },
      { key: 'situation', label: 'Situation', placeholder: '', type: 'chips', options: ['Seul(e)', 'En couple', 'Famille avec enfants', 'Colocation', 'Avec animaux'] },
    ],
  },
  {
    id: 'testament-numerique',
    icon: 'lock',
    title: 'Testament numérique',
    description: 'Documentez vos accès numériques et volontés pour votre patrimoine digital.',
    category: 'Juridique perso',
    color: '#64748b',
    prompt: 'Crée un guide de testament numérique complet et organisé. Type de comptes: {accounts}. Volontés: {wishes}. Structure: 1) Importance du testament numérique (contexte légal en France), 2) Inventaire organisé des comptes par catégorie: — Finances (banques, crypto, investissements), — Réseaux sociaux (Facebook, Instagram, LinkedIn, Twitter), — Services cloud (Google, Apple, Microsoft, Dropbox), — Abonnements payants, — Sites e-commerce, — Comptes professionnels, — Emails, 3) Pour chaque catégorie: instructions d\'accès (sans mots de passe en clair — utiliser un gestionnaire de mots de passe), volontés (supprimer, mémorialiser, transférer), 4) Personne de confiance numérique désignée, 5) Procédure en cas de décès pour chaque grande plateforme, 6) Conseils de mise en oeuvre (gestionnaire de mots de passe, lettre scellée, notaire). DISCLAIMER: Ce document ne remplace pas un testament notarié.',
    fields: [
      { key: 'accounts', label: 'Types de comptes à couvrir', placeholder: '', type: 'chips', options: ['Réseaux sociaux', 'Banques/Finance', 'Cloud/Stockage', 'Emails', 'Crypto', 'Abonnements', 'Sites pro', 'Jeux/Divertissement'], required: true },
      { key: 'wishes', label: 'Vos volontés générales', placeholder: 'Supprimer tous les comptes, garder les photos en mémoire, transférer la musique...', type: 'textarea', helpText: 'Réfléchissez à ce que vous souhaitez pour chaque type de compte' },
    ],
  },
  {
    id: 'lettre-recommandation',
    icon: 'star',
    title: 'Lettre de recommandation',
    description: 'Rédigez une lettre de recommandation professionnelle pour un collègue ou collaborateur.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige une lettre de recommandation professionnelle convaincante. Personne recommandée: {person}. Votre relation professionnelle: {relationship}. Qualités et réalisations: {qualities}. Poste visé: {targetJob}. Structure: 1) En-tête et date, 2) À l\'attention de (ou "À qui de droit"), 3) Votre identité et fonction, 4) Contexte de votre relation professionnelle (durée, cadre), 5) Compétences techniques observées avec exemples concrets, 6) Qualités humaines et professionnelles avec anecdotes, 7) Réalisations marquantes chiffrées, 8) Recommandation claire et enthousiaste, 9) Disponibilité pour échange, 10) Coordonnées. Le ton doit être authentique, spécifique et enthousiaste — pas générique.',
    fields: [
      { key: 'person', label: 'Personne recommandée', placeholder: 'Nom, poste actuel, durée de collaboration...', type: 'input', required: true },
      { key: 'relationship', label: 'Votre relation', placeholder: 'Manager direct, collègue, client, professeur...', type: 'input', required: true },
      { key: 'qualities', label: 'Qualités et réalisations clés', placeholder: 'Listez 3-5 qualités avec des exemples concrets...', type: 'textarea', required: true, helpText: 'Les exemples concrets rendent la recommandation crédible' },
      { key: 'targetJob', label: 'Contexte de la recommandation', placeholder: 'Candidature à un poste, école, promotion...', type: 'input' },
    ],
  },
  {
    id: 'plan-carriere',
    icon: 'trending_up',
    title: 'Plan de carrière',
    description: 'Élaborez un plan de développement de carrière structuré sur 1 à 5 ans.',
    category: 'Développement personnel',
    color: '#8b5cf6',
    prompt: 'Crée un plan de carrière personnalisé et actionnable. Situation actuelle: {current}. Objectif de carrière: {target}. Horizon: {horizon}. Structure: 1) Analyse de la situation actuelle (poste, compétences, réseau, satisfaction), 2) Définition de l\'objectif carrière (poste, secteur, rémunération, mode de vie), 3) Gap analysis: compétences manquantes entre situation actuelle et objectif, 4) Plan d\'acquisition de compétences (formations, certifications, expériences), 5) Stratégie de networking (personnes à rencontrer, événements, LinkedIn), 6) Personal branding (positionnement, visibilité, contenu), 7) Jalons intermédiaires avec timeline, 8) Plan B et pivots possibles, 9) Métriques de progression, 10) Actions à lancer cette semaine.',
    fields: [
      { key: 'current', label: 'Situation actuelle', placeholder: 'Poste, entreprise, secteur, salaire, années d\'expérience...', type: 'textarea', required: true },
      { key: 'target', label: 'Objectif de carrière', placeholder: 'Le poste ou la carrière que vous visez...', type: 'textarea', required: true },
      { key: 'horizon', label: 'Horizon', placeholder: 'Choisissez', type: 'select', options: ['1 an', '2-3 ans', '5 ans', '10 ans'], required: true },
    ],
  },
  {
    id: 'email-personnel-delicat',
    icon: 'chat',
    title: 'Email personnel délicat',
    description: 'Rédigez un email personnel sensible : excuses, confrontation, annonce difficile.',
    category: 'Personnel',
    color: '#f97316',
    prompt: 'Rédige un email personnel délicat avec tact et intelligence émotionnelle. Destinataire: {recipient}. Type de message: {messageType}. Situation: {situation}. Ce que je veux exprimer: {intent}. L\'email doit: 1) Avoir un ton approprié (ni trop froid ni trop émotionnel), 2) Reconnaître les sentiments de l\'autre, 3) Exprimer clairement le message principal, 4) Prendre ses responsabilités si applicable, 5) Proposer une suite constructive. Propose 2 versions: une version courte et directe, et une version plus développée. Évite les formulations passives-agressives, les justifications excessives et le victim-blaming.',
    fields: [
      { key: 'recipient', label: 'Destinataire', placeholder: 'Relation: ami, famille, ex, voisin, collègue...', type: 'input', required: true },
      { key: 'messageType', label: 'Type de message', placeholder: 'Choisissez', type: 'select', options: ['Excuses sincères', 'Confrontation respectueuse', 'Annonce d\'une mauvaise nouvelle', 'Refus poli', 'Rétablir le contact', 'Fixer des limites', 'Remerciement profond'], required: true },
      { key: 'situation', label: 'Contexte de la situation', placeholder: 'Décrivez ce qui s\'est passé et le contexte relationnel...', type: 'textarea', required: true },
      { key: 'intent', label: 'Ce que vous voulez exprimer', placeholder: 'Le message que vous voulez faire passer...', type: 'textarea' },
    ],
  },
  {
    id: 'recette-personnalisee',
    icon: 'cooking',
    title: 'Recette personnalisée',
    description: 'Obtenez une recette sur mesure adaptée à vos ingrédients, régime et niveau culinaire.',
    category: 'Loisirs',
    color: '#06b6d4',
    prompt: 'Crée une recette personnalisée détaillée et alléchante. Ingrédients disponibles: {ingredients}. Type de plat: {dishType}. Contraintes alimentaires: {diet}. Structure: 1) Nom créatif de la recette, 2) Temps de préparation et cuisson, 3) Niveau de difficulté, 4) Nombre de portions, 5) Liste complète des ingrédients avec quantités précises, 6) Ustensiles nécessaires, 7) Instructions étape par étape (numérotées, avec astuces de chef entre parenthèses), 8) Conseils de présentation, 9) Variantes possibles, 10) Valeurs nutritionnelles approximatives, 11) Accord boisson (vin ou autre). Sois gourmand dans la description — on doit avoir envie de cuisiner !',
    fields: [
      { key: 'ingredients', label: 'Ingrédients disponibles', placeholder: 'Listez ce que vous avez dans le frigo et les placards...', type: 'textarea', required: true, helpText: 'Plus vous listez d\'ingrédients, plus la recette sera créative' },
      { key: 'dishType', label: 'Type de plat', placeholder: '', type: 'chips', options: ['Entrée', 'Plat principal', 'Dessert', 'Apéritif', 'Brunch', 'Soupe', 'Salade', 'Snack healthy'], required: true },
      { key: 'diet', label: 'Contraintes alimentaires', placeholder: '', type: 'chips', options: ['Aucune', 'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Low carb', 'Halal'] },
    ],
  },
  {
    id: 'plan-lecture',
    icon: 'menu_book',
    title: 'Plan de lecture',
    description: 'Recevez un plan de lecture personnalisé avec des recommandations adaptées à vos goûts.',
    category: 'Loisirs',
    color: '#06b6d4',
    prompt: 'Crée un plan de lecture personnalisé sur 3 mois. Centres d\'intérêt: {interests}. Livres récents appréciés: {recentBooks}. Objectif: {goal}. Structure: 1) Profil lecteur et recommandations adaptées, 2) Sélection de 12 livres (1 par semaine) organisés en 3 thématiques mensuelles, pour chaque livre: titre, auteur, résumé alléchant (3-4 lignes), pourquoi ce livre pour vous, niveau de difficulté, nombre de pages, 3) Ordre de lecture recommandé (du plus accessible au plus dense), 4) Alternatives si un livre ne plaît pas, 5) Conseils pour lire régulièrement (habitudes, moment idéal, objectif pages/jour), 6) Clubs de lecture en ligne à rejoindre, 7) Bonus: 5 livres "si vous n\'en lisez qu\'un".',
    fields: [
      { key: 'interests', label: 'Centres d\'intérêt', placeholder: '', type: 'chips', options: ['Business/Entrepreneuriat', 'Développement personnel', 'Science-fiction', 'Roman', 'Histoire', 'Philosophie', 'Science', 'Biographie', 'Psychologie', 'Politique'], required: true },
      { key: 'recentBooks', label: 'Livres récents appréciés', placeholder: 'Listez 2-3 livres que vous avez aimés récemment...', type: 'textarea', helpText: 'Cela permet d\'affiner les recommandations à votre goût' },
      { key: 'goal', label: 'Objectif de lecture', placeholder: 'Choisissez', type: 'select', options: ['Plaisir et évasion', 'Apprentissage et culture générale', 'Développement professionnel', 'Habitude de lecture régulière', 'Explorer de nouveaux genres'] },
    ],
  },
  {
    id: 'bilan-financier-personnel',
    icon: 'trending_down',
    title: 'Bilan financier personnel',
    description: 'Faites le point complet sur votre situation financière avec des recommandations concrètes.',
    category: 'Finance perso',
    color: '#059669',
    prompt: 'Crée un bilan financier personnel complet et bienveillant. Revenus: {income}. Charges fixes: {expenses}. Patrimoine: {assets}. Dettes: {debts}. Structure: 1) Tableau récapitulatif des revenus et charges, 2) Taux d\'épargne actuel vs recommandé, 3) Analyse du patrimoine (actifs vs passifs), 4) Ratio d\'endettement et analyse, 5) Score de santé financière (sur 100) avec explication, 6) Points forts à maintenir, 7) Alertes et points d\'attention, 8) Top 5 des actions prioritaires ce mois-ci, 9) Objectifs financiers recommandés à 1 an et 5 ans, 10) Recommandations d\'optimisation fiscale de base. Le ton doit être encourageant et constructif, jamais culpabilisant.',
    fields: [
      { key: 'income', label: 'Revenus mensuels nets', placeholder: 'Salaire, freelance, revenus locatifs, autres...', type: 'textarea', required: true },
      { key: 'expenses', label: 'Charges fixes mensuelles', placeholder: 'Loyer, crédits, assurances, abonnements, transport...', type: 'textarea', required: true },
      { key: 'assets', label: 'Patrimoine', placeholder: 'Épargne, investissements, immobilier, crypto...', type: 'textarea' },
      { key: 'debts', label: 'Dettes en cours', placeholder: 'Crédit immobilier, crédit conso, prêt étudiant...', type: 'textarea' },
    ],
  },
  {
    id: 'projet-passion',
    icon: 'rocket_launch',
    title: 'Projet passion',
    description: 'Structurez et planifiez votre projet passion pour le concrétiser étape par étape.',
    category: 'Développement personnel',
    color: '#8b5cf6',
    prompt: 'Crée un plan de lancement pour un projet passion. Projet: {project}. Motivation: {motivation}. Temps disponible: {availability}. Ressources: {resources}. Structure: 1) Clarification de la vision (ce projet passion en 1 phrase), 2) Pourquoi ce projet compte pour vous (ancrage émotionnel), 3) Objectif concret et mesurable à 3 mois, 4) Découpage en 12 micro-étapes hebdomadaires (petites victoires), 5) Compétences à acquérir et comment (tutoriels, mentors, communautés), 6) Ressources nécessaires (budget, outils, matériel), 7) Planning hebdomadaire réaliste intégré à votre vie actuelle, 8) Communauté et partage (trouver des pairs, documenter le parcours), 9) Gestion de la motivation (quand l\'enthousiasme baisse), 10) Premier pas à faire AUJOURD\'HUI (micro-action de 15 min).',
    fields: [
      { key: 'project', label: 'Votre projet passion', placeholder: 'Écrire un roman, lancer un podcast, apprendre la guitare, créer une app...', type: 'textarea', required: true },
      { key: 'motivation', label: 'Votre motivation', placeholder: 'Pourquoi ce projet vous tient à coeur?', type: 'textarea', required: true },
      { key: 'availability', label: 'Temps disponible par semaine', placeholder: 'Choisissez', type: 'select', options: ['1-2 heures', '3-5 heures', '5-10 heures', '10+ heures'], required: true },
      { key: 'resources', label: 'Ressources disponibles', placeholder: 'Budget, matériel, compétences existantes, contacts...', type: 'textarea' },
    ],
  },
  {
    id: 'meditation-guidee',
    icon: 'self_improvement',
    title: 'Méditation guidée',
    description: 'Recevez un script de méditation guidée personnalisé à lire ou écouter.',
    category: 'Bien-être',
    color: '#10b981',
    prompt: 'Crée un script de méditation guidée personnalisé. Durée: {duration}. Type: {meditationType}. Intention: {intention}. Le script doit: 1) Commencer par une installation confortable (posture, respiration), 2) Guider progressivement vers la détente (scan corporel ou respiration consciente), 3) Développer le thème principal avec des visualisations riches et sensorielles, 4) Inclure des pauses de silence indiquées (... 10 secondes ..., ... 30 secondes ...), 5) Utiliser un langage doux, lent, avec des phrases courtes, 6) Intégrer des affirmations positives liées à l\'intention, 7) Ramener doucement à la conscience, 8) Terminer par une intention pour la journée/soirée. Le rythme doit être lent et apaisant. Indique entre crochets les instructions de lecture [parler plus doucement], [pause longue], etc.',
    fields: [
      { key: 'duration', label: 'Durée souhaitée', placeholder: 'Choisissez', type: 'select', options: ['5 minutes (express)', '10 minutes', '15 minutes', '20 minutes', '30 minutes'], required: true },
      { key: 'meditationType', label: 'Type de méditation', placeholder: '', type: 'chips', options: ['Relaxation', 'Pleine conscience', 'Visualisation', 'Gratitude', 'Gestion du stress', 'Sommeil', 'Confiance en soi', 'Lâcher-prise'], required: true },
      { key: 'intention', label: 'Intention personnelle', placeholder: 'Calmer l\'anxiété, mieux dormir, se recentrer, retrouver la confiance...', type: 'textarea', helpText: 'Décrivez ce que vous traversez ou ce dont vous avez besoin en ce moment' },
    ],
  },
];

const CATEGORIES = ['Communication', 'Commercial', 'Stratégie', 'Marketing', 'Organisation', 'RH', 'Juridique', 'Finance', 'Personnel', 'Bien-être', 'Développement personnel', 'Loisirs', 'Organisation perso', 'Finance perso', 'Juridique perso'];

export default function DocumentsPage() {
  const { showError, showSuccess } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const { data: generatedDocs, setData: setGeneratedDocs } = useUserData<GeneratedDoc[]>('documents', [], 'fz_docs');
  const [viewingDoc, setViewingDoc] = useState<GeneratedDoc | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const lastFocusedFieldRef = useRef<string>('');

  // Knowledge Base
  const [kbDocs, setKbDocs] = useState<Array<{ id: string; filename: string; context: string; file_size: number; token_count?: number; created_at: string }>>([]);
  const [kbStorage, setKbStorage] = useState<{ totalBytes: number; maxBytes: number } | null>(null);
  const [kbLoading, setKbLoading] = useState(false);

  const loadKB = useCallback(async () => {
    setKbLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (!session.token) return;
      const [docsRes, storageRes] = await Promise.all([
        fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/documents', token: session.token, method: 'GET' }) }).catch(() => null),
        fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/documents/storage', token: session.token, method: 'GET' }) }).catch(() => null),
      ]);
      if (docsRes?.ok) { const d = await docsRes.json(); setKbDocs(d.documents ?? d ?? []); }
      if (storageRes?.ok) { const s = await storageRes.json(); setKbStorage(s); }
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur de chargement de la base de connaissance'); }
    setKbLoading(false);
  }, [showError]);

  useEffect(() => { loadKB(); }, [loadKB]);

  async function deleteKBDoc(id: string) {
    if (!confirm('Supprimer ce document de la base de connaissance ?')) return;
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const res = await fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: `/documents/${id}`, token: session.token, method: 'DELETE' }) });
      if (res.ok) { setKbDocs(prev => prev.filter(d => d.id !== id)); showSuccess('Document supprimé'); }
      else showError('Impossible de supprimer ce document');
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur réseau'); }
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
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

      const companyProfile = localStorage.getItem('fz_company_profile');
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
            { role: 'user', content: `Tu es ${DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name}, experte en rédaction professionnelle. ${prompt}` },
          ],
          maxTokens: 4096,
          agentName: 'fz-assistante',
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
      setViewingDoc(doc);
      setSelectedTemplate(null);
      setFieldValues({});
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  }

  function deleteDoc(id: string) {
    const updated = generatedDocs.filter(d => d.id !== id);
    setGeneratedDocs(updated);
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
            <h2 className="font-bold" style={{ fontSize: 18 }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>{tpl?.icon ?? 'description'}</span> {viewingDoc.title}</h2>
            <div className="text-sm text-muted">
              {new Date(viewingDoc.createdAt).toLocaleString('fr-FR')} | {viewingDoc.tokens} tokens | {(viewingDoc.cost / 1_000_000).toFixed(4)} cr
            </div>
          </div>
          <button onClick={() => copyToClipboard(viewingDoc.content)} className="btn btn-primary btn-sm">
            {copied ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>check</span> Copié !</> : 'Copier'}
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
        }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(viewingDoc.content)) }} />
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
            <h2 className="font-bold" style={{ fontSize: 18 }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>{selectedTemplate.icon}</span> {selectedTemplate.title}</h2>
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
              <span className="animate-pulse">{DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name} rédige votre document...</span>
            ) : (
              <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>auto_awesome</span> Générer le document</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Template gallery
  const filteredTemplates = filterCategory ? TEMPLATES.filter(t => t.category === filterCategory) : TEMPLATES;

  return (
    <div className="client-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Générateur de <span className="fz-logo-word">Documents</span></h1>
          <p className="page-subtitle">
            {DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name} rédige pour vous : emails, propositions, contrats, posts... Choisissez un modèle et personnalisez.
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
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{tpl.icon}</span>
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

      {/* ─── Knowledge Base Manager ─── */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}><span className="material-symbols-rounded" style={{ fontSize: 18 }}>psychology</span> Base de connaissance</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Documents uploadés et injectés <span className="fz-logo-word">automatiquement</span> dans vos agents
            </div>
          </div>
          {kbStorage && (
            <div style={{ textAlign: 'right', minWidth: 180 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Stockage : {(kbStorage.totalBytes / (1024 * 1024)).toFixed(1)} Mo / {(kbStorage.maxBytes / (1024 * 1024)).toFixed(0)} Mo
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(100, (kbStorage.totalBytes / kbStorage.maxBytes) * 100)}%`,
                  background: (kbStorage.totalBytes / kbStorage.maxBytes) > 0.8 ? '#ef4444' : 'var(--accent)',
                  transition: 'width 0.6s',
                }} />
              </div>
            </div>
          )}
        </div>

        {kbLoading ? (
          <div className="text-center text-tertiary" style={{ padding: 24 }}>Chargement...</div>
        ) : kbDocs.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 32 }}>folder_open</span></div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Aucun document uploadé</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Utilisez le composant d&apos;upload ci-dessus pour enrichir la base de connaissance de vos agents
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {kbDocs.map(doc => {
              const sizeKb = Math.round(doc.file_size / 1024);
              const contextLabel: Record<string, string> = { general: 'Général', repondeur: 'Répondeur', personal: 'Perso', 'studio-video': 'Studio Vidéo', 'studio-photo': 'Studio Photo' };
              return (
                <div key={doc.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22 }}>{doc.filename.endsWith('.pdf') ? 'picture_as_pdf' : doc.filename.endsWith('.docx') ? 'description' : doc.filename.endsWith('.xlsx') ? 'table_chart' : 'description'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>{sizeKb} Ko</span>
                      {doc.token_count && <span>· {doc.token_count.toLocaleString('fr-FR')} tokens</span>}
                      <span>· {new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                    background: 'var(--accent)15', color: 'var(--accent)',
                  }}>
                    {contextLabel[doc.context] ?? doc.context}
                  </span>
                  <button
                    onClick={() => deleteKBDoc(doc.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, flexShrink: 0 }}
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
                  <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{tpl?.icon ?? 'description'}</span>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-md font-semibold truncate">{doc.title}</div>
                    <div className="text-xs text-muted">{new Date(doc.createdAt).toLocaleString('fr-FR')}</div>
                  </div>
                  <button onClick={() => setViewingDoc(doc)} className="btn btn-ghost btn-sm">Voir</button>
                  <button onClick={() => copyToClipboard(doc.content)} className="btn btn-ghost btn-sm">Copier</button>
                  <button onClick={() => { if (confirm('Supprimer ce document ? Cette action est irreversible.')) deleteDoc(doc.id); }} className="btn btn-ghost btn-sm text-danger" aria-label="Supprimer le document"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
