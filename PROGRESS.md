# PROGRESS — Refonte Sidebar + Dashboard + Cohérence

## Terminé

### 1. Sidebar — Fix emoji rail + expand
- **Emoji rail** toujours visible sur desktop (56px) — ne se cache plus quand sidebar ouvre
- **Clic sur emoji section** → ouvre la sidebar ET scroll vers la section correspondante
- **Sidebar** s'ouvre à `left: 56px` (à droite du rail) au lieu de couvrir le rail
- **Overlay semi-transparent** apparaît sur desktop aussi — clic dehors ferme la sidebar
- **Sidebar ne pousse plus le contenu** — overlay uniquement
- **Logo "f."** dans le rail en haut (au lieu de 🚀)
- **Indicateur actif** : trait noir à gauche de l'emoji de la section active (style Notion)
- **Mobile** : sidebar passe en `z-index: 56` et couvre le rail (comportement mobile correct)

### 2. Logo & Branding
- **Sidebar header** : "freenzy.io" + "Beta Test 1" (lien vers accueil)
- **Mobile topbar** : conserve l'affichage emoji + titre de page, ou "freenzy.io Beta Test 1" en fallback
- **PublicNav** : déjà correct (vérifié)
- **Login** : déjà correct (vérifié)
- **Landing page** : v2 Notion promue en page d'accueil

### 3. Dashboard Home (`/client/dashboard`)
- **"Service temporairement indisponible"** → remplacé par message plus doux
- **"Streak 0j"** → affiche "Nouveau" + "Bienvenue !" pour les nouveaux utilisateurs
- **"X sur 24 assistants"** → remplacé par "X actifs" (moins intimidant)

### 4. Notion-style consistency (layout.tsx)
- **Toutes les CSS variables** (`var(--text-muted)`, `var(--accent)`, etc.) remplacées par couleurs Notion directes
- Palette: `#1A1A1A` (text), `#6B6B6B` (secondary), `#9B9B9B` (muted), `#E5E5E5` (border), `#FAFAFA` (bg secondary)
- Bordures: `1px solid #E5E5E5` partout, `borderRadius: 8` partout
- Boutons: fond `#1A1A1A`, texte blanc
- Sidebar nav links: actif = bordure gauche noire + fond subtil, inactif = `#6B6B6B`

### 5. Allègement du build
- **Landing v2 Notion** promue en page d'accueil (`/`) — 1014 lignes
- **Ancienne landing** (1129 lignes) remplacée
- **`/v2`** → redirect vers `/`
- **`/variants/`** supprimé (5 pages, ~3700 lignes) : gradient-wave, problème-solution, roi-économie, simplicité
- **Résultat** : 188 → 175 pages, build OK

## Fichiers modifiés
- `src/dashboard/app/globals.css` — Emoji rail: keep visible, active indicator, sidebar positioning
- `src/dashboard/app/client/layout.tsx` — Sidebar + header + branding + Notion colors
- `src/dashboard/app/client/dashboard/page.tsx` — Dashboard UX fixes
- `src/dashboard/app/page.tsx` — Remplacé par le contenu v2
- `src/dashboard/app/v2/page.tsx` — Redirect vers /

## Supprimé
- `src/dashboard/app/variants/` — 5 fichiers (~3700 lignes)

## Build
- TypeScript: 0 erreurs
- Next.js: 175 pages, compilation OK
- EBUSY warning (Windows) = inoffensif
