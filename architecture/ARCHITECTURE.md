# Freenzy.io — Architecture Document

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (LTS) | >=20 |
| Language | TypeScript (strict) | 5.7+ |
| Framework | Express.js | 5.x |
| Database | PostgreSQL + pgvector | 16+ |
| Cache/Bus | Redis | 7+ |
| LLM | Claude API (@anthropic-ai/sdk) | ^0.39.0 |
| Image/Video | fal.ai (Flux/schnell, LTX Video) | Latest |
| TTS | ElevenLabs (eleven_multilingual_v2) | Latest |
| Telephony | Twilio SDK | ^5.12.2 |
| Dashboard | Next.js (App Router) | 14+ |
| Containers | Docker + Docker Compose | Latest |

## Agent Architecture — 3-Level Hierarchy

```
Level 3 — Executive (claude-opus-4-6, extended thinking)
├── Chief Orchestration Agent (nexus central)
├── Strategy Agent
├── Self-Improvement Agent
└── Autonomy Expansion Agent

Level 2 — Management (claude-sonnet-4-20250514)
├── Operations Manager
├── Growth Manager
├── Technical Manager
└── Knowledge Manager

Level 1 — Business Execution (claude-sonnet-4-20250514)
├── fz-repondeur  [classification → Haiku | réponses complexes → Sonnet]
├── fz-assistante, fz-commercial, fz-marketing, fz-rh
├── fz-communication, fz-finance, fz-dev, fz-juridique, fz-dg, fz-video, fz-photo

Level 1 — Personal Execution (claude-sonnet-4-20250514)
├── fz-budget  [catégorisation → Haiku | analyses → Sonnet]
├── fz-negociateur, fz-impots, fz-comptable, fz-chasseur
└── fz-portfolio, fz-cv, fz-contradicteur, fz-ecrivain, fz-cineaste, fz-coach, fz-deconnexion
```

### Model Tier Mapping

| Tier | Modele | Cas d'usage | Cout relatif |
|------|--------|-------------|-------------|
| `ultra-fast` | claude-haiku-4-5-20251001 | Classification, tri, reponse courte | 1x |
| `fast` | claude-sonnet-4-20250514 | L1 execution standard | ~3.75x |
| `standard` | claude-sonnet-4-20250514 | L2 coordination | ~3.75x |
| `advanced` | claude-opus-4-6 | L3 executive + extended thinking + Deep Discussions | ~18.75x |

## Communication Flow

```
Founder (Emmanuel) → Chief Orchestration (L3)
    → Issues directives to L2 Managers
        → Managers decompose into tasks for L1 Agents
            → L1 Agents execute and report back
                → Results bubble up through hierarchy
```

## Data Flow

```
Event Bus (Redis Pub/Sub)
├── All agents publish events
├── Agents subscribe to relevant event types
├── Event handlers route and process
└── Audit log captures all events

State Persistence
├── SYSTEM_STATE.json — real-time snapshot
├── ROADMAP.md — living blueprint
├── PostgreSQL — structured data + embeddings
├── Redis — cache + sessions + queues
└── localStorage — client-side features (discussions, studio, gamification)
```

## Avatar System

```
2 Base Avatars (IP 100% owned)
├── Sarah (female) — DG virtuelle, gender-swapped from founder
└── Emmanuel (male) — CEO replica

Client Deployment
├── Client chooses Sarah or Emmanuel base
├── Client assigns custom name
├── Same face/voice, different persona prompt
└── 2 D-ID caches mutualized (not N per client)

Pipeline: Audio → ASR → Claude → TTS → D-ID → Video
├── ASR: AssemblyAI (primary) + Whisper (fallback) [stub]
├── TTS: ElevenLabs eleven_multilingual_v2 (active) | Telnyx/Inworld (fallback stubs)
└── Video: D-ID Lite (lip-sync) [stub]
```

## Studio Creatif (fal.ai)

```
Photo Generation
├── fal.ai Flux/schnell (synchrone)
├── /api/photo/route.ts → {imageUrl, status:'completed'}
├── Cout: 8 credits (standard), 12 credits (HD)
└── Galerie photo avec historique

Video Generation
├── fal.ai LTX Video (async queue)
├── D-ID talking head
├── /api/video/route.ts
├── Cout: 20 credits
└── Bibliotheque video avec projets film

Agent Requests
├── src/dashboard/lib/studio-requests.ts
├── localStorage: fz_studio_requests + fz_video_library
└── Mode "Demandes agents" avec file d'attente
```

## Deep Discussions

