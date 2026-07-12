# Session 11 — Refactor pages géantes 2/3 : `chat` + `social`

**Modèle conseillé** : Sonnet · **Coût** : 🔴 lourd · **Durée** : ~1h · **Prérequis** : Session 10 faite (mêmes conventions)

## Contexte

- `src/dashboard/app/client/chat/page.tsx` — **2100 lignes** — ⚠️ page la plus sensible du produit (cœur de la démo). Streaming de réponses, historique, sélection d'agents.
- `src/dashboard/app/client/social/page.tsx` — **2077 lignes**

Appliquer EXACTEMENT la méthode de la Session 10 (voir `audit/sessions/session-10.md`, section « Méthode de découpage » — la relire). Les conventions sont établies : composants co-localisés dans `components/`, état dans page.tsx, aucune dépendance nouvelle.

## Spécificités chat

- Le streaming (SSE/fetch) et la gestion du scroll auto sont les parties les plus fragiles : les extraire en DERNIER, ou les laisser dans page.tsx si le risque est trop grand.
- Clés localStorage `fz_*` et types `deep-discussion.types.ts` : ne pas toucher.
- Tester mentalement chaque extraction : les refs (scroll, input) doivent rester fonctionnelles (forwardRef si besoin).

## Spécificités social

- Page probablement organisée par réseaux/onglets → découpage naturel par onglet/section.

## Critère de réussite

- page.tsx < 700 lignes chacune, composants < 400 lignes.
- `next build` vert, zéro changement fonctionnel (le chat stream toujours, le scroll suit toujours).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement), puis audit/sessions/session-11.md, puis la section « Méthode de découpage » de audit/sessions/session-10.md, et exécute la Session 11.

Mission : découper src/dashboard/app/client/chat/page.tsx (2100 l.) et src/dashboard/app/client/social/page.tsx (2077 l.) en composants, comportement STRICTEMENT identique.

Règles strictes :
- Même méthode et mêmes interdits que la Session 10 (composants co-localisés < 400 l., page < 700 l., état dans page.tsx, aucune dépendance nouvelle, aucun changement de comportement/clés fz_*).
- CHAT = page la plus sensible du produit : le streaming et le scroll auto restent dans page.tsx si leur extraction présente le moindre risque. Attention aux refs (forwardRef).
- npx tsc --noEmit après chaque extraction ; build complet avant commit.
- Si tu ne peux pas finir les deux : termine chat proprement, committe, note social en reste-à-faire dans AUDIT.md.
- Commits : refactor(dashboard): split chat page into components (puis idem social)
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, liste des composants extraits.
```
