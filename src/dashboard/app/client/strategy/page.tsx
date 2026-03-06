'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserData } from '../../../lib/use-user-data';
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
  advanced?: boolean;
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
  [key: string]: unknown;
  strategies: Partial<Record<AgentTypeId, SavedStrategy>>;
  version: number;
}

interface ProjectObjective {
  title: string;
  description: string;
  deadline: string;
  priority: 'haute' | 'moyenne' | 'basse';
  status: 'en_cours' | 'en_pause' | 'termine';
  createdAt: string;
}

interface ActionFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  notes: string;
  createdAt: string;
}

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  uploadedAt: string;
}

interface ConversationSummary {
  date: string;
  agent: string;
  summary: string;
  keyPoints: string[];
}

interface ProjectData {
  [key: string]: unknown;
  objective: ProjectObjective;
  folders: ActionFolder[];
  documents: ProjectDocument[];
  conversations: ConversationSummary[];
  notes: string;
}

/* ═══════════════════════════════════════════
   Strategy definitions per agent
   ═══════════════════════════════════════════ */

const AGENT_STRATEGIES: AgentStrategyDef[] = [
  {
    agentId: 'fz-marketing',
    icon: 'bar_chart',
    color: '#ec4899',
    shortLabel: 'Marketing',
    title: 'Stratégie Marketing',
    subtitle: 'Définissez votre présence digitale et vos objectifs marketing',
    reassurance: `Remplissez ça une seule fois — ${agent('fz-marketing').name} s'en sert à chaque échange pour créer du contenu adapté à votre marque !`,
    fields: [
      { key: 'networks', label: 'Sur quels réseaux êtes-vous présent ?', placeholder: '', type: 'chips', options: ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Twitter/X', 'YouTube', 'Pinterest', 'Newsletter'], hint: `${agent('fz-marketing').name} adaptera ses suggestions de contenu à ces plateformes.` },
      { key: 'postFrequency', label: 'Combien de publications par semaine ?', placeholder: '', type: 'select', options: ['1-2 par semaine', '3-5 par semaine', '1 par jour', '2+ par jour', 'Je ne sais pas encore'] },
      { key: 'tone', label: 'Quel ton pour votre communication ?', placeholder: '', type: 'chips', options: ['Professionnel', 'Décontracté', 'Inspirant', 'Éducatif', 'Humoristique', 'Premium', 'Authentique'] },
      { key: 'targetAudience', label: 'Qui est votre audience cible ?', placeholder: 'Ex: Dirigeants PME 35-55 ans, secteur tech...', type: 'textarea' },
      { key: 'goals', label: 'Vos 3 objectifs marketing principaux ?', placeholder: 'Ex: Augmenter la notoriété, générer des leads, fidéliser...', type: 'textarea', advanced: true },
      { key: 'existingContent', label: 'Avez-vous déjà du contenu ?', placeholder: 'Blog, newsletter, videos... Décrivez ce qui existe', type: 'textarea', hint: `${agent('fz-marketing').name} pourra s'appuyer sur ce qui marche déjà.`, advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-marketing').name}, ${agent('fz-marketing').role}. Le client a défini sa stratégie marketing :\n- Réseaux : {networks}\n- Fréquence : {postFrequency}\n- Ton : {tone}\n- Audience : {targetAudience}\n- Objectifs : {goals}\n- Contenu existant : {existingContent}\n\n{companyContext}\n\nGénère un plan d'action marketing complet et structuré avec :\n\n## 1. CALENDRIER EDITORIAL\nPlanning semaine type avec les jours et types de contenu par réseau.\n\n## 2. STRATÉGIE DE CONTENU\npiliers de contenu recommandés avec exemples concrets de publications.\n\n## 3. ACTIONS PRIORITAIRES\nLes 5 premières actions à faire cette semaine, classées par impact.\n\n## 4. MÉTRIQUES À SUIVRE\nLes KPIs à tracker avec objectifs chiffrés réalistes.\n\n## 5. TIMELINE 3 MOIS\nPlanning mois par mois avec jalons et objectifs.\n\nSois concrète, actionnable et adaptée au contexte du client. Utilise des exemples précis.`,
  },
  {
    agentId: 'fz-finance',
    icon: 'savings',
    color: '#f59e0b',
    shortLabel: 'Finance',
    title: 'Stratégie Financière',
    subtitle: 'Maîtrisez vos finances et optimisez votre rentabilité',
    reassurance: `Ces infos sont confidentielles et aident ${agent('fz-finance').name} à vous donner des conseils financiers sur mesure.`,
    fields: [
      { key: 'revenue', label: 'Chiffre d\'affaires actuel (annuel)', placeholder: 'Ex: 500K EUR, 2M EUR...', type: 'input' },
      { key: 'mainExpenses', label: 'Vos 3 postes de dépenses principaux', placeholder: 'Ex: Salaires (60%), Marketing (15%), Outils/SaaS (10%)...', type: 'textarea' },
      { key: 'financialGoal', label: 'Votre objectif financier à 12 mois', placeholder: 'Ex: Doubler le CA, atteindre la rentabilite, lever des fonds...', type: 'textarea' },
      { key: 'cashflow', label: 'Situation de trésorerie', placeholder: '', type: 'select', options: ['Confortable (6+ mois)', 'Correcte (3-6 mois)', 'Tendue (1-3 mois)', 'Critique (< 1 mois)', 'Je ne sais pas'] },
      { key: 'painPoints', label: 'Vos défis financiers actuels', placeholder: 'Ex: Recouvrement lent, marges faibles, depenses non controlees...', type: 'textarea', advanced: true },
      { key: 'tools', label: 'Outils de gestion utilises', placeholder: 'Ex: Excel, QuickBooks, Pennylane, aucun...', type: 'input', hint: `${agent('fz-finance').name} pourra recommander des améliorations ou alternatives.`, advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-finance').name}, ${agent('fz-finance').role}. Le client a défini son contexte financier :\n- CA actuel : {revenue}\n- Dépenses principales : {mainExpenses}\n- Objectif 12 mois : {financialGoal}\n- Trésorerie : {cashflow}\n- Défis : {painPoints}\n- Outils : {tools}\n\n{companyContext}\n\nGénère un plan financier structuré avec :\n\n## 1. DIAGNOSTIC\nAnalyse de la situation financière actuelle (forces/faiblesses).\n\n## 2. BUDGET OPTIMISÉ\nRecommandations d'allocation par poste avec pourcentages cibles.\n\n## 3. PLAN DE TRÉSORERIE\nActions pour sécuriser le cash sur 6 mois.\n\n## 4. QUICK WINS\n5 optimisations rapides à mettre en place cette semaine.\n\n## 5. OBJECTIFS CHIFFRÉS\nKPIs financiers avec cibles mensuelles sur 12 mois.\n\n## 6. TIMELINE 3 MOIS\nPlanning d'actions mois par mois.\n\nSois précis, chiffré et pragmatique.`,
  },
  {
    agentId: 'fz-assistante',
    icon: 'assignment',
    color: '#5b6cf7',
    shortLabel: 'Organisation',
    title: 'Stratégie Organisation',
    subtitle: 'Optimisez votre quotidien et gagnez du temps',
    reassurance: `Dites à ${agent('fz-assistante').name} comment vous travaillez — elle trouvera les meilleurs moyens de vous simplifier la vie !`,
    fields: [
      { key: 'dailyTasks', label: 'À quoi ressemble votre journée type ?', placeholder: 'Ex: Matin: emails + reunions. Aprem: travail de fond. Soir: suivi...', type: 'textarea' },
      { key: 'tools', label: 'Quels outils utilisez-vous ?', placeholder: '', type: 'chips', options: ['Gmail', 'Outlook', 'Slack', 'Teams', 'Notion', 'Trello', 'Asana', 'Google Calendar', 'WhatsApp', 'Zoom'] },
      { key: 'painPoints', label: 'Qu\'est-ce qui vous fait perdre le plus de temps ?', placeholder: 'Ex: Trop d\'emails, reunions inutiles, taches repetitives...', type: 'textarea' },
      { key: 'teamSize', label: 'Taille de votre équipe', placeholder: '', type: 'select', options: ['Solo', '2-5 personnes', '6-15 personnes', '16-50 personnes', '50+'] },
      { key: 'priorities', label: 'Vos 3 priorites d\'organisation', placeholder: 'Ex: Mieux gérer mon agenda, déléguer plus, automatiser le reporting...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-assistante').name}, ${agent('fz-assistante').role}. Le client a défini son quotidien :\n- Journee type : {dailyTasks}\n- Outils : {tools}\n- Pertes de temps : {painPoints}\n- Équipe : {teamSize}\n- Priorités : {priorities}\n\n{companyContext}\n\nGénère un plan d'organisation structuré avec :\n\n## 1. AUDIT TEMPS\nOù le client perd du temps (analyse des frictions).\n\n## 2. WORKFLOW OPTIMISÉ\nRoutine quotidienne idéale heure par heure.\n\n## 3. AUTOMATISATIONS\n5 tâches à automatiser avec les outils recommandés.\n\n## 4. TEMPLATES UTILES\n3 templates prêt-à-l'emploi (email, reunion, reporting).\n\n## 5. ACTIONS IMMEDIATES\n3 changements à faire dès aujourd'hui.\n\n## 6. PLANNING SEMAINE\nStructure type d'une semaine optimisée.\n\nSois pratique, concrète et adaptée aux outils du client.`,
  },
  {
    agentId: 'fz-dg',
    icon: 'verified',
    color: '#8b7cf8',
    shortLabel: 'Strategie',
    title: 'Strategie d\'Entreprise',
    subtitle: 'Définissez votre cap et accélérez votre croissance',
    reassurance: `Ces informations stratégiques permettent à ${agent('fz-dg').name} de vous accompagner comme une vraie DG.`,
    fields: [
      { key: 'stage', label: 'Stade de votre entreprise', placeholder: '', type: 'select', options: ['Idee / Pre-lancement', 'MVP / Premiers clients', 'Product-market fit', 'Croissance', 'Scale-up', 'Entreprise etablie'] },
      { key: 'fundingNeeds', label: 'Besoin de financement ?', placeholder: '', type: 'select', options: ['Non, autofinance', 'Oui, en recherche', 'En cours de levee', 'Deja finance', 'Subventions uniquement'] },
      { key: 'growthTargets', label: 'Vos objectifs de croissance a 12 mois', placeholder: 'Ex: Doubler le CA, passer de 10 a 30 clients, lancer un 2e produit...', type: 'textarea' },
      { key: 'biggestChallenge', label: 'Votre plus grand défi actuel', placeholder: 'Ex: Trouver les bons talents, pivoter le business model, se différencier...', type: 'textarea' },
      { key: 'competitiveAdvantage', label: 'Votre avantage concurrentiel', placeholder: 'Ex: Technologie propriétaire, équipe experte, premier sur le marché...', type: 'textarea', advanced: true },
      { key: 'vision', label: 'Ou voyez-vous votre entreprise dans 3 ans ?', placeholder: 'Décrivez votre vision...', type: 'textarea', hint: `${agent('fz-dg').name} utilisera cette vision pour aligner toutes ses recommandations stratégiques.`, advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-dg').name}, ${agent('fz-dg').role}. Le client a défini sa situation stratégique :\n- Stade : {stage}\n- Financement : {fundingNeeds}\n- Objectifs 12 mois : {growthTargets}\n- Plus grand défi : {biggestChallenge}\n- Avantage concurrentiel : {competitiveAdvantage}\n- Vision 3 ans : {vision}\n\n{companyContext}\n\nGénère un plan stratégique structuré avec :\n\n## 1. ANALYSE STRATÉGIQUE\nPositionnement actuel, forces/faiblesses/opportunites/menaces (SWOT).\n\n## 2. CAP STRATÉGIQUE\nLes 3 axes prioritaires pour les 12 prochains mois.\n\n## 3. PLAN DE CROISSANCE\nÉtapes concrètes trimestre par trimestre.\n\n## 4. RISQUES & MITIGATIONS\nLes 3 risques majeurs et comment les anticiper.\n\n## 5. RESSOURCES NÉCESSAIRES\nÉquipe, budget, outils, partenaires.\n\n## 6. MILESTONES\nLes 5 jalons clés avec dates cibles.\n\nSois visionnaire mais pragmatique. Donne des exemples concrets adaptes au stade de l'entreprise.`,
  },
  {
    agentId: 'fz-dev',
    icon: 'terminal',
    color: '#3b82f6',
    shortLabel: 'Tech',
    title: 'Stratégie Technique',
    subtitle: 'Structurez votre stack et votre roadmap tech',
    reassurance: `${agent('fz-dev').name} CTO analyse votre setup technique et recommande les meilleures pratiques.`,
    fields: [
      { key: 'techStack', label: 'Votre stack technique actuelle', placeholder: '', type: 'chips', options: ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'PHP/Laravel', 'Java', 'Go', 'WordPress', 'No-code', 'Mobile natif', 'Flutter'] },
      { key: 'teamSize', label: 'Taille de l\'equipe tech', placeholder: '', type: 'select', options: ['Solo dev', '2-3 devs', '4-8 devs', '9-20 devs', '20+ devs', 'Pas d\'equipe tech'] },
      { key: 'infrastructure', label: 'Hébergement / Infrastructure', placeholder: '', type: 'chips', options: ['AWS', 'GCP', 'Azure', 'Vercel', 'Heroku', 'OVH', 'Scaleway', 'Docker', 'Kubernetes', 'Serveur dédié'] },
      { key: 'painPoints', label: 'Vos défis techniques actuels', placeholder: 'Ex: Performance lente, dette technique, pas de CI/CD, bugs récurrents...', type: 'textarea' },
      { key: 'nextFeature', label: 'Prochaine fonctionnalité ou projet technique', placeholder: 'Ex: Refonte frontend, migration cloud, API publique, app mobile...', type: 'textarea', advanced: true },
      { key: 'securityLevel', label: 'Niveau de sécurité requis', placeholder: '', type: 'select', options: ['Standard', 'Données sensibles (RGPD)', 'Fintech / Paiements', 'Santé / HDS', 'Defense / Critique'], advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-dev').name}, ${agent('fz-dev').role} (CTO). Le client a défini son contexte technique :\n- Stack : {techStack}\n- Equipe : {teamSize}\n- Infrastructure : {infrastructure}\n- Défis : {painPoints}\n- Prochain projet : {nextFeature}\n- Sécurité : {securityLevel}\n\n{companyContext}\n\nGénère une roadmap technique structurée avec :\n\n## 1. AUDIT TECHNIQUE\nAnalyse de la stack actuelle (points forts, dette technique, risques).\n\n## 2. ARCHITECTURE RECOMMANDÉE\nAjustements proposés avec justification.\n\n## 3. ROADMAP TECHNIQUE\nPlanning sur 3 mois avec sprints.\n\n## 4. BONNES PRATIQUES\n5 pratiques à adopter immédiatement (CI/CD, testing, monitoring...).\n\n## 5. SÉCURITÉ\nRecommandations sécurité adaptées au niveau requis.\n\n## 6. STACK RECOMMANDATIONS\nOutils et services a ajouter ou remplacer.\n\nSois précis, technique et pragmatique. Adapte tes recommandations à la taille de l'équipe.`,
  },
  {
    agentId: 'fz-repondeur',
    icon: 'call',
    color: '#22c55e',
    shortLabel: 'Service Client',
    title: 'Stratégie Service Client',
    subtitle: 'Construisez un service client qui fidélise',
    reassurance: `${agent('fz-repondeur').name} utilisera ces infos pour répondre exactement comme vous le souhaitez à vos clients.`,
    fields: [
      { key: 'productService', label: 'Décrivez votre produit/service en 2-3 phrases', placeholder: 'Ex: SaaS de gestion de projet pour PME, abonnement mensuel 49 EUR...', type: 'textarea' },
      { key: 'commonQuestions', label: 'Les 5 questions les plus fréquentes de vos clients', placeholder: 'Ex: Comment ca marche ? Quels sont les tarifs ? Comment annuler ?...', type: 'textarea' },
      { key: 'responseStyle', label: 'Ton de réponse souhaité', placeholder: '', type: 'chips', options: ['Formel et professionnel', 'Amical et chaleureux', 'Direct et efficace', 'Pédagogique', 'Premium et soigné'] },
      { key: 'channels', label: 'Canaux de support actuels', placeholder: '', type: 'chips', options: ['Email', 'Telephone', 'WhatsApp', 'Chat en ligne', 'Réseaux sociaux', 'Formulaire web'] },
      { key: 'availability', label: 'Horaires de disponibilité', placeholder: '', type: 'select', options: ['24/7', 'Jours ouvrables (9h-18h)', 'Jours ouvrables (8h-20h)', 'Lun-Sam', 'Variable'], advanced: true },
      { key: 'escalation', label: 'Quand faut-il escalader à un humain ?', placeholder: 'Ex: Réclamations, remboursements > 100 EUR, problèmes techniques complexes...', type: 'textarea', hint: `${agent('fz-repondeur').name} saura quand vous passer la main.`, advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-repondeur').name}, ${agent('fz-repondeur').role}. Le client a défini son service client :\n- Produit/Service : {productService}\n- Questions fréquentes : {commonQuestions}\n- Ton : {responseStyle}\n- Canaux : {channels}\n- Horaires : {availability}\n- Escalade : {escalation}\n\n{companyContext}\n\nGénère un plan service client structuré avec :\n\n## 1. FAQ COMPLÈTE\nRéponses types aux 10 questions les plus courantes.\n\n## 2. SCRIPTS DE RÉPONSE\n5 templates de réponse pour situations types (bienvenue, réclamation, question technique, suivi, clôture).\n\n## 3. WORKFLOW ESCALADE\nArbre de décision pour savoir quand et comment escalader a un humain.\n\n## 4. MESSAGE D'ACCUEIL\nProposition de message d'accueil multicanal.\n\n## 5. MÉTRIQUES\nKPIs de service client à suivre (temps de réponse, satisfaction, résolution).\n\n## 6. ACTIONS IMMÉDIATES\n3 choses à mettre en place cette semaine.\n\nSois concrète et adaptée au produit du client. Propose des réponses prêt-à-l'emploi.`,
  },
  {
    agentId: 'fz-commercial',
    icon: 'handshake',
    color: '#f97316',
    shortLabel: 'Commercial',
    title: 'Stratégie Commerciale',
    subtitle: 'Structurez votre pipeline et boostez vos ventes',
    reassurance: `${agent('fz-commercial').name} utilisera ces infos pour qualifier vos leads et préparer vos pitchs de vente.`,
    fields: [
      { key: 'salesCycle', label: 'Votre cycle de vente moyen', placeholder: '', type: 'select', options: ['< 1 semaine', '1-4 semaines', '1-3 mois', '3-6 mois', '6+ mois'] },
      { key: 'targetClients', label: 'Vos clients cibles', placeholder: 'Ex: PME tech 50-200 employés, budget 10-50K...', type: 'textarea' },
      { key: 'currentPipeline', label: 'État actuel de votre pipeline', placeholder: 'Ex: 20 leads, 5 en négociation, 2 en closing...', type: 'textarea' },
      { key: 'conversionRate', label: 'Taux de conversion actuel', placeholder: '', type: 'select', options: ['< 5%', '5-10%', '10-20%', '20-40%', '> 40%', 'Je ne sais pas'] },
      { key: 'channels', label: 'Canaux de prospection', placeholder: '', type: 'chips', options: ['Cold email', 'LinkedIn', 'Appels', 'Salons', 'Inbound', 'Partenaires', 'Bouche-à-oreille'], advanced: true },
      { key: 'challenges', label: 'Vos défis commerciaux', placeholder: 'Ex: Pas assez de leads, closing difficile...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-commercial').name}, ${agent('fz-commercial').role}. Le client a défini son contexte commercial :\n- Cycle de vente : {salesCycle}\n- Clients cibles : {targetClients}\n- Pipeline : {currentPipeline}\n- Taux de conversion : {conversionRate}\n- Canaux : {channels}\n- Défis : {challenges}\n\n{companyContext}\n\nGénère un plan commercial structuré avec :\n\n## 1. DIAGNOSTIC COMMERCIAL\nAnalyse du pipeline et du processus de vente actuel.\n\n## 2. STRATÉGIE DE PROSPECTION\nPlan de prospection multi-canal avec actions concrètes.\n\n## 3. PIPELINE OPTIMISÉ\nStructure du pipeline idéal avec étapes et critères de qualification.\n\n## 4. SCRIPTS & TEMPLATES\n3 scripts prêts à l'emploi (email de prospection, pitch téléphonique, relance).\n\n## 5. KPIs COMMERCIAUX\nMétriques à suivre avec objectifs chiffrés.\n\n## 6. PLAN D'ACTION 90 JOURS\nActions semaine par semaine pour les 3 prochains mois.\n\nSois concret, orienté résultats et adapté au contexte du client.`,
  },
  {
    agentId: 'fz-rh',
    icon: 'group',
    color: '#14b8a6',
    shortLabel: 'RH',
    title: 'Stratégie RH',
    subtitle: 'Attirez, développez et fidélisez vos talents',
    reassurance: `${agent('fz-rh').name} s'appuiera sur ces infos pour vous accompagner dans la gestion de vos équipes.`,
    fields: [
      { key: 'teamSize', label: 'Taille actuelle de l\'équipe', placeholder: '', type: 'select', options: ['1-5', '6-15', '16-50', '51-100', '100+'] },
      { key: 'hiringNeeds', label: 'Postes à pourvoir (6 prochains mois)', placeholder: 'Ex: 2 devs, 1 commercial, 1 marketing...', type: 'textarea' },
      { key: 'challenges', label: 'Vos défis RH actuels', placeholder: 'Ex: Turnover élevé, difficulté à recruter...', type: 'textarea' },
      { key: 'culture', label: 'Valeurs et culture d\'entreprise', placeholder: 'Ex: Innovation, bienveillance, performance...', type: 'textarea' },
      { key: 'tools', label: 'Outils RH utilises', placeholder: '', type: 'chips', options: ['LinkedIn Recruiter', 'Welcome to the Jungle', 'ATS', 'SIRH', 'Aucun'], advanced: true },
      { key: 'priorities', label: 'Vos 3 priorités RH', placeholder: 'Ex: Améliorer l\'onboarding, réduire le turnover...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-rh').name}, DRH. Le client a défini son contexte RH :\n- Équipe : {teamSize}\n- Recrutements prévus : {hiringNeeds}\n- Défis : {challenges}\n- Culture : {culture}\n- Outils : {tools}\n- Priorités : {priorities}\n\n{companyContext}\n\nGénère un plan RH structuré avec :\n\n## 1. AUDIT RH\nAnalyse de la situation actuelle (forces et axes d'amélioration).\n\n## 2. PLAN DE RECRUTEMENT\nStratégie de recrutement pour les 6 prochains mois.\n\n## 3. ONBOARDING\nProcessus d'intégration structuré pour les nouveaux.\n\n## 4. DÉVELOPPEMENT DES TALENTS\nPlan de formation et de montée en compétences.\n\n## 5. RETENTION & ENGAGEMENT\nActions pour fidéliser et motiver les équipes.\n\n## 6. TIMELINE 3 MOIS\nPlanning d'actions prioritaires mois par mois.\n\nSois concret, humain et adapté à la taille de l'équipe.`,
  },
  {
    agentId: 'fz-communication',
    icon: 'campaign',
    color: '#8b5cf6',
    shortLabel: 'Communication',
    title: 'Stratégie Communication',
    subtitle: 'Construisez une image forte et cohérente',
    reassurance: `${agent('fz-communication').name} utilisera ces infos pour piloter votre image de marque et vos relations médias.`,
    fields: [
      { key: 'currentImage', label: 'Comment décrivez-vous votre image actuelle ?', placeholder: 'Ex: Startup innovante, entreprise traditionnelle...', type: 'textarea' },
      { key: 'targets', label: 'Vos publics cibles', placeholder: '', type: 'chips', options: ['Clients', 'Investisseurs', 'Médias', 'Employés', 'Partenaires', 'Grand public'] },
      { key: 'channels', label: 'Canaux de communication actuels', placeholder: '', type: 'chips', options: ['Site web', 'Blog', 'Newsletter', 'Réseaux sociaux', 'Presse', 'Événements', 'Podcast'] },
      { key: 'goals', label: 'Vos objectifs de communication', placeholder: 'Ex: Augmenter la notoriété, lancer un produit...', type: 'textarea' },
      { key: 'budget', label: 'Budget communication', placeholder: '', type: 'select', options: ['< 5K EUR/an', '5-20K EUR/an', '20-100K EUR/an', '> 100K EUR/an', 'Pas défini'], advanced: true },
      { key: 'tone', label: 'Ton de communication souhaité', placeholder: '', type: 'chips', options: ['Institutionnel', 'Dynamique', 'Humain', 'Expert', 'Inspirant', 'Audacieux'], advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-communication').name}, ${agent('fz-communication').role}. Le client a défini son contexte :\n- Image actuelle : {currentImage}\n- Publics cibles : {targets}\n- Canaux : {channels}\n- Objectifs : {goals}\n- Budget : {budget}\n- Ton : {tone}\n\n{companyContext}\n\nGénère un plan de communication structuré avec :\n\n## 1. DIAGNOSTIC IMAGE\nAnalyse de l'image actuelle et positionnement souhaité.\n\n## 2. MESSAGES CLÉS\nLes 3-5 messages clés à véhiculer selon chaque public.\n\n## 3. PLAN MEDIA\nStratégie médias et relations presse.\n\n## 4. COMMUNICATION INTERNE\nPlan de communication interne pour fédérer les équipes.\n\n## 5. GESTION DE CRISE\nProtocole de communication de crise préparé.\n\n## 6. CALENDRIER 3 MOIS\nPlanning éditorial et événementiel mois par mois.\n\nSois stratégique, créative et cohérente avec l'identité de la marque.`,
  },
  {
    agentId: 'fz-juridique',
    icon: 'balance',
    color: '#64748b',
    shortLabel: 'Juridique',
    title: 'Stratégie Juridique',
    subtitle: 'Sécurisez votre entreprise sur le plan légal',
    reassurance: `${agent('fz-juridique').name} utilisera ces infos pour vous alerter sur les risques et assurer votre conformité.`,
    fields: [
      { key: 'structure', label: 'Forme juridique', placeholder: '', type: 'select', options: ['Auto-entrepreneur', 'SARL/EURL', 'SAS/SASU', 'SA', 'Association', 'Autre'] },
      { key: 'dataHandling', label: 'Gérez-vous des données personnelles ?', placeholder: '', type: 'select', options: ['Oui, beaucoup', 'Oui, quelques-unes', 'Non', 'Je ne suis pas sûr'] },
      { key: 'contracts', label: 'Types de contrats utilises', placeholder: '', type: 'chips', options: ['CGV', 'CGU', 'Contrats clients', 'Contrats fournisseurs', 'NDA', 'Contrats de travail', 'Licences'] },
      { key: 'risks', label: 'Vos préoccupations juridiques', placeholder: 'Ex: Conformité RGPD, protection PI, litiges...', type: 'textarea' },
      { key: 'international', label: 'Activité internationale ?', placeholder: '', type: 'select', options: ['Non, France uniquement', 'Europe', 'International'], advanced: true },
      { key: 'priorities', label: 'Vos 3 priorités juridiques', placeholder: 'Ex: Mettre à jour les CGV, conformité RGPD...', type: 'textarea', advanced: true },
    ],
    promptTemplate: `Tu es ${agent('fz-juridique').name}, ${agent('fz-juridique').role}. Le client a défini son contexte juridique :\n- Structure : {structure}\n- Données personnelles : {dataHandling}\n- Contrats : {contracts}\n- Préoccupations : {risks}\n- International : {international}\n- Priorités : {priorities}\n\n{companyContext}\n\nGénère un plan juridique structuré avec :\n\n## 1. AUDIT DE CONFORMITÉ\nAnalyse des risques juridiques actuels.\n\n## 2. RGPD\nPlan de mise en conformité données personnelles.\n\n## 3. CONTRATS PRIORITAIRES\nListe des contrats à rédiger ou mettre à jour avec priorités.\n\n## 4. PROTECTION PI\nStratégie de protection de la propriété intellectuelle.\n\n## 5. VEILLE JURIDIQUE\nPoints de vigilance et obligations réglementaires.\n\n## 6. PLAN D'ACTION 3 MOIS\nActions juridiques prioritaires mois par mois.\n\nSois précise, pragmatique et orientée PME. Rappelle que tes conseils ne remplacent pas un avocat.`,
  },
];

const STRATEGY_STORAGE_KEY = 'fz_agent_strategies';
const PROJECT_STORAGE_KEY = 'fz_plan_attaque';

const DEFAULT_FOLDERS: ActionFolder[] = [
  { id: 'f-marketing', name: 'Marketing & Comm', icon: 'bar_chart', color: '#ec4899', items: [] },
  { id: 'f-finance', name: 'Finance & Budget', icon: 'savings', color: '#f59e0b', items: [] },
  { id: 'f-tech', name: 'Tech & Produit', icon: 'terminal', color: '#3b82f6', items: [] },
  { id: 'f-commercial', name: 'Commercial & Ventes', icon: 'handshake', color: '#f97316', items: [] },
  { id: 'f-rh', name: 'RH & Recrutement', icon: 'group', color: '#14b8a6', items: [] },
  { id: 'f-juridique', name: 'Juridique & Admin', icon: 'balance', color: '#64748b', items: [] },
  { id: 'f-operations', name: 'Opérations', icon: 'settings', color: '#8b5cf6', items: [] },
  { id: 'f-other', name: 'Divers', icon: 'folder', color: '#5b6cf7', items: [] },
];

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export default function StrategyPage() {
  // ─── Tab state ───
  const [activeTab, setActiveTab] = useState<'dashboard' | 'strategies' | 'folders' | 'documents' | 'history'>('dashboard');

  // ─── Project objective ───
  const [objective, setObjective] = useState<ProjectObjective>({
    title: '', description: '', deadline: '', priority: 'moyenne', status: 'en_cours', createdAt: '',
  });
  const [editingObjective, setEditingObjective] = useState(false);

  // ─── Strategy state ───
  const [activeAgentId, setActiveAgentId] = useState<AgentTypeId>('fz-marketing');
  const { data: allStrategies, setData: setAllStrategies } = useUserData<AllStrategies>('strategy', { strategies: {}, version: 1 }, STRATEGY_STORAGE_KEY);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [strategyViewMode, setStrategyViewMode] = useState<'form' | 'plan'>('form');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const lastFocusedFieldRef = useRef<string>('');

  // ─── Folders ───
  const [folders, setFolders] = useState<ActionFolder[]>(DEFAULT_FOLDERS);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  // ─── Documents ───
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  // ─── Conversation history ───
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState('');

  // ─── Notes ───
  const [projectNotes, setProjectNotes] = useState('');

  // ─── Persistent project data (useUserData handles localStorage + API sync) ───
  const { data: projectDataBlob, setData: setProjectDataBlob } = useUserData<ProjectData>(
    'strategy_project',
    { objective: { title: '', description: '', deadline: '', priority: 'moyenne', status: 'en_cours', createdAt: '' }, folders: DEFAULT_FOLDERS, documents: [], conversations: [], notes: '' },
    PROJECT_STORAGE_KEY,
  );

  const activeStrategy = AGENT_STRATEGIES.find(s => s.agentId === activeAgentId);

  // ─── Load data from hooks on mount ───
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // Strategies — restore derived state from hook data
    const saved = allStrategies.strategies['fz-marketing'];
    if (saved) {
      setFormData(saved.formData);
      if (saved.generatedPlan) setStrategyViewMode('plan');
    }
    // Project data — populate individual state from hook blob
    if (projectDataBlob.objective?.title) setObjective(projectDataBlob.objective);
    if (projectDataBlob.folders?.length) setFolders(projectDataBlob.folders);
    if (projectDataBlob.documents?.length) setDocuments(projectDataBlob.documents);
    if (projectDataBlob.conversations?.length) setConversations(projectDataBlob.conversations);
    if (projectDataBlob.notes) setProjectNotes(projectDataBlob.notes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Save project data (useUserData handles localStorage + API) ───
  function saveProject(overrides?: Partial<ProjectData>) {
    const data: ProjectData = {
      objective: overrides?.objective ?? objective,
      folders: overrides?.folders ?? folders,
      documents: overrides?.documents ?? documents,
      conversations: overrides?.conversations ?? conversations,
      notes: overrides?.notes ?? projectNotes,
    };
    setProjectDataBlob(data);
  }

  // ─── Strategy functions ───
  const switchAgent = useCallback((agentId: AgentTypeId) => {
    setActiveAgentId(agentId);
    setStrategyViewMode('form');
    setShowAdvanced(false);
    setError('');
    const saved = allStrategies.strategies[agentId];
    if (saved) {
      setFormData(saved.formData);
      if (saved.generatedPlan) setStrategyViewMode('plan');
    } else {
      setFormData({});
    }
  }, [allStrategies]);

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
  }

  function updateField(key: string, value: string) {
    const next = { ...formData, [key]: value };
    setFormData(next);
    saveToStorage(next);
  }

  function toggleChip(key: string, chip: string) {
    const current = (formData[key] as string[]) || [];
    const next = current.includes(chip) ? current.filter(c => c !== chip) : [...current, chip];
    const newForm = { ...formData, [key]: next };
    setFormData(newForm);
    saveToStorage(newForm);
  }

  function buildPrompt(): string {
    if (!activeStrategy) return '';
    let prompt = activeStrategy.promptTemplate;
    for (const field of activeStrategy.fields) {
      const val = formData[field.key];
      const display = Array.isArray(val) ? val.join(', ') : (val || 'Non renseigne');
      prompt = prompt.replace(`{${field.key}}`, display);
    }
    let companyCtx = '';
    try {
      const raw = localStorage.getItem('fz_company_profile');
      if (raw) {
        const profile = JSON.parse(raw);
        const parts: string[] = [];
        if (profile.companyName) parts.push(`Entreprise: ${profile.companyName}`);
        if (profile.industry) parts.push(`Secteur: ${profile.industry}`);
        if (profile.mission) parts.push(`Mission: ${profile.mission}`);
        if (profile.targetAudience) parts.push(`Audience: ${profile.targetAudience}`);
        if (profile.strengths) parts.push(`Forces: ${profile.strengths}`);
        if (parts.length > 0) companyCtx = `Contexte entreprise du client :\n${parts.join('\n')}`;
      }
    } catch { /* */ }
    prompt = prompt.replace('{companyContext}', companyCtx);
    return prompt;
  }

  async function generatePlan() {
    setGenerating(true);
    setError('');
    try {
      const raw = localStorage.getItem('fz_session');
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
      setStrategyViewMode('plan');
      // Also save to conversations
      const newConv: ConversationSummary = {
        date: new Date().toISOString(),
        agent: activeStrategy?.title ?? 'Agent',
        summary: `Plan ${activeStrategy?.shortLabel} généré`,
        keyPoints: plan.split('\n').filter((l: string) => l.startsWith('## ')).map((l: string) => l.replace('## ', '')),
      };
      const updatedConvs = [newConv, ...conversations].slice(0, 50);
      setConversations(updatedConvs);
      saveProject({ conversations: updatedConvs });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setGenerating(false);
    }
  }

  async function copyPlan() {
    const plan = allStrategies.strategies[activeAgentId]?.generatedPlan;
    if (!plan) return;
    try { await navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  }

  // ─── Folder functions ───
  function addItemToFolder(folderId: string) {
    if (!newItemTitle.trim()) return;
    const newFolders = folders.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, items: [...f.items, { id: `item-${Date.now()}`, title: newItemTitle.trim(), status: 'todo' as const, notes: '', createdAt: new Date().toISOString() }] };
    });
    setFolders(newFolders);
    setNewItemTitle('');
    saveProject({ folders: newFolders });
  }

  function toggleItemStatus(folderId: string, itemId: string) {
    const newFolders = folders.map(f => {
      if (f.id !== folderId) return f;
      return {
        ...f,
        items: f.items.map(item => {
          if (item.id !== itemId) return item;
          const next = item.status === 'todo' ? 'doing' : item.status === 'doing' ? 'done' : 'todo';
          return { ...item, status: next as 'todo' | 'doing' | 'done' };
        }),
      };
    });
    setFolders(newFolders);
    saveProject({ folders: newFolders });
  }

  function deleteItem(folderId: string, itemId: string) {
    const newFolders = folders.map(f => {
      if (f.id !== folderId) return f;
      return { ...f, items: f.items.filter(item => item.id !== itemId) };
    });
    setFolders(newFolders);
    saveProject({ folders: newFolders });
  }

  // ─── Document functions ───
  function addDocument() {
    if (!uploadName.trim() || !uploadContent.trim()) return;
    const doc: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name: uploadName.trim(),
      type: 'text',
      content: uploadContent.trim(),
      uploadedAt: new Date().toISOString(),
    };
    const newDocs = [...documents, doc];
    setDocuments(newDocs);
    setShowUpload(false);
    setUploadName('');
    setUploadContent('');
    saveProject({ documents: newDocs });
  }

  function deleteDocument(docId: string) {
    const newDocs = documents.filter(d => d.id !== docId);
    setDocuments(newDocs);
    saveProject({ documents: newDocs });
  }

  async function analyzeDocument(doc: ProjectDocument) {
    setAnalyzing(true);
    setAnalysisResult('');
    try {
      const raw = localStorage.getItem('fz_session');
      if (!raw) return;
      const session = JSON.parse(raw);
      const objectiveCtx = objective.title ? `\nObjectif du projet : ${objective.title}\nDescription : ${objective.description}` : '';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Analyse ce document dans le contexte de notre plan d'attaque.${objectiveCtx}\n\nDocument "${doc.name}" :\n${doc.content}\n\nFais une analyse structurée :\n1. RÉSUMÉ (3 lignes max)\n2. POINTS CLÉS extraits\n3. ACTIONS SUGGÉRÉES pour notre objectif\n4. RISQUES OU ALERTES éventuels` }],
          maxTokens: 2048,
          agentName: 'fz-assistante',
        }),
      });
      const data = await res.json();
      setAnalysisResult(data.content || data.message || 'Analyse indisponible');
    } catch {
      setAnalysisResult('Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  }

  // ─── Synthesis ───
  async function generateSynthesis() {
    setSynthesizing(true);
    setSynthesis('');
    try {
      const raw = localStorage.getItem('fz_session');
      if (!raw) return;
      const session = JSON.parse(raw);

      // Gather all generated plans
      const plans: string[] = [];
      for (const strat of AGENT_STRATEGIES) {
        const saved = allStrategies.strategies[strat.agentId];
        if (saved?.generatedPlan) {
          plans.push(`=== ${strat.title} ===\n${saved.generatedPlan.substring(0, 800)}...`);
        }
      }

      // Gather folder items
      const folderSummary = folders.filter(f => f.items.length > 0).map(f =>
        `${f.name}: ${f.items.length} actions (${f.items.filter(i => i.status === 'done').length} terminées)`
      ).join('\n');

      const objectiveCtx = objective.title ? `Objectif : ${objective.title}\nDescription : ${objective.description}\nDélai : ${objective.deadline || 'Non défini'}\nPriorité : ${objective.priority}` : 'Pas d\'objectif défini';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Tu es un directeur stratégique. Fais une synthèse complète de l'état de notre projet.\n\n${objectiveCtx}\n\n--- Plans générés ---\n${plans.length > 0 ? plans.join('\n\n') : 'Aucun plan généré'}\n\n--- Actions en cours ---\n${folderSummary || 'Aucune action enregistrée'}\n\n--- Documents ---\n${documents.length} document(s) téléchargé(s)\n\nGénère :\n## SYNTHÈSE GLOBALE\nOù en sommes-nous ? (3-5 lignes)\n\n## AVANCÉES CLÉS\nCe qui a été fait / décidé.\n\n## PROCHAINES ÉTAPES PRIORITAIRES\nLes 5 actions les plus urgentes.\n\n## POINTS DE VIGILANCE\nRisques ou blocages potentiels.\n\n## SCORE DE PROGRESSION\nEstimation du % d'avancement global.` }],
          maxTokens: 3000,
          agentName: 'fz-dg',
        }),
      });
      const data = await res.json();
      setSynthesis(data.content || data.message || 'Synthèse indisponible');
    } catch {
      setSynthesis('Erreur lors de la génération de synthèse');
    } finally {
      setSynthesizing(false);
    }
  }

  // ─── Helpers ───
  function renderPlan(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="font-bold" style={{ fontSize: 15, color: 'var(--accent)', marginTop: 20, marginBottom: 8 }}>{line.replace('## ', '')}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-md font-bold" style={{ marginTop: 12, marginBottom: 4 }}>{line.replace('### ', '')}</h4>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="text-md text-secondary" style={{ paddingLeft: 16, lineHeight: 1.6 }}>• {line.slice(2)}</div>;
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} className="text-md font-bold mt-8">{line.replace(/\*\*/g, '')}</div>;
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} className="text-md text-secondary" style={{ lineHeight: 1.6 }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} style={{ color: 'var(--text-primary)' }}>{part.replace(/\*\*/g, '')}</strong>;
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

  // Dashboard stats
  const totalActions = folders.reduce((sum, f) => sum + f.items.length, 0);
  const doneActions = folders.reduce((sum, f) => sum + f.items.filter(i => i.status === 'done').length, 0);
  const doingActions = folders.reduce((sum, f) => sum + f.items.filter(i => i.status === 'doing').length, 0);
  const plansGenerated = AGENT_STRATEGIES.filter(s => allStrategies.strategies[s.agentId]?.generatedPlan).length;
  const progressPct = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

  const TABS = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: 'bar_chart' },
    { id: 'strategies' as const, label: 'Stratégies', icon: 'target' },
    { id: 'folders' as const, label: 'Dossiers', icon: 'folder' },
    { id: 'documents' as const, label: 'Documents', icon: 'description' },
    { id: 'history' as const, label: 'Historique IA', icon: 'chat' },
  ];

  return (
    <div className="client-page-scrollable">
      {/* ─── Header ─── */}
      <div className="page-header">
        <h1 className="page-title">Plan d&apos;Attaque</h1>
        <p className="page-subtitle">
          Votre centre de commandement. Définissez votre objectif, pilotez vos <span className="fz-logo-word">stratégies</span>, organisez vos actions.
        </p>
      </div>

      {/* ─── Objective Banner ─── */}
      <div className="card mb-20" style={{
        padding: 20,
        background: objective.title ? 'linear-gradient(135deg, #5b6cf708, #8b7cf808)' : 'var(--bg-secondary)',
        border: objective.title ? '1px solid var(--accent)' : '1px dashed var(--border-secondary)',
      }}>
        {!objective.title && !editingObjective ? (
          <button
            onClick={() => setEditingObjective(true)}
            className="w-full text-md text-accent font-semibold pointer"
            style={{ padding: '12px 0', background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}
          >
            + Définir votre objectif principal
          </button>
        ) : editingObjective ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="text-md font-bold" style={{ color: 'var(--accent)' }}>Votre objectif</div>
            <input
              className="input w-full"
              placeholder="Ex: Lancer notre produit SaaS en 3 mois"
              value={objective.title}
              onChange={e => setObjective(prev => ({ ...prev, title: e.target.value }))}
              style={{ fontSize: 15, fontWeight: 700 }}
            />
            <textarea
              className="input w-full"
              placeholder="Décrivez votre objectif en détail : contexte, résultat attendu, contraintes..."
              value={objective.description}
              onChange={e => setObjective(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            />
            <div className="flex gap-8 flex-wrap">
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: 4 }}>Échéance</label>
                <input
                  className="input w-full"
                  type="date"
                  value={objective.deadline}
                  onChange={e => setObjective(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="text-xs font-semibold text-muted" style={{ display: 'block', marginBottom: 4 }}>Priorité</label>
                <div className="flex gap-6">
                  {(['haute', 'moyenne', 'basse'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setObjective(prev => ({ ...prev, priority: p }))}
                      className="rounded-full text-xs pointer"
                      style={{
                        padding: '4px 12px', fontFamily: 'var(--font-sans)',
                        fontWeight: objective.priority === p ? 700 : 500,
                        background: objective.priority === p ? (p === 'haute' ? '#ef444420' : p === 'moyenne' ? '#f59e0b20' : '#22c55e20') : 'var(--bg-primary)',
                        color: objective.priority === p ? (p === 'haute' ? '#ef4444' : p === 'moyenne' ? '#f59e0b' : '#22c55e') : 'var(--text-tertiary)',
                        border: `1px solid ${objective.priority === p ? 'currentColor' : 'var(--border-secondary)'}`,
                      }}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const updated = { ...objective, createdAt: objective.createdAt || new Date().toISOString() };
                  setObjective(updated);
                  setEditingObjective(false);
                  saveProject({ objective: updated });
                }}
              >
                Enregistrer
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingObjective(false)}>Annuler</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-8 mb-4">
              <span style={{ fontSize: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>target</span></span>
              <div className="text-lg font-bold" style={{ flex: 1 }}>{objective.title}</div>
              <button
                onClick={() => setEditingObjective(true)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                Modifier
              </button>
            </div>
            {objective.description && <p className="text-sm text-secondary mb-8" style={{ lineHeight: 1.5 }}>{objective.description}</p>}
            <div className="flex gap-8 flex-wrap text-xs">
              {objective.deadline && (
                <span className="badge" style={{ background: 'var(--bg-primary)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>calendar_month</span> {new Date(objective.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              <span className="badge" style={{
                background: objective.priority === 'haute' ? '#ef444415' : objective.priority === 'moyenne' ? '#f59e0b15' : '#22c55e15',
                color: objective.priority === 'haute' ? '#ef4444' : objective.priority === 'moyenne' ? '#f59e0b' : '#22c55e',
              }}>
                Priorité {objective.priority}
              </span>
              <span className="badge badge-success">{progressPct}% avancé</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--border-primary)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -2, fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
         TAB: TABLEAU DE BORD
         ═══════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{progressPct}%</div>
              <div className="text-xs text-muted">Progression globale</div>
              <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{doneActions}</div>
              <div className="text-xs text-muted">Actions terminées</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{doingActions}</div>
              <div className="text-xs text-muted">En cours</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-tertiary)' }}>{totalActions - doneActions - doingActions}</div>
              <div className="text-xs text-muted">À faire</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#8b7cf8' }}>{plansGenerated}</div>
              <div className="text-xs text-muted">Plans générés</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{documents.length}</div>
              <div className="text-xs text-muted">Documents</div>
            </div>
          </div>

          {/* Folder overview */}
          <div className="card mb-20" style={{ padding: 20 }}>
            <div className="text-md font-bold mb-12">Répartition par dossier</div>
            {folders.filter(f => f.items.length > 0).length === 0 ? (
              <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                Aucune action enregistrée. Allez dans l&apos;onglet Dossiers pour commencer.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {folders.filter(f => f.items.length > 0).map(folder => {
                  const done = folder.items.filter(i => i.status === 'done').length;
                  const pct = Math.round((done / folder.items.length) * 100);
                  return (
                    <div key={folder.id} className="flex items-center gap-8">
                      <span style={{ fontSize: 16, width: 24 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>{folder.icon}</span></span>
                      <span className="text-sm font-semibold" style={{ width: 140, flexShrink: 0 }}>{folder.name}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: folder.color, borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <span className="text-xs text-muted" style={{ width: 60, textAlign: 'right' }}>{done}/{folder.items.length}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Synthesis section */}
          <div className="card" style={{ padding: 20 }}>
            <div className="flex items-center gap-8 mb-12">
              <div className="text-md font-bold" style={{ flex: 1 }}>Synthèse <span className="fz-logo-word">IA</span> du projet</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={generateSynthesis}
                disabled={synthesizing}
              >
                {synthesizing ? 'Analyse en cours...' : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>psychology</span> Générer la synthèse</>}
              </button>
            </div>
            {synthesis ? (
              <div>{renderPlan(synthesis)}</div>
            ) : (
              <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                Cliquez sur &quot;Générer la synthèse&quot; pour obtenir un résumé complet de l&apos;état de votre projet par l&apos;IA.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="card mt-20" style={{ padding: 20 }}>
            <div className="text-md font-bold mb-8">Notes de projet</div>
            <textarea
              className="input w-full"
              placeholder="Vos notes, idées, remarques sur le projet..."
              value={projectNotes}
              onChange={e => { setProjectNotes(e.target.value); saveProject({ notes: e.target.value }); }}
              rows={4}
              style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
         TAB: STRATEGIES
         ═══════════════════════════════════════════ */}
      {activeTab === 'strategies' && (
        <div>
          {/* Agent tabs */}
          <div className="flex gap-6 flex-wrap mb-16" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
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
                    padding: '6px 14px', fontWeight: isActive ? 700 : 500,
                    background: isActive ? strat.color + '15' : 'transparent',
                    color: isActive ? strat.color : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? strat.color + '44' : 'var(--border-secondary)'}`,
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                  }}
                >
                  <span><span className="material-symbols-rounded" style={{ fontSize: 18 }}>{strat.icon}</span></span>
                  {strat.shortLabel}
                  {hasPlan && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />}
                  {hasSaved && !hasPlan && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />}
                </button>
              );
            })}
          </div>

          {/* Reassurance */}
          <div className="alert alert-info mb-16">
            <span className="text-base"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>lightbulb</span></span>{' '}
            <span className="text-md">{activeStrategy?.reassurance}</span>
          </div>

          {error && <div className="alert alert-danger mb-16">{error}</div>}

          {/* Form view */}
          {strategyViewMode === 'form' && activeStrategy && (
            <div className="card p-20">
              <div className="flex items-center gap-8 mb-16">
                <span style={{ fontSize: 24 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{activeStrategy.icon}</span></span>
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

              {basicFields.map(field => (
                <FieldRenderer key={field.key} field={field} value={formData[field.key]} onChangeText={(v) => updateField(field.key, v)} onToggleChip={(chip) => toggleChip(field.key, chip)} accentColor={activeStrategy.color} onFocusField={() => { lastFocusedFieldRef.current = field.key; }} />
              ))}

              {advancedFields.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-6 text-md font-semibold text-accent pointer mt-8"
                    style={{ padding: '8px 0', background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}
                  >
                    {showAdvanced ? '▾' : '▸'} {showAdvanced ? 'Masquer les détails' : 'Plus de détails (optionnel)'}
                  </button>
                  {showAdvanced && advancedFields.map(field => (
                    <FieldRenderer key={field.key} field={field} value={formData[field.key]} onChangeText={(v) => updateField(field.key, v)} onToggleChip={(chip) => toggleChip(field.key, chip)} accentColor={activeStrategy.color} onFocusField={() => { lastFocusedFieldRef.current = field.key; }} />
                  ))}
                </>
              )}

              <div className="flex gap-8 flex-wrap mt-24">
                <button
                  className="btn btn-primary flex-1 font-bold text-base"
                  onClick={generatePlan}
                  disabled={generating || filledCount === 0}
                  style={{
                    minWidth: 200, padding: '10px 20px',
                    background: generating ? 'var(--bg-tertiary)' : activeStrategy.color,
                    borderColor: generating ? 'var(--border-secondary)' : activeStrategy.color,
                  }}
                >
                  {generating ? (
                    <span className="animate-pulse">{agent(activeStrategy.agentId).name} analyse et crée votre plan...</span>
                  ) : (
                    <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>target</span> Générer mon plan d&apos;action</>
                  )}
                </button>
                {currentPlan && (
                  <button className="btn btn-ghost text-md" onClick={() => setStrategyViewMode('plan')}>
                    Voir mon plan existant
                  </button>
                )}
              </div>
              <div className="text-xs text-muted text-center mt-8">Coût estimé : ~3-5 crédits (Sonnet)</div>
            </div>
          )}

          {/* Plan view */}
          {strategyViewMode === 'plan' && activeStrategy && currentPlan && (
            <div>
              <div className="flex gap-8 flex-wrap mb-16">
                <button className="btn btn-ghost btn-sm" onClick={() => setStrategyViewMode('form')}>← Modifier mes réponses</button>
                <div style={{ flex: 1 }} />
                <button className="btn btn-ghost btn-sm" onClick={copyPlan}>{copied ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>check</span> Copié !</> : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>assignment</span> Copier</>}</button>
                <button
                  className="btn btn-sm"
                  onClick={() => { setStrategyViewMode('form'); setTimeout(() => generatePlan(), 100); }}
                  style={{ background: activeStrategy.color, color: 'white', borderColor: activeStrategy.color }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>refresh</span> Régénérer
                </button>
              </div>
              <div className="card p-20">
                <div className="flex items-center gap-8 mb-16" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: 24 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{activeStrategy.icon}</span></span>
                  <div>
                    <div className="text-lg font-bold">{activeStrategy.title}</div>
                    <div className="text-xs text-muted">
                      Généré le {savedData?.generatedAt ? new Date(savedData.generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                </div>
                <div>{renderPlan(currentPlan)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
         TAB: DOSSIERS
         ═══════════════════════════════════════════ */}
      {activeTab === 'folders' && (
        <div>
          <p className="text-sm text-muted mb-16">
            Organisez vos actions par dossier thématique. Cliquez sur un dossier pour ajouter et gérer vos tâches.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {folders.map(folder => {
              const isExpanded = expandedFolder === folder.id;
              const done = folder.items.filter(i => i.status === 'done').length;
              const total = folder.items.length;
              return (
                <div key={folder.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Folder header */}
                  <button
                    onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                    className="w-full flex items-center gap-8"
                    style={{
                      padding: '14px 16px', background: isExpanded ? folder.color + '08' : 'transparent',
                      border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      borderBottom: isExpanded ? `1px solid ${folder.color}22` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>{folder.icon}</span></span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="text-md font-bold">{folder.name}</div>
                      <div className="text-xs text-muted">{total} action{total > 1 ? 's' : ''} • {done} terminée{done > 1 ? 's' : ''}</div>
                    </div>
                    {total > 0 && (
                      <div style={{ width: 60, height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${total > 0 ? (done / total) * 100 : 0}%`, background: folder.color, borderRadius: 3 }} />
                      </div>
                    )}
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{isExpanded ? '▾' : '▸'}</span>
                  </button>

                  {/* Folder content */}
                  {isExpanded && (
                    <div style={{ padding: '12px 16px' }}>
                      {/* Items list */}
                      {folder.items.map(item => (
                        <div key={item.id} className="flex items-center gap-8 mb-6" style={{
                          padding: '8px 10px', borderRadius: 8, background: 'var(--bg-secondary)',
                        }}>
                          <button
                            onClick={() => toggleItemStatus(folder.id, item.id)}
                            style={{
                              width: 22, height: 22, borderRadius: 6, border: `2px solid ${
                                item.status === 'done' ? 'var(--success)' : item.status === 'doing' ? 'var(--warning)' : 'var(--border-secondary)'
                              }`,
                              background: item.status === 'done' ? 'var(--success)' : item.status === 'doing' ? 'var(--warning)' : 'transparent',
                              color: item.status !== 'todo' ? '#fff' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            {item.status === 'done' ? <span className="material-symbols-rounded" style={{ fontSize: 11 }}>check</span> : item.status === 'doing' ? <span className="material-symbols-rounded" style={{ fontSize: 11 }}>hourglass_empty</span> : ''}
                          </button>
                          <span className="text-sm" style={{
                            flex: 1,
                            textDecoration: item.status === 'done' ? 'line-through' : 'none',
                            color: item.status === 'done' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          }}>
                            {item.title}
                          </span>
                          <button
                            onClick={() => deleteItem(folder.id, item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, padding: '0 4px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Add item */}
                      <div className="flex gap-6 mt-8">
                        <input
                          className="input"
                          style={{ flex: 1, fontSize: 13 }}
                          placeholder="Nouvelle action..."
                          value={expandedFolder === folder.id ? newItemTitle : ''}
                          onChange={e => setNewItemTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addItemToFolder(folder.id); }}
                        />
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => addItemToFolder(folder.id)}
                          disabled={!newItemTitle.trim()}
                        >
                          + Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
         TAB: DOCUMENTS
         ═══════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div>
          <div className="flex items-center gap-8 mb-16">
            <p className="text-sm text-muted" style={{ flex: 1, margin: 0 }}>
              Ajoutez des documents (textes, données, notes) pour les analyser avec l&apos;IA dans le contexte de votre projet.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
              + Ajouter un document
            </button>
          </div>

          {/* Upload form */}
          {showUpload && (
            <div className="card mb-16" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-12">Ajouter un document</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Nom du document</label>
                  <input
                    className="input w-full"
                    placeholder="Ex: Brief client, Étude de marché, Notes de réunion..."
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: 4 }}>Contenu (collez le texte)</label>
                  <textarea
                    className="input w-full"
                    placeholder="Collez ici le contenu du document à analyser..."
                    value={uploadContent}
                    onChange={e => setUploadContent(e.target.value)}
                    rows={8}
                    style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                  />
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-primary btn-sm" onClick={addDocument} disabled={!uploadName.trim() || !uploadContent.trim()}>
                    Enregistrer
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowUpload(false); setUploadName(''); setUploadContent(''); }}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document list */}
          {documents.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>description</span></div>
              <div className="text-md font-semibold mb-4">Aucun document</div>
              <p className="text-sm text-muted">Ajoutez des documents pour les analyser avec l&apos;IA et enrichir votre plan d&apos;attaque.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map(doc => (
                <div key={doc.id} className="card" style={{ padding: 16 }}>
                  <div className="flex items-center gap-8 mb-8">
                    <span style={{ fontSize: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>description</span></span>
                    <div style={{ flex: 1 }}>
                      <div className="text-md font-bold">{doc.name}</div>
                      <div className="text-xs text-muted">
                        Ajouté le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} • {doc.content.length} caractères
                      </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
                      onClick={() => analyzeDocument(doc)}
                      disabled={analyzing}
                    >
                      {analyzing ? '...' : <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>psychology</span> Analyser</>}
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16, padding: '0 4px' }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-sm text-secondary" style={{ lineHeight: 1.5, maxHeight: 60, overflow: 'hidden' }}>
                    {doc.content.substring(0, 200)}{doc.content.length > 200 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analysis result */}
          {analysisResult && (
            <div className="card mt-16" style={{ padding: 20 }}>
              <div className="text-md font-bold mb-12" style={{ color: 'var(--accent)' }}>Analyse IA</div>
              <div>{renderPlan(analysisResult)}</div>
            </div>
          )}

          {/* Templates section */}
          <div className="card mt-20" style={{ padding: 20 }}>
            <div className="text-md font-bold mb-12">Modèles à télécharger</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {[
                { icon: 'assignment', name: 'Brief projet', desc: 'Template de brief structuré' },
                { icon: 'bar_chart', name: 'Business plan', desc: 'Structure de business plan' },
                { icon: 'calendar_month', name: 'Planning projet', desc: 'Modèle de planning Gantt' },
                { icon: 'savings', name: 'Budget prévisionnel', desc: 'Tableau de budget type' },
                { icon: 'target', name: 'OKR / Objectifs', desc: 'Matrice objectifs & résultats' },
                { icon: 'edit_note', name: 'Compte-rendu', desc: 'Template réunion / CR' },
              ].map(tpl => (
                <button
                  key={tpl.name}
                  onClick={() => {
                    setUploadName(tpl.name);
                    setUploadContent(`# ${tpl.name}\n\n## Objectif\n[Décrivez l'objectif]\n\n## Contexte\n[Contexte du projet]\n\n## Actions\n- [ ] Action 1\n- [ ] Action 2\n- [ ] Action 3\n\n## Échéances\n[Dates clés]\n\n## Budget\n[Estimations]\n\n## Notes\n[Notes additionnelles]`);
                    setShowUpload(true);
                  }}
                  className="card"
                  style={{ padding: 14, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  <span style={{ fontSize: 20 }}><span className="material-symbols-rounded" style={{ fontSize: 20 }}>{tpl.icon}</span></span>
                  <div className="text-sm font-bold mt-4">{tpl.name}</div>
                  <div className="text-xs text-muted">{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
         TAB: HISTORIQUE IA
         ═══════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div>
          <p className="text-sm text-muted mb-16">
            Historique des plans et analyses générés par l&apos;IA pour ce projet.
          </p>

          {conversations.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 40 }}>chat</span></div>
              <div className="text-md font-semibold mb-4">Aucun historique</div>
              <p className="text-sm text-muted">
                Les plans générés dans l&apos;onglet Stratégies apparaîtront ici automatiquement.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversations.map((conv, i) => (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div className="flex items-center gap-8 mb-6">
                    <span style={{ fontSize: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 16 }}>smart_toy</span></span>
                    <div className="text-sm font-bold" style={{ flex: 1 }}>{conv.summary}</div>
                    <span className="text-xs text-muted">
                      {new Date(conv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-muted mb-4">Agent : {conv.agent}</div>
                  {conv.keyPoints.length > 0 && (
                    <div className="flex gap-6 flex-wrap">
                      {conv.keyPoints.map((kp, j) => (
                        <span key={j} className="badge" style={{ fontSize: 10, background: 'var(--bg-secondary)' }}>
                          {kp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Field Renderer sub-component
   ═══════════════════════════════════════════ */

function FieldRenderer({
  field, value, onChangeText, onToggleChip, accentColor, onFocusField,
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
        <div className="text-xs text-muted mb-4" style={{ fontStyle: 'italic' }}>{field.hint}</div>
      )}

      {field.type === 'input' && (
        <input className="input w-full" type="text" placeholder={field.placeholder} value={(value as string) || ''} onChange={e => onChangeText(e.target.value)} />
      )}

      {field.type === 'textarea' && (
        <textarea className="input w-full" placeholder={field.placeholder} value={(value as string) || ''} onChange={e => onChangeText(e.target.value)} onFocus={onFocusField} rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
      )}

      {field.type === 'select' && field.options && (
        <div className="flex flex-wrap gap-6">
          {field.options.map(opt => {
            const isSelected = value === opt;
            return (
              <button key={opt} onClick={() => onChangeText(opt)} className="pointer rounded-full text-sm"
                style={{
                  padding: '6px 14px', fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? accentColor : 'var(--bg-primary)',
                  color: isSelected ? 'white' : 'var(--text-tertiary)',
                  border: `1px solid ${isSelected ? accentColor : 'var(--border-secondary)'}`,
                  fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                }}
              >{opt}</button>
            );
          })}
        </div>
      )}

      {field.type === 'chips' && field.options && (
        <div className="flex flex-wrap gap-6">
          {field.options.map(chip => {
            const selected = Array.isArray(value) ? value.includes(chip) : false;
            return (
              <button key={chip} onClick={() => onToggleChip(chip)} className="pointer rounded-full text-sm"
                style={{
                  padding: '6px 14px', fontWeight: selected ? 600 : 500,
                  background: selected ? accentColor : 'var(--bg-primary)',
                  color: selected ? 'white' : 'var(--text-tertiary)',
                  border: `1px solid ${selected ? accentColor : 'var(--border-secondary)'}`,
                  fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                }}
              >{chip}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}
