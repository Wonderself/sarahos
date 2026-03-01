# SARAH OS — ROADMAP

## Vision

SARAH OS is an autonomous multi-agent AI operating system designed to replace manual enterprise processes with specialized AI agents. The ultimate goal is maximum autonomy — the human founder intervenes only for financial approvals and major strategic pivots.

## Current Phase: 10 — Real Anthropic SDK Integration (Complete)

---

## Phase 1: Core Infrastructure

### Milestone 1.1: Project Foundation
- [x] TASK-001 — Init Node.js/TypeScript project (CRITICAL)
- [x] TASK-002 — Docker Compose complete setup (CRITICAL)
- [x] TASK-003 — PostgreSQL schema + pgvector (CRITICAL)
- [x] TASK-004 — Redis configuration (HIGH)
- [x] TASK-005 — Structured JSON logger (HIGH)
- [x] TASK-006 — Config management + .env (HIGH)
- [x] TASK-007 — Custom error system (HIGH)

### Milestone 1.2: Core Systems
- [x] TASK-008 — State Manager (CRITICAL)
- [x] TASK-009 — Roadmap Parser (HIGH)
- [x] TASK-010 — Base Agent class + interface (CRITICAL)
- [x] TASK-011 — Event Bus (Redis Pub/Sub) (CRITICAL)
- [x] TASK-012 — Agent Registry (HIGH)
- [x] TASK-013 — LLM Router (CRITICAL)
- [x] TASK-014 — Orchestrator (CRITICAL)
- [x] TASK-015 — Human Override system (HIGH)

### Milestone 1.3: Module Skeletons
- [x] TASK-016 — Memory Manager (pgvector interface) (HIGH)
- [x] TASK-017 — Avatar module types & config (MEDIUM)
- [x] TASK-018 — Financial module skeleton (MEDIUM)

---

## Phase 2: Agent Implementation (L1 Execution Agents)
- [x] TASK-019 — Communication Agent (email, Slack, translate, parse) (CRITICAL)
- [x] TASK-020 — Task Execution Agent (CRM, file, script, data) (CRITICAL)
- [x] TASK-021 — Knowledge Agent (search, context, index) (CRITICAL)
- [x] TASK-022 — Scheduling Agent (events, conflicts, timezone masking) (CRITICAL)
- [x] TASK-023 — Content Agent (copy, visual, brand check, tone) (CRITICAL)
- [x] TASK-024 — Social Media Agent (post, schedule, track, viral) (CRITICAL)
- [x] TASK-025 — Monitoring Agent (latency, tokens, containers, avatar cache) (CRITICAL)
- [x] TASK-026 — L1 barrel export + bootstrap registration (HIGH)
- [x] TASK-027 — State files update + verification (HIGH)

## Phase 3: Management Layer (L2 Agents)
- [x] TASK-028 — Operations Manager Agent (task decomposition, escalation, reporting) (CRITICAL)
- [x] TASK-029 — Growth Manager Agent (engagement, campaigns, A/B testing, market) (CRITICAL)
- [x] TASK-030 — Technical Manager Agent (tech debt, performance, tokens, infra, avatar) (CRITICAL)
- [x] TASK-031 — Knowledge Manager Agent (audit, gaps, freshness, indexing, dedup) (CRITICAL)
- [x] TASK-032 — L2 barrel export + bootstrap registration (HIGH)
- [x] TASK-033 — State files update + verification (HIGH)

## Phase 4: Executive Layer (L3 Agents)
- [x] TASK-034 — Chief Orchestration Agent (executive review, directives, conflict resolution, global state) (CRITICAL)
- [x] TASK-035 — Strategy Agent (strategy formulation, pivot analysis, growth planning, SWOT) (CRITICAL)
- [x] TASK-036 — Self-Improvement Agent (optimization, code review, improvement cycles, metrics) (CRITICAL)
- [x] TASK-037 — Autonomy Expansion Agent (autonomy assessment, blockers, automation, capabilities) (CRITICAL)
- [x] TASK-038 — L3 barrel export + bootstrap registration (HIGH)
- [x] TASK-039 — State files update + verification (HIGH)

## Phase 5: Avatar Pipeline
- [x] TASK-040 — ASR service (AssemblyAI + Whisper fallback) (CRITICAL)
- [x] TASK-041 — TTS service (Telnyx + Inworld fallback) (CRITICAL)
- [x] TASK-042 — D-ID video avatar service (CRITICAL)
- [x] TASK-043 — Twilio telephony integration (CRITICAL)
- [x] TASK-044 — Conversation manager pipeline (CRITICAL)
- [x] TASK-045 — Persona system (Sarah, Emmanuel, client avatars) (CRITICAL)
- [x] TASK-046 — Avatar services barrel export + API endpoints (HIGH)
- [x] TASK-047 — Event types + state types updates (HIGH)
- [x] TASK-048 — Bootstrap registration + index.ts integration (HIGH)
- [x] TASK-049 — State files update + verification (HIGH)

