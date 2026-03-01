'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_AGENTS, type AgentTypeId } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';

// ─── Helper: get agent def by ID ───
const agent = (id: AgentTypeId) => DEFAULT_AGENTS.find(a => a.id === id)!;

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface StrategyField {
  key: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'select' | 'chips';
  options?: string[];
  hint?: string;
  advanced?: boolean; // hidden under "Plus de details"
}

interface AgentStrategyDef {
  agentId: AgentTypeId;
  icon: string;
  color: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  reassurance: string;
  fields: StrategyField[];
  promptTemplate: string;
}

interface SavedStrategy {
  formData: Record<string, string | string[]>;
  generatedPlan: string | null;
  generatedAt: string | null;
  updatedAt: string;
}

interface AllStrategies {
  strategies: Partial<Record<AgentTypeId, SavedStrategy>>;
  version: number;
}

/* ═══════════════════════════════════════════
   Strategy definitions per agent
   ═══════════════════════════════════════════ */

const AGENT_STRATEGIES: AgentStrategyDef[] = [
  {
    agentId: 'sarah-marketing',
    icon: '📊',
    color: '#ec4899',
    shortLabel: 'Marketing',
    title: 'Stratégie Marketing',
    subtitle: 'Définissez votre présence digitale et vos objectifs marketing',
    reassurance: `Remplissez ça une seule fois — ${agent('sarah-marketing').name} s'en sert à chaque échange pour créer du contenu adapté à votre marque !`,
    fields: [
      {
        key: 'networks',
        label: 'Sur quels réseaux êtes-vous présent ?',
        placeholder: '',
        type: 'chips',
        options: ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Twitter/X', 'YouTube', 'Pinterest', 'Newsletter'],
        hint: `${agent('sarah-marketing').name} adaptera ses suggestions de contenu à ces plateformes.`,
      },
      {
        key: 'postFrequency',
        label: 'Combien de publications par semaine ?',
        placeholder: '',
        type: 'select',
        options: ['1-2 par semaine', '3-5 par semaine', '1 par jour', '2+ par jour', 'Je ne sais pas encore'],
      },
      {
        key: 'tone',
        label: 'Quel ton pour votre communication ?',
        placeholder: '',
        type: 'chips',
        options: ['Professionnel', 'Décontracté', 'Inspirant', 'Éducatif', 'Humoristique', 'Premium', 'Authentique'],
      },
      {
        key: 'targetAudience',
        label: 'Qui est votre audience cible ?',
        placeholder: 'Ex: Dirigeants PME 35-55 ans, secteur tech...',
        type: 'textarea',
      },
      {
        key: 'goals',
        label: 'Vos 3 objectifs marketing principaux ?',
        placeholder: 'Ex: Augmenter la notoriété, générer des leads, fidéliser...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'existingContent',
        label: 'Avez-vous déjà du contenu ?',
        placeholder: 'Blog, newsletter, videos... Décrivez ce qui existe',
        type: 'textarea',
        hint: `${agent('sarah-marketing').name} pourra s'appuyer sur ce qui marche déjà.`,
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-marketing').name}, ${agent('sarah-marketing').role}. Le client a défini sa stratégie marketing :
- Réseaux : {networks}
- Fréquence : {postFrequency}
- Ton : {tone}
- Audience : {targetAudience}
- Objectifs : {goals}
- Contenu existant : {existingContent}

{companyContext}

Génère un plan d'action marketing complet et structuré avec :

## 1. CALENDRIER EDITORIAL
Planning semaine type avec les jours et types de contenu par réseau.

## 2. STRATÉGIE DE CONTENU
piliers de contenu recommandés avec exemples concrets de publications.

## 3. ACTIONS PRIORITAIRES
Les 5 premières actions à faire cette semaine, classées par impact.

## 4. MÉTRIQUES À SUIVRE
Les KPIs à tracker avec objectifs chiffrés réalistes.

## 5. TIMELINE 3 MOIS
Planning mois par mois avec jalons et objectifs.

Sois concrète, actionnable et adaptée au contexte du client. Utilise des exemples précis.`,
  },
  {
    agentId: 'sarah-finance',
    icon: '💰',
    color: '#f59e0b',
    shortLabel: 'Finance',
    title: 'Stratégie Financière',
    subtitle: 'Maîtrisez vos finances et optimisez votre rentabilité',
    reassurance: `Ces infos sont confidentielles et aident ${agent('sarah-finance').name} à vous donner des conseils financiers sur mesure.`,
    fields: [
      {
        key: 'revenue',
        label: 'Chiffre d\'affaires actuel (annuel)',
        placeholder: 'Ex: 500K EUR, 2M EUR...',
        type: 'input',
      },
      {
        key: 'mainExpenses',
        label: 'Vos 3 postes de dépenses principaux',
        placeholder: 'Ex: Salaires (60%), Marketing (15%), Outils/SaaS (10%)...',
        type: 'textarea',
      },
      {
        key: 'financialGoal',
        label: 'Votre objectif financier à 12 mois',
        placeholder: 'Ex: Doubler le CA, atteindre la rentabilite, lever des fonds...',
        type: 'textarea',
      },
      {
        key: 'cashflow',
        label: 'Situation de trésorerie',
        placeholder: '',
        type: 'select',
        options: ['Confortable (6+ mois)', 'Correcte (3-6 mois)', 'Tendue (1-3 mois)', 'Critique (< 1 mois)', 'Je ne sais pas'],
      },
      {
        key: 'painPoints',
        label: 'Vos défis financiers actuels',
        placeholder: 'Ex: Recouvrement lent, marges faibles, depenses non controlees...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'tools',
        label: 'Outils de gestion utilises',
        placeholder: 'Ex: Excel, QuickBooks, Pennylane, aucun...',
        type: 'input',
        hint: `${agent('sarah-finance').name} pourra recommander des améliorations ou alternatives.`,
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-finance').name}, ${agent('sarah-finance').role}. Le client a défini son contexte financier :
- CA actuel : {revenue}
- Dépenses principales : {mainExpenses}
- Objectif 12 mois : {financialGoal}
- Trésorerie : {cashflow}
- Défis : {painPoints}
- Outils : {tools}

{companyContext}

Génère un plan financier structuré avec :

## 1. DIAGNOSTIC
Analyse de la situation financière actuelle (forces/faiblesses).

## 2. BUDGET OPTIMISÉ
Recommandations d'allocation par poste avec pourcentages cibles.

## 3. PLAN DE TRÉSORERIE
Actions pour sécuriser le cash sur 6 mois.

## 4. QUICK WINS
5 optimisations rapides à mettre en place cette semaine.

## 5. OBJECTIFS CHIFFRÉS
KPIs financiers avec cibles mensuelles sur 12 mois.

## 6. TIMELINE 3 MOIS
Planning d'actions mois par mois.

Sois précis, chiffré et pragmatique.`,
  },
  {
    agentId: 'sarah-assistante',
    icon: '📋',
    color: '#6366f1',
    shortLabel: 'Organisation',
    title: 'Stratégie Organisation',
    subtitle: 'Optimisez votre quotidien et gagnez du temps',
    reassurance: `Dites à ${agent('sarah-assistante').name} comment vous travaillez — elle trouvera les meilleurs moyens de vous simplifier la vie !`,
    fields: [
      {
        key: 'dailyTasks',
        label: 'À quoi ressemble votre journée type ?',
        placeholder: 'Ex: Matin: emails + reunions. Aprem: travail de fond. Soir: suivi...',
        type: 'textarea',
      },
      {
        key: 'tools',
        label: 'Quels outils utilisez-vous ?',
        placeholder: '',
        type: 'chips',
        options: ['Gmail', 'Outlook', 'Slack', 'Teams', 'Notion', 'Trello', 'Asana', 'Google Calendar', 'WhatsApp', 'Zoom'],
      },
      {
        key: 'painPoints',
        label: 'Qu\'est-ce qui vous fait perdre le plus de temps ?',
        placeholder: 'Ex: Trop d\'emails, reunions inutiles, taches repetitives...',
        type: 'textarea',
      },
      {
        key: 'teamSize',
        label: 'Taille de votre équipe',
        placeholder: '',
        type: 'select',
        options: ['Solo', '2-5 personnes', '6-15 personnes', '16-50 personnes', '50+'],
      },
      {
        key: 'priorities',
        label: 'Vos 3 priorites d\'organisation',
        placeholder: 'Ex: Mieux gérer mon agenda, déléguer plus, automatiser le reporting...',
        type: 'textarea',
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-assistante').name}, ${agent('sarah-assistante').role}. Le client a défini son quotidien :
- Journee type : {dailyTasks}
- Outils : {tools}
- Pertes de temps : {painPoints}
- Équipe : {teamSize}
- Priorités : {priorities}

{companyContext}

Génère un plan d'organisation structuré avec :

## 1. AUDIT TEMPS
Où le client perd du temps (analyse des frictions).

## 2. WORKFLOW OPTIMISÉ
Routine quotidienne idéale heure par heure.

## 3. AUTOMATISATIONS
5 tâches à automatiser avec les outils recommandés.

## 4. TEMPLATES UTILES
3 templates prêt-à-l'emploi (email, reunion, reporting).

## 5. ACTIONS IMMEDIATES
3 changements à faire dès aujourd'hui.

## 6. PLANNING SEMAINE
Structure type d'une semaine optimisée.

Sois pratique, concrète et adaptée aux outils du client.`,
  },
  {
    agentId: 'sarah-dg',
    icon: '👩‍💼',
    color: '#a855f7',
    shortLabel: 'Strategie',
    title: 'Strategie d\'Entreprise',
    subtitle: 'Définissez votre cap et accélérez votre croissance',
    reassurance: `Ces informations stratégiques permettent à ${agent('sarah-dg').name} de vous accompagner comme une vraie DG.`,
    fields: [
      {
        key: 'stage',
        label: 'Stade de votre entreprise',
        placeholder: '',
        type: 'select',
        options: ['Idee / Pre-lancement', 'MVP / Premiers clients', 'Product-market fit', 'Croissance', 'Scale-up', 'Entreprise etablie'],
      },
      {
        key: 'fundingNeeds',
        label: 'Besoin de financement ?',
        placeholder: '',
        type: 'select',
        options: ['Non, autofinance', 'Oui, en recherche', 'En cours de levee', 'Deja finance', 'Subventions uniquement'],
      },
      {
        key: 'growthTargets',
        label: 'Vos objectifs de croissance a 12 mois',
        placeholder: 'Ex: Doubler le CA, passer de 10 a 30 clients, lancer un 2e produit...',
        type: 'textarea',
      },
      {
        key: 'biggestChallenge',
        label: 'Votre plus grand défi actuel',
        placeholder: 'Ex: Trouver les bons talents, pivoter le business model, se différencier...',
        type: 'textarea',
      },
      {
        key: 'competitiveAdvantage',
        label: 'Votre avantage concurrentiel',
        placeholder: 'Ex: Technologie propriétaire, équipe experte, premier sur le marché...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'vision',
        label: 'Ou voyez-vous votre entreprise dans 3 ans ?',
        placeholder: 'Décrivez votre vision...',
        type: 'textarea',
        hint: `${agent('sarah-dg').name} utilisera cette vision pour aligner toutes ses recommandations stratégiques.`,
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-dg').name}, ${agent('sarah-dg').role}. Le client a défini sa situation stratégique :
- Stade : {stage}
- Financement : {fundingNeeds}
- Objectifs 12 mois : {growthTargets}
- Plus grand défi : {biggestChallenge}
- Avantage concurrentiel : {competitiveAdvantage}
- Vision 3 ans : {vision}

{companyContext}

Génère un plan stratégique structuré avec :

## 1. ANALYSE STRATÉGIQUE
Positionnement actuel, forces/faiblesses/opportunites/menaces (SWOT).

## 2. CAP STRATÉGIQUE
Les 3 axes prioritaires pour les 12 prochains mois.

## 3. PLAN DE CROISSANCE
Étapes concrètes trimestre par trimestre.

## 4. RISQUES & MITIGATIONS
Les 3 risques majeurs et comment les anticiper.

## 5. RESSOURCES NÉCESSAIRES
Équipe, budget, outils, partenaires.

## 6. MILESTONES
Les 5 jalons clés avec dates cibles.

Sois visionnaire mais pragmatique. Donne des exemples concrets adaptes au stade de l'entreprise.`,
  },
  {
    agentId: 'sarah-dev',
    icon: '💻',
    color: '#3b82f6',
    shortLabel: 'Tech',
    title: 'Stratégie Technique',
    subtitle: 'Structurez votre stack et votre roadmap tech',
    reassurance: `${agent('sarah-dev').name} CTO analyse votre setup technique et recommande les meilleures pratiques.`,
    fields: [
      {
        key: 'techStack',
        label: 'Votre stack technique actuelle',
        placeholder: '',
        type: 'chips',
        options: ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'PHP/Laravel', 'Java', 'Go', 'WordPress', 'No-code', 'Mobile natif', 'Flutter'],
      },
      {
        key: 'teamSize',
        label: 'Taille de l\'equipe tech',
        placeholder: '',
        type: 'select',
        options: ['Solo dev', '2-3 devs', '4-8 devs', '9-20 devs', '20+ devs', 'Pas d\'equipe tech'],
      },
      {
        key: 'infrastructure',
        label: 'Hébergement / Infrastructure',
        placeholder: '',
        type: 'chips',
        options: ['AWS', 'GCP', 'Azure', 'Vercel', 'Heroku', 'OVH', 'Scaleway', 'Docker', 'Kubernetes', 'Serveur dédié'],
      },
      {
        key: 'painPoints',
        label: 'Vos défis techniques actuels',
        placeholder: 'Ex: Performance lente, dette technique, pas de CI/CD, bugs récurrents...',
        type: 'textarea',
      },
      {
        key: 'nextFeature',
        label: 'Prochaine fonctionnalité ou projet technique',
        placeholder: 'Ex: Refonte frontend, migration cloud, API publique, app mobile...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'securityLevel',
        label: 'Niveau de sécurité requis',
        placeholder: '',
        type: 'select',
        options: ['Standard', 'Données sensibles (RGPD)', 'Fintech / Paiements', 'Santé / HDS', 'Defense / Critique'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-dev').name}, ${agent('sarah-dev').role} (CTO). Le client a défini son contexte technique :
- Stack : {techStack}
- Equipe : {teamSize}
- Infrastructure : {infrastructure}
- Défis : {painPoints}
- Prochain projet : {nextFeature}
- Sécurité : {securityLevel}

{companyContext}

Génère une roadmap technique structurée avec :

## 1. AUDIT TECHNIQUE
Analyse de la stack actuelle (points forts, dette technique, risques).

## 2. ARCHITECTURE RECOMMANDÉE
Ajustements proposés avec justification.

## 3. ROADMAP TECHNIQUE
Planning sur 3 mois avec sprints.

## 4. BONNES PRATIQUES
5 pratiques à adopter immédiatement (CI/CD, testing, monitoring...).

## 5. SÉCURITÉ
Recommandations sécurité adaptées au niveau requis.

## 6. STACK RECOMMANDATIONS
Outils et services a ajouter ou remplacer.

Sois précis, technique et pragmatique. Adapte tes recommandations à la taille de l'équipe.`,
  },
  {
    agentId: 'sarah-repondeur',
    icon: '📞',
    color: '#22c55e',
    shortLabel: 'Service Client',
    title: 'Stratégie Service Client',
    subtitle: 'Construisez un service client qui fidélise',
    reassurance: `${agent('sarah-repondeur').name} utilisera ces infos pour répondre exactement comme vous le souhaitez à vos clients.`,
    fields: [
      {
        key: 'productService',
        label: 'Décrivez votre produit/service en 2-3 phrases',
        placeholder: 'Ex: SaaS de gestion de projet pour PME, abonnement mensuel 49 EUR...',
        type: 'textarea',
      },
      {
        key: 'commonQuestions',
        label: 'Les 5 questions les plus fréquentes de vos clients',
        placeholder: 'Ex: Comment ca marche ? Quels sont les tarifs ? Comment annuler ?...',
        type: 'textarea',
      },
      {
        key: 'responseStyle',
        label: 'Ton de réponse souhaité',
        placeholder: '',
        type: 'chips',
        options: ['Formel et professionnel', 'Amical et chaleureux', 'Direct et efficace', 'Pédagogique', 'Premium et soigné'],
      },
      {
        key: 'channels',
        label: 'Canaux de support actuels',
        placeholder: '',
        type: 'chips',
        options: ['Email', 'Telephone', 'WhatsApp', 'Chat en ligne', 'Réseaux sociaux', 'Formulaire web'],
      },
      {
        key: 'availability',
        label: 'Horaires de disponibilité',
        placeholder: '',
        type: 'select',
        options: ['24/7', 'Jours ouvrables (9h-18h)', 'Jours ouvrables (8h-20h)', 'Lun-Sam', 'Variable'],
        advanced: true,
      },
      {
        key: 'escalation',
        label: 'Quand faut-il escalader à un humain ?',
        placeholder: 'Ex: Réclamations, remboursements > 100 EUR, problèmes techniques complexes...',
        type: 'textarea',
        hint: `${agent('sarah-repondeur').name} saura quand vous passer la main.`,
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-repondeur').name}, ${agent('sarah-repondeur').role}. Le client a défini son service client :
- Produit/Service : {productService}
- Questions fréquentes : {commonQuestions}
- Ton : {responseStyle}
- Canaux : {channels}
- Horaires : {availability}
- Escalade : {escalation}

{companyContext}

Génère un plan service client structuré avec :

## 1. FAQ COMPLÈTE
Réponses types aux 10 questions les plus courantes.

## 2. SCRIPTS DE RÉPONSE
5 templates de réponse pour situations types (bienvenue, réclamation, question technique, suivi, clôture).

## 3. WORKFLOW ESCALADE
Arbre de décision pour savoir quand et comment escalader a un humain.

## 4. MESSAGE D'ACCUEIL
Proposition de message d'accueil multicanal.

## 5. MÉTRIQUES
KPIs de service client à suivre (temps de réponse, satisfaction, résolution).

## 6. ACTIONS IMMÉDIATES
3 choses à mettre en place cette semaine.

Sois concrète et adaptée au produit du client. Propose des réponses prêt-à-l'emploi.`,
  },
  {
    agentId: 'sarah-commercial',
    icon: '🤝',
    color: '#f97316',
    shortLabel: 'Commercial',
    title: 'Stratégie Commerciale',
    subtitle: 'Structurez votre pipeline et boostez vos ventes',
    reassurance: `${agent('sarah-commercial').name} utilisera ces infos pour qualifier vos leads et préparer vos pitchs de vente.`,
    fields: [
      { key: 'salesCycle', label: 'Votre cycle de vente moyen', placeholder: '', type: 'select', options: ['< 1 semaine', '1-4 semaines', '1-3 mois', '3-6 mois', '6+ mois'] },
      { key: 'targetClients', label: 'Vos clients cibles', placeholder: 'Ex: PME tech 50-200 employés, budget 10-50K...', type: 'textarea' },
      { key: 'currentPipeline', label: 'État actuel de votre pipeline', placeholder: 'Ex: 20 leads, 5 en négociation, 2 en closing...', type: 'textarea' },
      { key: 'conversionRate', label: 'Taux de conversion actuel', placeholder: '', type: 'select', options: ['< 5%', '5-10%', '10-20%', '20-40%', '> 40%', 'Je ne sais pas'] },
      { key: 'channels', label: 'Canaux de prospection', placeholder: '', type: 'chips', options: ['Cold email', 'LinkedIn', 'Appels', 'Salons', 'Inbound', 'Partenaires', 'Bouche-à-oreille'], advanced: true },
      { key: 'challenges', label: 'Vos défis commerciaux', placeholder: 'Ex: Pas assez de leads, closing difficile...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('sarah-commercial').name}, ${agent('sarah-commercial').role}. Le client a défini son contexte commercial :
- Cycle de vente : {salesCycle}
- Clients cibles : {targetClients}
- Pipeline : {currentPipeline}
- Taux de conversion : {conversionRate}
- Canaux : {channels}
- Défis : {challenges}

{companyContext}

Génère un plan commercial structuré avec :

## 1. DIAGNOSTIC COMMERCIAL
Analyse du pipeline et du processus de vente actuel.

## 2. STRATÉGIE DE PROSPECTION
Plan de prospection multi-canal avec actions concrètes.

## 3. PIPELINE OPTIMISÉ
Structure du pipeline idéal avec étapes et critères de qualification.

## 4. SCRIPTS & TEMPLATES
3 scripts prêts à l'emploi (email de prospection, pitch téléphonique, relance).

## 5. KPIs COMMERCIAUX
Métriques à suivre avec objectifs chiffrés.

## 6. PLAN D'ACTION 90 JOURS
Actions semaine par semaine pour les 3 prochains mois.

Sois concret, orienté résultats et adapté au contexte du client.`,
  },
  {
    agentId: 'sarah-rh',
    icon: '👥',
    color: '#14b8a6',
    shortLabel: 'RH',
    title: 'Stratégie RH',
    subtitle: 'Attirez, développez et fidélisez vos talents',
    reassurance: `${agent('sarah-rh').name} s'appuiera sur ces infos pour vous accompagner dans la gestion de vos équipes.`,
    fields: [
      { key: 'teamSize', label: 'Taille actuelle de l\'équipe', placeholder: '', type: 'select', options: ['1-5', '6-15', '16-50', '51-100', '100+'] },
      { key: 'hiringNeeds', label: 'Postes à pourvoir (6 prochains mois)', placeholder: 'Ex: 2 devs, 1 commercial, 1 marketing...', type: 'textarea' },
      { key: 'challenges', label: 'Vos défis RH actuels', placeholder: 'Ex: Turnover élevé, difficulté à recruter...', type: 'textarea' },
      { key: 'culture', label: 'Valeurs et culture d\'entreprise', placeholder: 'Ex: Innovation, bienveillance, performance...', type: 'textarea' },
      { key: 'tools', label: 'Outils RH utilises', placeholder: '', type: 'chips', options: ['LinkedIn Recruiter', 'Welcome to the Jungle', 'ATS', 'SIRH', 'Aucun'], advanced: true },
      { key: 'priorities', label: 'Vos 3 priorités RH', placeholder: 'Ex: Améliorer l\'onboarding, réduire le turnover...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('sarah-rh').name}, DRH. Le client a défini son contexte RH :
- Équipe : {teamSize}
- Recrutements prévus : {hiringNeeds}
- Défis : {challenges}
- Culture : {culture}
- Outils : {tools}
- Priorités : {priorities}

{companyContext}

Génère un plan RH structuré avec :

## 1. AUDIT RH
Analyse de la situation actuelle (forces et axes d'amélioration).

## 2. PLAN DE RECRUTEMENT
Stratégie de recrutement pour les 6 prochains mois.

## 3. ONBOARDING
Processus d'intégration structuré pour les nouveaux.

## 4. DÉVELOPPEMENT DES TALENTS
Plan de formation et de montée en compétences.

## 5. RETENTION & ENGAGEMENT
Actions pour fidéliser et motiver les équipes.

## 6. TIMELINE 3 MOIS
Planning d'actions prioritaires mois par mois.

Sois concret, humain et adapté à la taille de l'équipe.`,
  },
  {
    agentId: 'sarah-communication',
    icon: '📣',
    color: '#8b5cf6',
    shortLabel: 'Communication',
    title: 'Stratégie Communication',
    subtitle: 'Construisez une image forte et cohérente',
    reassurance: `${agent('sarah-communication').name} utilisera ces infos pour piloter votre image de marque et vos relations médias.`,
    fields: [
      { key: 'currentImage', label: 'Comment décrivez-vous votre image actuelle ?', placeholder: 'Ex: Startup innovante, entreprise traditionnelle...', type: 'textarea' },
      { key: 'targets', label: 'Vos publics cibles', placeholder: '', type: 'chips', options: ['Clients', 'Investisseurs', 'Médias', 'Employés', 'Partenaires', 'Grand public'] },
      { key: 'channels', label: 'Canaux de communication actuels', placeholder: '', type: 'chips', options: ['Site web', 'Blog', 'Newsletter', 'Réseaux sociaux', 'Presse', 'Événements', 'Podcast'] },
      { key: 'goals', label: 'Vos objectifs de communication', placeholder: 'Ex: Augmenter la notoriété, lancer un produit...', type: 'textarea' },
      { key: 'budget', label: 'Budget communication', placeholder: '', type: 'select', options: ['< 5K EUR/an', '5-20K EUR/an', '20-100K EUR/an', '> 100K EUR/an', 'Pas défini'], advanced: true },
      { key: 'tone', label: 'Ton de communication souhaité', placeholder: '', type: 'chips', options: ['Institutionnel', 'Dynamique', 'Humain', 'Expert', 'Inspirant', 'Audacieux'], advanced: true },
    ],
    promptTemplate: `Tu es ${agent('sarah-communication').name}, ${agent('sarah-communication').role}. Le client a défini son contexte :
- Image actuelle : {currentImage}
- Publics cibles : {targets}
- Canaux : {channels}
- Objectifs : {goals}
- Budget : {budget}
- Ton : {tone}

{companyContext}

Génère un plan de communication structuré avec :

## 1. DIAGNOSTIC IMAGE
Analyse de l'image actuelle et positionnement souhaité.

## 2. MESSAGES CLÉS
Les 3-5 messages clés à véhiculer selon chaque public.

## 3. PLAN MEDIA
Stratégie médias et relations presse.

## 4. COMMUNICATION INTERNE
Plan de communication interne pour fédérer les équipes.

## 5. GESTION DE CRISE
Protocole de communication de crise préparé.

## 6. CALENDRIER 3 MOIS
Planning éditorial et événementiel mois par mois.

Sois stratégique, créative et cohérente avec l'identité de la marque.`,
  },
  {
    agentId: 'sarah-juridique',
    icon: '⚖️',
    color: '#64748b',
    shortLabel: 'Juridique',
    title: 'Stratégie Juridique',
    subtitle: 'Sécurisez votre entreprise sur le plan légal',
    reassurance: `${agent('sarah-juridique').name} utilisera ces infos pour vous alerter sur les risques et assurer votre conformité.`,
    fields: [
      { key: 'structure', label: 'Forme juridique', placeholder: '', type: 'select', options: ['Auto-entrepreneur', 'SARL/EURL', 'SAS/SASU', 'SA', 'Association', 'Autre'] },
      { key: 'dataHandling', label: 'Gérez-vous des données personnelles ?', placeholder: '', type: 'select', options: ['Oui, beaucoup', 'Oui, quelques-unes', 'Non', 'Je ne suis pas sûr'] },
      { key: 'contracts', label: 'Types de contrats utilises', placeholder: '', type: 'chips', options: ['CGV', 'CGU', 'Contrats clients', 'Contrats fournisseurs', 'NDA', 'Contrats de travail', 'Licences'] },
      { key: 'risks', label: 'Vos préoccupations juridiques', placeholder: 'Ex: Conformité RGPD, protection PI, litiges...', type: 'textarea' },
      { key: 'international', label: 'Activité internationale ?', placeholder: '', type: 'select', options: ['Non, France uniquement', 'Europe', 'International'], advanced: true },
      { key: 'priorities', label: 'Vos 3 priorités juridiques', placeholder: 'Ex: Mettre à jour les CGV, conformité RGPD...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('sarah-juridique').name}, ${agent('sarah-juridique').role}. Le client a défini son contexte juridique :
- Structure : {structure}
- Données personnelles : {dataHandling}
- Contrats : {contracts}
- Préoccupations : {risks}
- International : {international}
- Priorités : {priorities}

{companyContext}

Génère un plan juridique structuré avec :

## 1. AUDIT DE CONFORMITÉ
Analyse des risques juridiques actuels.

## 2. RGPD
Plan de mise en conformité données personnelles.

## 3. CONTRATS PRIORITAIRES
Liste des contrats à rédiger ou mettre à jour avec priorités.

## 4. PROTECTION PI
Stratégie de protection de la propriété intellectuelle.

## 5. VEILLE JURIDIQUE
Points de vigilance et obligations réglementaires.

## 6. PLAN D'ACTION 3 MOIS
Actions juridiques prioritaires mois par mois.

Sois précise, pragmatique et orientée PME. Rappelle que tes conseils ne remplacent pas un avocat.`,
  },
];

const STORAGE_KEY = 'sarah_agent_strategies';

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function StrategyPage() {
  const [activeAgentId, setActiveAgentId] = useState<AgentTypeId>('sarah-marketing');
  const [allStrategies, setAllStrategies] = useState<AllStrategies>({ strategies: {}, version: 1 });
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'plan'>('form');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const lastFocusedFieldRef = useRef<string>('');

  const activeStrategy = AGENT_STRATEGIES.find(s => s.agentId === activeAgentId);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AllStrategies;
        setAllStrategies(parsed);
        // Load the active agent's data
        const saved = parsed.strategies[activeAgentId as AgentTypeId];
        if (saved) {
          setFormData(saved.formData);
          if (saved.generatedPlan) setViewMode('plan');
        }
      }
    } catch { /* */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching agents, load that agent's saved data
  const switchAgent = useCallback((agentId: AgentTypeId) => {
    setActiveAgentId(agentId);
    setViewMode('form');
    setShowAdvanced(false);
    setError('');
    const saved = allStrategies.strategies[agentId];
    if (saved) {
      setFormData(saved.formData);
      if (saved.generatedPlan) setViewMode('plan');
    } else {
      setFormData({});
    }
  }, [allStrategies]);

  // Save form data to localStorage
  function saveToStorage(newFormData: Record<string, string | string[]>, plan?: string | null) {
    const existing = allStrategies.strategies[activeAgentId];
    const updated: AllStrategies = {
      ...allStrategies,
      strategies: {
        ...allStrategies.strategies,
        [activeAgentId]: {
          formData: newFormData,
          generatedPlan: plan !== undefined ? plan : (existing?.generatedPlan ?? null),
          generatedAt: plan ? new Date().toISOString() : (existing?.generatedAt ?? null),
          updatedAt: new Date().toISOString(),
        },
      },
    };
    setAllStrategies(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* */ }
  }

  // Update a field value
  function updateField(key: string, value: string) {
    const next = { ...formData, [key]: value };
    setFormData(next);
    saveToStorage(next);
  }

  // Toggle a chip in a chips array
  function toggleChip(key: string, chip: string) {
    const current = (formData[key] as string[]) || [];
    const next = current.includes(chip)
      ? current.filter(c => c !== chip)
      : [...current, chip];
    const newForm = { ...formData, [key]: next };
    setFormData(newForm);
    saveToStorage(newForm);
  }

  // Build the prompt from template + form data
  function buildPrompt(): string {
    if (!activeStrategy) return '';
    let prompt = activeStrategy.promptTemplate;
    for (const field of activeStrategy.fields) {
      const val = formData[field.key];
      const display = Array.isArray(val) ? val.join(', ') : (val || 'Non renseigne');
      prompt = prompt.replace(`{${field.key}}`, display);
    }
    // Add company context
    let companyCtx = '';
    try {
      const raw = localStorage.getItem('sarah_company_profile');
      if (raw) {
        const profile = JSON.parse(raw);
        const parts: string[] = [];
        if (profile.companyName) parts.push(`Entreprise: ${profile.companyName}`);
        if (profile.industry) parts.push(`Secteur: ${profile.industry}`);
        if (profile.mission) parts.push(`Mission: ${profile.mission}`);
        if (profile.targetAudience) parts.push(`Audience: ${profile.targetAudience}`);
        if (profile.strengths) parts.push(`Forces: ${profile.strengths}`);
        if (parts.length > 0) {
          companyCtx = `Contexte entreprise du client :\n${parts.join('\n')}`;
        }
      }
    } catch { /* */ }
    prompt = prompt.replace('{companyContext}', companyCtx);
    return prompt;
  }

  // Generate the plan via /api/chat
  async function generatePlan() {
    setGenerating(true);
    setError('');
    try {
      const raw = localStorage.getItem('sarah_session');
      if (!raw) { window.location.href = '/login'; return; }
      const session = JSON.parse(raw);

      const prompt = buildPrompt();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 4096,
          agentName: activeAgentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la generation');

      const plan = data.content || data.message || '';
      saveToStorage(formData, plan);
      setViewMode('plan');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setGenerating(false);
    }
  }

  // Copy plan to clipboard
  async function copyPlan() {
    const plan = allStrategies.strategies[activeAgentId]?.generatedPlan;
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  }

  // Simple markdown-like rendering
  function renderPlan(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="font-bold" style={{ fontSize: 15, color: activeStrategy?.color ?? 'var(--accent)', marginTop: 20, marginBottom: 8 }}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-md font-bold" style={{ marginTop: 12, marginBottom: 4 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <div key={i} className="text-md text-secondary" style={{ paddingLeft: 16, lineHeight: 1.6 }}>• {line.slice(2)}</div>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="text-md font-bold mt-8">{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.trim() === '') {
        return <div key={i} style={{ height: 8 }} />;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} className="text-md text-secondary" style={{ lineHeight: 1.6 }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: 'var(--text-primary)' }}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  }

  const savedData = allStrategies.strategies[activeAgentId];
  const currentPlan = savedData?.generatedPlan;
  const basicFields = activeStrategy ? activeStrategy.fields.filter(f => !f.advanced) : [];
  const advancedFields = activeStrategy ? activeStrategy.fields.filter(f => f.advanced) : [];
  const filledCount = activeStrategy ? activeStrategy.fields.filter(f => {
    const v = formData[f.key];
    return v && (Array.isArray(v) ? v.length > 0 : v.trim().length > 0);
  }).length : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Plan d&apos;Attaque</h1>
        <p className="page-subtitle">
          Définissez votre stratégie pour chaque domaine. Votre agent crée un plan d&apos;action concret et personnalisé.
        </p>
      </div>

      {/* Agent tabs */}
      <div className="flex gap-6 flex-wrap mb-16" style={{
        padding: '6px 0', borderBottom: '1px solid var(--border-primary)',
      }}>
        {AGENT_STRATEGIES.map(strat => {
          const isActive = strat.agentId === activeAgentId;
          const hasSaved = !!allStrategies.strategies[strat.agentId];
          const hasPlan = !!allStrategies.strategies[strat.agentId]?.generatedPlan;
          return (
            <button
              key={strat.agentId}
              onClick={() => switchAgent(strat.agentId)}
              className="flex items-center gap-6 pointer rounded-full text-md"
              style={{
                padding: '6px 14px',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? strat.color + '15' : 'transparent',
                color: isActive ? strat.color : 'var(--text-secondary)',
                border: `1px solid ${isActive ? strat.color + '44' : 'var(--border-secondary)'}`,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
              }}
            >
              <span>{strat.icon}</span>
              {strat.shortLabel}
              {hasPlan && <span className="dot dot-success" />}
              {hasSaved && !hasPlan && <span className="dot dot-warning" />}
            </button>
          );
        })}
      </div>

      {/* Reassurance banner */}
      <div className="alert alert-info mb-16">
        <span className="text-base">💡</span>{' '}
        <span className="text-md">{activeStrategy?.reassurance}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger mb-16">
          {error}
        </div>
      )}

      {/* Form view */}
      {viewMode === 'form' && activeStrategy && (
        <div className="card p-20">
          <div className="flex items-center gap-8 mb-16">
            <span style={{ fontSize: 24 }}>{activeStrategy.icon}</span>
            <div>
              <div className="text-lg font-bold">{activeStrategy.title}</div>
              <div className="text-sm text-muted">{activeStrategy.subtitle}</div>
            </div>
            <div className="flex items-center gap-8" style={{ marginLeft: 'auto' }}>
              <VoiceInput
                onTranscript={(t) => {
                  const key = lastFocusedFieldRef.current || activeStrategy.fields.find(f => f.type === 'textarea')?.key || '';
                  if (key) updateField(key, ((formData[key] as string) || '') + (formData[key] ? ' ' : '') + t);
                }}
                size="sm"
              />
              <span className="badge badge-neutral text-xs">
                {filledCount}/{activeStrategy.fields.length} rempli{filledCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Basic fields */}
          {basicFields.map(field => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={formData[field.key]}
              onChangeText={(v) => updateField(field.key, v)}
              onToggleChip={(chip) => toggleChip(field.key, chip)}
              accentColor={activeStrategy.color}
              onFocusField={() => { lastFocusedFieldRef.current = field.key; }}
            />
          ))}

          {/* Advanced fields toggle */}
          {advancedFields.length > 0 && (
            <>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-6 text-md font-semibold text-accent pointer mt-8"
                style={{
                  padding: '8px 0', background: 'none', border: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {showAdvanced ? '▾' : '▸'} {showAdvanced ? 'Masquer les détails' : 'Plus de détails (optionnel)'}
              </button>
              {showAdvanced && advancedFields.map(field => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChangeText={(v) => updateField(field.key, v)}
                  onToggleChip={(chip) => toggleChip(field.key, chip)}
                  accentColor={activeStrategy.color}
                  onFocusField={() => { lastFocusedFieldRef.current = field.key; }}
                />
              ))}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-8 flex-wrap mt-24">
            <button
              className="btn btn-primary flex-1 font-bold text-base"
              onClick={generatePlan}
              disabled={generating || filledCount === 0}
              style={{
                minWidth: 200,
                padding: '10px 20px',
                background: generating ? 'var(--bg-tertiary)' : activeStrategy.color,
                borderColor: generating ? 'var(--border-secondary)' : activeStrategy.color,
              }}
            >
              {generating ? (
                <span className="animate-pulse">{activeStrategy ? agent(activeStrategy.agentId).name : 'Votre agent'} analyse et crée votre plan...</span>
              ) : (
                <>🎯 Générer mon plan d&apos;action</>
              )}
            </button>
            {currentPlan && (
              <button
                className="btn btn-ghost text-md"
                onClick={() => setViewMode('plan')}
              >
                Voir mon plan existant
              </button>
            )}
          </div>

          {/* Cost hint */}
          <div className="text-xs text-muted text-center mt-8">
            Coût estimé : ~3-5 crédits (Sonnet)
          </div>
        </div>
      )}

      {/* Plan view */}
      {viewMode === 'plan' && activeStrategy && currentPlan && (
        <div>
          {/* Action bar */}
          <div className="flex gap-8 flex-wrap mb-16">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setViewMode('form')}
            >
              ← Modifier mes réponses
            </button>
            <div className="flex-1" />
            <button
              className="btn btn-ghost btn-sm"
              onClick={copyPlan}
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => { setViewMode('form'); setTimeout(() => generatePlan(), 100); }}
              style={{ background: activeStrategy.color, color: 'white', borderColor: activeStrategy.color }}
            >
              🔄 Régénérer
            </button>
          </div>

          {/* Plan card */}
          <div className="card p-20">
            <div className="flex items-center gap-8 mb-16" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-primary)' }}>
              <span style={{ fontSize: 24 }}>{activeStrategy.icon}</span>
              <div>
                <div className="text-lg font-bold">{activeStrategy.title}</div>
                <div className="text-xs text-muted">
                  Généré le {savedData?.generatedAt ? new Date(savedData.generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </div>
              </div>
            </div>
            <div>{renderPlan(currentPlan)}</div>
          </div>

          {/* Encouragement */}
          <div className="text-center mt-16 rounded-md" style={{
            padding: '10px 14px',
            background: activeStrategy.color + '08',
            border: `1px solid ${activeStrategy.color}22`,
          }}>
            <span className="text-md font-semibold" style={{ color: activeStrategy.color }}>
              🎉 Votre plan est prêt ! Vous pouvez maintenant discuter avec {agent(activeStrategy.agentId).name} dans le Chat pour approfondir chaque point.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Field Renderer sub-component
   ═══════════════════════════════════════════ */

function FieldRenderer({
  field,
  value,
  onChangeText,
  onToggleChip,
  accentColor,
  onFocusField,
}: {
  field: StrategyField;
  value: string | string[] | undefined;
  onChangeText: (v: string) => void;
  onToggleChip: (chip: string) => void;
  accentColor: string;
  onFocusField?: () => void;
}) {
  return (
    <div className="mb-16">
      <label className="text-md font-semibold" style={{ display: 'block', marginBottom: 6 }}>
        {field.label}
      </label>
      {field.hint && (
        <div className="text-xs text-muted mb-4" style={{ fontStyle: 'italic' }}>
          {field.hint}
        </div>
      )}

      {field.type === 'input' && (
        <input
          className="input w-full"
          type="text"
          placeholder={field.placeholder}
          value={(value as string) || ''}
          onChange={e => onChangeText(e.target.value)}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          className="input w-full"
          placeholder={field.placeholder}
          value={(value as string) || ''}
          onChange={e => onChangeText(e.target.value)}
          onFocus={onFocusField}
          rows={3}
          style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
        />
      )}

      {field.type === 'select' && field.options && (
        <div className="flex flex-wrap gap-6">
          {field.options.map(opt => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                onClick={() => onChangeText(opt)}
                className="pointer rounded-full text-sm"
                style={{
                  padding: '6px 14px',
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? accentColor : 'var(--bg-primary)',
                  color: isSelected ? 'white' : 'var(--text-tertiary)',
                  border: `1px solid ${isSelected ? accentColor : 'var(--border-secondary)'}`,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'chips' && field.options && (
        <div className="flex flex-wrap gap-6">
          {field.options.map(chip => {
            const selected = Array.isArray(value) ? value.includes(chip) : false;
            return (
              <button
                key={chip}
                onClick={() => onToggleChip(chip)}
                className="pointer rounded-full text-sm"
                style={{
                  padding: '6px 14px',
                  fontWeight: selected ? 600 : 500,
                  background: selected ? accentColor : 'var(--bg-primary)',
                  color: selected ? 'white' : 'var(--text-tertiary)',
                  border: `1px solid ${selected ? accentColor : 'var(--border-secondary)'}`,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
