# Session 8 — Design system CU : migrer les 7 pages hors système

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~45 min

## Contexte (source : AUDIT-RESULTS.md §2 — audit design de mars 2026, ne pas re-auditer)

87/94 pages utilisent le design system centralisé `CU` (`src/dashboard/lib/page-styles.ts`). **7 pages** sont hors système :

| Page | Problème |
|---|---|
| `src/dashboard/app/client/branding/page.tsx` | styles custom inline + padding 32px/24px (max 16px mobile) |
| `src/dashboard/app/client/learn/page.tsx` | styles custom + couleurs hors palette (#16A34A, #D97706, #7C3AED, #DC2626) |
| `src/dashboard/app/client/learn/[parcoursId]/page.tsx` | styles custom inline |
| `src/dashboard/app/client/news-ai/page.tsx` | constante `const C` locale + couleurs hors palette (#D97706, #059669, #FEF2F2, #FFFBEB) |
| `src/dashboard/app/client/settings/personalization/page.tsx` | constante `const C` locale + accent #0EA5E9 |
| `src/dashboard/app/client/strategy/page.tsx` | pas d'import CU (⚠️ page de 2199 lignes — ne PAS la refactorer ici, juste brancher CU) |
| `src/dashboard/app/client/team/page.tsx` | constante `const C` locale + accent #0EA5E9 |

Palette Notion officielle (CLAUDE.md) : fond #FFFFFF, texte #1A1A1A, secondaire #6B6B6B, muted #9B9B9B, bordures #E5E5E5, fond secondaire #FAFAFA, accent #1A1A1A, danger #DC2626. Inline styles UNIQUEMENT (pas de Tailwind).

## Règles de migration

1. Lire d'abord `src/dashboard/lib/page-styles.ts` pour connaître l'API exacte de l'objet `CU` (+ helpers `pageContainer(isMobile)`, `cardGrid`).
2. Remplacer les constantes locales `const C = {...}` par l'import CU. Mapper couleur par couleur.
3. Couleurs sémantiques hors palette (badges de niveau, impacts news) : les rapprocher de la palette. #DC2626 (danger) est déjà dans la palette. Pour les badges verts/orange/violets : garder une sémantique mais passer par des tons discrets cohérents Notion (texte coloré sobre + fond #FAFAFA), ou ajouter ces tons AU design system (une seule source de vérité) plutôt que localement.
4. Accent #0EA5E9 → #1A1A1A partout.
5. branding/page.tsx : padding → `pageContainer(isMobile)`.
6. Zéro changement fonctionnel : uniquement styles/imports.

## Critère de réussite

- 94/94 pages importent CU ; plus aucune constante `const C` locale.
- `grep -rn "#0EA5E9" src/dashboard/app` → 0.
- `cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build` → 0 erreur.
- Rendu visuel cohérent Notion (vérifier avec le build).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-08.md et exécute la Session 8.

Mission : migrer les 7 pages listées dans la fiche vers le design system CU (src/dashboard/lib/page-styles.ts) et éliminer les couleurs hors palette.

Règles strictes :
- Lis d'abord src/dashboard/lib/page-styles.ts pour l'API exacte de CU et ses helpers, puis traite les 7 pages une par une.
- Palette Notion stricte : #FFFFFF/#1A1A1A/#6B6B6B/#9B9B9B/#E5E5E5/#FAFAFA, accent #1A1A1A, danger #DC2626. Inline styles uniquement, jamais de Tailwind.
- Si des couleurs sémantiques (badges niveau/impact) sont nécessaires, ajoute-les UNE FOIS dans page-styles.ts plutôt que localement.
- strategy/page.tsx fait 2199 lignes : branche uniquement l'import CU et remplace les couleurs, NE la refactore PAS (c'est la Session 10).
- Zéro changement fonctionnel. Uniquement styles et imports.
- OBLIGATOIRE avant commit : cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build → 0 erreur.
- Commit : refactor(dashboard): migrate 7 pages to CU design system
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
