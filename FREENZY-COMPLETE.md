# FREENZY.IO — Documentation Complète du Projet

> Ce document est une référence exhaustive pour travailler sur le projet Freenzy.io avec Claude ou tout autre LLM.
> Basé sur la landing page v2, le dashboard client (75+ pages) et le dashboard admin.
> Dernière mise à jour : 13 mars 2026.

---

## 1. Vision & Positionnement

**Freenzy.io** est une plateforme d'intelligence artificielle tout-en-un destinée aux PME, freelances et particuliers. Le nom du produit dashboard est **Flashboard**.

### Philosophie : Free & Easy
- **Free** : Accès 100% gratuit, 0% de commission sur les tokens IA, pas d'abonnement
- **Easy** : Onboarding en 5 minutes, aucune compétence technique requise, interface en français
- **Modèle économique** : L'utilisateur ne paie que les tokens IA au prix officiel des fournisseurs (Anthropic, OpenAI, Google…). Système de crédits rechargeable. Les crédits n'expirent jamais. 0% commission pour les 5000 premiers utilisateurs (verrouillé à vie), 5% après.

### Slogan
> "100 agents IA. 0% de commission. Free & Easy."

### Crédits offerts
- **50 crédits gratuits** à l'inscription (SIGNUP_BONUS_CREDITS = 50)
- 1 crédit = 1 000 000 micro-crédits
- Système de parrainage : 20€ par ami parrainé

---

## 2. Architecture Technique

### Stack
| Composant | Technologie |
|-----------|-------------|
| Backend | Node.js 20+ / TypeScript strict / Express 5 |
| Frontend | Next.js 14 (App Router) — `src/dashboard/` |
| Base de données | PostgreSQL 16 + pgvector (mémoire RAG) |
| Cache | Redis 7 |
| IA principale | @anthropic-ai/sdk (Claude Haiku L1, Sonnet L2, Opus L3) |
| Téléphonie | Twilio (appels entrants/sortants, SMS, WhatsApp Business) |
| Synthèse vocale | ElevenLabs (eleven_multilingual_v2, voix George) |
| Génération image | fal.ai (Flux/schnell), DALL-E |
| Génération vidéo | fal.ai (LTX Video), D-ID (avatars parlants), Runway ML |
| Paiement | Stripe (PCI-DSS) |
| Sécurité | JWT + RBAC, 2FA TOTP, AES-256, RGPD natif, serveurs EU |

### Modèles IA supportés
1. **Claude · Anthropic** — Haiku (rapide), Sonnet (précis), Opus (stratégique, Extended Thinking)
2. **GPT · OpenAI** — GPT-4o, o3, GPT-4.5
3. **Gemini · Google** — Flash, Pro, Ultra
4. **Llama · Meta** — Llama 4, open source
5. **Grok · xAI** — Grok 3, raisonnement temps réel
6. **Mistral · Cohere** — IA européenne

### Écosystème de services intégrés
- **ElevenLabs** — Voix naturelle, TTS premium multilingue
- **Twilio** — Appels entrants/sortants, SMS, WhatsApp
- **pgvector** — Mémoire longue durée, RAG (Retrieval Augmented Generation)
- **WhatsApp Business** — Messages IA entrants & sortants
- **Runway ML** — Génération vidéo IA
- **DALL-E / Flux** — Génération image IA
- **Redis** — Cache, sessions temps réel
- **Stripe** — Paiement, facturation sécurisée

### Infrastructure
- Docker Compose : backend (port 3010), postgres (5432), redis (6379)
- Dashboard Next.js : port 3001
- Build : `NODE_OPTIONS="--max-old-space-size=4096" npx next build` → **188 pages**
- DB : `freenzy`, user : `freenzy`
- Données EU uniquement, RGPD natif
- Purge automatique des données > 90 jours

### Sécurité
- JWT auth + RBAC (4 rôles : admin, operator, viewer, system)
- 2FA TOTP natif
- Chiffrement AES-256
- Validation signature HMAC pour webhooks Twilio
- PII masqué dans les logs
- Audit logs complets

---

