# PROMPT — Upgrade complet Claude Code pour Freenzy.io

> **INSTRUCTIONS** : Execute ce prompt etape par etape. Ne saute AUCUNE etape.
> Tu travailles sur le projet Freenzy.io dans `/root/projects/freenzy/sarahos`.
> REGLE ABSOLUE : ZERO REGRESSION. Tu ne modifies JAMAIS le contenu existant des fichiers sauf pour AJOUTER du contenu. Tu ne supprimes rien, tu ne remplaces rien, tu ENRICHIS uniquement.
> Lis CLAUDE.md et MEMORY.md du projet AVANT de commencer pour avoir le contexte complet.

---

## ETAPE 1 — Installer Context7 MCP Server (docs API a jour)

Context7 par Upstash fournit les docs a jour de nos dependances exactes au lieu de se baser sur les donnees d'entrainement.

**Pourquoi on en a besoin** : Notre stack utilise @anthropic-ai/sdk ^0.39, Next.js 14 (App Router), Express 4.21, Twilio ^5.12, BullMQ ^5.34, Zod ^3.24, pgvector ^0.2, node-telegram-bot-api ^0.67, ioredis ^5.4, Winston ^3.17 — des APIs qui evoluent vite. Context7 resout les hallucinations d'API.

```bash
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp@latest
```

Verifier que ca marche :
```bash
claude mcp list
```

Tu devrais voir `context7` dans la liste. Si ca marche, passe a l'etape 2.

---

## ETAPE 2 — Debloquer et activer le Code Review Plugin

Le plugin code-review a ete blockliste par erreur ("just-a-test"). Il faut le debloquer.

**Ce qu'il fait** : Lance 5 agents Sonnet en parallele qui auditent le code :
1. Conformite au CLAUDE.md (nos conventions TS strict, prefixe fz-*, inline styles)
2. Detection de bugs evidents
3. Analyse git blame/history pour contexte
4. Patterns des corrections precedentes
5. Verification de la documentation inline

**Action** : Editer le fichier de configuration des plugins pour retirer `code-review` de la blocklist.

Trouver le fichier de blocklist des plugins dans `/root/.claude/plugins/` et retirer l'entree `code-review@claude-plugins-official` de la liste des plugins bloques.

Ensuite reinstaller :
```bash
claude plugin install code-review
```

Si la commande plugin n'existe pas directement, utiliser la slash command `/plugin install code-review@claude-plugins-official` dans une session Claude Code interactive.

---

## ETAPE 3 — Enrichir CLAUDE.md avec les patterns d'orchestration avances

**ATTENTION : Ne pas modifier le contenu existant du CLAUDE.md. UNIQUEMENT ajouter les nouvelles sections a la fin du fichier, AVANT la section "Entite juridique" qui doit rester en derniere position.**

Le fichier est dans `/root/projects/freenzy/sarahos/CLAUDE.md`.

Ajouter les sections suivantes APRES la section "Scripts utiles" et AVANT la section "Entite juridique" :

```markdown
## Workflow Orchestration (patterns avances)
- Entrer en plan mode pour TOUTE tache non-triviale (3+ etapes ou decisions d'architecture)
- Si quelque chose derape, STOP et re-planifier immediatement — ne pas insister sur une approche cassee
- Utiliser le plan mode pour les etapes de verification, pas juste la construction
- Ecrire des specs detaillees AVANT de coder pour reduire l'ambiguite
- Toujours verifier le diff entre main et les changements avant de considerer une tache terminee

## Strategie Subagents
- Utiliser les subagents pour garder le contexte principal propre
- Deleguer recherche, exploration, et analyse parallele aux subagents
- Pour les problemes complexes, lancer plusieurs subagents en parallele
- Un subagent = une tache focalisee, pas de multitasking
- Les resultats des subagents doivent etre synthetises, pas copies bruts

## Self-Improvement Loop
- Apres TOUTE correction de l'utilisateur → mettre a jour MEMORY.md avec la lecon apprise
- Ecrire des regles concretes pour ne pas repeter la meme erreur
- Iterer sans relache sur ces lecons jusqu'a ce que le taux d'erreur baisse
- Relire les memories et le MEMORY.md au debut de chaque session
- Si un pattern d'erreur se repete 2+ fois → creer un feedback memory specifique

## Verification Before Done
- Ne JAMAIS marquer une tache terminee sans preuve qu'elle fonctionne
- Diff entre main et les changements quand c'est pertinent
- Se demander : "Est-ce qu'un senior dev approuverait cette PR ?"
- Lancer les tests (`npm test`), verifier les types (`npx tsc --noEmit`), verifier le build si c'est du frontend
- Pour les changements d'API : tester avec curl ou verifier les tests d'integration

## Autonomous Bug Fixing
- Quand un bug est signale : le fixer directement, pas de hand-holding
- Pointer les logs, erreurs, tests qui echouent — puis resoudre
- Zero context switching pour l'utilisateur — gerer le debug de bout en bout
- Aller fixer les tests CI qui echouent sans qu'on le demande

## Task Management
- Plan First : ecrire le plan avec des etapes checkables
- Verify Plan : valider avec l'utilisateur avant de commencer l'implementation
- Track Progress : marquer chaque etape completee au fur et a mesure
- Explain Changes : resume de haut niveau a chaque etape
- Document Results : ajouter une section review si pertinent
- Capture Lessons : mettre a jour MEMORY.md apres les corrections

## Principes fondamentaux
- Simplicite d'abord : chaque changement doit etre aussi simple que possible. Impact minimal.
- Pas de paresse : trouver les causes racines. Pas de fixes temporaires. Standards de senior dev.
- Impact minimal : ne toucher que ce qui est necessaire. Eviter d'introduire des bugs.
- Ne pas sur-ingenierer : 3 lignes similaires valent mieux qu'une abstraction prematuree.
```

