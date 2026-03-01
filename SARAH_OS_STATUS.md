# SARAH OS — Etat Complet du Projet

**Version :** 0.10.0 | **Phase :** 10 / Real Anthropic SDK | **Date :** 2026-03-01
**Tests :** 64 suites, 683 tests (tous passent) | **TypeScript :** 0 erreurs | **Dashboard :** 34+ pages, build OK

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
- **Appels Claude reels** via Anthropic SDK (Sonnet pour L1/L2, Opus pour L3)
- **Facturation par token** avec marge de 20% automatique
- **Streaming SSE** (`POST /billing/llm/stream`) pour reponses en temps reel
- **Extended Thinking** pour les agents L3 (Opus) — raisonnement profond
- **Circuit breaker** : coupe apres 5 echecs consecutifs, reprend apres 60s
- **Budget journalier** par utilisateur (configurable)
- **Suivi des couts** : chaque appel logge dans `llm_usage_log` avec cout reel + marge

### 1.2 Systeme Multi-Agents (15 agents)
- **L1 Execution (7)** : Communication, Task Execution, Knowledge, Scheduling, Content, Social Media, Monitoring
- **L2 Management (4)** : Operations Manager, Growth Manager, Technical Manager, Knowledge Manager
- **L3 Executive (4)** : Chief Orchestration, Strategy, Self-Improvement, Autonomy Expansion
- Chaque agent a des prompts optimises (JSON output, gestion d'erreur)
- Les L3 beneficient de l'extended thinking (raisonnement profond)
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

### 1.10 Infrastructure & Monitoring
- **Health checks** : `/health`, `/infra/health`, `/avatar/pipeline/health`
- **SSE events** : `/stream/events` (flux temps reel)
- **Autonomie** : score 0-100, rapport detaille
- **Token tracking** : usage par agent et par modele
- **Events** : journal complet avec filtrage
- **Cron jobs** : 4 taches automatiques (reset quotidien, expiration demo, alertes solde bas, nettoyage)

---

## 2. Ou trouver les features speciales

### Comptes Demo
- **Creation** : `POST /auth/register` avec tier `demo` OU `POST /admin/users` avec tier `demo`
- **Expiration auto** : cron job verifie toutes les heures, desactive apres 7 jours (configurable `DEMO_DEFAULT_DAYS`)
- **Donnees de test** : `scripts/seed-users.ts` → utilisateur `demo@sarah-os.test` / cle `test-demo-key-2024`
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

### Avatars (Sarah & Emmanuel)
- **Configs** : `src/avatar/config/sarah.config.ts` + `emmanuel.config.ts`
- **Personas** : `GET /avatar/personas` | `POST /avatar/personas/switch`
- **Conversations** : `POST /avatar/conversation/start` → `/turn` → `/end`
- **DB** : presets dans `scripts/init-db.sql` lignes 402-421

---

## 3. Limites actuelles

### 3.1 Stubs (code present mais pas connecte)

| Feature | Fichier | Probleme |
|---------|---------|----------|
| **WhatsApp** | `src/notifications/notification.service.ts:62` | Log-only, pas d'API Meta |
| **Email** | `src/notifications/notification.service.ts:72` | Log-only, pas de SendGrid/SES |
| **SMS** | `src/notifications/notification.service.ts:82` | Log-only, pas de Twilio SMS |
| **Webhook** | `src/notifications/notification.service.ts:96` | Queue sans livraison |
| **TTS (Telnyx)** | `src/avatar/services/tts/tts.service.ts:111` | Retourne buffer factice |
| **TTS (Inworld)** | `src/avatar/services/tts/tts.service.ts:125` | Retourne buffer factice |
| **ASR (AssemblyAI)** | `src/avatar/services/asr/asr.service.ts:74` | Retourne texte factice |
| **ASR (Whisper)** | `src/avatar/services/asr/asr.service.ts:92` | Retourne texte factice |
| **Video (D-ID)** | `src/avatar/services/video/video.service.ts:92` | URL factice |
| **Telephonie (Twilio)** | `src/avatar/services/telephony/telephony.service.ts:31` | CallSid factice |
| **Send Email (agent)** | `src/agents/level1-execution/communication/communication.tools.ts:36` | Stub |
| **Post Slack (agent)** | `src/agents/level1-execution/communication/communication.tools.ts:50` | Stub |
| **Post LinkedIn/X/IG** | `src/agents/level1-execution/social-media/social-media.tools.ts` | Stubs |
| **Calendar sync** | `src/agents/level1-execution/scheduling/scheduling.tools.ts` | Stub |
| **Monitoring real** | `src/agents/level1-execution/monitoring/monitoring.tools.ts` | Stubs |

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
│                   SARAH OS v0.10.0               │
├──────────────────────────────────────────────────┤
│  Dashboard (Next.js 14)          :3001           │
│  ├─ Overview, Agents, Events, Approvals          │
│  ├─ Avatar Pipeline, Metrics                     │
│  └─ API Client → Backend                        │
├──────────────────────────────────────────────────┤
│  Backend (Node.js / Express / TS)   :3010        │
│  ├─ 79 API Routes (REST + SSE)                   │
│  ├─ 15 AI Agents (L1/L2/L3)                     │
│  ├─ JWT Auth + RBAC                              │
│  ├─ Billing (Wallet + LLM Proxy + Margin 20%)   │
│  ├─ Cron Jobs (4 taches auto)                    │
│  ├─ EventBus + SSE Streaming                     │
│  └─ Circuit Breaker + Budget Guards              │
├──────────────────────────────────────────────────┤
│  PostgreSQL 16 + pgvector           :5432        │
│  ├─ users, wallets, transactions                 │
│  ├─ campaigns, notifications                     │
│  ├─ llm_usage_log, cron_history                  │
│  └─ agents, events, tasks, approvals             │
├──────────────────────────────────────────────────┤
│  Redis 7                            :6379        │
│  └─ Cache, sessions, rate-limiting               │
├──────────────────────────────────────────────────┤
│  Anthropic Claude API (externe)                  │
│  ├─ Sonnet : agents L1 + L2 (fast/standard)     │
│  └─ Opus : agents L3 (advanced + thinking)       │
└──────────────────────────────────────────────────┘
```

### Stack
- **Runtime** : Node.js 20+ / TypeScript strict
- **Framework** : Express 4
- **Base de donnees** : PostgreSQL 16 + pgvector
- **Cache** : Redis 7 (LRU 256MB)
- **Frontend** : Next.js 14 (App Router, standalone)
- **LLM** : Anthropic SDK @anthropic-ai/sdk ^0.39.0
- **Containerisation** : Docker Compose (4 services)
- **Tests** : Jest (64 suites, 683 tests)

---

## 5. Tous les endpoints API

### Auth (3 routes)
| Methode | Path | Description |
|---------|------|-------------|
| POST | `/auth/register` | Creer un compte |
| POST | `/auth/login` | Se connecter (API key) → JWT |
| GET | `/auth/me` | Profil du user connecte |

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

### Portal Client (4 routes)
| Methode | Path | Description |
|---------|------|-------------|
| GET | `/portal/profile` | Mon profil |
| GET | `/portal/dashboard` | Tableau de bord agrege |
| GET | `/portal/wallet` | Mon wallet + transactions |
| GET | `/portal/usage` | Ma consommation |

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
| GET | `/agents` | Liste des 15 agents |
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
**Pages** : 34+ pages (admin + client + systeme + infra)

### Section Admin (server components)
| Page | Path | Contenu |
|------|------|---------|
| **Overview** | `/` | Status, version, phase, uptime + liste 15 agents |
| **Utilisateurs** | `/admin/users` | CRUD utilisateurs, roles, tiers |
| **Billing** | `/admin/billing` | Gestion facturation, wallets, transactions |
| **Control** | `/admin/control` | Controle systeme |
| **Financial** | `/admin/financial` | Tableau de bord financier |
| **Promo** | `/admin/promo` | Gestion des codes promo |
| **Tokens** | `/admin/tokens` | Gestion des tokens API |
| **Guide** | `/admin/guide` | Guide de gestion (8 sections) |
| **Roadmap** | `/admin/roadmap` | Roadmap & integrations (16 items) |

### Section Systeme
| Page | Path | Contenu |
|------|------|---------|
| **Agents** | `/system/agents` | Agents groupes par niveau (L1/L2/L3) avec status |
| **Events** | `/system/events` | Journal des evenements |
| **Approvals** | `/system/approvals` | Queue d'approbation avec badges status |
| **Autonomy** | `/system/autonomy` | Score et rapport d'autonomie |
| **Tasks** | `/system/tasks` | Suivi des taches |

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
| **Chat** | `/client/chat` | Interface de chat IA |
| **Account** | `/client/account` | Compte, credits, abonnement |
| **Team** | `/client/team` | Gestion de l'equipe d'agents |
| **Documents** | `/client/documents` | Gestion documentaire |
| **Briefing** | `/client/briefing` | Briefings et rapports |
| **Meeting** | `/client/meeting` | Gestion de reunions |
| **Strategy** | `/client/strategy` | Planning strategique |
| **Profile** | `/client/profile` | Profil entreprise |
| **Onboarding** | `/client/onboarding` | Assistant d'integration |
| **Agents Studio** | `/client/agents/customize` | Personnalisation des agents |

### Autres pages
| Page | Path | Contenu |
|------|------|---------|
| **Login** | `/login` | Connexion |
| **Register** | `/register` | Inscription |
| **Plans** | `/plans` | Tarifs et abonnements |

### Theme
- Dark theme (slate-950)
- Sidebar navigation (220px)
- Responsive grid layouts
- 1000+ classes CSS reutilisables

### Pages a enrichir (structure existante, contenu a completer)
- `/security` — audit securite

---

## 7. Comptes de test

### Utilisateurs pre-configures (apres seed)

| Email | Role | Tier | API Key |
|-------|------|------|---------|
| `admin@sarah-os.test` | admin | paid | `test-admin-key-2024` |
| `operator@sarah-os.test` | operator | paid | `test-operator-key-2024` |
| `viewer@sarah-os.test` | viewer | free | `test-viewer-key-2024` |
| `guest@sarah-os.test` | viewer | guest | `test-guest-key-2024` |
| `demo@sarah-os.test` | viewer | demo | `test-demo-key-2024` |
| `free@sarah-os.test` | viewer | free | `test-free-key-2024` |
| `paid@sarah-os.test` | operator | paid | `test-paid-key-2024` |

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

### Phase 11 — Integration Stripe & Paiement (PRIORITE HAUTE)
- Webhook Stripe pour rechargement automatique
- Checkout Session pour achat de credits
- Auto-topup quand solde bas
- Factures PDF automatiques
- Portal client avec historique paiements

### Phase 12 — Canaux reels (WhatsApp, Email, SMS)
- WhatsApp Business Cloud API (Meta)
- SendGrid ou SES pour email
- Twilio SMS
- Webhook reels pour notifications
- Templates de messages par canal

### Phase 13 — LLM Multi-Provider
- Support Mistral (mistral-large, mistral-medium)
- Support Llama (via Together AI ou Groq)
- Routing intelligent par cout/qualite/latence
- Fallback automatique entre providers
- Comparaison de prix dans le billing

### Phase 14 — Avatar Pipeline reel
- D-ID Streaming pour video avatar
- AssemblyAI ou Whisper pour ASR
- Telnyx ou ElevenLabs pour TTS
- Pipeline complete : audio → texte → LLM → voix → video
- WebRTC pour conversations temps reel

### Phase 15 — Social Media reels
- LinkedIn API (OAuth2 + posting)
- X/Twitter API v2
- Instagram Graph API (via Facebook)
- Scheduling automatique
- Analytics engagement

### Phase 16 — Ameliorations Dashboard
- Pages financieres (revenus, marges, projections)
- Page de gestion des avatars clients
- Roadmap visuelle
- Audit securite
- Graphiques temps reel (ChartJS ou Recharts)
- Responsive mobile

### Ameliorations continues
- Migration system (Flyway/custom) au lieu de monolithique SQL
- pgvector pour recherche semantique dans Knowledge Agent
- WebSocket en plus de SSE
- Tests E2E avec Playwright
- CI/CD pipeline (GitHub Actions)
- Monitoring Prometheus + Grafana
- Logs structures avec correlation IDs

---

## 9. Pour demarrer : premiers clients

### Etape 1 : Lancer le systeme
1. Demarrer l'infrastructure avec Docker Compose : `docker-compose up -d`
2. Demarrer le dashboard en mode dev : `cd src/dashboard && npm run dev`
3. Verifier les URLs :
   - **Backend** : http://localhost:3010 (verifier `/health`)
   - **Dashboard** : http://localhost:3001

### Etape 2 : Initialiser les donnees de test
- Lancer le script de seed : `npx tsx scripts/seed-users.ts`
- Cela cree 7 comptes de test + 2 codes promo (voir section 7)

### Etape 3 : Se connecter en admin
1. Se connecter via `POST /auth/login` avec la cle `test-admin-key-2024`
2. Le systeme retourne un token JWT valide 24h
3. Utiliser ce token pour toutes les operations admin

### Etape 4 : Tester les fonctionnalites cles
| Action | Endpoint | Description |
|--------|----------|-------------|
| Voir les stats | `GET /admin/stats` | Statistiques globales plateforme |
| Voir le wallet | `GET /billing/wallet` | Solde et micro-credits |
| Deposer des credits | `POST /billing/deposit` | Ajouter des credits (montant + reference) |
| Appel IA | `POST /billing/llm` | Envoyer un message a Claude avec facturation auto |
| Streaming IA | `POST /billing/llm/stream` | Reponse en streaming SSE |

### Etape 5 : Creer les comptes clients
- Via `POST /admin/users` : specifier email, nom, role (operator), tier (paid)
- Le systeme genere automatiquement une cle API unique pour chaque client
- Deposer des credits dans le wallet du nouveau client

### Etape 6 : Creer un code promo de lancement
- Via `POST /admin/promo-codes` : specifier le code, l'effet (bonus_calls, tier_upgrade, extend_demo), la valeur, et la date d'expiration
- Exemple : code "LAUNCH2026" donnant 50 credits bonus, valide jusqu'au 31/12/2026

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
| `TOKEN_MARGIN_PERCENT` | 20% | Marge sur chaque appel LLM |
| `DEMO_DEFAULT_DAYS` | 7 jours | Duree des comptes demo |
| `LLM_DAILY_LIMIT_CREDITS` | Non defini | Limite de depense par jour par user (optionnel) |
| `NODE_ENV` | development | Passer a `production` avant deploiement |
| `STRIPE_SECRET_KEY` | Non configure | Pour integration Stripe (phase suivante) |
