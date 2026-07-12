# Session 9 — Responsive parfait mobile (fixes AUDIT-RESULTS)

**Modèle conseillé** : Sonnet · **Coût** : 🟢 léger · **Durée** : ~30 min

## Contexte (source : AUDIT-RESULTS.md §1 — audit responsive de mars 2026, score 88/100)

Le mobile est déjà bon (hook `useIsMobile()`, breakpoint 768px, boutons ≥44px, zoom iOS prévenu). Il reste **6 issues précises** à corriger pour une démo irréprochable sur iPhone :

| Priorité | Page | Issue | Fix |
|---|---|---|---|
| Haute | `client/dashboard/page.tsx` | Grille KPI 2 colonnes trop serrée à 375px | passer en 1 colonne sous 480px |
| Moyenne | `client/studio/page.tsx` | grid photo `minmax(260px)` déborde sur tablette | tester/ajuster minmax (ex. `minmax(220px, 1fr)`) |
| Moyenne | `client/documents/page.tsx` | textarea `minHeight: 80` trop petit mobile | ≥ 120 sur mobile |
| Moyenne | `client/dashboard/page.tsx` | gaps de 8px trop serrés mobile | 12px sur mobile |
| Basse | `client/news-ai/page.tsx` | StatBar `label width: 120` fixe | largeur fluide ou max-width |
| Basse | `client/memory/page.tsx` | audit partiel — repasser la page à 375px | corriger ce qui dépasse |

## Méthode

1. Pour chaque page : localiser le style incriminé (grep du pattern indiqué, ex. `minmax(260px`, `minHeight: 80`, `width: 120`).
2. Appliquer le fix en conservant le pattern existant du fichier (inline styles + `isMobile`).
3. Contrôle visuel : `cd src/dashboard && npm run dev` n'est pas dispo en session distante → se fier au build + relecture attentive des styles. Si Playwright/Chromium est disponible dans l'environnement, faire des captures à 375px et 768px des pages touchées.
4. Build final.

## Critère de réussite

- Les 6 issues corrigées.
- Aucune régression desktop (les changements sont conditionnés par `isMobile` / media queries).
- `next build` vert.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-09.md et exécute la Session 9.

Mission : corriger les 6 issues responsive listées dans la fiche (tableau priorité/page/fix).

Règles strictes :
- Les fixes sont déjà spécifiés dans la fiche — applique-les, ne refais pas l'audit.
- Conserve le pattern du repo : inline styles + hook useIsMobile(), breakpoint 768px, pas de Tailwind.
- Les changements mobile ne doivent PAS toucher le rendu desktop (conditionne par isMobile).
- Si Chromium/Playwright est disponible, fais des captures à 375px des pages modifiées pour vérifier ; sinon relis soigneusement chaque style modifié.
- OBLIGATOIRE avant commit : cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build → 0 erreur.
- Commit : fix(dashboard): mobile responsive polish (6 issues from audit)
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
