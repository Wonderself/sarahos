# Freenzy.io

> Plateforme SaaS d'agents IA autonomes pour PME francophones (FR + BE).
> 136 agents spécialisés (marketing : « 100+ »), pilotés par Claude (Haiku / Sonnet / Opus).
> Entreprise israélienne — données hébergées en EU (Hetzner) pour conformité RGPD.

## Liens

| Quoi | Où |
|---|---|
| Dashboard | https://app.freenzy.io |
| API | https://api.freenzy.io |
| Repo | https://github.com/Wonderself/sarahos |
| Audit & plan d'optimisation | [`AUDIT.md`](./AUDIT.md) |
| Règles de développement | [`CLAUDE.md`](./CLAUDE.md) |

## Stack

- **Backend** : Node.js 20+ / TypeScript strict / Express 4.21 — `src/`
- **Frontend** : Next.js 14 App Router (standalone) — `src/dashboard/`
- **DB** : PostgreSQL 16 + pgvector (RAG) · Redis 7 (cache, locks, AOF)
- **IA** : @anthropic-ai/sdk — routing L1 Haiku / L2 Sonnet / L3 Opus
- **Téléphonie** : Twilio (calls, SMS, WhatsApp) + WhatsApp Cloud API
- **TTS** : ElevenLabs + Deepgram (fallback) · **Média** : fal.ai, D-ID, Runway
- **Paiement** : Stripe · **Queue** : BullMQ · **Logs** : Winston JSON
- **Déploiement** : Coolify (Hetzner) + Traefik — `docker-compose.yaml`

## Structure du repo

```
src/
├── agents/            # Hiérarchie backend L1/L2/L3 (exécution, managers, executive)
├── billing/           # Wallet, crédits, pricing, factures
├── core/              # LLM client/router, guardrails, event-bus, cron, mémoire RAG
├── security/          # Auth JWT+RBAC, middlewares, routes API
├── telegram/          # Bot Telegram (service systemd)
├── whatsapp/          # Pipeline WhatsApp
├── avatar/            # Avatar vocal (TTS/persona) — legacy SARAH en migration fz-*
├── dashboard/         # App Next.js (188+ pages) — lib/agent-config*.ts = 136 agents
└── db/migrations/     # Migrations SQL
```

## Démarrage rapide

```bash
npm ci                          # dépendances backend
npm run typecheck               # tsc --noEmit — doit être vert
npm test                        # Jest (89 suites, 1535+ tests)
npm run dev                     # backend en watch mode

cd src/dashboard && npm ci && npm run dev   # dashboard sur :3001
```

Infra locale : `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
(Postgres + Redis liés à 127.0.0.1 uniquement).

## Fichiers docker-compose

| Fichier | Rôle |
|---|---|
| `docker-compose.yaml` | **PROD** — utilisé par Coolify (ne pas confondre avec `.yml`) |
| `docker-compose.yml` | Base **dev local** uniquement |
| `docker-compose.dev.yml` | Overrides dev (watch mode, ports localhost) |
| `docs/archive/docker-compose.prod.yml` | Ancienne itération, archivée |

## Règles clés (résumé — détail dans CLAUDE.md)

- TypeScript strict : 0 `any`, 0 `@ts-ignore` (objectif — nettoyage en cours, voir AUDIT.md)
- Crédits : déduire AVANT l'action IA, rembourser si erreur technique
- Agent IDs : préfixe `fz-*` uniquement (`sarah-*` = legacy à migrer)
- Twilio : toujours valider la signature HMAC des webhooks
- Logs : Winston JSON structuré, pas de `console.log` en prod
- Git : feature branch obligatoire, build + typecheck verts avant commit

## Documentation

- `AUDIT.md` — état de santé + plan d'optimisation par sessions (avec megaprompts dans `audit/sessions/`)
- `FREENZY-COMPLETE.md` — référence exhaustive du produit (pages, agents, flows)
- `VEILLE-API-2026.md` — veille comparative des APIs utilisées
- `decisions/ADR-*.md` — décisions d'architecture
- `docs/archive/` — anciens documents de suivi (historique, ne pas utiliser comme référence)
- `MEMORY.md`, `TELEGRAM-CONTEXT.md` — ⚠️ lus à l'exécution par le bot Telegram, ne pas déplacer