## 3. Système d'Agents IA — 100+ Agents

L'architecture repose sur un système hiérarchique à 3 niveaux :
- **L1 (Exécution)** — Claude Haiku : tâches rapides, chat, réponses simples
- **L2 (Management)** — Claude Sonnet : rédaction, analyse, décisions intermédiaires
- **L3 (Exécutif)** — Claude Opus + Extended Thinking : stratégie, décisions complexes

### 3.1. Agents Business (22 agents cœur)

| ID | Emoji | Nom | Rôle |
|----|-------|-----|------|
| fz-repondeur | 📞 | Répondeur 24/7 | Gère les appels entrants, qualifie les leads, prend RDV |
| fz-assistante | 🤝 | Assistante | Assistante exécutive polyvalente |
| fz-commercial | 🚀 | Commercial | Prospection, devis, propositions commerciales |
| fz-marketing | 📢 | Marketing | Stratégie marketing, campagnes, contenu |
| fz-rh | 👥 | RH | Recrutement, gestion équipe, onboarding |
| fz-communication | 📣 | Communication | Relations publiques, presse, réseaux sociaux |
| fz-finance | 💰 | Finance | Comptabilité, budget, rapports financiers |
| fz-dev | 💻 | Dev | Développement, code, support technique |
| fz-juridique | ⚖️ | Juridique | Contrats, conformité, veille réglementaire |
| fz-dg | 🎯 | Direction Générale | Stratégie, gouvernance, décisions stratégiques (L3 Opus) |
| fz-video | 🎬 | Vidéo | Clips vidéo, montage, talking heads |
| fz-photo | 📸 | Photo / Visuel | Visuels, logos, bannières IA |
| fz-qualite | ✅ | Qualité | Contrôle qualité, processus, audits |
| fz-data | 📊 | Data | Analyse de données, tableaux de bord, KPIs |
| fz-product | 🎯 | Produit | Gestion produit, roadmap, specs |
| fz-csm | 🤗 | Succès Client | Onboarding clients, satisfaction, rétention |
| fz-rse | 🌿 | RSE | Responsabilité sociétale, impact environnemental |
| fz-operations | ⚙️ | Opérations | Processus, logistique, efficacité opérationnelle |
| fz-design | 🎨 | Design | UX/UI, identité visuelle, branding |
| fz-formation | 🎓 | Formation | Contenus pédagogiques, tutoriels, guides |
| fz-innovation | 💡 | Innovation | Veille technologique, R&D, nouvelles opportunités |
| fz-international | 🌍 | International | Expansion internationale, traduction, adaptation culturelle |

### 3.2. Agents Business étendus (38 agents)

**Business Pack 1 (19 agents)** :
fz-recrutement, fz-logistique, fz-achats, fz-sav, fz-crm, fz-seo, fz-ads, fz-community, fz-copywriter, fz-traducteur, fz-comptabilite, fz-tresorerie, fz-audit, fz-conformite, fz-rgpd, fz-securite, fz-sysadmin, fz-devops, fz-frontend

**Business Pack 2 (19 agents)** :
fz-backend, fz-mobile, fz-qa, fz-scrum, fz-architect, fz-bi, fz-pricing, fz-partenariat, fz-evenement, fz-presse, fz-branding, fz-ux-research, fz-redacteur, fz-podcast, fz-influence, fz-ecommerce, fz-growth, fz-strategie, fz-mentor

### 3.3. Agents Personnels (12 agents cœur)

| ID | Emoji | Nom | Rôle |
|----|-------|-----|------|
| fz-budget | 💳 | Budget perso | Suivi dépenses, alertes, conseils d'épargne |
| fz-negociateur | 🤝 | Négociateur | Négociation salaire, loyer, contrats |
| fz-impots | 📊 | Impôts | Optimisation fiscale, simulations, déclarations |
| fz-comptable | 🧾 | Comptable perso | Factures, rapprochement bancaire |
| fz-chasseur | 🏠 | Chasseur immo | Veille immobilière, analyse de marché |
| fz-portfolio | 📈 | Portfolio | Investissements, diversification |
| fz-cv | 📝 | CV & carrière | CV optimisé, lettres de motivation, prep entretien |
| fz-contradicteur | 💬 | Contradicteur | Joue l'avocat du diable, challenge les idées |
| fz-ecrivain | ✍️ | Écrivain | Rédaction créative, correction, storytelling |
| fz-cineaste | 🎥 | Cinéaste | Scénarios, storyboards, production |
| fz-coach | 🧘 | Coach bien-être | Méditation, équilibre, déconnexion |
| fz-deconnexion | 🏔️ | Déconnexion | Digital detox, pauses, respiration |