## Phase 6: Event-Driven Architecture & Autonomy
- [x] TASK-050 — Infrastructure clients PostgreSQL pool + Redis connection (CRITICAL)
  - DatabaseClient wrapping pg.Pool avec connect/query/disconnect/healthCheck
  - RedisClient wrapping ioredis avec publish/subscribe/get/set/del
  - Graceful degradation si DB/Redis indisponibles
- [x] TASK-051 — EventBus persistence PostgreSQL + Redis Pub/Sub (CRITICAL)
  - PersistentEventBus extends EventBus avec dual-write (DB + Redis)
  - getPersistedEvents/getEventStats depuis PostgreSQL
  - Fallback transparent vers in-memory
- [x] TASK-052 — MemoryManager persistence pgvector cosine search (CRITICAL)
  - PersistentMemoryManager extends MemoryManager
  - store/search/delete avec PostgreSQL pgvector
  - syncFromDatabase au demarrage
- [x] TASK-053 — ApprovalQueue persistence PostgreSQL (HIGH)
  - PersistentApprovalQueue extends ApprovalQueue
  - create/decide persistes en DB
  - syncFromDatabase + getHistory
- [x] TASK-054 — TokenTracker persistence PostgreSQL (HIGH)
  - PersistentTokenTracker extends TokenTracker
  - record persiste, getTokensByDateRange, getCostReport
  - Table token_usage ajoutee au schema
- [x] TASK-055 — Event-driven orchestrator + recurring scheduler (CRITICAL)
  - EventDrivenOrchestrator: triggers auto sur ASR/TTS/Video/Telephony/PerformanceAlert/TechDebt
  - RecurringScheduler: taches periodiques (state-save 10min, health-check 5min, self-improvement 6h, autonomy 12h)
- [x] TASK-056 — Self-improvement loop automated cycles + health score (CRITICAL)
  - ImprovementScheduler: collectSystemMetrics, calculateHealthScore (0-100)
  - Auto-enqueue optimize si score < 70, metrics-review si > 90
  - Historique des cycles d'amelioration
- [x] TASK-057 — Autonomy expansion engine real score + blocker detection (CRITICAL)
  - AutonomyEngine: calculateScore (4 facteurs x 25 pts)
  - identifyRealBlockers: infrastructure, reliability, automation, improvement
  - proposeAutonomyUpgrades + getAutonomyReport
- [x] TASK-058 — Dashboard Next.js skeleton monitoring UI (HIGH)
  - 6 pages: Overview, Agents, Events, Approvals, Avatar, Metrics
  - API client vers backend SARAH OS
  - Layout sidebar avec navigation
- [x] TASK-059 — Integration bootstrap state files update (HIGH)
  - index.ts: connect DB/Redis, enable persistence, setup triggers, start scheduler
  - 6 nouveaux endpoints API: /infra/health, /events/stats, /autonomy/report+score, /improvement/history, /scheduler/tasks

## Phase 7: Production Hardening (Security, CI/CD, API Completeness)
- [x] TASK-060 — JWT Authentication + RBAC middleware (CRITICAL)
  - AuthService: generateToken, verifyToken, login with API key → JWT
  - 4 roles: admin, operator, viewer, system
  - verifyToken + requireRole Express middleware
  - POST /auth/login, GET /auth/me endpoints
- [x] TASK-061 — API Security middleware (helmet, CORS, rate limiting) (CRITICAL)
  - helmet() security headers, cors() with DASHBOARD_ORIGIN
  - Rate limiting wrapping existing RateLimiter class (X-RateLimit-* headers)
  - Request logger middleware (method, path, statusCode, durationMs)
- [x] TASK-062 — Input validation layer with Zod schemas (CRITICAL)
  - validateBody(schema) + validateQuery(schema) generic middleware
  - 14 Zod schemas for all POST/query endpoints
  - 400 responses with field-level error details
- [x] TASK-063 — Route refactor: extract from index.ts into Router modules (CRITICAL)
  - 14 domain-specific Express Routers in src/security/routes/
  - Per-route auth/role enforcement (public, viewer+, operator+)
  - registerAllRoutes(app) barrel, 404 handler, global error handler
  - index.ts reduced from ~460 to ~190 lines
