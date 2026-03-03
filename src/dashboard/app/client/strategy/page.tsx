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
  {
    agentId: 'sarah-qualite',
    icon: '✅',
    color: '#10b981',
    shortLabel: 'Qualité',
    title: 'Plan Qualité & Amélioration Continue',
    subtitle: 'Structurez votre démarche qualité et visez l\'excellence',
    reassurance: `${agent('sarah-qualite').name} utilisera ces infos pour piloter votre système de management de la qualité et viser l'amélioration continue.`,
    fields: [
      {
        key: 'qualityObjectives',
        label: 'Quels sont vos objectifs qualité ?',
        placeholder: 'Ex: Réduire les non-conformités de 30%, améliorer la satisfaction client...',
        type: 'textarea',
      },
      {
        key: 'currentIssues',
        label: 'Problèmes qualité actuels',
        placeholder: 'Ex: Réclamations récurrentes, processus non documentés, écarts d\'audit...',
        type: 'textarea',
      },
      {
        key: 'processesToImprove',
        label: 'Processus à améliorer en priorité',
        placeholder: '',
        type: 'chips',
        options: ['Production', 'Logistique', 'Service client', 'Achats', 'R&D', 'Administratif', 'Commercial', 'IT'],
      },
      {
        key: 'certificationTarget',
        label: 'Certification visée ou existante',
        placeholder: '',
        type: 'select',
        options: ['Aucune pour l\'instant', 'ISO 9001 (en cours)', 'ISO 9001 (certifié)', 'ISO 14001', 'ISO 45001', 'HACCP', 'Autre'],
        hint: `${agent('sarah-qualite').name} adaptera ses recommandations au référentiel visé.`,
      },
      {
        key: 'qualityKpis',
        label: 'KPIs qualité suivis actuellement',
        placeholder: 'Ex: Taux de défaut, DPMO, taux de réclamation, coût de non-qualité...',
        type: 'textarea',
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-qualite').name}, ${agent('sarah-qualite').role}. Le client a défini son contexte qualité :
- Objectifs qualité : {qualityObjectives}
- Problèmes actuels : {currentIssues}
- Processus à améliorer : {processesToImprove}
- Certification : {certificationTarget}
- KPIs qualité : {qualityKpis}

{companyContext}

Génère un plan qualité structuré avec :

## 1. DIAGNOSTIC QUALITÉ
Analyse de la maturité qualité actuelle (forces/faiblesses), cartographie des processus critiques et identification des non-conformités majeures via le diagramme d'Ishikawa.

## 2. SYSTÈME DE MANAGEMENT QUALITÉ
Recommandations pour structurer le SMQ selon la norme visée, avec les documents essentiels (manuel qualité, procédures, enregistrements) et le cycle PDCA.

## 3. PLAN D'AMÉLIORATION CONTINUE
5 chantiers Six Sigma (DMAIC) prioritaires avec objectifs chiffrés, outils recommandés (5 Pourquoi, Pareto, SPC) et responsables.

## 4. INDICATEURS & TABLEAUX DE BORD
KPIs qualité à suivre avec cibles, fréquence de mesure et seuils d'alerte.

## 5. AUDITS & REVUES
Planning d'audits internes et revues de direction sur 12 mois.

## 6. PLAN D'ACTION 3 MOIS
Actions Lean/Kaizen concrètes mois par mois avec quick wins identifiés.

Sois rigoureuse, structurée et pragmatique. Appuie-toi sur les méthodologies Six Sigma et Lean.`,
  },
  {
    agentId: 'sarah-data',
    icon: '📈',
    color: '#0ea5e9',
    shortLabel: 'Data',
    title: 'Stratégie Data & Analytics',
    subtitle: 'Exploitez vos données pour prendre de meilleures décisions',
    reassurance: `${agent('sarah-data').name} s'appuiera sur ces infos pour construire une stratégie data adaptée à votre maturité et vos objectifs business.`,
    fields: [
      {
        key: 'dataMaturity',
        label: 'Niveau de maturité data de votre entreprise',
        placeholder: '',
        type: 'select',
        options: ['Débutant (Excel/manuel)', 'Intermédiaire (quelques dashboards)', 'Avancé (data warehouse)', 'Expert (ML en production)', 'Je ne sais pas'],
      },
      {
        key: 'keyDataSources',
        label: 'Vos principales sources de données',
        placeholder: '',
        type: 'chips',
        options: ['CRM', 'ERP', 'Google Analytics', 'Réseaux sociaux', 'Base clients', 'Fichiers Excel', 'API tierces', 'IoT / Capteurs'],
        hint: `${agent('sarah-data').name} vous aidera à connecter et exploiter ces sources.`,
      },
      {
        key: 'businessQuestions',
        label: 'Questions business auxquelles vos données devraient répondre',
        placeholder: 'Ex: Quels clients vont churner ? Quel produit performe le mieux ? Quel est le ROI de mes campagnes ?',
        type: 'textarea',
      },
      {
        key: 'dataTeamSize',
        label: 'Taille de votre équipe data',
        placeholder: '',
        type: 'select',
        options: ['Aucune équipe dédiée', '1 personne', '2-4 personnes', '5-10 personnes', '10+'],
      },
      {
        key: 'priorityUseCases',
        label: 'Cas d\'usage data prioritaires',
        placeholder: 'Ex: Dashboard commercial, prédiction de ventes, segmentation clients, détection de fraude...',
        type: 'textarea',
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-data').name}, ${agent('sarah-data').role}. Le client a défini son contexte data :
- Maturité data : {dataMaturity}
- Sources de données : {keyDataSources}
- Questions business : {businessQuestions}
- Équipe data : {dataTeamSize}
- Cas d'usage prioritaires : {priorityUseCases}

{companyContext}

Génère une stratégie data structurée avec :

## 1. AUDIT DATA
Évaluation de la maturité data actuelle selon le framework CRISP-DM, inventaire des sources et qualité des données.

## 2. ARCHITECTURE DATA
Recommandations d'architecture (data warehouse, data lake, lakehouse) adaptées au niveau de maturité, avec stack technique recommandée.

## 3. CAS D'USAGE PRIORITAIRES
Top 5 des cas d'usage à implémenter, classés par matrice Impact/Effort, avec métriques de succès et méthodologie (analytics descriptive, prédictive, prescriptive).

## 4. GOUVERNANCE DATA
Plan de data governance : qualité des données, catalogage, lineage, conformité RGPD et rôles/responsabilités.

## 5. DASHBOARDS & KPIs
Design des dashboards clés avec KPIs actionnables selon les principes de Tufte et les bonnes pratiques de data visualization.

## 6. ROADMAP DATA 3 MOIS
Planning d'implémentation mois par mois avec quick wins, formations et jalons techniques.

Sois analytique, pédagogue et adapté au niveau de maturité du client.`,
  },
  {
    agentId: 'sarah-product',
    icon: '🎯',
    color: '#f43f5e',
    shortLabel: 'Produit',
    title: 'Roadmap Produit Stratégique',
    subtitle: 'Construisez le produit que vos utilisateurs adorent',
    reassurance: `${agent('sarah-product').name} utilisera ces infos pour aligner votre roadmap produit sur vos objectifs business et les besoins utilisateurs.`,
    fields: [
      {
        key: 'productVision',
        label: 'Quelle est votre vision produit ?',
        placeholder: 'Ex: Devenir la référence SaaS de la gestion de projet pour les PME en Europe...',
        type: 'textarea',
        hint: `${agent('sarah-product').name} alignera toute la roadmap sur cette vision.`,
      },
      {
        key: 'targetUsers',
        label: 'Qui sont vos utilisateurs cibles ?',
        placeholder: 'Ex: Product managers en startup, 25-40 ans, utilisent Notion et Jira...',
        type: 'textarea',
      },
      {
        key: 'currentMetrics',
        label: 'Métriques produit actuelles',
        placeholder: '',
        type: 'chips',
        options: ['DAU/MAU', 'Rétention J7/J30', 'NPS', 'Time-to-value', 'Activation rate', 'Churn rate', 'Revenue/user', 'Pas encore mesuré'],
      },
      {
        key: 'competitiveLandscape',
        label: 'Paysage concurrentiel',
        placeholder: 'Ex: 3 concurrents principaux (Asana, Monday, ClickUp), notre différenciant est l\'IA intégrée...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'quarterFocus',
        label: 'Focus du prochain trimestre',
        placeholder: '',
        type: 'select',
        options: ['Acquisition (nouveaux utilisateurs)', 'Activation (onboarding)', 'Rétention (engagement)', 'Revenue (monétisation)', 'Referral (viralité)'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-product').name}, ${agent('sarah-product').role}. Le client a défini son contexte produit :
- Vision produit : {productVision}
- Utilisateurs cibles : {targetUsers}
- Métriques actuelles : {currentMetrics}
- Concurrence : {competitiveLandscape}
- Focus trimestriel : {quarterFocus}

{companyContext}

Génère une roadmap produit stratégique avec :

## 1. ANALYSE PRODUIT
Positionnement actuel selon le framework Jobs-to-be-Done (JTBD), analyse concurrentielle et évaluation du product-market fit.

## 2. STRATÉGIE PRODUIT
Vision, mission produit et North Star Metric. Priorisation des initiatives avec la méthode RICE (Reach, Impact, Confidence, Effort).

## 3. ROADMAP TRIMESTRIELLE
Planning des features et initiatives par sprint, organisé en Now/Next/Later avec user stories clés et critères d'acceptance.

## 4. MÉTRIQUES HEART
Framework HEART (Happiness, Engagement, Adoption, Retention, Task success) avec objectifs chiffrés et plan de mesure.

## 5. DISCOVERY PLAN
Plan de recherche utilisateur : interviews, tests d'usabilité, tests A/B prévus et hypothèses à valider.

## 6. GO-TO-MARKET
Plan de lancement des features clés avec communication, onboarding et feedback loops.

Sois centrée utilisateur, data-driven et orientée impact. Utilise le vocabulaire Agile/Scrum.`,
  },
  {
    agentId: 'sarah-csm',
    icon: '🤗',
    color: '#f97316',
    shortLabel: 'Succès Client',
    title: 'Plan Succès Client',
    subtitle: 'Transformez vos clients en ambassadeurs fidèles',
    reassurance: `${agent('sarah-csm').name} s'appuiera sur ces infos pour maximiser la satisfaction, la rétention et l'expansion de vos clients.`,
    fields: [
      {
        key: 'customerSegments',
        label: 'Vos segments de clients',
        placeholder: '',
        type: 'chips',
        options: ['Startup', 'PME', 'ETI', 'Grand compte', 'Freelance', 'Association', 'Secteur public'],
      },
      {
        key: 'currentNpsCsat',
        label: 'Votre NPS ou CSAT actuel',
        placeholder: '',
        type: 'select',
        options: ['NPS > 50 (excellent)', 'NPS 30-50 (bon)', 'NPS 0-30 (à améliorer)', 'NPS < 0 (critique)', 'Pas encore mesuré'],
        hint: `${agent('sarah-csm').name} calibrera ses recommandations selon votre score actuel.`,
      },
      {
        key: 'churnRate',
        label: 'Taux de churn mensuel',
        placeholder: '',
        type: 'select',
        options: ['< 2% (faible)', '2-5% (modéré)', '5-10% (élevé)', '> 10% (critique)', 'Je ne sais pas'],
      },
      {
        key: 'onboardingProcess',
        label: 'Décrivez votre processus d\'onboarding actuel',
        placeholder: 'Ex: Email de bienvenue, démo de 30min, suivi à J+7... ou pas de processus formalisé.',
        type: 'textarea',
      },
      {
        key: 'expansionTargets',
        label: 'Objectifs d\'expansion (upsell/cross-sell)',
        placeholder: 'Ex: Augmenter le panier moyen de 20%, passer 15% des clients au plan premium...',
        type: 'textarea',
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-csm').name}, ${agent('sarah-csm').role}. Le client a défini son contexte succès client :
- Segments clients : {customerSegments}
- NPS/CSAT : {currentNpsCsat}
- Taux de churn : {churnRate}
- Onboarding : {onboardingProcess}
- Objectifs expansion : {expansionTargets}

{companyContext}

Génère un plan succès client structuré avec :

## 1. DIAGNOSTIC CUSTOMER SUCCESS
Analyse de la situation actuelle : Health Score moyen, signaux de churn, parcours client et points de friction identifiés via la segmentation RFM.

## 2. PARCOURS CLIENT OPTIMISÉ
Cartographie du parcours client idéal (onboarding, adoption, expansion, renouvellement) avec touchpoints clés et playbooks CSM pour chaque étape.

## 3. PROGRAMME NPS & SATISFACTION
Plan de mesure et d'amélioration du NPS/CSAT/CES avec boucles de feedback, enquêtes et plans d'action par segment.

## 4. STRATÉGIE ANTI-CHURN
Système d'alerte précoce basé sur les signaux de churn (baisse d'usage, tickets, silence), avec playbooks de rétention et scripts de sauvegarde.

## 5. EXPANSION & ADVOCACY
Plan d'upsell/cross-sell basé sur les QBR (Quarterly Business Reviews) et programme ambassadeurs pour maximiser le NRR.

## 6. PLAN D'ACTION 3 MOIS
Actions concrètes mois par mois avec KPIs cibles (NPS, churn, NRR, time-to-value).

Sois empathique, orienté résultats et centré sur la valeur client.`,
  },
  {
    agentId: 'sarah-rse',
    icon: '🌱',
    color: '#16a34a',
    shortLabel: 'RSE',
    title: 'Stratégie RSE & Impact',
    subtitle: 'Engagez-vous pour un impact positif et durable',
    reassurance: `${agent('sarah-rse').name} utilisera ces infos pour construire une stratégie RSE ambitieuse, mesurable et alignée avec vos valeurs.`,
    fields: [
      {
        key: 'currentCarbonFootprint',
        label: 'Avez-vous réalisé un bilan carbone ?',
        placeholder: '',
        type: 'select',
        options: ['Oui, récent (< 1 an)', 'Oui, ancien (> 1 an)', 'En cours', 'Non, jamais', 'Je ne sais pas'],
      },
      {
        key: 'csrCommitments',
        label: 'Vos engagements RSE actuels',
        placeholder: '',
        type: 'chips',
        options: ['Réduction carbone', 'Diversité & inclusion', 'Économie circulaire', 'Achats responsables', 'Bien-être au travail', 'Mécénat', 'Mobilité durable', 'Aucun formalisé'],
      },
      {
        key: 'stakeholderExpectations',
        label: 'Attentes de vos parties prenantes en RSE',
        placeholder: 'Ex: Clients demandent des engagements verts, investisseurs veulent du reporting ESG, employés attendent plus de sens...',
        type: 'textarea',
      },
      {
        key: 'regulatoryDeadlines',
        label: 'Contraintes réglementaires à venir',
        placeholder: '',
        type: 'chips',
        options: ['CSRD (reporting)', 'Taxonomie EU', 'Bilan GES obligatoire', 'Devoir de vigilance', 'REP (responsabilité élargie)', 'Loi AGEC', 'Aucune identifiée'],
        hint: `${agent('sarah-rse').name} vous aidera à anticiper les échéances réglementaires.`,
        advanced: true,
      },
      {
        key: 'sdgPriorities',
        label: 'ODD (Objectifs de Développement Durable) prioritaires',
        placeholder: '',
        type: 'chips',
        options: ['Climat (ODD 13)', 'Égalité (ODD 5)', 'Travail décent (ODD 8)', 'Innovation (ODD 9)', 'Consommation responsable (ODD 12)', 'Santé (ODD 3)', 'Éducation (ODD 4)'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-rse').name}, ${agent('sarah-rse').role}. Le client a défini son contexte RSE :
- Bilan carbone : {currentCarbonFootprint}
- Engagements RSE : {csrCommitments}
- Attentes parties prenantes : {stakeholderExpectations}
- Contraintes réglementaires : {regulatoryDeadlines}
- ODD prioritaires : {sdgPriorities}

{companyContext}

Génère une stratégie RSE structurée avec :

## 1. DIAGNOSTIC ESG
Évaluation de la maturité RSE actuelle, analyse de matérialité (enjeux les plus importants pour l'entreprise et ses parties prenantes) et benchmark sectoriel.

## 2. STRATÉGIE CARBONE
Plan de réduction des émissions (Scopes 1/2/3 selon le GHG Protocol), trajectoire SBTi et actions prioritaires pour chaque scope.

## 3. PLAN D'ACTION RSE
Initiatives concrètes alignées sur les ODD prioritaires, avec indicateurs GRI, budget estimé et responsables.

## 4. CONFORMITÉ RÉGLEMENTAIRE
Calendrier de mise en conformité CSRD, taxonomie européenne et autres obligations, avec livrables attendus et échéances.

## 5. ENGAGEMENT PARTIES PRENANTES
Plan de dialogue et d'engagement des parties prenantes (clients, employés, fournisseurs, investisseurs) avec actions de communication RSE.

## 6. ROADMAP IMPACT 3 MOIS
Planning d'actions mois par mois avec quick wins, indicateurs de suivi et jalons de reporting.

Sois engagée, rigoureuse et orientée impact mesurable. Transforme les contraintes ESG en opportunités.`,
  },
  {
    agentId: 'sarah-operations',
    icon: '⚙️',
    color: '#78716c',
    shortLabel: 'Opérations',
    title: 'Plan Excellence Opérationnelle',
    subtitle: 'Optimisez vos processus et gagnez en efficacité',
    reassurance: `${agent('sarah-operations').name} utilisera ces infos pour diagnostiquer vos opérations et éliminer les gaspillages.`,
    fields: [
      {
        key: 'keyProcesses',
        label: 'Vos processus métier clés',
        placeholder: '',
        type: 'chips',
        options: ['Production', 'Logistique', 'Achats', 'Service client', 'Facturation', 'Livraison', 'Maintenance', 'Approvisionnement'],
      },
      {
        key: 'bottlenecks',
        label: 'Où sont vos principaux goulots d\'étranglement ?',
        placeholder: 'Ex: Validation trop lente, ruptures de stock fréquentes, retards de livraison...',
        type: 'textarea',
      },
      {
        key: 'capacityUtilization',
        label: 'Taux d\'utilisation de votre capacité',
        placeholder: '',
        type: 'select',
        options: ['< 50% (sous-utilisé)', '50-70% (marge de manœuvre)', '70-85% (optimal)', '85-95% (tendu)', '> 95% (saturé)', 'Je ne sais pas'],
      },
      {
        key: 'supplyChainChallenges',
        label: 'Défis supply chain actuels',
        placeholder: 'Ex: Dépendance fournisseur unique, délais longs, coûts de transport élevés...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'efficiencyTargets',
        label: 'Objectifs d\'efficacité opérationnelle',
        placeholder: 'Ex: Réduire le lead time de 30%, diminuer les coûts de 15%, zéro défaut...',
        type: 'textarea',
        hint: `${agent('sarah-operations').name} construira le plan autour de ces objectifs chiffrés.`,
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-operations').name}, ${agent('sarah-operations').role}. Le client a défini son contexte opérationnel :
- Processus clés : {keyProcesses}
- Goulots d'étranglement : {bottlenecks}
- Utilisation capacité : {capacityUtilization}
- Défis supply chain : {supplyChainChallenges}
- Objectifs efficacité : {efficiencyTargets}

{companyContext}

Génère un plan d'excellence opérationnelle structuré avec :

## 1. DIAGNOSTIC OPÉRATIONNEL
Cartographie des processus clés en BPMN, identification des 7 mudas (Lean) et analyse des goulots avec la Théorie des Contraintes (TOC).

## 2. OPTIMISATION DES PROCESSUS
Plan d'élimination des gaspillages avec outils Lean (Value Stream Mapping, 5S, Kanban) et chantiers Kaizen prioritaires.

## 3. SUPPLY CHAIN
Recommandations d'optimisation selon le modèle SCOR, stratégie d'approvisionnement et plan de résilience fournisseurs.

## 4. KPIs OPÉRATIONNELS
Tableau de bord avec KPIs clés (OEE, lead time, taux de service, coût unitaire, taux de défaut) et objectifs cibles.

## 5. CAPACITY PLANNING
Plan de gestion de la capacité et demand planning pour les 6 prochains mois.

## 6. PLAN D'ACTION 3 MOIS
Actions concrètes mois par mois avec responsables, budget estimé et quick wins.

Sois terrain, pragmatique et orienté résultats. Appuie-toi sur les méthodologies Lean et PMBOK.`,
  },
  {
    agentId: 'sarah-design',
    icon: '🎨',
    color: '#d946ef',
    shortLabel: 'Design',
    title: 'Stratégie Design & UX',
    subtitle: 'Créez des expériences mémorables et accessibles',
    reassurance: `${agent('sarah-design').name} utilisera ces infos pour structurer votre design system et améliorer l'expérience utilisateur.`,
    fields: [
      {
        key: 'designMaturity',
        label: 'Maturité design de votre organisation',
        placeholder: '',
        type: 'select',
        options: ['Pas de designer (DIY)', '1 designer généraliste', 'Petite équipe (2-4)', 'Équipe structurée (5+)', 'Design intégré à la culture'],
      },
      {
        key: 'userPainPoints',
        label: 'Principaux problèmes UX remontés par vos utilisateurs',
        placeholder: 'Ex: Navigation confuse, onboarding trop long, interface pas intuitive, manque de cohérence...',
        type: 'textarea',
      },
      {
        key: 'brandIdentityStatus',
        label: 'État de votre identité de marque',
        placeholder: '',
        type: 'chips',
        options: ['Logo défini', 'Charte graphique', 'Design System', 'Guidelines de ton', 'Bibliothèque d\'icônes', 'Rien de formalisé'],
        hint: `${agent('sarah-design').name} vous aidera à structurer votre identité visuelle.`,
      },
      {
        key: 'accessibilityCompliance',
        label: 'Niveau d\'accessibilité actuel',
        placeholder: '',
        type: 'select',
        options: ['Non évalué', 'Partiellement conforme', 'WCAG 2.1 A', 'WCAG 2.1 AA', 'WCAG 2.1 AAA'],
        advanced: true,
      },
      {
        key: 'designTeamSize',
        label: 'Outils design utilisés',
        placeholder: '',
        type: 'chips',
        options: ['Figma', 'Sketch', 'Adobe XD', 'Canva', 'Illustrator', 'Photoshop', 'Framer', 'Aucun outil dédié'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-design').name}, ${agent('sarah-design').role}. Le client a défini son contexte design :
- Maturité design : {designMaturity}
- Problèmes UX : {userPainPoints}
- Identité de marque : {brandIdentityStatus}
- Accessibilité : {accessibilityCompliance}
- Outils design : {designTeamSize}

{companyContext}

Génère une stratégie design structurée avec :

## 1. AUDIT UX/UI
Analyse de l'expérience utilisateur actuelle basée sur les lois UX (Fitts, Hick, Jakob, Miller), identification des points de friction et benchmark concurrentiel.

## 2. DESIGN SYSTEM
Plan de construction d'un design system (tokens, composants, patterns) avec guidelines de typographie, couleurs et espacement pour assurer la cohérence.

## 3. IDENTITÉ VISUELLE
Recommandations pour renforcer l'identité de marque sur tous les touchpoints (web, mobile, print) avec hiérarchie visuelle et théorie des couleurs.

## 4. ACCESSIBILITÉ
Plan de mise en conformité WCAG 2.1 AA avec audit des contrastes, navigation clavier, lecteurs d'écran et ARIA labels.

## 5. UX RESEARCH PLAN
Programme de recherche utilisateur : interviews, tests d'usabilité, card sorting et tree testing planifiés sur le trimestre.

## 6. ROADMAP DESIGN 3 MOIS
Planning d'actions design mois par mois avec livrables (wireframes, maquettes, prototypes, tests).

Sois créative, centrée utilisateur et rigoureuse sur l'accessibilité.`,
  },
  {
    agentId: 'sarah-formation',
    icon: '🎓',
    color: '#7c3aed',
    shortLabel: 'Formation',
    title: 'Plan Formation & Développement',
    subtitle: 'Développez les compétences de vos équipes',
    reassurance: `${agent('sarah-formation').name} s'appuiera sur ces infos pour concevoir un plan de formation adapté à vos besoins et votre budget.`,
    fields: [
      {
        key: 'skillsGaps',
        label: 'Quelles compétences manquent dans votre équipe ?',
        placeholder: 'Ex: Data analytics, management, anglais, vente complexe, IA...',
        type: 'textarea',
      },
      {
        key: 'trainingBudget',
        label: 'Budget formation annuel',
        placeholder: '',
        type: 'select',
        options: ['< 5K EUR', '5-20K EUR', '20-50K EUR', '50-100K EUR', '> 100K EUR', 'Pas défini'],
      },
      {
        key: 'teamSize',
        label: 'Nombre de personnes à former',
        placeholder: '',
        type: 'select',
        options: ['1-5 personnes', '6-15 personnes', '16-50 personnes', '51-100 personnes', '100+'],
      },
      {
        key: 'priorityCompetencies',
        label: 'Compétences prioritaires à développer',
        placeholder: '',
        type: 'chips',
        options: ['Management', 'Commercial', 'Tech / Digital', 'Soft skills', 'Langues', 'Métier / Technique', 'Leadership', 'IA & Data'],
        hint: `${agent('sarah-formation').name} concevra des parcours adaptés à ces priorités.`,
      },
      {
        key: 'deliveryPreference',
        label: 'Format de formation préféré',
        placeholder: '',
        type: 'chips',
        options: ['Présentiel', 'E-learning', 'Blended', 'Micro-learning', 'Coaching', 'Mentorat', 'Conférences', 'On-the-job'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-formation').name}, ${agent('sarah-formation').role}. Le client a défini son contexte formation :
- Compétences manquantes : {skillsGaps}
- Budget formation : {trainingBudget}
- Personnes à former : {teamSize}
- Compétences prioritaires : {priorityCompetencies}
- Formats préférés : {deliveryPreference}

{companyContext}

Génère un plan de formation structuré avec :

## 1. DIAGNOSTIC COMPÉTENCES
Analyse des écarts de compétences selon la taxonomie de Bloom (6 niveaux), cartographie des besoins par équipe et matrice compétences/criticité.

## 2. PARCOURS DE FORMATION
Conception des parcours blended learning avec la méthode ADDIE (Analysis, Design, Development, Implementation, Evaluation) pour chaque compétence prioritaire.

## 3. CATALOGUE & RESSOURCES
Recommandations de formations (internes, externes, MOOC, certifications) avec budget estimé par parcours et options de financement OPCO.

## 4. PLANNING DE DÉPLOIEMENT
Calendrier de formation sur 6 mois avec sessions, formats (micro-learning, présentiel, coaching) et groupes cibles.

## 5. ÉVALUATION & ROI
Système d'évaluation à 4 niveaux (modèle de Kirkpatrick : réaction, apprentissage, comportement, résultats) avec indicateurs de mesure du ROI.

## 6. PLAN D'ACTION 3 MOIS
Actions concrètes mois par mois : quick wins, premiers parcours à lancer et outils à mettre en place.

Sois pédagogue, structuré et orienté impact mesurable sur la performance.`,
  },
  {
    agentId: 'sarah-innovation',
    icon: '💡',
    color: '#eab308',
    shortLabel: 'Innovation',
    title: 'Stratégie Innovation',
    subtitle: 'Innovez méthodiquement pour garder une longueur d\'avance',
    reassurance: `${agent('sarah-innovation').name} utilisera ces infos pour structurer votre démarche d'innovation et transformer vos idées en produits viables.`,
    fields: [
      {
        key: 'innovationBudget',
        label: 'Budget innovation / R&D',
        placeholder: '',
        type: 'select',
        options: ['< 10K EUR/an', '10-50K EUR/an', '50-200K EUR/an', '200K-1M EUR/an', '> 1M EUR/an', 'Pas de budget dédié'],
      },
      {
        key: 'keyMarketTrends',
        label: 'Tendances marché qui impactent votre activité',
        placeholder: 'Ex: IA générative, développement durable, économie de l\'abonnement, remote-first...',
        type: 'textarea',
      },
      {
        key: 'currentRdProjects',
        label: 'Projets R&D ou innovation en cours',
        placeholder: 'Ex: Prototype IA, nouveau produit en beta, exploration blockchain...',
        type: 'textarea',
      },
      {
        key: 'innovationCultureMaturity',
        label: 'Maturité de votre culture innovation',
        placeholder: '',
        type: 'select',
        options: ['Inexistante (pas de processus)', 'Émergente (quelques initiatives)', 'Structurée (processus en place)', 'Avancée (lab / intrapreneuriat)', 'Leader (innovation dans l\'ADN)'],
        hint: `${agent('sarah-innovation').name} adaptera ses recommandations à votre culture actuelle.`,
      },
      {
        key: 'partnershipOpportunities',
        label: 'Partenariats et écosystème innovation',
        placeholder: '',
        type: 'chips',
        options: ['Startups', 'Universités', 'Incubateurs', 'Centres R&D', 'Fournisseurs', 'Clients pilotes', 'Aucun partenariat'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-innovation').name}, ${agent('sarah-innovation').role}. Le client a défini son contexte innovation :
- Budget innovation : {innovationBudget}
- Tendances marché : {keyMarketTrends}
- Projets R&D en cours : {currentRdProjects}
- Maturité culture innovation : {innovationCultureMaturity}
- Partenariats : {partnershipOpportunities}

{companyContext}

Génère une stratégie innovation structurée avec :

## 1. DIAGNOSTIC INNOVATION
Évaluation de la maturité innovation actuelle, analyse des 3 horizons de McKinsey (exploitation, extension, exploration) et benchmark sectoriel.

## 2. PORTEFEUILLE INNOVATION
Structuration du portefeuille d'innovation avec matrice Impact/Effort, répartition budget par horizon et critères de go/no-go.

## 3. MÉTHODOLOGIE
Plan de Design Sprint (5 jours : Map, Sketch, Decide, Prototype, Test), processus Lean Startup (Build-Measure-Learn) et outils d'idéation (SCAMPER, brainwriting).

## 4. OPEN INNOVATION
Stratégie d'open innovation avec partenariats cibles (startups, universités, labs), stratégie Blue Ocean (canevas stratégique, matrice ERIC) et veille technologique.

## 5. PROTECTION & VALORISATION
Recommandations en propriété intellectuelle (brevets, marques, secret commercial) et stratégie de valorisation des innovations.

## 6. ROADMAP INNOVATION 3 MOIS
Planning d'actions mois par mois avec sprints d'innovation, prototypes à livrer et tests de marché.

Sois créative, méthodique et orientée mise en marché. Pousse le client à sortir du cadre.`,
  },
  {
    agentId: 'sarah-international',
    icon: '🌍',
    color: '#0284c7',
    shortLabel: 'International',
    title: 'Plan Expansion Internationale',
    subtitle: 'Conquérez de nouveaux marchés à l\'international',
    reassurance: `${agent('sarah-international').name} utilisera ces infos pour structurer votre expansion internationale et anticiper les défis culturels et réglementaires.`,
    fields: [
      {
        key: 'targetMarkets',
        label: 'Marchés cibles pour l\'expansion',
        placeholder: '',
        type: 'chips',
        options: ['Europe de l\'Ouest', 'Europe de l\'Est', 'Amérique du Nord', 'Amérique latine', 'Afrique du Nord', 'Afrique subsaharienne', 'Moyen-Orient', 'Asie-Pacifique'],
      },
      {
        key: 'currentInternationalPresence',
        label: 'Présence internationale actuelle',
        placeholder: '',
        type: 'select',
        options: ['Aucune (100% domestique)', 'Export occasionnel', 'Export régulier (quelques pays)', 'Filiales à l\'étranger', 'Présence mondiale'],
      },
      {
        key: 'entryModePreference',
        label: 'Mode d\'entrée privilégié',
        placeholder: '',
        type: 'select',
        options: ['Export direct', 'Distributeur / Agent local', 'Licence / Franchise', 'Joint-venture', 'Filiale propre', 'Acquisition', 'Je ne sais pas encore'],
        hint: `${agent('sarah-international').name} analysera le meilleur mode d'entrée pour chaque marché.`,
      },
      {
        key: 'culturalChallenges',
        label: 'Défis culturels et linguistiques anticipés',
        placeholder: 'Ex: Barrière de la langue, différences de négociation, adaptation produit...',
        type: 'textarea',
        advanced: true,
      },
      {
        key: 'regulatoryConcerns',
        label: 'Préoccupations réglementaires',
        placeholder: '',
        type: 'chips',
        options: ['Douanes / Tarifs', 'Fiscalité locale', 'Normes produit', 'Protection des données', 'Droit du travail', 'Licences / Autorisations', 'Sanctions / Embargo'],
        advanced: true,
      },
    ],
    promptTemplate: `Tu es ${agent('sarah-international').name}, ${agent('sarah-international').role}. Le client a défini son contexte international :
- Marchés cibles : {targetMarkets}
- Présence actuelle : {currentInternationalPresence}
- Mode d'entrée : {entryModePreference}
- Défis culturels : {culturalChallenges}
- Préoccupations réglementaires : {regulatoryConcerns}

{companyContext}

Génère un plan d'expansion internationale structuré avec :

## 1. ANALYSE PESTEL
Analyse PESTEL (Politique, Économique, Socioculturel, Technologique, Écologique, Légal) des marchés cibles avec scoring d'attractivité.

## 2. STRATÉGIE D'ENTRÉE
Recommandation de mode d'entrée par marché (export, licence, JV, filiale) selon le modèle Uppsala, avec avantages/risques et Incoterms adaptés.

## 3. ADAPTATION CULTURELLE
Plan d'adaptation selon les 6 dimensions de Hofstede (distance hiérarchique, individualisme, masculinité, incertitude, orientation long terme, indulgence) avec impacts sur le produit, le marketing et le management.

## 4. CONFORMITÉ RÉGLEMENTAIRE
Checklist réglementaire par marché : fiscalité internationale (prix de transfert, conventions fiscales), douanes, normes produit et protection des données.

## 5. ORGANISATION & RESSOURCES
Structure organisationnelle recommandée, profils à recruter, partenaires locaux et budget d'expansion estimé.

## 6. ROADMAP INTERNATIONALE 3 MOIS
Plan de déploiement mois par mois avec jalons, livrables et critères de succès par marché.

Sois stratège, culturellement sensible et pragmatique. Adapte les recommandations aux spécificités de chaque marché.`,
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
