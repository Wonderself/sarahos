# Freenzy.io — Etat Complet du Projet

**Version :** 0.17.0 | **Phase :** 18 / Deep Discussions | **Date :** 2026-03-05
**Tests :** 88+ suites | **TypeScript :** 0 erreurs | **Dashboard :** 80+ pages, build OK

---

## Table des matieres

1. [Ce que le site PEUT faire (fonctionnel)](#1-ce-que-le-site-peut-faire)
2. [Ou trouver les features speciales](#2-ou-trouver-les-features-speciales)
3. [Limites actuelles (stubs & manquants)](#3-limites-actuelles)
4. [Architecture technique](#4-architecture-technique)
5. [Tous les endpoints API (79 routes)](#5-tous-les-endpoints-api)
6. [Dashboard (Next.js)](#6-dashboard)
7. [Comptes de test & acces](#7-comptes-de-test)
8. [Evolutions proposees](#8-evolutions-proposees)
9. [Pour demarrer : premiers clients](#9-pour-demarrer)

---

## 1. Ce que le site PEUT faire

### 1.1 Intelligence Artificielle (LLM)
- **Appels Claude reels** via Anthropic SDK — 3 tiers : Haiku (ultra-fast), Sonnet (fast/standard), Opus (advanced)
- **Prompt Caching** : system prompts caches cote Anthropic (−90% sur tokens systeme repetes)
- **Batch API** : summaries repondeur traites en batch asynchrone (−50% sur input+output tokens)
- **Redis Memoization** : reponses identiques cachees 5 min (zero appel API pour duplicats)
- **Routing Haiku** : classification repondeur + categorisation budget → Haiku (~3.75x moins cher que Sonnet)
- **Facturation par token** avec marge configurable (`TOKEN_MARGIN_PERCENT`)
- **Streaming SSE** (`POST /billing/llm/stream`) pour reponses en temps reel
- **Extended Thinking** pour les agents L3 (Opus) — raisonnement profond
- **Circuit breaker** : coupe apres 5 echecs consecutifs, reprend apres 60s
- **Budget journalier** par utilisateur (configurable via `LLM_DAILY_LIMIT_CREDITS`)
- **Suivi des couts** : chaque appel logge dans `llm_usage_log` avec cout reel, marge, cache hits

### 1.2 Systeme Multi-Agents (24 agents fz-*)
- **L1 Business (12)** : fz-repondeur, fz-assistante, fz-commercial, fz-marketing, fz-rh, fz-communication, fz-finance, fz-dev, fz-juridique, fz-dg, fz-video, fz-photo
- **L1 Personnel (12)** : fz-budget, fz-negociateur, fz-impots, fz-comptable, fz-chasseur, fz-portfolio, fz-cv, fz-contradicteur, fz-ecrivain, fz-cineaste, fz-coach, fz-deconnexion
- **L2 Management (4)** : Operations Manager, Growth Manager, Technical Manager, Knowledge Manager
- **L3 Executive (4)** : Chief Orchestration, Strategy, Self-Improvement, Autonomy Expansion
- Modeles par tier : Haiku (ultra-fast, classification), Sonnet (L1/L2), Opus (L3/DG)
- Les L3 beneficient de l'extended thinking (raisonnement profond)
- Marketplace avec **48 templates** d'agents pre-configures (23 gratuits + 25 premium)
- Execution via `POST /agents/:id/execute`, pause/resume, historique

### 1.3 Systeme de Facturation SaaS
- **Wallet/Credits** : solde en micro-credits (1 credit = 1M micro-credits)
- **Depot** : `POST /billing/deposit` (admin ou auto)
- **Deduction automatique** a chaque appel LLM
- **Historique transactions** : depot, retrait, remboursement, bonus, expiration
- **Stats admin** : `GET /billing/admin/stats` — revenu total, marge, top users
- **Pricing transparent** : `GET /billing/pricing` — prix par modele

### 1.4 Comptes Utilisateurs
- **4 tiers** : guest (10 appels/jour), demo (100, expire en 7j), free (100), paid (10000)
- **Enregistrement** : `POST /auth/register`
- **Login JWT** : `POST /auth/login` → token 24h
- **RBAC** : admin, operator, viewer, system
- **Gestion admin** : CRUD complet + stats plateformes
- **Cron** : expiration auto des comptes demo, reset quotidien des compteurs

### 1.5 Codes Promo
- **3 types d'effet** : tier_upgrade, extend_demo, bonus_calls
- **Creation admin** : `POST /admin/promo-codes`
- **Validation** : `GET /promo/validate/:code` (sans consommer)
- **Utilisation** : `POST /promo/redeem` (avec controle unicite par user)
- **Limite d'utilisation** et date d'expiration configurables

### 1.6 Campagnes Marketing
- **Workflow complet** : draft → pending_approval → approved → active → completed
- **Types** : social, email, sms, whatsapp, multi_channel
- **Posts par campagne** avec suivi publication
- **Approbation admin** obligatoire avant activation
- **Budget en credits** par campagne

### 1.7 Notifications
- **In-app** : fonctionnel (DB + polling/SSE)
- **Types** : low_balance, campaign_approved/rejected, post_published/failed, daily/weekly_report, welcome, demo_expiring
- **Compteur non-lus** : `GET /notifications/unread-count`
- **Marquage lu** : `POST /notifications/:id/read`

### 1.8 Portail Client
- `GET /portal/profile` — profil utilisateur
- `GET /portal/dashboard` — vue aggregee (wallet, campagnes, notifications, usage)
- `GET /portal/wallet` — solde + transactions recentes
- `GET /portal/usage` — consommation LLM

### 1.9 Systeme d'Approbation
- Queue d'approbation humaine pour les actions critiques
- `GET /approvals/pending` + `POST /approvals/:id/decide`

### 1.10 Telephonie & Communication (Twilio SDK reel)
- **Appels vocaux** : entrants/sortants via Twilio REST API avec TwiML
- **SMS** : envoi/reception bidirectionnel
- **WhatsApp Business** : liaison telephone, conversations, messages vocaux
- **Repondeur IA** : 7 modes (professional, family_humor, order_taking, emergency, concierge, support_technique, qualification), 7 styles, 10 competences, FAQ, VIP, anti-spam
- **Visio Agents** : appels vocaux navigateur avec STT + LLM + TTS ElevenLabs
- **Degradation gracieuse** : fonctionne en mode stub si Twilio pas configure

### 1.11 Synthese vocale (ElevenLabs)
- **Modele** : eleven_multilingual_v2 (premium TTS)
- **7 voix francaises** : George, Agathe, Theron, etc.
- **Integration** : Visio Agents, repondeur vocal, apercu voix
- **Voice cloning** : prevu (coming soon)

### 1.12 Multi-Projets
- **Projects table** : chaque user peut avoir plusieurs projets
- **Isolation totale** : repondeur, WhatsApp, agents, documents, campagnes, alarmes — tout scope par projet
- **Selecteur de projets** : dans le sidebar du dashboard
- **Projet par defaut** : cree automatiquement a l'inscription

### 1.13 Reveil Intelligent
- **Appel matinal IA** : programmable par heure et jours de la semaine
- **8 modes** : Doux, Dur, Sympa, Drole, Fou, Motivant, Zen, Energique
- **18 rubriques** : meteo, astrologie, news, citations, bien-etre, motivation, agenda, etc.
- **Livraison** : appel telephonique Twilio OU message WhatsApp (au choix)
- **Contenu genere par IA** : Claude construit le script selon mode + rubriques

### 1.14 Studio Creatif (fal.ai)
- **Generation de photos IA** via fal.ai Flux/schnell (synchrone)
- **Generation de videos IA** via fal.ai LTX Video (async queue) + D-ID (talking head)
- **Cout** : image 8cr, image HD 12cr, video 20cr
- **Agent requests** : demandes de creation par les agents, stockees en localStorage
- **2 modes** : Creation libre (prompt utilisateur) + Demandes agents (file d'attente)
- **Galerie photo** + **Bibliotheque video** avec lecteur HTML5

### 1.15 Deep Discussions (Discussions profondes)
- **85+ templates** de discussion repartis en 12 sections thematiques
- **16 categories** : philosophie, religion, culture, civilisation, personnel, science, economie, geopolitique, art, ethique, technologie, psychologie, sociologie, histoire, spiritualite, existentiel
- **17 tags transversaux** : debat, introspection, societe, futur, histoire, morale, identite, liberte, pouvoir, amour, mort, sens, justice, progres, nature humaine, foi, conscience
- **Modele Opus** (claude-opus-4-6) avec Extended Thinking pour qualite maximale
- **Alertes de sensibilite** : detection automatique de sujets sensibles (religion, politique, mort)
- **Mode challenge** : l'agent joue l'avocat du diable
- **Partage social** : Twitter, LinkedIn, Facebook, WhatsApp, Email — points cles, citations, resumes
- **Completion** : flow de conclusion avec bilan structure genere par l'agent
- **Edition inline du titre** : double-clic pour modifier
- **Prompts adaptatifs** : 3 niveaux selon la profondeur (exploration 0-5, approfondissement 6-15, synthese 16+)
- **Export Markdown** : telechargement complet de la discussion
- **Recherche + tags** : filtrage des templates par texte et tags combines
- **Retry on error** : bouton reessayer avec max 2 tentatives
- **Textarea auto-expanding** : s'adapte au contenu (max 200px)

### 1.16 Admin Dashboard Refonte (8 sessions)
- **Session 1** : SlideOver, Toast, SkeletonLoader — composants UI modernes
- **Session 2** : AdminCharts.tsx (Recharts), analytics hub, OverviewCharts
- **Session 3** : user/:id Feature Flags + Danger Zone, impersonation JWT 1h
- **Session 4** : Diagnostics live (Anthropic/ElevenLabs/Email/SMS), endpoints /admin/test/*
- **Session 5** : GlobalSearch (Cmd+K), recherche globale integree
- **Session 6** : 2FA TOTP (src/utils/totp.ts pur crypto), /admin/security page
- **Session 7** : BillingCharts.tsx, /admin/referrals page, endpoints referrals + tiers
- **Session 8** : /system/crons page + CronActions.tsx, /admin/setup checklist

### 1.17 Infrastructure & Monitoring
- **Health checks** : `/health`, `/infra/health`, `/avatar/pipeline/health`
- **SSE events** : `/stream/events` (flux temps reel) + `/portal/notifications/stream`
- **Autonomie** : score 0-100, rapport detaille
- **Token tracking** : usage par agent et par modele
- **Events** : journal complet avec filtrage
- **Session tracking** : JWT avec revocation, multi-sessions
- **Activity log** : journal d'activite par user en DB
- **Cron jobs** : 10+ taches automatiques (reset quotidien, expiration demo, alertes solde bas, nettoyage, auto-topup, repondeur summaries, GDPR cleanup, check alarms, parrainage, check_batch_results)
- **Dark mode** : toggle avec CSS variables + persistence preferences

---

## 2. Ou trouver les features speciales

### Comptes Demo
- **Creation** : `POST /auth/register` avec tier `demo` OU `POST /admin/users` avec tier `demo`
- **Expiration auto** : cron job verifie toutes les heures, desactive apres 7 jours (configurable `DEMO_DEFAULT_DAYS`)
- **Donnees de test** : `scripts/seed-users.ts` → utilisateur `demo@freenzy.test` / cle `test-demo-key-2024`
- **Service** : `src/users/user.service.ts` lignes 26-50

### Codes Promo
- **Routes admin** : `POST /admin/promo-codes` (creer) | `GET /admin/promo-codes` (lister) | `DELETE /admin/promo-codes/:code` (desactiver)
- **Routes publiques** : `POST /promo/redeem` (utiliser) | `GET /promo/validate/:code` (verifier)
- **Service** : `src/users/promo.service.ts`
- **Codes de test** : `WELCOME2024` (upgrade tier → free) | `DEMO30` (extend demo 30 jours)
- **Schema DB** : `scripts/init-db.sql` lignes 216-241

### Tiers Utilisateurs (guest/demo/free/paid)
- **Definition** : `src/users/user.types.ts` — hierarchy guest(1) → demo(2) → free(3) → paid(4)
- **Limites quotidiennes** : guest=10, demo=100, free=100, paid=10000 appels API
- **Configurable** via `.env` : `GUEST_DAILY_LIMIT`, `FREE_DAILY_LIMIT`, `PAID_DAILY_LIMIT`

### Wallet & Micro-Credits
- **Service** : `src/billing/wallet.service.ts`
- **Types** : `src/billing/billing.types.ts` — 1 credit = 1,000,000 micro-credits
- **Marge** : 20% sur chaque appel LLM (configurable `TOKEN_MARGIN_PERCENT`)
- **Depot** : `POST /billing/deposit` body: `{ "amount": 10, "reference": "test" }`

### Campagnes
- **Service** : `src/campaigns/campaign.service.ts`
- **Routes** : `src/security/routes/campaign.routes.ts`
- **Workflow** : creer (draft) → soumettre (`/campaigns/:id/submit`) → approuver (`/campaigns/:id/approve`)

### Cron Jobs Automatiques
- **Service** : `src/core/cron/cron.service.ts`
- `reset_daily_api_calls` — reset compteur quotidien (toutes les heures, 1x/jour)
- `expire_demo_accounts` — desactive demos expires (toutes les heures)
- `low_balance_alerts` — notifie si solde < 10% (toutes les 6h)
- `cleanup_stale_data` — purge historique > 30j et notifications > 90j (quotidien)
- `check_auto_topup` — verifie auto-recharge wallets (toutes les 30 min)
- `repondeur_hourly_summary` — resume repondeur horaire (Batch API si 3+ users, −50% cout)
- `repondeur_daily_summary` — resume repondeur quotidien 20h Paris (Batch API si 3+ users)
- `repondeur_gdpr_cleanup` — purge RGPD messages expires (quotidien)
- `check_alarms` — verifie et declenche les reveils intelligents (chaque minute)
- `check_referral_qualifications` — qualification parrainage 2 mois (quotidien)
- `check_batch_results` — poll les batches Anthropic en cours (toutes les 15 min)

### Avatars (Sarah & Emmanuel)
- **Configs** : `src/avatar/config/sarah.config.ts` + `emmanuel.config.ts`
- **Personas** : `GET /avatar/personas` | `POST /avatar/personas/switch`
- **Conversations** : `POST /avatar/conversation/start` → `/turn` → `/end`
- **DB** : presets dans `scripts/init-db.sql` lignes 402-421

---

## 3. Limites actuelles

### 3.1 Stubs restants (code present mais pas connecte)

| Feature | Fichier | Probleme |
|---------|---------|----------|
| **Email notif** | `src/notifications/notification.service.ts:72` | Log-only, pas de SendGrid/SES (Resend pour auth emails) |
| **Webhook notif** | `src/notifications/notification.service.ts:96` | Queue sans livraison |
| **TTS (Telnyx)** | `src/avatar/services/tts/tts.service.ts:111` | Retourne buffer factice (ElevenLabs est actif) |
| **TTS (Inworld)** | `src/avatar/services/tts/tts.service.ts:125` | Retourne buffer factice |
| **ASR (AssemblyAI)** | `src/avatar/services/asr/asr.service.ts:74` | Retourne texte factice |
| **ASR (Whisper)** | `src/avatar/services/asr/asr.service.ts:92` | Retourne texte factice |
| **Video (D-ID)** | `src/avatar/services/video/video.service.ts:92` | URL factice |
| **Send Email (agent)** | `src/agents/level1-execution/communication/communication.tools.ts:36` | Stub |
| **Post Slack (agent)** | `src/agents/level1-execution/communication/communication.tools.ts:50` | Stub |
| **Post LinkedIn/X/IG** | `src/agents/level1-execution/social-media/social-media.tools.ts` | Stubs |
| **Calendar sync** | `src/agents/level1-execution/scheduling/scheduling.tools.ts` | Stub |
| **Monitoring real** | `src/agents/level1-execution/monitoring/monitoring.tools.ts` | Stubs |

**Maintenant actifs (plus des stubs) :**
- Twilio SMS/Voice/WhatsApp ✓ (SDK reel, degradation gracieuse)
- ElevenLabs TTS ✓ (eleven_multilingual_v2, voix George + autres)
- Resend email ✓ (auth transactionnel)

### 3.2 Pas encore implemente

| Feature | Impact | Notes |
|---------|--------|-------|
| **Stripe** | CRITIQUE | Pas de paiement automatique, depots manuels uniquement |
| **LLM Open-Source** | MOYEN | Pas de Mistral/Llama, uniquement Claude |
| **Deploiement auto** | BAS | Docker local fonctionne, pas de push registry |
| **pgvector embeddings** | BAS | Extension installee, pas encore utilisee pour la recherche |

### 3.3 Securite a renforcer avant production

| Point | Localisation | Risque |
|-------|-------------|--------|
| JWT_SECRET par defaut | `.env.example:44` | `change-me-in-production` |
| ENCRYPTION_KEY par defaut | `.env.example:46` | `change-me-32-byte-key-here!!!!!` |
| API keys par defaut | `.env.example:49-52` | `admin-key-change-me` etc. |
| Pas de HTTPS | Docker | HTTP uniquement en dev |
| Pas de rate-limit avance | Middleware | Rate-limit basique global |

---

## 4. Architecture technique

```
┌──────────────────────────────────────────────────┐
│                 Freenzy.io v0.17.0                │
├──────────────────────────────────────────────────┤
│  Dashboard (Next.js 14)          :3001           │
│  ├─ 80+ pages (admin, client, systeme, infra)    │
│  ├─ Dark mode + gamification + activity log      │
│  └─ API Client → Backend                        │
├──────────────────────────────────────────────────┤
│  Backend (Node.js / Express 5 / TS)  :3010       │
│  ├─ 80+ API Routes (REST + SSE)                  │
│  ├─ 24 AI Agents (12+12 L1 + 4 L2 + 4 L3)      │
│  ├─ JWT Auth + RBAC + Sessions + Reset Password  │
│  ├─ Billing (Wallet + LLM Proxy + Margin)        │
│  ├─ Twilio SDK (SMS, Voice, WhatsApp)            │
│  ├─ ElevenLabs TTS (7 voix, multilingual_v2)     │
│  ├─ Multi-Projets (isolation totale)             │
│  ├─ Reveil Intelligent (cron + appel/WA)         │
│  ├─ fal.ai (photo + video generation)             │
│  ├─ Cron Jobs (10+ taches auto)                   │
│  ├─ EventBus + SSE Streaming                     │
│  └─ Circuit Breaker + Budget Guards              │
├──────────────────────────────────────────────────┤
│  PostgreSQL 16 + pgvector           :5432        │
│  ├─ 28+ tables (users, wallets, projects...)     │
│  ├─ repondeur, whatsapp, user_alarms             │
│  ├─ campaigns, notifications, activity_log       │
│  └─ agents, events, tasks, approvals             │
├──────────────────────────────────────────────────┤
│  Redis 7                            :6379        │
│  └─ Cache, sessions, rate-limiting               │
├──────────────────────────────────────────────────┤
│  Services externes                               │
│  ├─ Anthropic Claude (Haiku/Sonnet/Opus + Cache) │
│  ├─ Twilio (SMS, Voice, WhatsApp)                │
│  ├─ ElevenLabs (TTS premium)                     │
│  └─ Resend (emails transactionnels)              │
└──────────────────────────────────────────────────┘
```

### Stack
- **Runtime** : Node.js 20+ / TypeScript strict
- **Framework** : Express 5
- **Base de donnees** : PostgreSQL 16 + pgvector
- **Cache** : Redis 7 (LRU 256MB)
- **Frontend** : Next.js 14 (App Router, standalone)
- **LLM** : Anthropic SDK @anthropic-ai/sdk ^0.39.0
- **Telephonie** : Twilio SDK ^5.12.2
- **TTS** : ElevenLabs (eleven_multilingual_v2)
- **Containerisation** : Docker Compose (4 services)
- **Tests** : Jest (88+ suites)

---

## 5. Tous les endpoints API (80+ routes)

### Auth (5 routes)
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/auth/register` | Creer un compte |
| POST | `/auth/login` | Se connecter (API key ou email+password) → JWT |
| GET | `/auth/me` | Profil du user connecte |
| POST | `/auth/forgot-password` | Envoyer email reset password |
| POST | `/auth/reset-password` | Reinitialiser mot de passe |

### Admin (7 routes) — role admin requis
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/admin/users` | Creer un utilisateur |
| GET | `/admin/users` | Lister les utilisateurs (filtre: role, tier, search) |
| GET | `/admin/users/:id` | Detail d'un utilisateur |
| PATCH | `/admin/users/:id` | Modifier un utilisateur |
| DELETE | `/admin/users/:id` | Desactiver (soft delete) |
| POST | `/admin/users/:id/reset-key` | Regenerer la cle API |
| GET | `/admin/stats` | Statistiques plateforme |

### Billing (8 routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/billing/wallet` | Mon wallet |
| POST | `/billing/deposit` | Deposer des credits |
| GET | `/billing/transactions` | Historique transactions |
| GET | `/billing/usage` | Consommation LLM |
| GET | `/billing/pricing` | Prix par modele |
| POST | `/billing/llm` | Appel LLM avec facturation |
| POST | `/billing/llm/stream` | Appel LLM en streaming SSE |
| GET | `/billing/admin/stats` | Stats revenus (admin) |

### Campaigns (9 routes)
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/campaigns` | Creer une campagne |
| GET | `/campaigns` | Mes campagnes |
| GET | `/campaigns/:id` | Detail campagne |
| PATCH | `/campaigns/:id` | Modifier campagne |
| DELETE | `/campaigns/:id` | Supprimer campagne |
| POST | `/campaigns/:id/submit` | Soumettre pour approbation |
| POST | `/campaigns/:id/approve` | Approuver (admin) |
| POST | `/campaigns/:id/posts` | Creer un post |
| GET | `/campaigns/:id/posts` | Lister les posts |

### Notifications (4 routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/notifications` | Mes notifications |
| GET | `/notifications/unread-count` | Compteur non-lus |
| POST | `/notifications/:id/read` | Marquer comme lu |
| POST | `/notifications/send` | Envoyer (admin/system) |

### Portal Client (12+ routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/portal/profile` | Mon profil |
| GET | `/portal/dashboard` | Tableau de bord agrege |
| GET | `/portal/wallet` | Mon wallet + transactions |
| GET | `/portal/usage` | Ma consommation |
| GET/PATCH | `/portal/preferences` | Preferences utilisateur |
| GET/PATCH | `/portal/company-profile` | Profil entreprise |
| GET | `/portal/gamification` | Stats gamification |
| GET | `/portal/activity` | Journal d'activite |
| GET | `/portal/sessions` | Sessions actives |
| GET | `/portal/notifications/stream` | SSE notifications temps reel |
| GET/POST/PATCH/DELETE | `/portal/alarms` | Reveils intelligents CRUD |
| GET/POST/PATCH/DELETE | `/portal/projects` | Projets CRUD |

### Promo Codes (5 routes)
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/admin/promo-codes` | Creer (admin) |
| GET | `/admin/promo-codes` | Lister (admin) |
| DELETE | `/admin/promo-codes/:code` | Desactiver (admin) |
| POST | `/promo/redeem` | Utiliser un code |
| GET | `/promo/validate/:code` | Verifier un code |

### Agents (6 routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/agents` | Liste des 28 agents |
| POST | `/agents/:id/execute` | Executer une tache |
| POST | `/agents/:id/pause` | Mettre en pause |
| POST | `/agents/:id/resume` | Reprendre |
| GET | `/agents/:id/health` | Health check agent |
| GET | `/agents/:id/history` | Historique (events) |

### Avatar (14 routes)
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/avatar/conversation/start` | Demarrer session |
| POST | `/avatar/conversation/turn` | Tour de conversation |
| POST | `/avatar/conversation/end` | Terminer session |
| GET | `/avatar/conversations/active` | Sessions actives |
| POST | `/avatar/asr/transcribe` | Transcrire (stub) |
| POST | `/avatar/tts/synthesize` | Synthetiser voix (stub) |
| POST | `/avatar/telephony/call` | Appel sortant (stub) |
| POST | `/avatar/telephony/webhook` | Webhook entrant (stub) |
| GET | `/avatar/telephony/calls` | Historique appels |
| GET | `/avatar/personas` | Lister personas |
| POST | `/avatar/personas/switch` | Changer persona |
| GET | `/avatar/pipeline/metrics` | Metriques pipeline |
| GET | `/avatars/presets` | Presets avatar |
| GET | `/avatars/clients` | Clients actifs par avatar |

### Systeme (17 routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/health` | Sante systeme |
| GET | `/infra/health` | Sante infrastructure |
| GET | `/avatar/pipeline/health` | Sante pipeline avatar |
| GET | `/approvals/pending` | Queue d'approbation |
| POST | `/approvals/:id/decide` | Decider (approuver/refuser) |
| GET | `/tokens/usage` | Usage tokens par agent |
| GET | `/autonomy/report` | Rapport autonomie |
| GET | `/autonomy/score` | Score autonomie |
| GET | `/improvement/history` | Historique ameliorations |
| GET | `/scheduler/tasks` | Taches planifiees |
| GET | `/events/recent` | Events recents |
| GET | `/events/stats` | Stats events |
| GET | `/financial/summary` | Resume financier |
| GET | `/financial/costs` | Ventilation couts |
| GET | `/financial/charity` | Allocation charite |
| POST | `/memory/store` | Stocker memoire |
| POST | `/memory/search` | Chercher memoire |
| GET | `/memory/:id` | Lire memoire |
| DELETE | `/memory/:id` | Supprimer memoire |
| POST | `/tasks` | Creer tache |
| GET | `/tasks` | Lister taches |
| GET | `/tasks/:id` | Detail tache |
| DELETE | `/tasks/:id` | Supprimer tache |
| GET | `/state` | Etat systeme complet |
| GET | `/roadmap/tasks` | Taches roadmap |
| GET | `/stream/events` | Flux SSE temps reel |

---

## 6. Dashboard

**URL locale** : http://localhost:3001
**Pages** : 80+ pages (admin + client + systeme + infra + public)

### Nouveautes v0.17.0 (Deep Discussions)
- Deep Discussions : 85+ templates, 16 categories, 17 tags, modele Opus
- Partage social (Twitter, LinkedIn, Facebook, WhatsApp, Email)
- Completion de discussion avec bilan structure
- Prompts adaptatifs selon profondeur (3 niveaux)
- Edition inline du titre, retry on error, textarea auto-expanding
- Export Markdown, recherche + filtrage par tags

### Nouveautes v0.16.0 (Admin Dashboard Refonte — 8 sessions)
- SlideOver, Toast, SkeletonLoader composants UI
- AdminCharts + OverviewCharts + BillingCharts (Recharts)
- User detail page (Feature Flags, Danger Zone, impersonation)
- Diagnostics live (Anthropic, ElevenLabs, Email, SMS)
- GlobalSearch (Cmd+K)
- 2FA TOTP (pur crypto, /admin/security)
- /admin/referrals + /system/crons + /admin/setup
- Agent Config SlideOver

### Nouveautes v0.15.0 (Studio fal.ai + Redesign)
- Studio photo : fal.ai Flux/schnell (synchrone), galerie, questions avancees
- Studio video : fal.ai LTX Video (async) + D-ID, bibliotheque video, projets
- Mode "Demandes agents" avec file d'attente
- Landing page complete (11 sections, bento grid)
- Navigation simplifiee (Demo + Login uniquement)

### Historique v0.14.1 (Cost Optimization)
- Prompt Caching Anthropic (−89% tokens systeme)
- Tier Haiku pour classification repondeur + categorisation budget
- Batch API pour summaries (−50% cout)
- Redis memoization pour requetes identiques

### Historique v0.11.0
- Navigation sidebar restructuree
- Page Reseaux sociaux complete
- Pages vitrine Formations et Video Pro
- Integration Twilio + ElevenLabs approfondies

### Section Admin (server components)
| Page | Path | Contenu |
|------|------|---------|
| **Overview** | `/` | Status, version, phase, uptime + liste 24 agents |
| **Utilisateurs** | `/admin/users` | CRUD utilisateurs, roles, tiers |
| **Billing** | `/admin/billing` | Gestion facturation, wallets, transactions |
| **Control** | `/admin/control` | Controle systeme |
| **Financial** | `/admin/financial` | Tableau de bord financier |
| **Promo** | `/admin/promo` | Gestion des codes promo |
| **Tokens** | `/admin/tokens` | Gestion des tokens API |
| **Guide** | `/admin/guide` | Guide de gestion (8 sections) |
| **Roadmap** | `/admin/roadmap` | Roadmap & integrations (16 items) |
| **Agents (noms)** | `/admin/agents` | Gestion noms agents |
| **Devis Entreprise** | `/admin/quotes` | Devis entreprises |
| **Creation sur mesure** | `/admin/custom-creation` | Gestion creations sur mesure |
| **Repondeur** | `/admin/repondeur` | Stats et configs repondeur |
| **Telephonie** | `/admin/telephony` | Gestion numeros Twilio |
| **Diagnostics** | `/admin/diagnostics` | Tests live (Anthropic, ElevenLabs, Email, SMS) |
| **Securite** | `/admin/security` | 2FA TOTP, audit securite |
| **Referrals** | `/admin/referrals` | Gestion parrainages + tiers |
| **Setup** | `/admin/setup` | Checklist configuration initiale |
| **User Detail** | `/admin/users/[id]` | Feature Flags, Danger Zone, impersonation |

### Section Analytics
| Page | Path | Contenu |
|------|------|---------|
| **Studio** | `/admin/analytics/studio` | Analytics video/photo |
| **Documents** | `/admin/analytics/documents` | Analytics documents |
| **Voice & Visio** | `/admin/analytics/voice` | Analytics voix et visio |

### Section Systeme
| Page | Path | Contenu |
|------|------|---------|
| **Agents** | `/system/agents` | Agents groupes par niveau (L1/L2/L3) avec status |
| **Events** | `/system/events` | Journal des evenements |
| **Approvals** | `/system/approvals` | Queue d'approbation avec badges status |
| **Autonomy** | `/system/autonomy` | Score et rapport d'autonomie |
| **Tasks** | `/system/tasks` | Suivi des taches |
| **Crons** | `/system/crons` | Gestion cron jobs + CronActions |

### Section Infra
| Page | Path | Contenu |
|------|------|---------|
| **Avatar** | `/infra/avatar` | Sante des 5 services (ASR, TTS, Video, Telephony, Bridge) |
| **Health** | `/infra/health` | Health checks systeme |
| **Memory** | `/infra/memory` | Gestion memoire IA |
| **Metrics** | `/infra/metrics` | Usage tokens + metriques |

### Section Client (interactive, 'use client')
| Page | Path | Contenu |
|------|------|---------|
| **Dashboard** | `/client/dashboard` | Vue aggregee client |
| **Discutez avec vos agents** | `/client/chat` | Chat IA + section Reunions |
| **Briefing du jour** | `/client/briefing` | Briefings et taches quotidiennes |
| **Documents** | `/client/documents` | Gestion documentaire + generation |
| **Reseaux sociaux** | `/client/social` | Generateur posts, calendrier, connexion API |
| **Studio Creatif** | `/client/studio` | Hub photo (1er) + video |
| **Studio Photo** | `/client/studio/photo` | Generation photos IA + questions avancees |
| **Studio Video** | `/client/studio/video` | Generation videos IA + questions avancees |
| **Visio Agents** | `/client/visio` | Appels visio avec agents |
| **Visio Call** | `/client/visio/[agentId]` | Appel visio individuel (fix micro) |
| **Visio Diagnostic** | `/client/visio/diagnostic` | Diagnostic audio 7 etapes |
| **Plan d'attaque** | `/client/strategy` | Planning strategique IA |
| **Mes agents persos** | `/client/personal` | Equipe + agents perso fusionnes |
| **Personnaliser** | `/client/agents/customize` | Personnalisation agents + voix ElevenLabs |
| **Formations** | `/client/formations` | Page vitrine formations (6 cours) |
| **Video Pro** | `/client/video-pro` | Page vitrine services video (6 services) |
| **Creations sur mesure** | `/client/custom-creation` | Demande devis projets custom |
| **Mon entreprise** | `/client/onboarding` | Profil entreprise 7 etapes + analyse express |
| **Compte & Credits** | `/client/account` | Wallet, credits, transactions |
| **Parrainer** | `/client/referrals` | Programme de parrainage (fix code) |
| **Journal d'activite** | `/client/activity` | Historique activite (fix timeout) |
| **Repondeur** | `/client/repondeur` | Config repondeur + telephonie Twilio |
| **Meeting** | `/client/meeting` | Reunions multi-agents (6 templates) |
| **Marketplace** | `/client/marketplace` | Marketplace d'agents |
| **WhatsApp** | `/client/whatsapp` | Integration WhatsApp (fix timeout) |
| **Discussions** | `/client/discussions` | Deep Discussions (85+ templates, Opus, tags, partage social) |
| **Agents Perso Creer** | `/client/agents/create` | Creation d'agents personnalises |
| **Agents Liste** | `/client/agents` | Liste des agents du client |
| **Modules** | `/client/modules` | Gestion des modules actifs |
| **Notifications** | `/client/notifications` | Centre de notifications |
| **Projets** | `/client/projects` | Gestion multi-projets |
| **Campagnes** | `/client/campaigns` | Campagnes marketing |
| **Finances** | `/client/finances` | Suivi financier client |
| **Journee** | `/client/journee` | Planning de la journee |
| **Reveil** | `/client/reveil` | Configuration reveil intelligent |
| **Telephonie** | `/client/telephony` | Gestion telephonie client |

### Pages publiques
| Page | Path | Contenu |
|------|------|---------|
| **Accueil** | `/` | Landing page |
| **Login** | `/login` | Connexion (email + password + API key) |
| **Register** | `/register` | Inscription + selection agents |
| **Reset Password** | `/reset-password` | Reinitialisation mdp |
| **Plans** | `/plans` | Tarifs et abonnements |
| **Demo** | `/demo` | Page demo |
| **Legal** | `/legal/*` | Pages legales (CGU, confidentialite) |

### Theme
- Dark/Light theme toggle
- Sidebar navigation (220px) avec 5 sections
- Responsive grid layouts
- 1000+ classes CSS reutilisables

---

## 7. Comptes de test

### Utilisateurs pre-configures (apres seed)

| Email | Role | Tier | API Key |
|-------|------|------|---------|
| `admin@freenzy.test` | admin | paid | `test-admin-key-2024` |
| `operator@freenzy.test` | operator | paid | `test-operator-key-2024` |
| `viewer@freenzy.test` | viewer | free | `test-viewer-key-2024` |
| `guest@freenzy.test` | viewer | guest | `test-guest-key-2024` |
| `demo@freenzy.test` | viewer | demo | `test-demo-key-2024` |
| `free@freenzy.test` | viewer | free | `test-free-key-2024` |
| `paid@freenzy.test` | operator | paid | `test-paid-key-2024` |

### Codes promo disponibles

| Code | Effet | Valeur | Max utilisations |
|------|-------|--------|-----------------|
| `WELCOME2024` | Upgrade tier | → free | 100 |
| `DEMO30` | Extension demo | +30 jours | 50 |

### Comment se connecter

```bash
# Login avec API key → obtenir JWT
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "test-admin-key-2024"}'

# Utiliser le JWT pour les appels suivants
curl http://localhost:3010/billing/wallet \
  -H "Authorization: Bearer <token>"
```

### Seeder les donnees
```bash
# Depuis le repertoire du projet
npx tsx scripts/seed-users.ts
```

---

## 8. Evolutions proposees

### Phase 15 — Optimisation Couts LLM (TERMINE — v0.14.1) ✓
- Prompt caching Anthropic (−90% tokens systeme repetes) ✓
- Haiku tier (ultra-fast) pour classification et taches simples ✓
- Batch API pour summaries repondeur (−50% sur traitements batch) ✓
- Redis memoization pour requetes identiques ✓
- ADR-004 Cost Optimization Strategy ✓

### Phase 16 — Studio fal.ai + Redesign (TERMINE — v0.15.0) ✓
- Studio photo fal.ai Flux/schnell (synchrone, galerie) ✓
- Studio video fal.ai LTX Video (async queue) + D-ID ✓
- Mode "Demandes agents" avec file d'attente ✓
- Landing page complete (11 sections, bento grid) ✓
- Navigation simplifiee Demo + Login ✓

### Phase 17 — Admin Dashboard Refonte (TERMINE — v0.16.0) ✓
- SlideOver, Toast, SkeletonLoader composants UI ✓
- AdminCharts + OverviewCharts + BillingCharts (Recharts) ✓
- User detail (Feature Flags, Danger Zone, impersonation JWT 1h) ✓
- Diagnostics live (Anthropic, ElevenLabs, Email, SMS) ✓
- GlobalSearch Cmd+K ✓
- 2FA TOTP (pur crypto) + /admin/security ✓
- /admin/referrals + /system/crons + /admin/setup ✓
- Agent Config SlideOver ✓

### Phase 18 — Deep Discussions (TERMINE — v0.17.0) ✓
- 85+ templates de discussions profondes (12 sections, 16 categories) ✓
- 17 tags transversaux avec filtrage combine ✓
- Modele Opus avec Extended Thinking ✓
- Alertes de sensibilite + mode challenge ✓
- Partage social (Twitter, LinkedIn, Facebook, WhatsApp, Email) ✓
- Flow de completion avec bilan structure ✓
- Prompts adaptatifs (3 niveaux de profondeur) ✓
- Edition inline titre, retry on error, textarea auto-expand ✓
- Export Markdown, recherche templates ✓

### Phase 19 — Integration Stripe & Paiement (A VENIR)
- Webhook Stripe pour rechargement automatique
- Checkout Session pour achat de credits
- Auto-topup integre
- Factures PDF automatiques
- Abonnements mensuels

### Phase 20 — ASR & Avatar Video (A VENIR)
- Deepgram ASR pour transcription temps reel
- D-ID Streaming pour video avatar Sarah/Emmanuel
- Pipeline complete : audio → texte → LLM → voix → video
- WebRTC pour conversations temps reel

### Phase 21 — Integrations Sociales (A VENIR)
- LinkedIn API (OAuth2 + posting)
- X/Twitter API v2
- Instagram Graph API (via Meta Business)
- Scheduling automatique des posts
- Analytics engagement

### Ameliorations continues
- Migration system (Flyway/custom) au lieu de monolithique SQL
- pgvector pour recherche semantique dans Knowledge Agent
- WebSocket en plus de SSE
- Tests E2E avec Playwright
- Monitoring Prometheus + Grafana
- Logs structures avec correlation IDs

---

## 9. Pour demarrer : premiers clients

### Inscription self-service (recommande)

Les clients s'inscrivent eux-memes via le dashboard :

1. **Aller sur** http://localhost:3001/login (cliquer "Creer un compte")
2. **Remplir** : nom, email, mot de passe (min 10 car., majuscule + minuscule + chiffre)
3. **Accepter** les CGU
4. **Selectionner** les agents souhaites
5. **Completer** le profil entreprise (onboarding guide en 7 etapes)

A l'inscription, le systeme provisionne automatiquement :
- Compte cree en tier `free` (role `viewer`)
- **50 credits offerts** (signup bonus)
- Code de parrainage genere (FZ-XXXXXX)
- Wallet cree avec le bonus
- Projet par defaut cree
- Notification de bienvenue in-app
- Email de confirmation envoye (24h)

Les **credits sont la seule limite**. Quand les credits sont epuises, le client doit recharger via la page Compte & Credits. Pas de limite d'appels/jour arbitraire.

### Pour l'administrateur

1. **Lancer l'infrastructure** : `docker-compose up -d` (PostgreSQL + Redis)
2. **Lancer le backend** : `npm run dev` (port 3010)
3. **Lancer le dashboard** : `cd src/dashboard && npm run dev` (port 3001)
4. **Se connecter en admin** : http://localhost:3001/login (smadja99@gmail.com / Polmpolm1$)
5. **Gerer les clients** : http://localhost:3001/admin/users (CRUD, tiers, credits)
6. **Deposer des credits** : page detail utilisateur > bouton Deposer

### Donnees de test (optionnel, dev uniquement)

```bash
npx tsx scripts/seed-users.ts
```

Cree 7 comptes de test + 2 codes promo (voir section 7). **Non requis pour les vrais clients** — l'inscription self-service suffit.

### Test local (meme experience que production)

1. Ouvrir http://localhost:3001/login en navigation privee
2. Creer un compte avec un email test (ex: test1@example.com)
3. Verifier : 50 credits, notification de bienvenue, redirection onboarding
4. Envoyer un message a un agent — verifier la facturation par token
5. Laisser les credits s'epuiser — verifier le message d'erreur avec lien recharge

---

## Annexe : Variables d'environnement

Voir `.env.example` pour la liste complete. Variables critiques :

| Variable | Statut | Notes |
|----------|--------|-------|
| `ANTHROPIC_API_KEY` | **Configure** | Cle API Claude fonctionnelle |
| `DATABASE_URL` | **Configure** | PostgreSQL 16 + pgvector |
| `REDIS_URL` | **Configure** | Redis 7 |
| `JWT_SECRET` | **A changer** | Utilise une valeur par defaut — changer avant production |
| `ENCRYPTION_KEY` | **A changer** | Utilise une valeur par defaut — changer avant production |
| `TOKEN_MARGIN_PERCENT` | configurable | Marge sur chaque appel LLM |
| `DEMO_DEFAULT_DAYS` | 7 jours | Duree des comptes demo |
| `LLM_DAILY_LIMIT_CREDITS` | Non defini | Limite de depense par jour par user (optionnel) |
| `CLAUDE_MODEL_ULTRAFAST` | claude-haiku-4-5-20251001 | Override modele Haiku |
| `CLAUDE_MODEL_FAST` | claude-sonnet-4-20250514 | Override modele Sonnet L1 |
| `CLAUDE_MODEL_STANDARD` | claude-sonnet-4-20250514 | Override modele Sonnet L2 |
| `CLAUDE_MODEL_ADVANCED` | claude-opus-4-6 | Override modele Opus L3 |
| `NODE_ENV` | development | Passer a `production` avant deploiement |
| `STRIPE_SECRET_KEY` | Non configure | Pour integration Stripe (phase suivante) |