- [x] TASK-064 — ESLint + Prettier configuration (HIGH)
  - ESLint v10 flat config with @typescript-eslint
  - Prettier: singleQuote, trailingComma, 120 printWidth
  - npm run lint / lint:fix / format scripts
- [x] TASK-065 — GitHub Actions CI pipeline (HIGH)
  - ci.yml: typecheck → lint → test → build on push/PR to main
  - Separate dashboard build job
- [x] TASK-066 — Task Management + Agent Control + Memory APIs (CRITICAL)
  - POST/GET/DELETE /tasks — CRUD via taskScheduler
  - POST /agents/:id/execute|pause|resume, GET health|history
  - POST /memory/store|search, GET/DELETE /memory/:id
- [x] TASK-067 — SSE stream + integration tests (HIGH)
  - SSEManager: subscribes to EventBus, broadcasts to connected clients
  - GET /stream/events with heartbeat + type filtering
  - 22 integration tests (supertest) covering auth flow, validation, security headers
- [x] TASK-068 — Integration + state files update (HIGH)
  - Version 0.7.0, index.ts uses applySecurityMiddleware + registerAllRoutes
  - Updated SYSTEM_STATE.json, .env.example, ROADMAP.md

## Phase 8: User Accounts & Optimization
- [x] TASK-069 — User Account Model + DB schema (users, promo_codes, promo_redemptions tables) (CRITICAL)
  - User types (AccountTier, User, CreateUserInput, UpdateUserInput)
  - UserRepository with full CRUD, graceful degradation if DB unavailable
  - UserService (createUser, authenticateByApiKey, checkDailyLimit, tier access)
  - Config additions: DEMO_DEFAULT_DAYS, *_DAILY_LIMIT
- [x] TASK-070 — Auth refactor: dual login (user DB + env keys) (CRITICAL)
  - TokenPayload extended with optional userId and tier
  - loginDual() tries user DB first, falls back to env keys
  - POST /auth/register (public, creates free-tier user)
  - requireTier() middleware + checkDailyLimit middleware
- [x] TASK-071 — Admin user management routes (CRITICAL)
  - POST/GET/PATCH/DELETE /admin/users, POST /admin/users/:id/reset-key, GET /admin/stats
  - Zod schemas: createUserSchema, updateUserSchema, userQuerySchema
  - 14 unit tests
- [x] TASK-072 — Promo code system (CRITICAL)
  - PromoService: createCode, validateCode, redeemCode (tier_upgrade, extend_demo, bonus_calls)
  - Admin routes: POST/GET/DELETE /admin/promo-codes
  - User routes: POST /promo/redeem, GET /promo/validate/:code
  - 21 unit tests (11 service + 10 route)
- [x] TASK-073 — Seed data & test accounts (HIGH)
  - seed-users.ts: 7 test accounts (@sarah-os.test) + 2 promo codes (WELCOME2024, DEMO30)
  - remove-test-users.ts: cleanup script
  - npm run db:seed-users / db:remove-test-users
- [x] TASK-074 — Optimizations & bug fixes (HIGH)
  - asyncHandler wrapper for route error handling
  - Request ID middleware (X-Request-Id header on every request)
  - Improved global error handler (logs requestId, method, path, userId)
  - SSE dead client cleanup (90s timeout)
  - Hardened shutdown (individual try/catch + 10s safety timeout)
  - Query param bounds (agent history capped at 100)
- [x] TASK-075 — Integration tests update (HIGH)
  - 11 user admin integration tests
  - 8 promo code integration tests
  - Total: 41 integration tests (up from 22)
- [x] TASK-076 — State files update (HIGH)
  - Version 0.8.0, index.ts uses requestIdMiddleware, admin + promo routers
  - Updated SYSTEM_STATE.json, .env.example, ROADMAP.md

## Phase 9: SaaS Billing & Client Platform
- [x] TASK-077 — Wallet & credits billing system (CRITICAL)
  - Wallet model: micro-credits (1 credit = 1,000,000 micro), auto-create on first access
  - WalletService: atomic deposit/withdraw with BEGIN/COMMIT/ROLLBACK
  - Immutable transaction ledger (wallet_transactions table)
  - Token pricing config: Sonnet/Opus with 20% margin, per-million-token rates
  - LLM usage log for per-request analytics and cost tracking
- [x] TASK-078 — LLM Proxy with billed requests (CRITICAL)
  - LlmProxyService: pre-flight balance check → LLM call → deduct credits → log usage
  - POST /billing/llm endpoint with 402 for insufficient balance
  - Placeholder Anthropic SDK call (ready for real integration)
  - Request-level margin tracking and analytics