**VERIFICATION** : Apres l'ajout, verifier que :
- La section "Entite juridique" est toujours la derniere section du fichier
- Tout le contenu existant est intact (aucune suppression)
- Le fichier est valide Markdown

---

## ETAPE 4 — Creer les Skills custom Freenzy

Les skills sont des fichiers SKILL.md dans des dossiers sous `~/.claude/skills/`. Chaque skill est invoque automatiquement par Claude quand le contexte correspond, ou manuellement.

### Skill 1 : freenzy-new-page

```bash
mkdir -p /root/.claude/skills/freenzy-new-page
```

Creer le fichier `/root/.claude/skills/freenzy-new-page/SKILL.md` avec ce contenu :

```markdown
---
name: freenzy-new-page
description: Genere une nouvelle page dashboard Freenzy.io avec le design system Notion-style, inline styles, responsive mobile, et toutes les conventions du projet.
triggers:
  - nouvelle page
  - creer une page
  - new page
  - ajouter une page
---

# Freenzy.io — Generateur de pages dashboard

Tu crees une nouvelle page pour le dashboard Freenzy.io. Suis ces etapes EXACTEMENT.

## Contexte projet
- Frontend : Next.js 14 (App Router), dossier `src/dashboard/`
- Design : Notion-style light theme, INLINE STYLES UNIQUEMENT (PAS de Tailwind, PAS de CSS modules)
- Design system : importer `CU` depuis `@/lib/page-styles`
- Responsive : utiliser le hook `useIsMobile()` depuis `@/hooks/useIsMobile`
- Emojis : utiliser les emojis comme systeme de navigation (header, boutons, cartes, empty states)

## Etape 1 — Determiner l'emplacement

Demander a l'utilisateur :
- Section : `/client/` (pages utilisateur) ou `/(admin)/` (pages admin) ou `/system/` ou `/infra/`
- Nom de la route (ex: `telephony`, `partners`)
- Titre de la page avec emoji (ex: "☎️ Telephonie")
- Description courte pour PageExplanation

## Etape 2 — Generer la page

Creer le fichier `page.tsx` dans `src/dashboard/app/[section]/[route]/page.tsx`.

Structure obligatoire :

```tsx
'use client';

import { useState, useEffect } from 'react';
import { CU } from '@/lib/page-styles';
import { PageExplanation } from '@/components/ui/PageExplanation';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function NomDeLaPage() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les donnees
    setLoading(false);
  }, []);

  return (
    <div style={CU.pageContainer()}>
      <div style={CU.headerRow()}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          🎯 Titre de la page
        </h1>
      </div>

      <PageExplanation
        emoji="🎯"
        title="Titre"
        description="Description courte de ce que fait cette page."
      />

      {/* Contenu principal */}
      <div style={CU.cardGrid()}>
        {/* Cards avec CU.card style */}
      </div>
    </div>
  );
}
```

## Etape 3 — Regles de style

- Fond principal : `#FFFFFF`
- Texte principal : `#1A1A1A`
- Texte secondaire : `#6B6B6B`
- Texte muted : `#9B9B9B`
- Bordures : `#E5E5E5`
- Fond secondaire : `#FAFAFA`
- Accent : `#1A1A1A`
- Danger : `#DC2626`
- Border radius : 8px partout
- Bouton primaire : fond `#1A1A1A`, texte blanc, h 36px, borderRadius 8
- Bouton ghost : fond blanc, border `#E5E5E5`, color `#6B6B6B`
- Input : h 36px, border `#E5E5E5`, borderRadius 8, fontSize 13
- Card : bg blanc, border `1px solid #E5E5E5`, borderRadius 8, padding `14px 16px`

