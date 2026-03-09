# Freenzy.io — Coding Guidelines

## Architecture
- **Backend**: Node.js + TypeScript strict + Express 5
- **Frontend**: Next.js 14 (App Router) — `src/dashboard/`
- **Database**: PostgreSQL 16 + pgvector + Redis 7
- **AI**: @anthropic-ai/sdk (Haiku L1, Sonnet L2, Opus L3)
- **Telephony**: Twilio (calls, SMS, WhatsApp)
- **TTS**: ElevenLabs (eleven_multilingual_v2)

## Agents
- 24 agents: `src/dashboard/lib/agent-config.ts`
- Agent IDs: `fz-*` prefix (never `sarah-*`)
- Each agent: id, name, role, systemPrompt, capabilities, modes

## Systeme de credits
- TOUJOURS deduire les credits AVANT l'action IA
- TOUJOURS rembourser si erreur technique (timeout API, rate limit)
- JAMAIS deduire si l'action echoue pour raison interne
- 1 credit = 1,000,000 micro-credits
- SIGNUP_BONUS_CREDITS = 50

## Securite
- JWT auth + RBAC (admin, operator, viewer, system)
- Twilio webhooks: TOUJOURS valider signature HMAC
- RGPD: masquer PII dans les logs, donnees EU uniquement
- Purge automatique des donnees > 90 jours

## Code
- TypeScript strict mode — 0 `any`
- Express 5: `req.params['id']` returns `string | string[] | undefined` — wrap with `String()`
- Pas de `console.log` en prod — utiliser le logger structure JSON
- Tests: Jest, 89 suites, 1535+ tests
- Frontend: inline styles (PAS de Tailwind), dark theme

## localStorage
- Toutes les cles: `fz_*` prefix (30+ cles)
- JAMAIS supprimer ou renommer une cle existante
- Cookie auth: `fz-token`

## Base de donnees
- DB: `freenzy`, user: `freenzy`
- Docker: backend:3010, postgres:5432, redis:6379
- Migrations: `scripts/migrate-*.sql`

## Git
- Commits: `feat|fix|refactor|test(scope): description`
- Build check: `npx next build` (167 pages, 0 errors)
- TypeScript check: `npx tsc --noEmit`
- Jamais commit avec build casse