### 3.4. Agents Personnels étendus (28 agents)

fz-nutrition, fz-fitness, fz-meditation, fz-sommeil, fz-voyage, fz-cuisine, fz-jardin, fz-bricolage, fz-deco, fz-mode, fz-musique, fz-lecture, fz-langues, fz-parent, fz-relation, fz-productivite, fz-investissement, fz-immobilier, fz-assurance, fz-succession, fz-retraite, fz-droit-conso, fz-demenagement, fz-animaux, fz-auto, fz-tech-perso, fz-organisation, fz-gratitude

### 3.5. Agents Outils (16 agents)

fz-calendrier, fz-email, fz-facturation, fz-veille, fz-qrcode, fz-signature, fz-meteo, fz-photos, fz-focus, fz-notes, fz-habitudes, fz-journal, fz-landing, fz-templates, fz-kanban, fz-wellness

### Personnalisation des agents

Chaque agent possède un profil personnalisable avec :
- **Personnalité** (6 curseurs) : Formalité, Longueur de réponse, Créativité, Proactivité, Niveau d'expertise, Humour
- **Expertise** : Tags de domaine, focus industrie, connaissances custom, frameworks, concurrents
- **Instructions** : Toujours faire / Ne jamais faire, format de réponse, style de signature, langues
- **Contexte entreprise** : Vision, métriques clés, taille équipe, contacts, priorités, contraintes budget

---

## 4. Fonctionnalités Principales

### 4.1. 📞 Répondeur IA 24/7
- Répond aux appels téléphoniques avec voix naturelle (ElevenLabs)
- 11 modes de réponse : professionnel, humour familial, prise de commande, urgence, concierge, support technique, qualification, humour débridé, butler british, coach sportif, ami proche
- 6 scénarios : absent, vacances, commande, urgence, RDV, support
- Qualifie les leads et transmet les infos par WhatsApp
- Technologie : Twilio + Claude Haiku + WhatsApp
- Coût : ~5 crédits par appel entrant

### 4.2. 💬 Chat IA Multi-Agent
- Interface de chat avec choix de l'agent
- Streaming SSE en temps réel
- Historique de conversations sauvegardé
- Modèle adaptatif (Haiku pour vitesse, Sonnet pour précision)
- Coût : ~1 crédit par chat

### 4.3. 📄 Factory Documents
- Génération de contrats, devis, NDA, CGV, rapports en langage naturel
- Export PDF signable + Word éditable
- Archivage automatique
- Révision par agent Juridique IA
- Coût : ~3.5 crédits par document

### 4.4. 📱 Social Media Autopilot
- Création et planification de posts : LinkedIn, Twitter, Instagram, Facebook
- Ton adapté par réseau, hashtags automatiques
- Calendrier éditorial
- Analyse des concurrents
- Coût : ~2.4 crédits par post

### 4.5. 🎬 Studio Créatif
- **Photos IA** : Visuels pro, logos, bannières (fal.ai Flux) — 8 crédits
- **Vidéos IA** : Clips 30s, animations (LTX Video) — 20 crédits
- **Avatars parlants** : Votre avatar qui parle votre texte (D-ID + ElevenLabs) — 15 crédits
- Catégories : Social Media, E-commerce, Branding, Présentation, Personnel, Marketing

### 4.6. ☕ Réveil Intelligent
- Briefing matinal personnalisé chaque matin (appel ou message)
- 8 modes : doux, dur, sympa, drôle, fou, motivant, zen, énergique
- 18 rubriques : météo, agenda, actualités sectorielles, KPIs, priorités
- Livraison audio via ElevenLabs
- Technologie : Claude Sonnet + ElevenLabs + Cron