- [x] TASK-079 — Campaign management system (CRITICAL)
  - Campaign CRUD: create, list, get, update, delete
  - Approval workflow: draft → pending_approval → approved → scheduled → active → completed
  - Campaign posts: multi-platform (twitter, instagram, etc.) with scheduling
  - Owner-based access control (only owner or admin can view/edit)
  - Admin/operator approval endpoint
- [x] TASK-080 — Notification service (multi-channel skeleton) (CRITICAL)
  - NotificationService: send/dispatch to WhatsApp, email, SMS, in_app, webhook
  - Channel-specific dispatch handlers (log-only until APIs connected)
  - markAsSent/Delivered/Read lifecycle management
  - NOTIFICATION_TYPES constants for system-wide notification taxonomy
- [x] TASK-081 — Cron jobs service (CRITICAL)
  - CronService: 4 scheduled jobs with automatic cron_history logging
  - Daily API call counter reset (idempotent, prevents double-runs)
  - Demo account expiry (auto-deactivate + tier downgrade to guest)
  - Low balance alerts (in-app notification, 24h cooldown)
  - Stale data cleanup (30-day cron logs, 90-day read notifications)
- [x] TASK-082 — Billing routes + validation schemas (CRITICAL)
  - GET /billing/wallet, POST /billing/deposit, GET /billing/transactions
  - GET /billing/usage, GET /billing/pricing, POST /billing/llm
  - GET /billing/admin/stats (admin only — platform revenue/margin)
  - 7 Zod schemas for billing endpoints
- [x] TASK-083 — Campaign routes + validation schemas (CRITICAL)
  - POST/GET/PATCH/DELETE /campaigns, POST /campaigns/:id/submit|approve
  - POST/GET /campaigns/:id/posts
  - Zod schemas: createCampaignSchema, updateCampaignSchema, campaignQuerySchema, createPostSchema
- [x] TASK-084 — Notification routes (HIGH)
  - GET /notifications, GET /notifications/unread-count, POST /notifications/:id/read
  - POST /notifications/send (admin/system only)
- [x] TASK-085 — Client portal routes (HIGH)
  - GET /portal/profile, GET /portal/dashboard, GET /portal/wallet, GET /portal/usage
  - Aggregated dashboard endpoint (wallet + notifications + campaigns + usage in one call)
- [x] TASK-086 — SQL schema update (7 new tables) (CRITICAL)
  - wallets, wallet_transactions, llm_usage_log, campaigns, campaign_posts, notifications, cron_history
  - Indexes on user_id, wallet_id, campaign_id, created_at
- [x] TASK-087 — Tests for Phase 9 modules (HIGH)
  - 12 suites, 128 new tests: wallet.service, pricing, llm-proxy, campaign.service,
    notification.service, cron.service, billing.routes, campaign.routes
  - Total: 60 suites, 646 tests, 0 failures, 0 TS errors
- [x] TASK-088 — State files update + cron integration (HIGH)
  - Version 0.9.0, cronService.start() in bootstrap, cronService.stop() in shutdown
  - Updated SYSTEM_STATE.json, ROADMAP.md

## Phase 10: Real Anthropic SDK Integration
- [x] TASK-089 — Connect LLM Proxy to real Anthropic SDK (CRITICAL)
  - Replace placeholder callLlm() with real callLLM() from llm-client.ts
  - Map LlmProxyRequest → LLMRequest (system prompt, history, model tier)
  - Real token counts and content from SDK response
- [x] TASK-090 — Unified billing for agent LLM path (CRITICAL)
  - System user (00000000-0000-0000-0000-000000000000) for internal costs
  - llm-billing-bridge.ts: recordAgentUsage() → llm_usage_log
  - Fire-and-forget cost recording in LLMRouter.route()
  - SQL migration: insert system user + wallet
- [x] TASK-091 — Streaming SSE support (HIGH)
  - llm-stream.ts: streamLLM() using Anthropic messages.stream()
  - POST /billing/llm/stream endpoint with SSE events
  - Events: content_delta, message_complete, done
  - Pre-flight check before SSE headers, billing after stream completion
- [x] TASK-092 — Resilience and cost control (HIGH)
  - CircuitBreaker: 5 failures → OPEN for 60s → HALF_OPEN probe
  - Per-user daily budget limit (LLM_DAILY_LIMIT_CREDITS env var)
  - BudgetExceededError (429) + CircuitBreakerOpenError (503)