## Etape 4 — Ajouter au sidebar

Editer `src/dashboard/app/client/layout.tsx` (ou admin layout) pour ajouter le lien dans la bonne section de navigation. Format :
```tsx
{ emoji: '🎯', label: 'Nom', href: '/client/route' }
```

## Etape 5 — Verification

- `npx tsc --noEmit` (0 erreurs TypeScript)
- Verifier que la page s'affiche bien (si le dev server tourne)
- Verifier le responsive (isMobile conditionne les tailles)
```

### Skill 2 : freenzy-new-agent

```bash
mkdir -p /root/.claude/skills/freenzy-new-agent
```

Creer `/root/.claude/skills/freenzy-new-agent/SKILL.md` :

```markdown
---
name: freenzy-new-agent
description: Genere un nouvel agent IA Freenzy.io avec ID fz-*, system prompt complet, capabilities, modes, et credits. Ajoute au bon fichier de config selon la categorie.
triggers:
  - nouvel agent
  - creer un agent
  - new agent
  - ajouter un agent
---

# Freenzy.io — Generateur d'agents IA

Tu crees un nouvel agent pour la plateforme Freenzy.io (136 agents existants).

## Regles absolues
- ID : prefixe `fz-*` UNIQUEMENT (ex: `fz-negociateur`, `fz-seo`)
- JAMAIS de prefixe `sarah-*` (legacy obsolete)
- Verifier que l'ID n'existe pas deja dans les 5 fichiers de config
- Chaque agent a : id, name, emoji, role, systemPrompt, capabilities, modes, defaultCredits

## Fichiers de config selon la categorie

| Categorie | Fichier | Agents existants |
|-----------|---------|-----------------|
| Core business + personal | `src/dashboard/lib/agent-config.ts` | 34 agents |
| Business etendu pack 1 | `src/dashboard/lib/agents-extended-business1.ts` | 19 agents |
| Business etendu pack 2 | `src/dashboard/lib/agents-extended-business2.ts` | 19 agents |
| Personnel etendu | `src/dashboard/lib/agents-extended-personal.ts` | 28 agents |
| Outils | `src/dashboard/lib/agents-extended-tools.ts` | 16 agents |

## Structure d'un agent

```typescript
{
  id: 'fz-nom',
  name: 'Nom Affiche',
  emoji: '🎯',
  role: 'Description courte du role',
  category: 'business' | 'personal' | 'tool',
  defaultCredits: number, // cout par utilisation
  modelTier: 'ultra-fast' | 'fast' | 'standard' | 'advanced',
  // ultra-fast = Haiku (taches simples), fast/standard = Sonnet (L1/L2), advanced = Opus (L3)
  capabilities: ['capability1', 'capability2'],
  modes: [
    { id: 'MODE1', name: 'Nom du mode', description: 'Ce que fait ce mode', icon: '🎯' },
    { id: 'MODE2', name: 'Nom du mode', description: 'Ce que fait ce mode', icon: '🔍' },
  ],
  systemPrompt: `Tu es [Nom], l'agent [role] de Freenzy.io.

## Ton role
[Description detaillee]

## Tes competences
- [Competence 1]
- [Competence 2]

## Tes modes
### MODE1 — [Nom]
[Instructions detaillees]

### MODE2 — [Nom]
[Instructions detaillees]

## Regles
- Toujours repondre en francais
- Format structure avec emojis
- Etre proactif et proposer des actions concretes
- Si tu ne sais pas, le dire clairement plutot que d'inventer
`,
}
```

## Etape 1 — Collecter les infos
Demander : nom, emoji, role, categorie, modes (2-4), cout en credits, tier de modele.