### 4.7. 🧠 Discussions Profondes
- 85+ templates de discussion guidée
- 12 sections, 16 catégories : Philosophie, Éthique, Science, Économie, Géopolitique, Psychologie, Art, Technologie, Spiritualité, Histoire, Société, Environnement…
- 17 tags transversaux
- Modèle : Claude Opus avec Extended Thinking
- Mode Challenge : l'IA joue l'avocat du diable
- Alertes de sensibilité : religion, politique, mort, suicidaire
- Export Markdown, partage social (Twitter, LinkedIn, Facebook, WhatsApp, Email)
- Conclusions structurées, profondeur adaptative

### 4.8. 💚 WhatsApp Business IA
- Messages entrants et sortants automatiques
- Résumés quotidiens envoyés par WhatsApp
- Pilotage des agents par WhatsApp
- Commandes : /ap list, approve, deny, rollback, audit
- Coût : ~0.4 crédits par message

### 4.9. ☎️ Téléphonie
- Appels sortants avec voix IA
- Prospection, relances, confirmations
- Numéro local dédié (Twilio)
- Transcription en temps réel

### 4.10. 🎮 Arcade & Gamification
- 10 jeux intégrés : Motus, Sudoku, Snake, Tetris, Quiz IA, Memory, 2048, Démineur, Dactylo, Défi du jour
- 50 niveaux, 20 badges
- Système de XP, niveaux, classements
- Récompenses en crédits
- Création de jeux personnalisés + communauté

### 4.11. 🛒 Marketplace
- 50 templates d'agents (23 gratuits, 27 premium)
- Exemples : Agent Immobilier, Veille Juridique, Maître d'Hôtel IA, Suivi Logistique, Assistant Médical, Tuteur IA, Vendeur E-commerce, Coach Sportif IA
- Installation en 1 clic

### 4.12. ✉️ Email IA
- Rédaction d'emails professionnels et personnels
- Choix du ton, de la langue et du style
- Templates prêts à l'emploi : newsletter, promo, bienvenue, relance
- Signatures email HTML élégantes
- Coût : ~1.1 crédits par email

### 4.13. 📆 Réunions Multi-Agents
- Réunions avec plusieurs assistants IA simultanément
- Ordre du jour automatique
- Compte-rendu structuré avec décisions et actions
- Coût : ~6 crédits par réunion

### 4.14. 🎥 Visio / Appel Vocal
- Appel vocal avec n'importe quel assistant
- Transcription en temps réel
- Diagnostic audio intégré

---

## 5. Outils de Productivité Intégrés

| Outil | Emoji | Description |
|-------|-------|-------------|
| Notes rapides | 📝 | Notes avec tags, couleurs, recherche, export Markdown |
| Focus / Pomodoro | 🍅 | Timer 25/5, streaks de productivité |
| Calendrier | 📅 | Vue jour/semaine/mois, rappels, deadlines |
| Kanban | 📋 | Tableaux style Trello, drag & drop, étiquettes |
| Ma Journée | 📅 | Planning complet : widgets, tâches, bien-être, objectifs |
| Habitudes | ✅ | Tracker quotidien, streaks, progression |
| Journal perso | 📓 | Journal intime, prompts guidés, analyse émotions IA |
| CRM | 🤝 | Pipeline de ventes, fiches contacts, relances |
| Facturation | 🧾 | Devis et factures, suivi paiements, TVA auto |
| SEO Tracker | 🔍 | Analyse SEO, mots-clés, suivi positions |
| Veille | 📰 | Flux RSS, tendances, actualité concurrents |
| QR Codes | 🔳 | URLs, cartes de visite, WiFi, événements |
| Traduction | 🌐 | 50+ langues avec nuances culturelles |
| Landing Builder | 🏗️ | Templates de pages de vente, WYSIWYG |
| Banque d'images | 🖼️ | Recherche images gratuites (Unsplash) |
| Campagnes | 📢 | Marketing multi-plateformes, calendrier éditorial |

