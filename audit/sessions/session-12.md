# Session 12 — Refactor pages géantes 3/3 : `reveil`, `journee`, `repondeur`, `layout` client

**Modèle conseillé** : Sonnet · **Coût** : 🔴 lourd · **Durée** : ~1h · **Prérequis** : Sessions 10-11 faites

## Contexte

Dernier lot de fichiers > 1400 lignes :
- `src/dashboard/app/client/reveil/page.tsx` — 1602 lignes
- `src/dashboard/app/client/layout.tsx` — 1556 lignes ⚠️ (layout GLOBAL du dashboard client : sidebar, rail emoji, topbar — toute régression est visible sur TOUTES les pages)
- `src/dashboard/app/client/journee/page.tsx` — 1517 lignes
- `src/dashboard/app/client/repondeur/page.tsx` — 1451 lignes

Méthode : voir `audit/sessions/session-10.md` § « Méthode de découpage ». Mêmes conventions, mêmes interdits.

## Spécificités layout.tsx

- C'est le composant le plus critique du dashboard (rendu sur toutes les pages client).
- Découpage naturel : `Sidebar.tsx`, `EmojiRail.tsx`, `MobileTopbar.tsx`, `SidebarOverlay.tsx` dans `app/client/components/layout/`.
- Les comportements décrits dans docs/archive/PROGRESS.md (rail 56px toujours visible desktop, sidebar à left:56px, overlay clic-dehors, indicateur actif trait noir, mobile z-index 56) doivent être EXACTEMENT préservés — les vérifier dans le code avant/après.
- Le faire en DERNIER dans la session, avec un commit séparé, pour pouvoir revert facilement.

## Critère de réussite

- Chaque fichier < 700 lignes, composants < 400 lignes.
- `next build` vert.
- Sidebar/rail/topbar : comportement identique (desktop + mobile).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement), puis audit/sessions/session-12.md, puis la section « Méthode de découpage » de audit/sessions/session-10.md, et exécute la Session 12.

Mission : découper reveil/page.tsx (1602 l.), journee/page.tsx (1517 l.), repondeur/page.tsx (1451 l.) puis EN DERNIER app/client/layout.tsx (1556 l.), comportement STRICTEMENT identique.

Règles strictes :
- Mêmes méthode et interdits que les Sessions 10-11.
- layout.tsx en DERNIER, commit séparé : extrais Sidebar/EmojiRail/MobileTopbar/SidebarOverlay dans app/client/components/layout/ en préservant exactement les comportements (rail 56px desktop, sidebar left:56px, overlay clic-dehors ferme, indicateur actif, mobile sidebar z-index 56 couvre le rail).
- npx tsc --noEmit après chaque extraction ; build complet avant chaque commit.
- Si tu ne peux pas tout finir : priorise reveil+journee+repondeur, laisse layout.tsx pour une session dédiée, note-le dans AUDIT.md.
- Commits : refactor(dashboard): split reveil/journee/repondeur pages ; puis refactor(dashboard): extract client layout components
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, liste des composants extraits.
```
