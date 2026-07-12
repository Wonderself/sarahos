# Session 5 — TypeScript strict : dashboard (`any`)

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~45 min · **Prérequis** : Session 4 faite (mêmes conventions)

## Contexte

Suite de la Session 4, périmètre : `src/dashboard/` uniquement (Next.js 14, React 18, TS 5.5). Le dashboard a son propre `tsconfig.json` et son propre `package.json`.

Recensement :
```
grep -rn ": any\b\|as any\b\|@ts-ignore\|@ts-expect-error" src/dashboard --include="*.ts" --include="*.tsx" | grep -v node_modules
```

## Spécificités dashboard

- Composants React : typer les props avec des interfaces dédiées, les handlers avec `React.ChangeEvent<HTMLInputElement>` etc.
- Les réponses d'API internes : chercher si un type existe déjà dans `src/dashboard/lib/*.types.ts` ou dans `api-client.ts` avant d'en créer un.
- `localStorage` : les données parsées sont `unknown` → garde de forme avant usage (les clés `fz_*` ont souvent des helpers dans `lib/` qui centralisent déjà le parse — passer par eux).
- Recharts v3 : les types de props des tooltips/labels custom sont pénibles — utiliser les types exportés par recharts, pas `any`.
- Zod v4 est présent côté dashboard : `z.infer` disponible.

## Étapes

1. Recensement → grouper par dossier (`app/client/`, `app/(admin)/`, `lib/`, `components/`).
2. Traiter dossier par dossier. Après chaque dossier : `cd src/dashboard && npx tsc --noEmit`.
3. Build final obligatoire : `cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build` → 0 erreur.

## Critère de réussite

- 0 `any`/`as any`/`@ts-ignore` dans `src/dashboard/`.
- `next build` vert (toutes les pages générées, 0 erreur).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-05.md et exécute la Session 5.

Mission : éliminer tous les `any`, `as any`, `@ts-ignore` de src/dashboard/.

Règles strictes :
- Commence par le grep de recensement de la fiche, groupe par dossier, traite dossier par dossier.
- Réutilise les types existants (lib/*.types.ts, api-client.ts, types recharts) avant d'en créer.
- localStorage : passe par les helpers lib/ existants, données parsées = unknown + garde.
- Vérifie cd src/dashboard && npx tsc --noEmit après chaque dossier.
- OBLIGATOIRE avant commit : cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build → 0 erreur.
- Si trop long : commit partiel propre + note du reste dans AUDIT.md.
- Commit : refactor(dashboard): eliminate any/ts-ignore from dashboard
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
