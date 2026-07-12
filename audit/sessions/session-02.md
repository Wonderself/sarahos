# Session 2 — Migration modèle `claude-sonnet-4-20250514` → `claude-sonnet-4-6`

**Modèle conseillé** : Sonnet · **Coût** : 🟢 léger · **Durée** : ~30 min · **Priorité** : 🔥 CRITIQUE (à faire en premier)

## Pourquoi c'est critique

`claude-sonnet-4-20250514` est le modèle L2 par défaut du produit (`CLAUDE_MODEL_FAST` et `CLAUDE_MODEL_STANDARD`). Ce modèle est **déprécié chez Anthropic avec retrait annoncé**. Le jour où il est retiré, chaque appel IA du produit renvoie une erreur 404 → le produit entier est mort. Le remplaçant direct est `claude-sonnet-4-6` (déjà utilisé ailleurs dans le code, même gamme de prix, plus intelligent).

## État des lieux (vérifié le 12/07/2026 — ne pas re-vérifier)

Occurrences de `claude-sonnet-4-20250514` :
- `src/utils/config.ts:27-28` — défauts de `CLAUDE_MODEL_FAST` et `CLAUDE_MODEL_STANDARD`
- `src/security/validation.schemas.ts:208` — allowlist `SUPPORTED_LLM_MODELS` (à GARDER en legacy accepté, mais ne plus proposer par défaut)
- `src/whatsapp/whatsapp-pipeline.service.ts:502` + son test `:44`
- `src/security/routes/billing.routes.test.ts:155,162,176`
- Probablement d'autres : lancer `grep -rn "claude-sonnet-4-20250514" src scripts --include="*.ts" --include="*.tsx"` pour la liste exhaustive.
- `CLAUDE.md` section « Modèles IA » : à mettre à jour (c'est la doc de référence).
- Vérifier aussi les variables d'env de prod : `.env.production.example` et noter que Coolify doit être mis à jour manuellement (variable `CLAUDE_MODEL_*` si définie).

⚠️ `claude-sonnet-4-6` (sans suffixe de date) est un ID **valide** — ne PAS inventer de variante datée type `claude-sonnet-4-6-20250514` (ça n'existe pas, c'était le bug corrigé en Session 1).

## Étapes

1. `grep -rn "claude-sonnet-4-20250514" . --include="*.ts" --include="*.tsx" --include="*.md" --include="*.example" | grep -v node_modules` — liste exhaustive.
2. Remplacer par `claude-sonnet-4-6` dans le code source ET les tests. Dans l'allowlist `SUPPORTED_LLM_MODELS`, déplacer `claude-sonnet-4-20250514` dans la section « Legacy model IDs still accepted » (pour ne pas casser les préférences utilisateurs stockées en DB).
3. Mettre à jour `CLAUDE.md` (section Modèles IA) : Fast/Standard (L2) = `claude-sonnet-4-6`.
4. Mettre à jour `.env.example` / `.env.production.example` si les modèles y figurent.
5. `cp .env.example .env && npm test` (les suites llm-client et cron ont besoin d'un .env) puis `rm .env`. `npx tsc --noEmit`.
6. Commit + push. Rappeler à l'utilisateur : si Coolify définit `CLAUDE_MODEL_FAST`/`CLAUDE_MODEL_STANDARD` en variable d'env, les changer aussi dans l'UI Coolify.

## Critère de réussite

- `grep -rn "claude-sonnet-4-20250514" src --include="*.ts"` ne renvoie que la ligne « legacy accepted » de `validation.schemas.ts` (et rien d'autre).
- `npm test` vert, `npx tsc --noEmit` vert.
- CLAUDE.md à jour.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-02.md et exécute la Session 2.

Mission : migrer le modèle IA déprécié claude-sonnet-4-20250514 vers claude-sonnet-4-6 dans tout le repo.

Règles strictes :
- La fiche session-02.md contient déjà la liste des fichiers et les numéros de ligne — ne relis PAS tout le repo, commence par le grep exhaustif indiqué.
- claude-sonnet-4-6 est l'ID exact du remplaçant. N'invente JAMAIS de variante datée (claude-sonnet-4-6-XXXXXXXX n'existe pas).
- Dans src/security/validation.schemas.ts, GARDE claude-sonnet-4-20250514 dans la liste des modèles legacy acceptés (des préférences utilisateur en DB peuvent y faire référence) mais il ne doit plus être un défaut nulle part.
- Mets à jour CLAUDE.md (section Modèles IA) et les .env*.example.
- Vérifie : cp .env.example .env && npx tsc --noEmit && npm test ; puis rm .env.
- Commit sur une feature branch : fix(llm): migrate deprecated claude-sonnet-4-20250514 to claude-sonnet-4-6
- Fin de session : mets à jour AUDIT.md (statut Session 2 → ✅ FAIT + ligne HISTORIQUE), rappelle-moi de mettre à jour les variables Coolify si besoin.
- Réponds en français, phrases courtes, montre les diffs pas les fichiers entiers.
```
