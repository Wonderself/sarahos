# Rapport Refactoring Notion — Freenzy Dashboard
**Date** : 13 mars 2026

---

## Ce qui a été fait cette session

### Nettoyage CSS (terminé, pas encore commité)
- Suppression complète du thème Gradient Wave (40+ variables `--gw-*` violet/cyan)
- Sidebar : fond blanc au lieu de violet foncé (#1a0e3a)
- Emojis : nav-icon agrandi 18px → 22px pour visibilité
- Remplacement de tous les `#7c3aed` dans le dashboard par `var(--accent)` / `#0EA5E9`
- Pages login, error, 404 : passées en thème clair
- Ajout des aliases `--fz-*` pour les 120+ références dans les classes `cu-*`
- 13 pages games/tools : couleurs Canvas/SVG corrigées

### Push GitHub (terminé)
- Rebase réussi avec 33 conflits résolus (layout, globals.css, composants)
- Code poussé sur `main`

---

## Fonctionnalités perdues (à restaurer)

### Priorité haute
| Composant | Ce qui manque |
|-----------|---------------|
| **Sidebar** (`layout.tsx`) | UI de personnalisation (drag/drop sections, emoji picker, réorganisation) |
| **Sidebar** (`layout.tsx`) | Bottom tab bar mobile (5 raccourcis) |
| **Team** (`team/page.tsx`) | Gestion workspace (créer/rejoindre) + invitations membres + 3 onglets |

### Priorité moyenne
| Composant | Ce qui manque |
|-----------|---------------|
| **Sidebar** (`layout.tsx`) | Affichage gamification (XP, level, badges) |
| **Strategy** (`strategy/page.tsx`) | Palette de couleurs (12 couleurs) + onglet Dossiers |
| **Repondeur** (`repondeur/page.tsx`) | Wizard setup + cartes statistiques détaillées |

### Priorité basse (pages publiques)
| Composant | Ce qui manque |
|-----------|---------------|
| PublicNav | Liens pricing, scroll detection, glassmorphism |
| PublicFooter | Branding complet, copyright |
| Landing page | Hero steps, stats badges, scenario toggles |

---

## Pages incomplètes

- **16 pages** sans bulle d'aide (`PageExplanation`)
- **25 pages** sans responsive mobile (`useIsMobile()`)
- **12 pages** manquant les deux

Ces lacunes seront corrigées pendant le refactoring batch par batch.

---

## Prochaines étapes

### Étape 1 — Fix accès visiteur (2 min)
Retirer `/client` de `PROTECTED_PREFIXES` dans `middleware.ts`. Les pages ont déjà `VisitorBanner` pour les non-connectés.

### Étape 2 — Créer la template Notion (`lib/page-styles.ts`)
Fichier central avec :
- Palette : noir (#1A1A1A), gris (#9B9B9B, #6B6B6B), bordures (#E5E5E5), fond blanc
- Composants : card, bouton noir, bouton ghost, input, tabs, badges, empty states
- Helpers : `pageContainer()`, `headerRow()`, `cardGrid()`, `toolbar()`, `tabBar()`

### Étapes 3-8 — Appliquer aux 58 pages (par batch de 8)
Ordre : pages simples → complexes. Chaque batch :
1. Importer template partagée
2. Supprimer styles locaux
3. Appliquer header emoji + titre + PageExplanation
4. Ajouter useIsMobile() si manquant
5. Vérifier zéro régression (comparer avec git history)
6. Build check après chaque batch

### Étape 9 — Restaurer les fonctionnalités perdues
Réintroduire sidebar customization, team workspace, strategy palette, repondeur wizard.

---

## Améliorations suggérées

1. **Commiter le nettoyage CSS actuel** avant de commencer le refactoring Notion (point de sauvegarde propre)
2. **Travailler batch par batch** avec un commit par batch — permet de rollback si problème
3. **Tester sur mobile** après chaque batch (le responsive est le point faible actuel)
4. **Vérifier les anciennes versions** (`git diff HEAD~5`) pour chaque page complexe avant de la modifier
5. **Ne pas toucher aux pages publiques** (landing, demo, etc.) dans un premier temps — priorité au dashboard client

---

## Comment préparer la suite

1. **Lire ce fichier** pour avoir le contexte complet
2. **Commiter les changements CSS en cours** (`git add` + commit)
3. **Lancer le refactoring** en disant "on commence phase 0" ou "go phase 1"
4. **Vérifier visuellement** 2-3 pages après chaque batch sur desktop + mobile
5. **Signaler** si une page semble avoir perdu du contenu ou des fonctionnalités

---

## Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `CLAUDE.md` | Règles de code, architecture, conventions |
| `memory/MEMORY.md` | Index mémoire du projet |
| `memory/pages-inventory.md` | Inventaire des 180 pages |
| `memory/architecture.md` | Architecture technique complète |
| `memory/do-not-remove.md` | Liste de protection (ne pas supprimer) |
| Plan : `eventual-juggling-tulip.md` | Plan détaillé phase par phase |