---

## 6. Coûts des Actions IA (pour 50 crédits)

| Action | Modèle | Nombre possible |
|--------|--------|-----------------|
| 💬 Chat avec agent IA | Haiku | ~100 chats |
| ✉️ Email professionnel | Sonnet | ~45 emails |
| 📱 Post réseaux sociaux | Haiku | ~62 posts |
| 📄 Document complet | Sonnet | ~14 docs |
| 📞 Appel répondeur IA | Twilio + Haiku | ~10 appels |
| 📲 Appel sortant IA | Twilio + Sonnet | ~3 appels |
| 💚 WhatsApp Business IA | Haiku | ~125 msgs |
| 🎙️ Message vocal TTS | ElevenLabs | ~11 msgs |
| 🖼️ Image IA créée | DALL-E / Flux | ~7 images |
| 🎬 Clip vidéo 30s | Runway ML | ~1 clip |
| 🤝 Réunion IA structurée | Opus | ~6 réunions |

---

## 7. Structure du Dashboard Client (75+ pages)

Le dashboard est organisé en 8 sections de navigation :

### 7.1. 📋 Espace de travail (18 pages)
| Page | Route | Description |
|------|-------|-------------|
| 🏠 Tableau de bord | /client/dashboard | Accueil avec KPIs, tâches, accès rapides |
| ☕ Réveil | /client/reveil | Briefing matinal personnalisé |
| 💬 Chat | /client/chat | Interface de chat multi-agent |
| 📞 Répondeur | /client/repondeur | Configuration répondeur 24/7 |
| 📱 Réseaux sociaux | /client/social | Gestion présence en ligne |
| 🎬 Studio | /client/studio | Création photos & vidéos IA |
| 📄 Documents | /client/documents | Génération et gestion de documents |
| 🎯 Plan d'attaque | /client/strategy | Objectifs et stratégie |
| 🧩 Création sur mesure | /client/custom-creation | Modules custom |
| 📹 Vidéo Pro | /client/video-pro | Production vidéo avancée |
| 🎓 Formations | /client/formations | Tutoriels et guides |
| 👤 Mes Assistants | /client/personal | Gestion équipe d'agents |
| 🎨 Personnaliser | /client/agents/customize | Configuration agents |
| 🤖 Assistants IA | /client/agents | Liste complète agents |
| 📦 Modules | /client/modules | Extensions de capacités |
| 📢 Campagnes | /client/campaigns | Marketing multi-plateformes |
| ☎️ Téléphonie | /client/telephony | Configuration appels |
| ⚡ Actions | /client/actions | Propositions des agents |

### 7.2. 👤 Moi (8 pages)
| Page | Route | Description |
|------|-------|-------------|
| ⚙️ Mon Compte | /client/account | Profil et paramètres |
| 📊 Analytics | /client/analytics | Statistiques d'utilisation |
| 💳 Finances | /client/finances | Coûts et facturation |
| 🎁 Parrainer | /client/referrals | Programme de parrainage |
| 🏆 Récompenses | /client/rewards | Crédits gratuits |
| 🕐 Activité | /client/activity | Historique complet |
| 📈 Timeline | /client/timeline | Frise chronologique |
| 🔔 Notifications | /client/notifications | Alertes et messages |

### 7.3. 🧠 Assistants Personnels (5 sous-pages)
| Page | Route | Description |
|------|-------|-------------|
| 💰 Budget | /client/personal/budget | Finances personnelles |
| 🧾 Comptabilité | /client/personal/comptable | Factures, TVA |
| 🏹 Chasseur | /client/personal/chasseur | Opportunités et missions |
| 📝 CV 2026 | /client/personal/cv | CV moderne et optimisé |
| ✍️ Écriture | /client/personal/ecrivain | Articles, livres, scripts |

### 7.4. 💭 Discussions (1 page)
| Page | Route | Description |
|------|-------|-------------|
| 🧠 Discussions Profondes | /client/discussions | 85+ thèmes avec Opus |

