# Session 7 — Harmonisation Zod v3 (backend) / v4 (dashboard)

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~45 min

## Contexte (vérifié le 12/07/2026)

- Backend `package.json` : `"zod": "^3.24.2"`
- Dashboard `src/dashboard/package.json` : `"zod": "^4.3.6"`

Deux majors différents = comportements de validation différents (messages d'erreur, `.errorMap` → `error` en v4, coercion, `z.string().email()` déprécié en v4 au profit de `z.email()`, etc.). Risque : une validation qui passe côté dashboard et échoue côté API (ou l'inverse). Cible : **tout en Zod v4** (le backend migre), car revenir en v3 côté dashboard serait une régression.

## Points de migration v3 → v4 connus (backend)

- `errorMap: () => ({message})` → `error: () => "message"` ou paramètre `message`. Utilisé notamment dans `src/security/validation.schemas.ts:219` (`z.enum(SUPPORTED_LLM_MODELS, { errorMap: ... })`).
- `z.string().email()/.url()/.uuid()` → `z.email()`, `z.url()`, `z.uuid()` (les anciennes formes émettent des dépréciations).
- `.datetime()` : vérifier le comportement (offset par défaut).
- `z.record(valueSchema)` → `z.record(z.string(), valueSchema)` (2 arguments obligatoires en v4).
- Les messages d'erreur changent de format → adapter les tests qui assertent sur des messages exacts (`validation.test.ts`, etc.).

## Étapes

1. Recenser l'usage : `grep -rln "from 'zod'" src --include="*.ts" | grep -v dashboard | wc -l` puis lister les fichiers.
2. `npm install zod@^4` (racine).
3. `npx tsc --noEmit` → corriger les erreurs de compilation une par une (elles pointent exactement les patterns v3).
4. `cp .env.example .env && npm test && rm .env` → corriger les tests qui assertent des messages d'erreur v3.
5. Vérifier les endpoints critiques manuellement dans les tests : auth (login/register), billing (llm-proxy), validation des webhooks.
6. Optionnel si simple : pinner la même version exacte dans les deux package.json.

## Critère de réussite

- Backend et dashboard sur le même major Zod (v4).
- Typecheck + 85 suites de tests vertes.
- Aucun `errorMap` restant (pattern v3).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-07.md et exécute la Session 7.

Mission : migrer le backend de Zod v3 vers Zod v4 pour l'aligner avec le dashboard.

Règles strictes :
- La fiche liste les patterns de migration v3→v4 connus (errorMap→error, .email()→z.email(), z.record à 2 args) — applique-les systématiquement.
- Méthode : npm install zod@^4 puis laisse npx tsc --noEmit te donner la liste exacte des erreurs, corrige-les une par une.
- Les tests qui assertent des messages d'erreur exacts vont casser : adapte les assertions au format v4, ne contourne pas.
- Vérifie particulièrement : src/security/validation.schemas.ts, auth, billing/llm-proxy.
- Fin : cp .env.example .env && npm test && rm .env → 85 suites vertes obligatoire.
- Commit : refactor(validation): migrate backend to zod v4 (align with dashboard)
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