## Etape 2 — Generer le system prompt
Minimum 500 mots. Inclure :
- Presentation de l'agent (qui il est, son expertise)
- Competences detaillees (5+)
- Modes d'utilisation (2-4 avec instructions precises)
- Regles de comportement
- Exemples de reponses (2+)
- Variables dynamiques si pertinent : `{{user.nom}}`, `{{business.nom}}`, `{{business.ville}}`

## Etape 3 — Ajouter au bon fichier
Inserer l'agent dans le tableau du fichier de config correspondant.
Ne PAS modifier les agents existants.

## Etape 4 — Verification
- `npx tsc --noEmit` (0 erreurs)
- Verifier que l'ID est unique avec grep : `grep -r "fz-nomchoisi" src/`
```

### Skill 3 : freenzy-new-route

```bash
mkdir -p /root/.claude/skills/freenzy-new-route
```

Creer `/root/.claude/skills/freenzy-new-route/SKILL.md` :

```markdown
---
name: freenzy-new-route
description: Genere une nouvelle route API Express pour Freenzy.io avec auth JWT, RBAC, validation Zod, logging structure, et tests Jest.
triggers:
  - nouvelle route
  - new route
  - ajouter une route
  - creer un endpoint
  - new endpoint
---

# Freenzy.io — Generateur de routes API

Tu crees une nouvelle route API Express pour le backend Freenzy.io (68 routes existantes).

## Architecture existante
- Framework : Express 4.21 (conventions Express 5 pour params)
- Auth : JWT + RBAC (4 roles : admin, operator, viewer, system)
- Validation : Zod schemas sur tous les inputs
- Logging : Winston JSON structure (PAS de console.log)
- Routes : `src/security/routes/[nom].routes.ts`
- Enregistrement : `registerAllRoutes(app)` dans le barrel

## Structure d'un fichier route

```typescript
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery } from '../validation.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { logger } from '../../utils/logger';

const router = Router();

// Schemas Zod
const createSchema = z.object({
  name: z.string().min(1).max(255),
  // ...
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Routes
router.get('/',
  verifyToken,
  requireRole('viewer'),
  validateQuery(querySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = String(req.params['userId'] || '');
    // TOUJOURS wrapper req.params avec String() pour Express 5 compat

    logger.info({ service: 'nom-service', action: 'list', userId });

    // ... logique metier ...

    res.json({ success: true, data: [] });
  })
);

router.post('/',
  verifyToken,
  requireRole('operator'),
  validateBody(createSchema),
  asyncHandler(async (req: Request, res: Response) => {
    logger.info({ service: 'nom-service', action: 'create', userId: req.body.userId });

    // ... logique metier ...

    res.status(201).json({ success: true, data: {} });
  })
);

export default router;
```

## Regles obligatoires

1. **Auth** : `verifyToken` sur TOUTES les routes (sauf webhooks publics)
2. **RBAC** : `requireRole('niveau')` — viewer pour GET, operator pour POST/PATCH, admin pour DELETE/admin
3. **Validation Zod** : `validateBody()` sur POST/PATCH, `validateQuery()` sur GET avec pagination
4. **Params Express 5** : `String(req.params['id'] || '')` — TOUJOURS wrapper, TOUJOURS verifier non-vide
5. **Logging** : `logger.info/warn/error({ service, action, userId, ...})` — JSON structure, PAS de console.log
6. **Erreurs** : `asyncHandler()` wrapper pour catch automatique, codes HTTP corrects (400, 401, 403, 404, 409, 500)
7. **Credits** : Si l'action consomme des credits, deduire AVANT l'action, rembourser si erreur technique

## Etape 1 — Collecter les infos
Demander : nom de la ressource, verbes HTTP (GET/POST/PATCH/DELETE), roles requis, champs du body/query.

## Etape 2 — Generer le fichier route
Creer `src/security/routes/[nom].routes.ts` avec la structure ci-dessus.

## Etape 3 — Enregistrer la route
Ajouter l'import et le `app.use('/path', nomRouter)` dans le barrel d'enregistrement des routes.

## Etape 4 — Generer les tests
Creer `src/__integration__/[nom].integration.test.ts` avec :
- Test auth (401 sans token, 403 sans role)
- Test validation (400 avec body invalide)
- Test succes (200/201 avec donnees valides)
- Minimum 5 tests par route