### 7.5. 🎮 Divertissement (3 pages + sous-pages)
| Page | Route | Description |
|------|-------|-------------|
| 🕹️ Arcade | /client/games | Mini-jeux et classements |
| ➕ Créer un jeu | /client/games/create | Créateur de jeux IA |
| 🎪 Communauté | /client/games/community | Jeux partagés et scores |

### 7.6. 🏢 Mon Entreprise (4 pages)
| Page | Route | Description |
|------|-------|-------------|
| 🏗️ Profil | /client/onboarding | Configuration entreprise (7 étapes) |
| 👥 Mon équipe | /client/team | Workspace, collaborateurs, rôles |
| 🤝 Partenaires | /client/partners | Intégrations et connexions |
| 🛒 Marketplace | /client/marketplace | Assistants spécialisés (50 templates) |

### 7.7. 🔧 Développeur (1 page)
| Page | Route | Description |
|------|-------|-------------|
| 💻 Widget | /client/widget | Code d'intégration Freenzy |

### 7.8. Outils supplémentaires (20+ pages)
Notes, Pomodoro, Calendrier, Email, Signatures, Templates Email, Facturation, CRM, SEO, Veille, Landing Builder, Kanban, Traduction, QR Code, Photos, Habitudes, Journal, Briefing, Meeting, Visio, WhatsApp, Projets, Ma Journée, Profil, Settings…

---

## 8. Dashboard Admin

Le dashboard admin est unifié avec 10 sections de navigation :

### Pages admin principales
- **Admin Home** : Vue d'ensemble, statistiques globales
- **Agents** : Configuration des 100+ agents, runtime config
- **Analytics** : Statistiques documents, studio, voice, usage global
- **Autopilot** : Propositions agents → validation admin → exécution → rollback
- **Billing** : Graphiques revenus, transactions, abonnements
- **Campaigns** : Gestion campagnes marketing admin
- **Chat Admin** : Chat multi-agent SSE streaming
- **Control** : Panneau de contrôle global
- **Custom Agents** : Agents personnalisés par les utilisateurs
- **Diagnostics** : Tests live (Anthropic, ElevenLabs, Email, SMS)
- **Financial** : Rapports financiers détaillés
- **Guardrails** : Règles de sécurité et limites
- **Guide** : Documentation interne
- **Modules** : Gestion des modules
- **Mon Studio** : Création photo/vidéo admin
- **Mon Espace** : Documents, stratégie, agents, discussions admin
- **Quotes** : Gestion devis
- **Répondeur Admin** : Configuration répondeur
- **Réveil Admin** : Configuration réveil
- **Roadmap** : Roadmap produit
- **Social** : Génération posts + calendrier
- **Studio** : Studio créatif admin
- **Telephony** : Configuration téléphonie
- **Tokens** : Gestion crédits et tokens
- **Users** : Gestion utilisateurs (profil, feature flags, gamification, notifications, usage, wallet, danger zone)
- **WhatsApp Hub** : Conversations + commandes autopilot

### Autopilot System
- Gouvernance par propositions : les agents proposent → l'admin valide (WhatsApp ou dashboard) → exécution → rollback possible
- 3 auditeurs automatiques : health, business, security
- 11 types d'actions (toggle_feature_flag, update_agent_config, etc.)
- Commandes WhatsApp : /ap list, approve, deny, rollback, audit

### GlobalSearch (Cmd+K)
- Recherche globale dans tout l'admin
- Raccourci clavier Cmd+K / Ctrl+K

---

## 9. Pages Publiques