```
Architecture
├── Types: src/dashboard/lib/deep-discussion.types.ts
├── Utils: src/dashboard/lib/deep-discussion.utils.ts (85+ templates, prompts, sharing)
├── Page: src/dashboard/app/client/discussions/page.tsx
└── Stockage: localStorage (fz_deep_discussions)

Features
├── 85+ templates en 12 sections thematiques
├── 16 categories × 17 tags transversaux
├── Modele: claude-opus-4-6 avec Extended Thinking
├── Alertes de sensibilite (religion, politique, mort)
├── Mode challenge (avocat du diable)
├── Partage social: Twitter, LinkedIn, Facebook, WhatsApp, Email
├── Flow de completion avec bilan structure
├── Prompts adaptatifs: exploration (0-5) → approfondissement (6-15) → synthese (16+)
└── Export Markdown
```

## Database Schema (High-Level)

- `users` — comptes utilisateurs (email, role, tier, api_key, totp_secret, totp_enabled)
- `wallets` — portefeuilles micro-credits (1 credit = 1M micro-credits)
- `wallet_transactions` — ledger immutable (depot, retrait, bonus, remboursement)
- `llm_usage_log` — suivi de chaque appel LLM (tokens, cout, marge)
- `agents` — agent registry with capabilities and status
- `agent_runtime_config` — configuration runtime des agents (modifiable via admin)
- `tasks` — task tracking with full metadata
- `events` — event log for audit and replay
- `campaigns` — campagnes marketing avec workflow d'approbation
- `campaign_posts` — posts par campagne, multi-plateforme
- `notifications` — notifications multi-canal (in_app, email, sms, whatsapp, webhook)
- `approval_queue` — human-in-the-loop decisions
- `promo_codes` — codes promo (tier_upgrade, extend_demo, bonus_calls)
- `promo_redemptions` — historique d'utilisation des codes promo
- `cron_history` — journal des taches automatiques
- `avatar_presets` — Sarah + Emmanuel base configs
- `avatar_client_configs` — per-client avatar customization
- `memory_embeddings` — pgvector for semantic search
- `token_usage` — usage tokens par agent et par modele
- `projects` — multi-projets avec isolation
- `user_alarms` — reveils intelligents (modes, rubriques, horaires)
- `user_documents` — documents generes par les agents
- `user_preferences` — preferences utilisateur
- `user_data` — donnees client (entreprise, profil)

## LLM Cost Optimization

```
Prompt Caching (Anthropic)
├── cache_control: {type: 'ephemeral'} sur tous les system prompts
├── Header: anthropic-beta: prompt-caching-2024-07-31
├── TTL Anthropic: 5 minutes
└── Economie: ~89% sur tokens systeme repetes (0.1x prix normal)

Redis Memoization
├── Cle: llm:memo:{sha256(model+system+user)[:32]}
├── TTL: 300s (configurable par appel)
└── Activation: LLMRequest.enableMemoization = true

Batch API (Anthropic)
├── Fichier: src/core/llm/llm-batch.ts
├── Reduction: 50% sur input+output tokens
├── Latence: 5-60 min (max 24h)
├── Tracking: Redis llm:active_batches + llm:batch:repondeur:{id}
└── Cron: check_batch_results (toutes les 15 min)
```

## Security

- Zero-Trust Network Access (ZTNA)
- GRE tunnels + IPsec
- Jump servers (decentralized EU)
- AES-256 encryption at rest
- Immutable audit trail
- JWT for dashboard auth + 2FA TOTP
- RBAC: 4 roles (admin, operator, viewer, system)
- Rate limiting + CORS + Helmet security headers
- Input validation (Zod schemas on all endpoints)

## Dashboard (80+ pages)

```
Next.js 14 (App Router, standalone)
├── Admin section (server components)
│   ├── Overview, Users, Billing, Financial, Tokens, Promo
│   ├── Guide, Roadmap, Control
│   ├── Diagnostics, Security (2FA), Referrals, Setup
│   ├── Repondeur, Telephonie, Quotes, Custom Creation
│   ├── Analytics (Studio, Documents, Voice)
│   └── User Detail [id] (Feature Flags, Danger Zone)
├── Client section ('use client')
│   ├── Dashboard, Chat, Briefing, Documents, Meeting
│   ├── Strategy, Onboarding, Account, Referrals, Activity
│   ├── Studio (Photo + Video), Visio, Social
│   ├── Personal agents, Marketplace, Formations, Video Pro
│   ├── Repondeur, WhatsApp, Telephonie, Reveil
│   ├── Deep Discussions (85+ templates, Opus)
│   ├── Projects, Modules, Notifications, Campaigns
│   └── Custom Creation, Finances, Journee
├── System section (Agents, Events, Approvals, Tasks, Crons)
├── Infrastructure section (Health, Memory, Metrics, Avatar)
└── Public (Landing, Login, Demo, Plans, Legal, Reset Password)
```
