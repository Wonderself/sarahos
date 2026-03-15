# Freenzy.io — Coding Guidelines

## Architecture
- **Backend**: Node.js 20+ / TypeScript strict / Express 4.21 (conventions Express 5 pour params)
- **Frontend**: Next.js 14 (App Router, standalone build) — `src/dashboard/`
- **Database**: PostgreSQL 16 + pgvector (mémoire RAG) + Redis 7 (AOF, LRU 256MB)
- **AI**: @anthropic-ai/sdk ^0.39 (Haiku L1, Sonnet L2, Opus L3)
- **Telephony**: Twilio (calls, SMS, WhatsApp) + WhatsApp Cloud API
- **TTS**: ElevenLabs (eleven_multilingual_v2) + Deepgram (fallback)
- **Media**: fal.ai (Flux/schnell images), D-ID (avatars), Runway ML (vidéo)
- **Payment**: Stripe (PCI-DSS)
- **Queue**: BullMQ (job queue)
- **Validation**: Zod
- **Logging**: Winston (JSON structuré)
- **Deploy**: Coolify (Docker Compose) + Traefik (reverse proxy, TLS auto)

## Domaines
- **Dashboard** : https://app.freenzy.io (Next.js, port 3000 interne)
- **API** : https://api.freenzy.io (Express, port 3000 interne)
- **Telegram bot** : systemd service (ts-node, port aucun)

## Agents — 136 agents (marketing : "100+")
- 34 agents cœur : `src/dashboard/lib/agent-config.ts`
- 19 agents business pack 1 : `src/dashboard/lib/agents-extended-business1.ts`
- 19 agents business pack 2 : `src/dashboard/lib/agents-extended-business2.ts`
- 28 agents personnels étendus : `src/dashboard/lib/agents-extended-personal.ts`
- 16 agents outils : `src/dashboard/lib/agents-extended-tools.ts` (calendrier, email, facturation, veille, qrcode, signature, meteo, etc.)
- Config étendue : `src/dashboard/lib/agent-config-extended.ts`
- Agent IDs : préfixe `fz-*` UNIQUEMENT (ex: `fz-commercial`, `fz-marketing`)
- ⚠️ JAMAIS utiliser le préfixe `sarah-*` (legacy SARAH OS, obsolète)
- Si du code legacy `sarah-*` est trouvé → migrer vers `fz-*`
- Each agent : id, name, role, systemPrompt, capabilities, modes
- Routing : L1 Haiku (exécution rapide) / L2 Sonnet (rédaction, analyse) / L3 Opus (stratégie, Extended Thinking)
- Hiérarchie backend : L1 Execution (24) / L2 Management (4 managers) / L3 Executive (4 agents)

## Système de crédits
- TOUJOURS déduire les crédits AVANT l'action IA
- TOUJOURS rembourser si erreur technique (timeout API, rate limit)
- JAMAIS déduire si l'action échoue pour raison interne
- 1 crédit = 1 000 000 micro-crédits
- SIGNUP_BONUS_CREDITS = 50
- Crédits n'expirent jamais
- 0% commission pour les 5000 premiers utilisateurs (verrouillé à vie), 5% après

## Sécurité
- JWT auth + RBAC (4 rôles : admin, operator, viewer, system)
- 2FA TOTP natif
- Chiffrement AES-256
- Twilio webhooks : TOUJOURS valider signature HMAC
- RGPD : masquer PII dans les logs, données EU uniquement (Hetzner)
- Purge automatique des données > 90 jours
- Audit logs complets

## Code
- TypeScript strict mode — 0 `any`, 0 `@ts-ignore`
- Express 5 : `req.params['id']` retourne `string | string[] | undefined`
  → TOUJOURS wrapper avec `String(req.params['id'] || '')` pour éviter les crashes
  → TOUJOURS valider les params avant usage (check non-vide, format attendu)
- Logging : logger structuré JSON uniquement (PAS de `console.log` en prod)
  → Format : `{"level":"info|warn|error","service":"nom","action":"description","userId":"...","timestamp":"..."}`
  → Permet de filtrer par service, user, niveau d'erreur en production
  → `console.log` acceptable UNIQUEMENT en dev local pour debug temporaire
