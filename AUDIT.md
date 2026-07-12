# 📊 AUDIT — Freenzy.io

Dernière mise à jour : 12 juillet 2026 — Modèle utilisé : Fable 5 (audit) · Sessions d'exécution : Sonnet par défaut

---

## 🚦 OÙ ON EN EST

- **État global : 🟡 à améliorer** (base saine, aucun blocage critique restant après la Session 1)
- **Score santé : 7,5/10**
- Le produit est solide : backend bien architecturé (guardrails, wallet testé, HMAC Twilio validé), dashboard riche (188+ pages), CI complète. Les risques restants sont : un modèle IA par défaut déprécié (peut casser toute l'IA en prod), de la dette TypeScript (`any`, `console.log`), et 5 pages géantes qui freinent la maintenance. Objectif de ce plan : **une démo investisseur irréprochable** (UX parfaite, zéro défaut d'affichage) + hygiène technique.

---

## 🗓️ TABLEAU DES SESSIONS

> Chaque session a sa fiche détaillée avec **megaprompt prêt à copier** dans `audit/sessions/session-XX.md`.
> ⚡ Règle d'or : au début d'une session, lire UNIQUEMENT ce tableau + la fiche de la session concernée. Ne pas relire tout le repo.

| # | Session | Objectif (1 ligne) | Modèle | Coût | Durée | Statut |
|---|---------|--------------------|--------|------|-------|--------|
| 1 | Fondations & sécurité infra | Typecheck réparé, docker-compose sécurisé, modèle fantôme corrigé, racine nettoyée | Fable 5 | 🟡 | ~1h | ✅ FAIT |
| 2 | [Migration modèle Sonnet 4 → 4.6](audit/sessions/session-02.md) | Remplacer `claude-sonnet-4-20250514` (déprécié, retrait annoncé) partout | Sonnet | 🟢 | ~30 min | ⬜ À faire |
| 3 | [Logging Winston](audit/sessions/session-03.md) | Éliminer les 41 `console.log` backend → logger JSON structuré | Sonnet | 🟢 | ~30 min | ⬜ |
| 4 | [TypeScript strict — backend](audit/sessions/session-04.md) | Éliminer `any` et `@ts-ignore` dans `src/` (hors dashboard) | Sonnet | 🟡 | ~45 min | ⬜ |
| 5 | [TypeScript strict — dashboard](audit/sessions/session-05.md) | Éliminer `any` dans `src/dashboard/` | Sonnet | 🟡 | ~45 min | ⬜ |
| 6 | [Remplacer xlsx (CVE)](audit/sessions/session-06.md) | Remplacer le paquet `xlsx` abandonné (failles connues) par `exceljs` | Sonnet | 🟡 | ~45 min | ⬜ |
| 7 | [Harmonisation Zod v3/v4](audit/sessions/session-07.md) | Backend en Zod 3, dashboard en Zod 4 → aligner | Sonnet | 🟡 | ~45 min | ⬜ |
| 8 | [Design system CU — 7 pages](audit/sessions/session-08.md) | Migrer les 7 pages hors design system + couleurs hors palette | Sonnet | 🟡 | ~45 min | ⬜ |
| 9 | [Responsive parfait mobile](audit/sessions/session-09.md) | Corriger les 6 issues responsive de AUDIT-RESULTS.md | Sonnet | 🟢 | ~30 min | ⬜ |
| 10 | [Refactor pages géantes 1/3](audit/sessions/session-10.md) | Découper `strategy` (2199 l.) et `discussions` (2124 l.) | Sonnet | 🔴 | ~1h | ⬜ |
| 11 | [Refactor pages géantes 2/3](audit/sessions/session-11.md) | Découper `chat` (2100 l.) et `social` (2077 l.) | Sonnet | 🔴 | ~1h | ⬜ |
| 12 | [Refactor pages géantes 3/3](audit/sessions/session-12.md) | Découper `reveil`, `journee`, `repondeur`, `layout` client | Sonnet | 🔴 | ~1h | ⬜ |
| 13 | [SEO blog](audit/sessions/session-13.md) | Metadata uniques par article de blog (75→90+/100) | Haiku | 🟢 | ~20 min | ⬜ |
| 14 | [Migration sarah-* → fz-*](audit/sessions/session-14.md) | Renommer les voice IDs legacy avec couche de compatibilité | Sonnet | 🟡 | ~45 min | ⬜ |
| 15 | [Parcours démo investisseur](audit/sessions/session-15.md) | Compte démo seedé + parcours scénarisé sans accroc | Sonnet | 🟡 | ~1h | ⬜ |
| 16 | [QA finale pré-démo](audit/sessions/session-16.md) | Passage complet du dashboard : zéro défaut d'affichage | Sonnet | 🔴 | ~1h30 | ⬜ |

**Légende coût** : 🟢 léger · 🟡 moyen · 🔴 lourd (à lancer en début de fenêtre de quota)

**Ordre recommandé** : 2 (critique) → 3 → 9 → 8 → 15 → 16 pour une démo rapide, puis 4-7, 10-14 pour la dette technique.
Avec 10 sessions : faire 2, 3, 8, 9, 15, 16 + 4, 5, 6, 13. Les refactors (10-12) peuvent attendre l'après-démo.

---

## 💡 PROPOSITIONS À VALIDER (avant implémentation)

