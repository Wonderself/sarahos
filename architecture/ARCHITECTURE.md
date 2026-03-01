# SARAH OS — Architecture Document

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js (LTS) | >=20 |
| Language | TypeScript (strict) | 5.7+ |
| Framework | Express.js | 4.x |
| Database | PostgreSQL + pgvector | 16+ |
| Cache/Bus | Redis | 7+ |
| LLM | Claude API (@anthropic-ai/sdk) | ^0.39.0 |
| Avatar Backend | Python FastAPI | 3.11+ |
| Dashboard | Next.js (App Router) | 14+ |
| Containers | Docker + Docker Compose | Latest |

## Agent Architecture — 3-Level Hierarchy

```
Level 3 — Executive (claude-opus)
├── Chief Orchestration Agent (nexus central)
├── Strategy Agent
├── Self-Improvement Agent
└── Autonomy Expansion Agent

Level 2 — Management (claude-sonnet/opus)
├── Operations Manager
├── Growth Manager
├── Technical Manager
└── Knowledge Manager

Level 1 — Execution (claude-sonnet)
├── Communication Agent
├── Task Execution Agent
├── Knowledge Agent
├── Scheduling Agent
├── Content Agent
├── Social Media Agent
└── Monitoring Agent
```

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
└── Redis — cache + sessions + queues
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
├── ASR: AssemblyAI (primary) + Whisper (fallback)
├── TTS: Telnyx NaturalHD (primary) + Inworld (fallback)
└── Video: D-ID Lite (lip-sync)
```

## Database Schema (High-Level)

- `users` — comptes utilisateurs (email, role, tier, api_key)
- `wallets` — portefeuilles micro-credits (1 credit = 1M micro-credits)
- `wallet_transactions` — ledger immutable (depot, retrait, bonus, remboursement)
- `llm_usage_log` — suivi de chaque appel LLM (tokens, cout, marge)
- `agents` — agent registry with capabilities and status
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

## Security

- Zero-Trust Network Access (ZTNA)
- GRE tunnels + IPsec
- Jump servers (decentralized EU)
- AES-256 encryption at rest
- Immutable audit trail
- JWT for dashboard auth