## Etape 5 — Verification
- `npx tsc --noEmit` (0 erreurs)
- `npm test -- --testPathPattern=[nom]` (tests passent)
```

### Skill 4 : freenzy-guardrails

```bash
mkdir -p /root/.claude/skills/freenzy-guardrails
```

Creer `/root/.claude/skills/freenzy-guardrails/SKILL.md` :

```markdown
---
name: freenzy-guardrails
description: Implemente les guardrails de securite et optimisation de Freenzy.io en suivant la spec CLAUDE_GUARDRAILS_SPEC.md (1383 lignes). Token budgets, circuit breakers, loop detection, memory optimizer, model router, credit guard, security hardening, fallback manager, dashboards, alerts.
triggers:
  - guardrails
  - guardrail
  - implementer guardrail
  - securite tokens
  - budget tokens
  - circuit breaker
  - loop detection
---

# Freenzy.io — Implementeur de Guardrails

Tu implementes les systemes de protection de Freenzy.io selon la spec `CLAUDE_GUARDRAILS_SPEC.md` a la racine du projet.

## Contexte
Le fichier CLAUDE_GUARDRAILS_SPEC.md (1383 lignes) definit 10 systemes de protection a implementer dans l'ordre suivant :

1. **Token Budget Manager** — controle total de la consommation de tokens
2. **Circuit Breakers** — coupe automatique des fuites et boucles
3. **Agent Loop Detector** — detection et kill des boucles inter-agents en temps reel
4. **Memory Optimizer** — resume progressif des conversations pour reduire les couts
5. **Model Router** — routing intelligent Haiku/Sonnet/Opus (partiellement fait)
6. **Credit Guard** — transactions atomiques sur les credits (partiellement fait)
7. **Security Hardening** — isolation des donnees, anti-injection, RGPD
8. **Fallback Manager** — basculement automatique quand une API tombe
9. **Real-time Dashboard** — visualisation en temps reel des agents, tokens, couts
10. **Alert System** — notifications instantanees quand un seuil est depasse

## Ce qui existe deja (NE PAS refaire)
- Circuit breaker basique dans `src/core/llm/llm-client.ts` (5 echecs → OPEN 60s)
- Credit Guard partiel dans `src/core/guardrails/credit-guard.ts`
- Memory Optimizer squelette dans `src/core/guardrails/memory-optimizer.ts`
- Model Router dans `src/core/llm/llm-client.ts` (Haiku/Sonnet/Opus routing)
- Budget journalier par user (`LLM_DAILY_LIMIT_CREDITS`)
- Prompt caching Anthropic (actif)
- Redis memoization (actif)
- Cron `guardrails_credit_audit` toutes les 6h

## Methode de travail
1. LIRE `CLAUDE_GUARDRAILS_SPEC.md` EN ENTIER avant de commencer
2. Identifier ce qui est deja implemente (grep dans le code)
3. Implementer le guardrail demande en suivant la spec exacte
4. Fichiers dans `src/core/guardrails/` ou le module pertinent
5. TypeScript strict — 0 `any`, 0 `@ts-ignore`
6. Tests Jest pour chaque guardrail
7. Logger structure JSON pour le monitoring
8. Dashboard : ajouter les vues dans `src/dashboard/app/(admin)/` ET `/client/`

## Regles
- NE PAS modifier les guardrails deja implementes
- NE PAS changer les signatures d'API existantes
- Toujours ajouter des tests
- Toujours verifier : `npx tsc --noEmit` + `npm test`
```

### Skill 5 : freenzy-context

```bash
mkdir -p /root/.claude/skills/freenzy-context
```

Creer `/root/.claude/skills/freenzy-context/SKILL.md` :

```markdown
---
name: freenzy-context
description: Charge le contexte complet du projet Freenzy.io en lisant tous les fichiers de documentation cles. A utiliser en debut de session ou quand le contexte est flou.
triggers:
  - contexte freenzy
  - contexte projet
  - charge le contexte
  - lis le projet
  - remets toi dans le contexte
---

# Freenzy.io — Chargeur de contexte

Quand ce skill est active, lis les fichiers suivants dans cet ordre :

1. `/root/projects/freenzy/sarahos/CLAUDE.md` — Conventions de code et regles
2. `/root/projects/freenzy/sarahos/MEMORY.md` — Journal de bord (decisions, bugs, lecons)
3. `/root/projects/freenzy/sarahos/SARAH_OS_STATUS.md` — Inventaire complet features + endpoints API
4. `/root/projects/freenzy/sarahos/FREENZY-COMPLETE.md` — Doc complete (vision, features, design system, agents)
5. `/root/projects/freenzy/sarahos/roadmap/ROADMAP.md` — Roadmap et phases (18 terminees, 19-21 a venir)
6. `/root/projects/freenzy/sarahos/RAPPORT-REFACTORING.md` — Features perdues a restaurer