- Tests : Jest, 89 suites, 1535+ tests
- Build : `NODE_OPTIONS="--max-old-space-size=4096" npx next build` (188 pages, 0 errors)
- TypeScript check : `npx tsc --noEmit`

## Design — Notion-style Light Theme
- Fond principal : #FFFFFF (blanc pur)
- Texte principal : #1A1A1A
- Texte secondaire : #6B6B6B
- Texte muted : #9B9B9B
- Bordures : #E5E5E5
- Fond secondaire : #FAFAFA
- Accent : #1A1A1A (noir Notion)
- Danger : #DC2626
- Inline styles UNIQUEMENT (PAS de Tailwind dans le dashboard)
- Emojis comme système de navigation
- Design system centralisé : `src/dashboard/lib/page-styles.ts` (objet CU)

## localStorage
- Toutes les clés : préfixe `fz_*` (30+ clés)
- JAMAIS supprimer ou renommer une clé existante
- Cookie auth : `fz-token`
- Clés principales : fz_session, fz_deep_discussions, fz_studio_requests, fz_sidebar_*

## Base de données
- DB : `freenzy`, user : `freenzy`
- 78 tables (users, wallets, wallet_transactions, agents, tasks, events, campaigns, etc.)
- PostgreSQL dans Docker : `docker exec freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003 psql -U freenzy -d freenzy`
- JAMAIS `psql` directement (pas installé sur l'hôte)
- Redis : port 6379, password requis, AOF persistence, maxmemory 256MB LRU
- Migrations : `src/db/migrations/` (5 fichiers) + `scripts/migrate-*.sql`
- ⚠️ Surveiller le disk space Docker (incident passé : cache Docker a rempli le disque → crash PostgreSQL)

## Modèles IA (noms exacts)
- Ultrafast (L1) : `claude-haiku-4-5-20251001`
- Fast/Standard (L2) : `claude-sonnet-4-20250514`
- Advanced (L3) : `claude-opus-4-6`
- ⚠️ PAS `claude-sonnet-4-6-20250514` (n'existe pas)
- Optimisations : prompt caching (89% savings), Redis memoization (300s TTL), batch API (50% reduction)

## Infrastructure
- **Hébergement** : Hetzner (EU) via Coolify (Docker Compose + Traefik)
- **Containers** : postgres (512M), redis (256M), backend (1G), dashboard (512M)
- **Systemd** : `freenzy-telegram-bot.service` (actif), `freenzy-claude-bot.service` (legacy, désactivé)
- **Crons système** : health-check (5min), disk-monitor (1h), db-backup (2h UTC), purge-90days (3h UTC)
- **Crons app** : 18 jobs internes avec distributed locking Redis (voir `src/core/cron/cron.service.ts`)
- **Backups** : `/root/backups/freenzy/` — pg_dump quotidien, rotation 7 jours, local uniquement
- **CI/CD** : GitHub Actions `.github/workflows/ci.yml` — typecheck + lint + tests + build sur push main/develop

## Git
- Commits : `feat|fix|refactor|test(scope): description`
- TOUJOURS feature branch — JAMAIS commit sur main directement
- Build check avant commit : `NODE_OPTIONS="--max-old-space-size=4096" npx next build`
- TypeScript check : `npx tsc --noEmit`
- JAMAIS commit avec build cassé
- JAMAIS exposer les clés API dans le code
- Remote : `origin` → `https://github.com/Wonderself/sarahos.git`

## Scripts utiles
- `npm run dev` — watch mode backend (tsx watch src/index.ts)
- `npm run typecheck` — vérification TypeScript
- `npm test` — Jest (89 suites, 1535+ tests)
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` — Prettier
- `npm run db:init` — seed database
- `npm run health` — health check
- Dashboard : `cd src/dashboard && npm run dev` (port 3001 en dev)

## Entité juridique
- Freenzy.io est une entreprise ISRAÉLIENNE
- Ne JAMAIS présenter Freenzy comme français (l'interface est en français car cible francophone FR+BE)
- Données hébergées en EU (Hetzner) pour conformité RGPD
- Admin email : smadja99@gmail.com