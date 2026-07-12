# Session 16 — QA finale pré-démo : zéro défaut d'affichage

**Modèle conseillé** : Sonnet · **Coût** : 🔴 lourd (lancer en début de fenêtre de quota) · **Durée** : ~1h30
**Prérequis** : idéalement après les sessions 8, 9 et 15. À refaire (version courte) la veille de chaque démo importante.

## Contexte

Exigence du propriétaire : « une belle démo propre avec aucun défaut d'affichage, UX parfaite ». Cette session est un passage systématique du dashboard, page par page, avec correction immédiate de chaque défaut visuel trouvé.

## Méthode

1. **Build de référence** : `cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build` → doit être vert AVANT de commencer (sinon corriger d'abord).
2. **Inventaire des pages** : la sortie du build liste toutes les routes. Prioriser dans cet ordre :
   - P0 (parcours démo, cf. docs/DEMO-SCRIPT.md si Session 15 faite) : `/`, `/login`, `/client/dashboard`, `/client/chat`, `/client/agents`, `/client/studio`, `/client/social`, facturation/plans.
   - P1 : le reste de `/client/*`.
   - P2 : pages publiques (`/fonctionnalites`, `/tarifs-api`, `/blog`, `/faq`, `/cas`, `/vs-alternatives`).
   - P3 : `(admin)`.
3. **Inspection** : si Chromium/Playwright est disponible (`PLAYWRIGHT_BROWSERS_PATH` est configuré dans les environnements Claude Code web), lancer l'app (`npm run dev` dashboard ou `next start` après build) et capturer chaque page P0/P1 en 1440px ET 375px. Sinon : revue de code ciblée des patterns à risque.
4. **Checklist par page** :
   - [ ] Aucun débordement horizontal (ni 375px ni 1440px)
   - [ ] Aucun texte tronqué/chevauché, aucune couleur hors palette Notion
   - [ ] États vides élégants (pas de « undefined », « NaN », « 0 sur 24 » anxiogène, pas de bloc vide moche)
   - [ ] États de chargement présents (pas de flash de contenu cassé)
   - [ ] Messages d'erreur doux (jamais de stack trace ou « Service indisponible » brut)
   - [ ] Boutons/touch targets ≥ 44px, focus visibles
   - [ ] Emojis de navigation cohérents, titres de page corrects
   - [ ] Console navigateur : 0 erreur JS, 0 404 d'assets
5. **Correction immédiate** : chaque défaut est corrigé dans la foulée (petits diffs). Si un défaut demande un gros chantier → le noter dans AUDIT.md comme session future, ne pas s'enliser.
6. **Rapport final** : `audit/QA-REPORT-<date>.md` — tableau pages × statut (✅/corrigé/reporté), liste des corrections.

## Critère de réussite

- Toutes les pages P0/P1 passent la checklist.
- Build vert, 0 erreur console sur le parcours démo.
- Rapport QA écrit.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-16.md et exécute la Session 16.

Mission : QA visuelle complète du dashboard — objectif zéro défaut d'affichage pour la démo investisseur. Passe les pages dans l'ordre P0→P3 défini dans la fiche, applique la checklist par page, corrige immédiatement chaque défaut trouvé.

Règles strictes :
- Build vert obligatoire avant de commencer ET avant chaque commit.
- Si Chromium/Playwright est disponible dans l'environnement : lance l'app et capture chaque page P0/P1 à 1440px et 375px, inspecte les captures. Sinon fais une revue de code ciblée des patterns à risque (overflow, width fixes, états vides, messages d'erreur bruts) et dis-le.
- Corrige en petits diffs au fil de l'eau. Un défaut = un fix immédiat. Gros chantier détecté = note-le dans AUDIT.md comme session future, ne t'enlise pas.
- Palette Notion stricte (CLAUDE.md), inline styles, pas de Tailwind.
- Écris le rapport final audit/QA-REPORT-<date>.md (tableau pages × statut + corrections faites).
- Commits progressifs : fix(dashboard): QA polish — <zone>
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis. Le rapport QA sert de livrable, pas besoin de tout raconter dans le chat.
```