- **P1 — Migration urgente du modèle Sonnet 4** : `claude-sonnet-4-20250514` est déprécié chez Anthropic avec retrait annoncé. C'est le modèle L2 par défaut du produit — s'il est retiré, **toutes les réponses IA tombent en erreur**. Migration vers `claude-sonnet-4-6` (même tarif, meilleur). → ❓ En attente
- **P2 — Parcours démo scénarisé** : un compte démo pré-rempli (données réalistes : tâches, conversations, stats, crédits) + un script de démo de 10 min écrit noir sur blanc. C'est LE levier n°1 pour une levée : la démo ne dépend plus de la chance. → ❓ En attente
- **P3 — QA d'affichage systématique** : passage page par page (188 pages) avec build + captures, correction de chaque défaut visuel. Fini les surprises en pleine démo. → ❓ En attente
- **P4 — Refactor des 5 pages géantes** : découper en composants < 400 lignes. Bénéfice : chargement plus fluide (moins de re-renders), développement 2× plus rapide ensuite. Coût : 3 sessions. Peut attendre l'après-démo. → ❓ En attente
- **P5 — Remplacer `xlsx`** : paquet abandonné avec failles de sécurité connues (prototype pollution). Pour une due diligence de levée, une dépendance vulnérable connue fait mauvais effet. Remplacement par `exceljs` (maintenu). → ❓ En attente
- **P6 — Migration sarah-* → fz-*** : les voice IDs `sarah-fr-female-01` (avatar/WhatsApp/TTS) sont le dernier legacy SARAH OS. Migration avec alias de compatibilité (aucune coupure). → ❓ En attente
- **P7 — SEO blog** : chaque article a actuellement les metadata génériques du site. Metadata uniques = plus de trafic organique = meilleure traction à montrer aux investisseurs. → ❓ En attente
- **P8 — Badge « conformité » pour la levée** : après les sessions 2-7, générer un rapport une page (0 `any`, 0 CVE connue, 1535+ tests verts, RGPD) à joindre au deck. Coût quasi nul, effet rassurant en due diligence. → ❓ En attente

---

## 📝 DÉTAIL DES SESSIONS

Le détail complet de chaque session (contexte, fichiers touchés, étapes, critères de réussite, **megaprompt prêt à copier**) est dans `audit/sessions/session-XX.md` — un fichier par session, autonome, pour que chaque session future ne lise QUE sa fiche.

### Résumé express

- **S2 — Modèle Sonnet 4→4.6** : ~15 fichiers (`src/utils/config.ts`, validation, tests, CLAUDE.md). Critère : 0 occurrence de `claude-sonnet-4-20250514`, tests verts.
- **S3 — Logging** : 14 fichiers backend. Critère : `grep console.log src --include=*.ts | grep -v dashboard | grep -v test` = 0.
- **S4/S5 — TS strict** : 85 `any` + 6 `@ts-ignore`. Critère : 0 occurrence, typecheck vert.
- **S6 — xlsx** : `package.json` + fichiers utilisant `xlsx`. Critère : `npm ls xlsx` vide, exports Excel fonctionnels, tests verts.
- **S7 — Zod** : aligner les versions. Critère : même major partout, validation testée.
- **S8 — Design CU** : 7 pages listées dans AUDIT-RESULTS.md §2. Critère : 94/94 pages avec import CU, 0 couleur hors palette.
- **S9 — Responsive** : 6 issues de AUDIT-RESULTS.md §1. Critère : parfait à 375px (iPhone) et 768px (tablette).
- **S10-12 — Refactors** : chaque page < 700 lignes, composants extraits dans `components/`. Critère : build 0 erreur, comportement identique.
- **S13 — SEO** : `generateMetadata` par article. Critère : title/description/OG uniques sur chaque article.
- **S14 — sarah→fz** : `fz-voice-fr-female-01` + alias legacy accepté en entrée. Critère : 0 nouveau `sarah-*`, TTS fonctionne.
- **S15 — Démo** : seed + script démo + page /demo pré-connectée. Critère : parcours 10 min sans accroc, données crédibles.
- **S16 — QA finale** : checklist 188 pages. Critère : 0 défaut d'affichage, build vert, rapport final.

---

## ⚠️ RÈGLES POUR TOUTES LES SESSIONS

1. **Lire d'abord** : `AUDIT.md` (ce tableau) + `audit/sessions/session-XX.md` de la session en cours. RIEN d'autre au départ.
2. **Ne PAS relire** les fichiers déjà analysés — les fiches de session contiennent les chemins et numéros de ligne exacts.
3. **Avant commit** : `npx tsc --noEmit` (racine) + `cd src/dashboard && NODE_OPTIONS="--max-old-space-size=4096" npx next build` si le dashboard est touché.
4. **Fin de session** : mettre à jour le statut dans le tableau ci-dessus + une ligne dans l'HISTORIQUE. Commit `feat|fix|refactor(scope): description` sur une feature branch.
5. **1 session = 1 objectif.** Si ça déborde, découper et s'arrêter proprement.
6. Rappeler à l'utilisateur de faire `/compact` si la conversation devient longue.

---

## ✅ HISTORIQUE

- [2026-07-12] **Session 1 terminée** — Typecheck réparé (baseUrl déprécié), modèle fantôme `claude-sonnet-4-6-20250514` corrigé dans ImprovementEngine, ports Postgres/Redis liés à 127.0.0.1 en dev, `docker-compose.prod.yml` redondant archivé, 7 fichiers de suivi obsolètes déplacés vers `docs/archive/`, README.md créé, AUDIT.md + 15 fiches de session créées.