### Landing Page (v2)
15 sections complètes :
1. **Hero** — Titre + sous-titre + CTA + stats badges
2. **Chiffres clés** — 100+ agents, 6+ modèles IA, 5 min onboarding, 0% commission, 24/7 actifs, 50+ langues
3. **Grille outils** — 5 catégories (Communication, Productivité, Création, Gestion, Personnel) × 4 outils chacune
4. **WhatsApp** — Mockup de conversation WhatsApp avec commandes IA
5. **3 étapes** — Créer compte → Configurer profil → Lancer les agents
6. **Agents personnels B2C** — 8 agents personnels phares
7. **Studio créatif** — Photos IA, Vidéos IA, Avatars parlants + catégories
8. **Création sur mesure** — 8 exemples de modules personnalisés (carousel)
9. **Discussions approfondies** — 85+ templates, Extended Thinking, Mode Challenge
10. **Social proof** — Flux d'activité en temps réel (10 actions récentes)
11. **Pourquoi Freenzy** — 6 avantages + 5 trust badges sécurité
12. **Démo interactive** — 4 scénarios (Répondeur, Email, Social, Document)
13. **Enterprise** — Section grands comptes
14. **Pricing** — Plans et tarifs avec FAQ (100+ questions, 4 catégories)
15. **CTA final** — Inscription + rewards chips

### Autres pages publiques
- **/fonctionnalites/repondeur** — Page dédiée répondeur
- **/fonctionnalites/documents** — Page dédiée documents
- **/fonctionnalites/social** — Page dédiée réseaux sociaux
- **/fonctionnalites/reveil** — Page dédiée réveil intelligent
- **/cas/restaurant** — Cas d'usage restaurant
- **/cas/immobilier** — Cas d'usage immobilier
- **/cas/cabinet** — Cas d'usage cabinet
- **/vs-alternatives** — Comparaison concurrents
- **/plans** — Page tarifs détaillée
- **/login** — Connexion
- **/register** — Inscription

---

## 10. FAQ — 100+ Questions

Organisées en 4 catégories :

### 🏢 Général
Exemples de questions couvertes :
- C'est quoi Freenzy.io ?
- C'est vraiment gratuit ?
- Quelle différence avec ChatGPT ou Claude ?
- Faut-il des compétences techniques ?
- C'est pour qui ? (PME, freelance, particulier)
- Puis-je tester avant de m'engager ?
- Combien de temps pour démarrer ? (5 min)
- Fonctionne en quelle langue ? (50+ langues)

### 💰 Tarifs & Crédits
- Comment fonctionne le système de crédits ?
- Les crédits expirent-ils ?
- 0% de commission, comment ?

### 🤖 Agents & Fonctionnalités
- Combien d'agents sont disponibles ?
- Puis-je créer mes propres agents ?
- Comment fonctionne le répondeur ?
- Que fait le réveil intelligent ?

### 🔒 Sécurité & Données
- Données hébergées où ?
- RGPD conforme ?
- Chiffrement ?
- 2FA ?

---

## 11. Design System (Notion-style)

Le dashboard utilise un design system inspiré de Notion, centralisé dans `lib/page-styles.ts` :

### Palette
| Token | Valeur | Usage |
|-------|--------|-------|
| text | #1A1A1A | Texte principal, titres |
| textMuted | #9B9B9B | Sous-titres, metadata |
| textSecondary | #6B6B6B | Texte secondaire |
| border | #E5E5E5 | Bordures, séparateurs |
| bg | #FFFFFF | Fond principal |
| bgSecondary | #FAFAFA | Fond alterné |
| accent | #1A1A1A | Accent principal (noir Notion) |
| accentLight | #F5F5F5 | Fond accent léger |
| danger | #DC2626 | Erreurs, suppressions |

### Composants standardisés
- **CU.card** : bg blanc, border 1px #E5E5E5, borderRadius 8, padding 14px 16px
- **CU.btnPrimary** : bg #1A1A1A, color blanc, h 36px, borderRadius 8
- **CU.btnGhost** : bg blanc, border #E5E5E5, color #6B6B6B
- **CU.input** : h 36px, border #E5E5E5, borderRadius 8, fontSize 13
- **CU.emptyState** : emoji 48px centré + titre + description + CTA
- **CU.tab / CU.tabActive** : texte 13px, active = borderBottom 2px solid #1A1A1A

### Principes
- Inline styles uniquement (pas de Tailwind)
- Emojis partout (headers, boutons, cartes, empty states)
- Responsive via `useIsMobile()` hook
- `PageExplanation` composant présent sur chaque page
- `HelpBubble` pour aide contextuelle