Apres avoir lu ces fichiers, faire un resume de 10 lignes max pour confirmer que le contexte est charge.

## Fichiers de reference supplementaires (lire si necessaire)
- `architecture/ARCHITECTURE.md` — Architecture technique detaillee
- `CLAUDE_GUARDRAILS_SPEC.md` — Spec guardrails a implementer
- `COWORK-PROGRESS.md` — Journal des sessions de travail
- `decisions/ADR-001.md` a `ADR-004.md` — Architecture Decision Records

## Rappels cles
- Le repo s'appelle "sarahos" (legacy) mais le produit est **Freenzy.io**, le dashboard est **Flashboard**
- Entreprise **israelienne** (jamais dire francaise meme si l'interface est en francais)
- On travaille en SSH remote sur le VPS Hetzner via Coolify
- PostgreSQL est dans Docker : `docker exec freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003 psql -U freenzy -d freenzy`
- Modeles : `claude-haiku-4-5-20251001` (L1), `claude-sonnet-4-20250514` (L2), `claude-opus-4-6` (L3)
- PAS `claude-sonnet-4-6-20250514` (n'existe pas)
```

---

## ETAPE 5 — Installer Ralph Loop (sessions autonomes)

Ralph permet de lancer Claude Code en boucle autonome avec des garde-fous (rate limiting, circuit breaker, exit detection).

```bash
cd /root
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code
chmod +x install.sh
./install.sh
```

Ensuite creer la config projet :

```bash
cat > /root/projects/freenzy/sarahos/.ralphrc << 'EOF'
# Ralph Loop config pour Freenzy.io
MAX_CALLS_PER_HOUR=80
SESSION_CONTINUITY=true
CIRCUIT_BREAKER_THRESHOLD=5
AUTO_CONTINUE=true
MONITOR_ENABLED=true
EOF
```

Verifier l'installation :
```bash
ralph --version
```

---

## ETAPE 6 — Installer les subagents VoltAgent (selection ciblee)

On installe UNIQUEMENT les subagents pertinents pour notre stack.

```bash
cd /root
git clone https://github.com/VoltAgent/awesome-claude-code-subagents.git
```

Ensuite, creer manuellement les 6 subagents adaptes a Freenzy dans `~/.claude/agents/` :

### Subagent 1 : security-auditor

```bash
mkdir -p /root/.claude/agents
```

Creer `/root/.claude/agents/security-auditor.md` :

```markdown
---
name: security-auditor
description: Audite la securite du code Freenzy.io — JWT, RBAC, injection, XSS, RGPD, Twilio HMAC, credits
---

Tu es un auditeur de securite specialise pour Freenzy.io.

## Focus
- JWT : verifier que verifyToken est sur toutes les routes (sauf webhooks publics)
- RBAC : verifier que requireRole() correspond au bon niveau
- Injection : verifier que tous les inputs passent par Zod validation
- XSS : verifier que les outputs sont sanitises
- RGPD : verifier PII masque dans les logs, purge >90j respectee
- Twilio : verifier signature HMAC sur tous les webhooks
- Credits : verifier deduction AVANT action, remboursement si erreur
- Secrets : verifier qu'aucune cle API n'est en dur dans le code

## Fichiers cles
- Routes : `src/security/routes/*.ts` (68 fichiers)
- Auth : `src/security/auth.service.ts`, `auth.middleware.ts`
- Billing : `src/billing/wallet.service.ts`
- Webhooks : `src/security/routes/twilio-webhook.routes.ts`

## Output
Rapport structure avec :
- Severite (CRITIQUE / HAUTE / MOYENNE / BASSE)
- Fichier + ligne
- Description du probleme
- Fix recommande
```

### Subagent 2 : typescript-specialist

Creer `/root/.claude/agents/typescript-specialist.md` :

```markdown
---
name: typescript-specialist
description: Expert TypeScript strict pour Freenzy.io — 0 any, 0 ts-ignore, conventions Express 5, 122K lignes
---

Tu es un expert TypeScript strict pour le projet Freenzy.io.

## Regles TypeScript du projet
- Mode strict active — ZERO `any`, ZERO `@ts-ignore`
- Express 5 conventions : `String(req.params['id'] || '')` pour les params
- Zod pour la validation des inputs
- Types definis dans des fichiers `.types.ts` par module
- Path aliases : @agents/*, @core/*, @utils/*, @avatar/*, @financial/*, @security/*

## Commandes
- Typecheck : `npx tsc --noEmit`
- Tests : `npm test`
- Build dashboard : `cd src/dashboard && NODE_OPTIONS="--max-old-space-size=8192" npx next build`

## Focus
- Resoudre les erreurs TypeScript
- Refactorer les types pour plus de surete
- Eliminer les `as any` ou les casts dangereux
- Proposer des types discrimines (discriminated unions) quand pertinent
- Verifier la coherence des types entre backend et frontend
```

### Subagent 3 : database-expert

Creer `/root/.claude/agents/database-expert.md` :

```markdown
---
name: database-expert
description: Expert PostgreSQL 16 + pgvector pour Freenzy.io — 78 tables, migrations, requetes, optimisation
---

Tu es un expert base de donnees pour Freenzy.io.

## Stack DB
- PostgreSQL 16 + pgvector (extension vector pour embeddings)
- 78 tables (users, wallets, wallet_transactions, agents, tasks, events, campaigns, etc.)
- Redis 7 (cache, sessions, pub/sub, distributed locking)
- Acces : `docker exec freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003 psql -U freenzy -d freenzy`
- JAMAIS `psql` directement (pas installe sur l'hote)

## Fichiers cles
- Schema initial : `scripts/init-db.sql`
- Migrations : `src/db/migrations/*.sql` + `scripts/migrate-*.sql`
- Infra DB : `src/infra/database.ts`
- Wallet (transactions atomiques) : `src/billing/wallet.service.ts`

## Regles
- Transactions atomiques pour les operations financieres (SELECT FOR UPDATE)
- Index sur user_id, created_at, et les colonnes de jointure
- RGPD : purge auto >90 jours sur conversations, audit_logs, events
- Pas de donnees sensibles en clair (AES-256 pour les secrets)
- Migrations incrementales, jamais de modification destructive du schema existant
```

### Subagent 4 : api-designer

Creer `/root/.claude/agents/api-designer.md` :

```markdown
---
name: api-designer
description: Expert API REST pour Freenzy.io — Express 4.21, Zod, JWT RBAC, 68 routes, conventions RESTful
---

Tu es un expert en design d'API REST pour Freenzy.io.

## Stack API
- Express 4.21 (conventions Express 5)
- Auth : JWT + RBAC (admin, operator, viewer, system)
- Validation : Zod schemas
- 68 routes dans `src/security/routes/`
- SSE streaming pour les flux temps reel
- Webhooks : Twilio (HMAC), WhatsApp, Stripe (a venir)

## Conventions
- Nommage : `/resource` (pluriel), `/resource/:id`
- Verbes : GET (list/get), POST (create), PATCH (update), DELETE (soft delete)
- Reponses : `{ success: true, data: ... }` ou `{ success: false, error: ... }`
- Pagination : `?page=1&limit=20` avec Zod coerce
- Codes : 200, 201, 400, 401, 403, 404, 409, 429, 500
- Logging : JSON structure `{ service, action, userId, timestamp }`
```

### Subagent 5 : performance-optimizer

Creer `/root/.claude/agents/performance-optimizer.md` :

```markdown
---
name: performance-optimizer
description: Expert optimisation pour Freenzy.io — Redis caching, prompt caching Anthropic, batch API, LLM cost reduction
---

Tu es un expert en optimisation de performance et couts pour Freenzy.io.

## Optimisations existantes
- Prompt caching Anthropic : cache_control ephemeral sur system prompts (-89% tokens)
- Redis memoization : cle llm:memo:{sha256}, TTL 300s
- Batch API : summaries repondeur en batch quand 3+ users (-50% cout)
- Routing Haiku : classification + categorisation vers Haiku (3.75x moins cher)
- Circuit breaker : 5 echecs → OPEN 60s → HALF_OPEN probe

## Couts token (credits/1M)
- Haiku : 80 input, 400 output
- Sonnet : 300 input, 1500 output
- Opus : 1500 input, 7500 output

## Focus
- Identifier les appels LLM non optimises (pas de cache, mauvais tier)
- Proposer des migrations Sonnet → Haiku pour les taches simples
- Optimiser les requetes PostgreSQL (EXPLAIN ANALYZE)
- Redis : verifier TTL, eviction policy, memory usage
- Next.js : optimiser le build (152+ pages, 8GB heap)
- Docker : surveiller disk usage, container memory limits
```

### Subagent 6 : devops-engineer

Creer `/root/.claude/agents/devops-engineer.md` :

```markdown
---
name: devops-engineer
description: Expert DevOps pour Freenzy.io — Docker, Coolify, Traefik, systemd, crons, backups, monitoring
---

Tu es un expert DevOps pour l'infrastructure Freenzy.io.

## Infrastructure
- Hebergement : Hetzner VPS (EU), deploye via Coolify (Docker Compose + Traefik)
- Containers : postgres (512M), redis (256M), backend (1G), dashboard (512M)
- Reverse proxy : Traefik v3.6 (TLS auto Let's Encrypt)
- Domaines : app.freenzy.io (dashboard), api.freenzy.io (backend)

## Services systemd
- `freenzy-telegram-bot.service` — bot Telegram TS (actif, auto-restart)
- `freenzy-claude-bot.service` — legacy bash bot (desactive)

## Crons systeme (`/root/projects/freenzy/sarahos/scripts/cron/`)
- health-check.sh (5min) — check containers Docker
- disk-monitor.sh (1h) — alerte si >80% disque
- db-backup.sh (2h UTC) — pg_dump quotidien, rotation 7j
- purge-90days.sh (3h UTC) — RGPD purge
- morning-briefing.sh (8h) — brief admin
- email-sequence.sh (30min) — emails onboarding

## Crons app (18 jobs dans `src/core/cron/cron.service.ts`)
- Distributed locking Redis (TTL = interval + 30s)
- reset_daily_api_calls, expire_demo_accounts, low_balance_alerts, etc.

## Points critiques
- Backups uniquement locaux (`/root/backups/freenzy/`) — PAS de backup cloud
- Single alerting : tout passe par Telegram admin
- Docker disk full deja arrive → crash PostgreSQL
- Container name PostgreSQL : freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003

## CI/CD
- GitHub Actions : `.github/workflows/ci.yml`
- Push sur main/develop → typecheck → lint → tests → build
```

---

## ETAPE 7 — Verification finale

Apres toutes les installations, verifier :

```bash
# 1. Context7 MCP
claude mcp list | grep context7

# 2. Skills
ls -la /root/.claude/skills/

# 3. Subagents
ls -la /root/.claude/agents/

# 4. Ralph
which ralph || echo "Ralph pas dans le PATH — verifier install.sh"

# 5. CLAUDE.md enrichi
wc -l /root/projects/freenzy/sarahos/CLAUDE.md
# Doit etre > 160 lignes (etait 133 avant, on a ajoute ~60 lignes)

# 6. Tout le contenu existant est intact
cd /root/projects/freenzy/sarahos
grep "Entite juridique" CLAUDE.md  # Doit etre present (derniere section)
grep "fz-commercial" CLAUDE.md     # Doit etre present (existant)
grep "Workflow Orchestration" CLAUDE.md  # Doit etre present (nouveau)
```

---

## RESUME DES FICHIERS CREES/MODIFIES

| Fichier | Action |
|---------|--------|
| MCP context7 | INSTALLE (scope user) |
| Plugin code-review | DEBLOQUE |
| `/root/projects/freenzy/sarahos/CLAUDE.md` | ENRICHI (sections ajoutees, rien supprime) |
| `/root/.claude/skills/freenzy-new-page/SKILL.md` | CREE |
| `/root/.claude/skills/freenzy-new-agent/SKILL.md` | CREE |
| `/root/.claude/skills/freenzy-new-route/SKILL.md` | CREE |
| `/root/.claude/skills/freenzy-guardrails/SKILL.md` | CREE |
| `/root/.claude/skills/freenzy-context/SKILL.md` | CREE |
| `/root/.claude/agents/security-auditor.md` | CREE |
| `/root/.claude/agents/typescript-specialist.md` | CREE |
| `/root/.claude/agents/database-expert.md` | CREE |
| `/root/.claude/agents/api-designer.md` | CREE |
| `/root/.claude/agents/performance-optimizer.md` | CREE |
| `/root/.claude/agents/devops-engineer.md` | CREE |
| `/root/projects/freenzy/sarahos/.ralphrc` | CREE |
| Ralph Loop | INSTALLE dans /root/ralph-claude-code |

**ZERO fichier supprime. ZERO contenu modifie. Uniquement des ajouts.**
