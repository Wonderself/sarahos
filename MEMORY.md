# Freenzy.io — Journal de bord Claude

## ⚠️ ARCHIVE — Lecture seule
> Ce fichier n'est plus maintenu manuellement depuis le 15/03/2026.
> La mémoire persistante est désormais gérée automatiquement par **Claude Mem**.
> Ce fichier reste dans le repo comme référence historique des décisions architecturales.

## A propos de ce fichier (historique)
Ce fichier était mis a jour par Claude Code.
Il contient les decisions prises, bugs resolus, features rejetees,
et insights importants sur Freenzy.io.

## Decisions d'architecture

- **Prefixe fz-* obligatoire** : tous les agents utilisent le prefixe `fz-*`. Le prefixe `sarah-*` est legacy (Phase 14 rebranding) et doit etre migre si trouve.
- **136 agents au total** (pas 116) : 34 core + 19 bus1 + 19 bus2 + 28 personal + 16 tools. Le marketing dit "100+".
- **Hierarchie 3 niveaux** : L1 Execution (24 agents, Sonnet/Haiku) → L2 Management (4 managers, Sonnet) → L3 Executive (4 agents, Opus + Extended Thinking).
- **Inline styles uniquement** dans le dashboard — pas de Tailwind. Design system centralise dans `page-styles.ts` (objet CU). Notion-style light theme (#FFFFFF, #1A1A1A, #E5E5E5).
- **Express 4.21** (pas Express 5 malgre ce que disent certains docs), mais on suit les conventions Express 5 pour `req.params`.
- **Hold/release pattern** pour les credits : on bloque les micro-credits avant l'appel LLM, puis on libere/confirme apres. Transactions atomiques (SELECT FOR UPDATE).
- **Distributed locking Redis** pour les cron jobs (TTL = intervalle + 30s) — empeche les executions doubles.
- **Fallback TTS** : ElevenLabs → Deepgram. Cache LRU en memoire (200 entries max).
- **Event bus** persistant : Redis pub/sub + sauvegarde en DB pour replay.
- **Standalone build Next.js** en prod — pas de serveur Next classique.
- **Circuit breaker** : coupe apres 5 echecs consecutifs, reprend apres 60s.
- **Prompt caching Anthropic** : cache_control ephemeral sur tous les system prompts (-89% tokens systeme). ADR-004.
- **Batch API** pour summaries repondeur (-50% cout) quand 3+ users actifs. Cron poll 15min.
- **Redis memoization** : reponses LLM identiques cachees 5min (sha256 de model+system+user).
- **Routing Haiku** : classification repondeur + categorisation budget → Haiku (3.75x moins cher que Sonnet).
- **Multi-projets** : isolation totale par projet (agents, docs, campagnes, alarmes).
- **Autopilot** : systeme de gouvernance par propositions (agents proposent → admin valide → execution → rollback possible). Desactive en prod pour l'instant.
- **Deep Discussions** : localStorage only, pas de persistence serveur (tech debt reconnu).

## Bugs resolus

- **Docker disk full → crash PostgreSQL** : le cache Docker a rempli le disque. Solution : surveiller via `disk-monitor.sh` (alerte >80%).
- **409 Telegram polling conflict** : plusieurs instances du bot Telegram polled en meme temps. Solution : un seul service systemd actif (`freenzy-telegram-bot.service`), legacy desactive.
- **Nom de modele incorrect** : `claude-sonnet-4-6-20250514` n'existe pas. Le bon nom est `claude-sonnet-4-20250514`.
- **Markdown Telegram** : erreurs de parsing byte offset. Solution : fallback texte brut quand `parse_mode: 'Markdown'` echoue.
- **Node heap OOM sur build** : 195 pages Next.js depassent la memoire par defaut. Solution : `NODE_OPTIONS="--max-old-space-size=8192"` en prod.
- **Rebase 33 conflits** : lors du push du refactoring Notion. Conflits dans layout, globals.css, composants. Resolu manuellement.
- **iOS Safari emoji rail** : emojis du sidebar ne s'affichaient pas sur mobile. Fix : inline styles forces (pas de CSS classes).
- **France → Israel** : 4 violations trouvees ou Freenzy etait presente comme entreprise francaise. Corrige partout + OVH → Hetzner, Netanya → Tel Aviv.

## Features rejetees et pourquoi

- **Mistral/Llama** : complexite de maintenance multi-provider, qualite inferieure sur le francais. Decision dans ADR-004.
- **Caching complet de contexte** (conversations longues) : complexite trop elevee pour le gain actuel.
- **Compression de prompts aggressive** : risque de degrader la qualite des reponses agents.
- **Pages variantes landing** : 5 variants (gradient-wave, probleme-solution, roi-economie, simplicite) supprimees — la v2 Notion les remplace. Gain : -3700 lignes, 188 → 175 pages.

## Fonctionnalites perdues a restaurer (RAPPORT-REFACTORING.md)

### Priorite haute
- Sidebar : UI de personnalisation (drag/drop sections, emoji picker, reorganisation)
- Sidebar : Bottom tab bar mobile (5 raccourcis)
- Team : Gestion workspace (creer/rejoindre) + invitations membres + 3 onglets

### Priorite moyenne
- Sidebar : Affichage gamification (XP, level, badges)
- Strategy : Palette de couleurs (12 couleurs) + onglet Dossiers
- Repondeur : Wizard setup + cartes statistiques detaillees

### Priorite basse
- PublicNav : Liens pricing, scroll detection, glassmorphism
- PublicFooter : Branding complet, copyright

### Pages incompletes
- 16 pages sans bulle d'aide (PageExplanation)
- 25 pages sans responsive mobile (useIsMobile())
- 12 pages manquant les deux

## Stubs et fonctionnalites non connectees

| Feature | Statut |
|---------|--------|
| Stripe | PAS CONNECTE — depots manuels uniquement |
| Email notif (SendGrid/SES) | Log-only, Resend pour auth seulement |
| Webhook notif | Queue sans livraison |
| TTS Telnyx/Inworld | Buffer factice (ElevenLabs actif) |
| ASR AssemblyAI/Whisper | Texte factice |
| Video D-ID | URL factice |
| Agent send email/slack | Stubs |
| LinkedIn/X/IG posting | Stubs |
| Calendar sync | Stub |
| pgvector search | Extension installee, pas encore utilisee |
| LLM Open-Source | Pas de Mistral/Llama |

## Historique des phases (18 phases terminees)

| Phase | Version | Contenu cle |
|-------|---------|-------------|
| 1-5 | 0.1-0.5 | Core infra, agents L1/L2/L3, avatar pipeline |
| 6 | 0.6 | Event-driven arch, persistence, autonomy engine |
| 7 | 0.7 | JWT, RBAC, Zod, ESLint, CI/CD, route refactor |
| 8 | 0.8 | User accounts, tiers, promo codes, seed data |
| 9 | 0.9 | Wallet/credits, campaigns, notifications, crons |
| 10 | 0.10 | Real Anthropic SDK, streaming SSE, circuit breaker, extended thinking |
| 11 | - | Reveil intelligent, repondeur IA (7 modes) |
| 12 | - | Multi-projets, Twilio reel, ElevenLabs, visio agents |
| 13 | - | Enterprise, analytics, agents personnels, parrainage |
| 14 | - | Rebranding SARAH OS → Freenzy.io, fz-* |
| 15 | 0.14.1 | Cost optimization (caching, Haiku, batch, memoization) |
| 16 | 0.15.0 | Studio fal.ai, landing v3, nav simplifiee |
| 17 | 0.16.0 | Admin dashboard refonte (8 sessions), 2FA TOTP, Cmd+K |
| 18 | 0.17.0 | Deep Discussions (85+ templates, Opus, tags, partage) |

## Prochaines phases prevues (ROADMAP)

- **Phase 19** : Integration Stripe & paiement (webhook, checkout, auto-topup, factures PDF, abonnements)
- **Phase 20** : ASR & Avatar Video (Deepgram, D-ID streaming, WebRTC)
- **Phase 21** : Integrations sociales (LinkedIn OAuth2, X API v2, Instagram Graph)

## Insights utilisateurs

- L'interface est 100% en francais (cible : France + Belgique francophone)
- Systeme de guest mode (`/try`) pour tester sans inscription
- Onboarding en multi-etapes : step1 → analyzing → validate-profile → quiz 7 questions adaptatives
- Intelligence gatherer : Pappers (SIRET), Google Places, website analysis, concurrents locaux, Claude Haiku synthesis
- 7 emails de sequence onboarding (J+0, J+2, J+5, J+10, J+15, J+21, J+30)
- 50 credits offerts a l'inscription, credits n'expirent jamais
- 0% commission verrouille a vie pour les 5000 premiers utilisateurs
- 4 tiers : guest (10 appels/j), demo (100, expire 7j), free (100), paid (10000)
- Gamification : XP, niveaux, 20+ badges, streaks, classements
- Parrainage : 20€ par ami parraine, code unique FZ-XXXXXX
- 10 jeux arcade integres (Motus, Sudoku, Snake, Tetris, Quiz, Memory, 2048, Demineur, Dactylo, Defi du jour)
- Marketplace : 50 templates d'agents (23 gratuits, 27 premium)

## Notes strategiques

- **Pas de backup cloud** : les backups PostgreSQL sont uniquement locaux (`/root/backups/freenzy/`, rotation 7j). Risque de perte si le disque tombe.
- **Single point of alerting** : toutes les alertes passent par un seul chat Telegram admin. Pas de PagerDuty/OpsGenie.
- **RGPD critique** : purge auto >90 jours, donnees EU uniquement (Hetzner), PII masque dans les logs.
- **Autopilot desactive** (`AUTOPILOT_ENABLED=false`) — le systeme d'autonomie des agents existe mais n'est pas actif en prod.
- **Stripe non connecte** — c'est le prochain gros chantier (Phase 19). Depots de credits uniquement manuels via admin.
- **JWT_SECRET et ENCRYPTION_KEY** utilisent encore les valeurs par defaut en dev. A changer absolument avant production reelle.
- **Deep Discussions en localStorage** — pas de persistence serveur, risque de perte de donnees.
- **Guardrails spec** (CLAUDE_GUARDRAILS_SPEC.md) : 1383 lignes de spec pour Token Budget Manager, Circuit Breakers, Agent Loop Detector, Memory Optimizer, Model Router, Credit Guard, Security Hardening, Fallback Manager, Real-time Dashboard, Alert System. A implementer dans les 2 dashboards (admin + user).
- **Le nom "sarahOS"** est le nom du repo GitHub (legacy). Le produit s'appelle **Freenzy.io**, le dashboard s'appelle **Flashboard**.
- **122 commits** sur le repo, branche principale `main`.

## Documentation existante (fichiers .md dans le repo)

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| CLAUDE.md | 133 | Regles de code et conventions |
| SARAH_OS_STATUS.md | 788 | Inventaire complet des features + tous les endpoints API |
| FREENZY-COMPLETE.md | 628 | Doc complete du projet pour LLM (vision, features, design system) |
| CLAUDE_GUARDRAILS_SPEC.md | 1383 | Spec guardrails et optimisation a implementer |
| COWORK-PROGRESS.md | 128 | Journal des sessions de travail (S1-S5) |
| PROGRESS.md | 54 | Notes refonte sidebar/dashboard |
| RAPPORT-REFACTORING.md | 112 | Rapport refactoring Notion + features perdues |
| architecture/ARCHITECTURE.md | 227 | Architecture technique detaillee |
| roadmap/ROADMAP.md | 414 | Roadmap complete (18 phases, 162 tasks) |
| decisions/ADR-001 a 004 | ~200 | Architecture Decision Records |
| audit/agent-audit*.md | 268 | Audit des agents |
| blog/ (10 articles) | ~15K mots | Articles SEO francais |
| legal/ (5 docs) | ~800 | CGU, CGV, mentions, confidentialite, cookies |
| emails/ (7 fichiers) | - | Templates emails HTML onboarding |

## Statistiques codebase (mars 2026)

- 152+ pages dashboard, 85+ composants React, 68 routes API
- 78 tables PostgreSQL, 18 cron jobs internes, 7 crons systeme
- 122K lignes TypeScript de production
- 89 suites de tests, 1535+ tests Jest
- Version actuelle : 0.12.0 (package.json) / Phase 18 (roadmap)
- 122 commits, branche `main`
