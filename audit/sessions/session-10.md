# Session 10 — Refactor pages géantes 1/3 : `strategy` + `discussions`

**Modèle conseillé** : Sonnet · **Coût** : 🔴 lourd (lancer en début de fenêtre de quota) · **Durée** : ~1h
**Prérequis** : Session 8 faite (strategy est déjà branchée sur CU)

## Contexte (vérifié le 12/07/2026)

Les deux plus grosses pages du dashboard :
- `src/dashboard/app/client/strategy/page.tsx` — **2199 lignes**
- `src/dashboard/app/client/discussions/page.tsx` — **2124 lignes**

Problèmes : re-renders massifs (tout l'état dans un seul composant), maintenance impossible, risques de régression à chaque modification. Objectif : découper en composants < 400 lignes chacun, page principale < 700 lignes, **comportement strictement identique**.

## Méthode de découpage (identique pour les 2 pages)

1. **Lire la page en entier** et cartographier : blocs d'UI (sections visuelles), état local (useState/useEffect), helpers purs.
2. Créer un dossier de composants co-localisés : `src/dashboard/app/client/strategy/components/` (idem discussions). Convention : un fichier par composant, PascalCase.
3. Ordre d'extraction (du moins risqué au plus risqué) :
   a. **Helpers purs et constantes** → `utils.ts` / `constants.ts` locaux (ou `lib/` si réutilisables).
   b. **Types** → `types.ts` local.
   c. **Composants feuilles** (cartes, badges, items de liste, modales) : ne reçoivent que des props.
   d. **Sections** (panneaux entiers) : props + callbacks.
   e. L'état global de page RESTE dans `page.tsx` (ne pas introduire de state manager).
4. Ajouter `React.memo` sur les composants feuilles qui reçoivent des props stables (gain re-render), `useCallback` pour les handlers passés en props — SEULEMENT là où ça a du sens.
5. Après CHAQUE extraction : `cd src/dashboard && npx tsc --noEmit`.
6. Build final complet.

## Interdits

- Ne PAS changer le comportement, les textes, les styles, les clés localStorage (`fz_*`).
- Ne PAS renommer les routes ni déplacer les pages.
- Ne PAS introduire de dépendance nouvelle (pas de zustand/redux).
- Si les deux pages ne tiennent pas dans la session : finir `strategy` proprement, committer, noter `discussions` comme reste-à-faire dans AUDIT.md.

## Critère de réussite

- `wc -l` : page.tsx < 700 lignes, chaque composant < 400 lignes.
- `next build` vert, aucune modification visuelle ou fonctionnelle.
- localStorage et appels API inchangés (mêmes clés, mêmes endpoints).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-10.md et exécute la Session 10.

Mission : découper src/dashboard/app/client/strategy/page.tsx (2199 l.) puis src/dashboard/app/client/discussions/page.tsx (2124 l.) en composants co-localisés, comportement STRICTEMENT identique.

Règles strictes :
- Suis la méthode de la fiche : helpers → types → composants feuilles → sections. L'état de page reste dans page.tsx, pas de state manager.
- Composants dans app/client/<page>/components/, un fichier par composant, < 400 lignes chacun, page finale < 700 lignes.
- INTERDIT : changer comportement/textes/styles/clés fz_*/routes, ajouter des dépendances.
- npx tsc --noEmit après chaque extraction ; build complet avant commit (NODE_OPTIONS="--max-old-space-size=4096" npx next build).
- Si tu ne peux pas finir les deux pages : termine strategy proprement, committe, note discussions en reste-à-faire dans AUDIT.md et arrête-toi.
- Commit(s) : refactor(dashboard): split strategy page into components (puis idem discussions)
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis. Ne recopie pas les gros blocs de code dans le chat, liste les composants extraits.
```