---

## 12. Avatars

Deux avatars IA :
- **Sarah** — Avatar femme (DG virtuelle)
- **Emmanuel** — Avatar homme (CEO virtuel)
- Générés à partir de la photo du fondateur
- Page dédiée : /infra/avatar

---

## 13. Système de Gamification

- **XP** : Points d'expérience gagnés par action
- **Niveaux** : Progression par paliers
- **Badges** : 20+ badges à débloquer (Premier Pas, Doigts de fée, Maître du puzzle, Assidu, Touche-à-tout, Immortel…)
- **Streaks** : Séries de jours consécutifs
- **Classements** : Comparaison avec la communauté
- **Récompenses** : Crédits gratuits pour les actions complétées

### Programme de parrainage
- 20€ par ami parrainé
- Code de parrainage unique
- Suivi dans /client/referrals

### Récompenses (CTA chips)
- 🎁 50 crédits offerts à l'inscription
- 🕹️ Gagnez en jouant
- 👥 Parrainage récompensé

---

## 14. Email Sequence Automatique

3 emails automatiques après inscription :
1. **J+0** : Email de bienvenue
2. **J+2** : Getting started (premiers pas)
3. **J+5** : Success story (cas d'usage inspirant)

Exécution : cron horaire, table `email_sequence_log`

---

## 15. Multilingue

- Interface : français
- Agents : 50+ langues supportées
- TTS (ElevenLabs) : 11 langues
- Traduction instantanée intégrée (/client/traduction)

---

## 16. Fichiers Clés du Projet

| Fichier | Contenu |
|---------|---------|
| `src/dashboard/lib/agent-config.ts` | 34 agents cœur (~2200 lignes) |
| `src/dashboard/lib/agents-extended-business1.ts` | 19 agents business étendus |
| `src/dashboard/lib/agents-extended-business2.ts` | 19 agents business étendus |
| `src/dashboard/lib/agents-extended-personal.ts` | 28 agents personnels étendus |
| `src/dashboard/lib/landing-data.ts` | Toutes les données de la landing page |
| `src/dashboard/lib/faq-data.ts` | 100+ questions FAQ |
| `src/dashboard/lib/emoji-map.ts` | 200+ mappings emojis + 75 PAGE_META |
| `src/dashboard/lib/page-styles.ts` | Design system CU + helpers |
| `src/dashboard/lib/deep-discussion.types.ts` | Types discussions profondes |
| `src/dashboard/lib/deep-discussion.utils.ts` | 85+ templates discussions |
| `src/dashboard/app/client/layout.tsx` | Layout client avec sidebar 8 sections |
| `src/dashboard/app/v2/page.tsx` | Landing page v2 complète |
| `src/dashboard/app/page.tsx` | Landing page principale |
| `src/dashboard/app/globals.css` | Variables CSS globales |
| `middleware.ts` | Protection routes (admin, system, infra) |

---

## 17. localStorage Keys (préfixe fz_)

30+ clés dont :
- `fz_session` — Session utilisateur (token, user info)
- `fz_deep_discussions` — Historique discussions profondes
- `fz_studio_requests` — Requêtes studio créatif
- `fz_video_library` — Bibliothèque vidéos
- `fz_sidebar_*` — Préférences sidebar
- Cookie auth : `fz-token`

---

## 18. Résumé Chiffres Clés

| Métrique | Valeur |
|----------|--------|
| Agents IA | 100+ |
| Modèles IA | 6+ |
| Pages dashboard | 188 |
| Templates marketplace | 50 |
| Questions FAQ | 103 |
| Templates discussion | 85+ |
| Langues supportées | 50+ |
| Jeux arcade | 10 |
| Badges | 20 |
| Outils intégrés | 16+ |
| Modes réveil | 8 |
| Commission | 0% |
| Crédits offerts | 50 |
| Onboarding | 5 min |

---

*Ce document est destiné à être utilisé comme contexte pour des sessions de travail avec Claude ou tout autre LLM. Il couvre l'intégralité de la plateforme Freenzy.io telle qu'elle existe au 13 mars 2026.*
