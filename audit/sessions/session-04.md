# Session 4 — TypeScript strict : backend (`any` + `@ts-ignore`)

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~45 min

## Contexte (vérifié le 12/07/2026)

La règle CLAUDE.md impose 0 `any` / 0 `@ts-ignore`. État réel : **85 occurrences de `: any` / `as any`** et **6 `@ts-ignore`/`@ts-expect-error`** sur l'ensemble de `src/` (backend + dashboard confondus). Cette session traite le **backend uniquement** (tout `src/` SAUF `src/dashboard/`). La Session 5 traite le dashboard.

Commande de recensement (à lancer en début de session) :
```
grep -rn ": any\b\|as any\b\|@ts-ignore\|@ts-expect-error" src --include="*.ts" | grep -v "src/dashboard" | grep -v node_modules
```

## Stratégie de typage (par ordre de préférence)

1. **Type précis** : si le type réel est identifiable (retour d'API, ligne pg, event), l'écrire ou l'importer.
2. **`unknown` + narrowing** : pour les entrées externes (JSON.parse, req.body brut, catch). `catch (e)` → `catch (e) { const msg = e instanceof Error ? e.message : String(e); }`.
3. **Génériques** : pour les helpers (ex. `function memo<T>(...)`).
4. **Zod infer** : si un schéma Zod existe déjà pour la donnée, utiliser `z.infer<typeof schema>`.
5. JAMAIS remplacer `any` par un cast mensonger (`as unknown as X`) — si le type est vraiment inconnaissable, `unknown` assumé avec garde.

## Pièges connus du repo

- Express : `req.params['id']` → typé `string | string[] | undefined` par convention maison → toujours `String(req.params['id'] || '')`.
- `noUncheckedIndexedAccess` est actif : les accès tableau/index renvoient `T | undefined`.
- Les rows pg : définir des interfaces de row (ou réutiliser celles de `src/*/**.types.ts` qui existent déjà dans la plupart des modules).

## Étapes

1. Recensement (commande ci-dessus) → grouper par fichier.
2. Traiter module par module (billing, core, security, telegram, whatsapp, agents…). Après chaque module : `npx tsc --noEmit`.
3. Pour les 6 `@ts-ignore` : comprendre POURQUOI ils sont là, corriger la cause, supprimer le commentaire. Si vraiment insoluble (bug de lib tierce), remplacer par `@ts-expect-error` + commentaire d'une ligne expliquant la contrainte.
4. Fin : `cp .env.example .env && npm test && rm .env` + `npm run lint`.

## Critère de réussite

- 0 `: any` / `as any` / `@ts-ignore` dans `src/` hors dashboard (exceptions documentées uniquement).
- Typecheck + tests + lint verts.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-04.md et exécute la Session 4.

Mission : éliminer tous les `any`, `as any`, `@ts-ignore` du backend (src/ hors src/dashboard/).

Règles strictes :
- Commence par le grep de recensement donné dans la fiche, groupe par fichier, traite module par module.
- Stratégie : type précis > unknown+narrowing > générique > z.infer. JAMAIS de cast mensonger `as unknown as X`.
- Respecte les conventions maison : String(req.params['x'] || ''), noUncheckedIndexedAccess actif.
- Vérifie npx tsc --noEmit après CHAQUE module, pas seulement à la fin.
- Fin : cp .env.example .env && npm test && rm .env, npm run lint.
- Si la session devient trop longue avant d'avoir tout traité : commit ce qui est fait, note dans AUDIT.md ce qui reste (liste fichiers), arrête-toi proprement.
- Commit : refactor(types): eliminate any/ts-ignore from backend
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