- [x] TASK-093 — Extended Thinking for L3 agents (MEDIUM)
  - LLMRequest: enableThinking + thinkingBudgetTokens fields
  - LLMResponse: thinking + thinkingTokens fields
  - Auto-enabled for advanced tier (4096 token budget)
  - Temperature constraint (removed when thinking active)
- [x] TASK-094 — Unit & integration tests (HIGH)
  - llm-client.test.ts: 12 tests (SDK params, tools, thinking, circuit breaker)
  - llm-stream.test.ts: 5 tests (SSE events, circuit breaker, error handling)
  - Updated llm-proxy.service.test.ts: 9 tests (real SDK flow)
  - Total: 64 suites, 683 tests (up from 60/646)
- [x] TASK-095 — Agent prompt optimization (MEDIUM)
  - Universal JSON footer on all 15 agents' system prompts
  - L1: strict JSON output, error handling, no fabricated data
  - L2: + confidence field (0-100)
  - L3: + confidence + risk_level + extended thinking guidance
- [x] TASK-096 — Migration, docs, version 0.10.0 (HIGH)
  - Version 0.10.0, SYSTEM_STATE phase 10
  - SQL: system user + wallet insert
  - Updated ROADMAP.md, resolved tech debt items

---

## Technical Debt Tracker
- ~~EventBus is currently in-memory only~~ — Resolved in Phase 6 (PersistentEventBus)
- ~~Memory Manager uses in-memory store~~ — Resolved in Phase 6 (PersistentMemoryManager)
- ~~Approval Queue is in-memory~~ — Resolved in Phase 6 (PersistentApprovalQueue)
- ~~TokenTracker persistence~~ — Added in Phase 6
- ~~Zero API authentication~~ — Resolved in Phase 7 (JWT + RBAC)
- ~~No input validation~~ — Resolved in Phase 7 (Zod schemas)
- ~~No security headers/CORS/rate limiting~~ — Resolved in Phase 7 (helmet, cors, rate limiter)
- ~~No ESLint/Prettier config~~ — Resolved in Phase 7
- ~~No CI/CD pipeline~~ — Resolved in Phase 7 (GitHub Actions)
- ~~All routes inline in index.ts~~ — Resolved in Phase 7 (14 Router modules)
- ~~No user accounts / API-key-only auth~~ — Resolved in Phase 8 (User DB + dual login)
- ~~No account tiers~~ — Resolved in Phase 8 (guest, demo, free, paid)
- ~~No promo code system~~ — Resolved in Phase 8
- ~~No async error handling in routes~~ — Resolved in Phase 8 (asyncHandler)
- ~~No request IDs~~ — Resolved in Phase 8 (X-Request-Id middleware)
- ~~SSE dead client leak~~ — Resolved in Phase 8 (90s cleanup)

- ~~No billing/wallet system~~ — Resolved in Phase 9 (micro-credits wallet + 20% margin)
- ~~No campaign management~~ — Resolved in Phase 9 (full CRUD + approval workflow)
- ~~No notification system~~ — Resolved in Phase 9 (multi-channel skeleton)
- ~~No cron jobs~~ — Resolved in Phase 9 (daily reset, demo expiry, cleanup)
- ~~No LLM usage billing~~ — Resolved in Phase 9 (LLM proxy with per-request cost tracking)
- ~~No client portal~~ — Resolved in Phase 9 (profile, wallet, dashboard, usage)

- ~~Anthropic SDK not yet integrated (LLM proxy uses placeholder)~~ — Resolved in Phase 10 (real SDK calls + billing)
- ~~No LLM streaming~~ — Resolved in Phase 10 (SSE streaming via messages.stream())
- ~~No circuit breaker / resilience~~ — Resolved in Phase 10 (CircuitBreaker + daily budget limits)
- ~~No extended thinking~~ — Resolved in Phase 10 (auto-enabled for L3 Opus agents)
- ~~Agent LLM costs not tracked in billing~~ — Resolved in Phase 10 (system user + llm_usage_log)

## Remaining Tech Debt
- WhatsApp/email/SMS notification channels are log-only (need API keys)
- No Stripe integration (deposits are manual/admin only)
- No open-source LLM integration (Mistral, Llama, etc.)
- No automated deployment (Docker build + push)
- ~~Dashboard Next.js build failing~~ — Resolved (34+ pages, build passing)
- Monitoring/alerting partially addressed by RecurringScheduler + ImprovementScheduler
- JWT_SECRET and ENCRYPTION_KEY still use default values (must change before production)
- No migration system (monolithic init-db.sql)
