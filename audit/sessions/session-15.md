# Session 15 — Parcours démo investisseur

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~1h
**Objectif business** : levée de fonds — LA session la plus importante du plan avec la 16.

## Contexte

Le propriétaire prépare une levée/démo. Il faut que la démo ne dépende plus de l'état du compte au moment J : un **compte démo pré-rempli avec des données crédibles** + un **script de démo écrit** de ~10 minutes.

Existant à réutiliser (ne pas réinventer) :
- Seed : `scripts/seed-data.ts` (`npm run db:init`) et `scripts/seed-users.ts` — regarder ce qu'ils créent déjà.
- Il existe des pages `/demo` et `/try` dans `src/dashboard/app/` — vérifier ce qu'elles font avant d'en créer.
- 136 agents dans `src/dashboard/lib/agent-config*.ts` — la démo doit en montrer la richesse.
- Crédits : SIGNUP_BONUS_CREDITS = 50 ; le compte démo doit avoir un historique de crédits réaliste (achats, consommation).

## Livrables

1. **Script de seed démo** : `scripts/seed-demo-account.ts` (`npm run db:seed-demo` à ajouter dans package.json). Crée (idempotent — re-exécutable sans doublons) :
   - 1 utilisateur `demo@freenzy.io` (mot de passe via env `DEMO_PASSWORD`, JAMAIS en dur).
   - Wallet avec solde + ~30 transactions étalées sur 60 jours (achats, consommation par agent).
   - 8-10 agents « actifs » avec historique : tâches terminées (contenus réalistes en français : PME fictive crédible, ex. agence immo ou resto), 3-4 conversations riches dans le chat, événements.
   - Stats dashboard non vides : streak, KPIs, activité sur 30 jours.
   - Données 100% fictives (RGPD : aucun vrai nom/email/téléphone).
2. **Script de démo** : `docs/DEMO-SCRIPT.md` — déroulé minuté de 10 min : login → dashboard (KPIs) → chat avec un agent (question préparée qui marche bien) → studio/social (création de contenu) → facturation/crédits (business model) → admin (si pertinent). Pour chaque étape : URL, quoi dire (1-2 phrases business), quoi montrer, piège à éviter.
3. **Checklist pré-démo** : dans le même doc — 10 points à vérifier 1h avant (compte seedé, crédits > 0, API key Anthropic valide, pas de bannière d'erreur, mode réseau stable…).

## Interdits

- Aucun secret en dur. Aucune donnée réelle.
- Ne pas toucher aux flows de prod (le seed est additif, sur un compte dédié).

## Critère de réussite

- `npm run db:seed-demo` exécutable et idempotent (2 exécutions = même état).
- Login sur le compte démo → toutes les pages du parcours sont pleines et crédibles, zéro état vide moche.
- DEMO-SCRIPT.md complet et actionnable par quelqu'un qui ne connaît pas le code.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-15.md et exécute la Session 15.

Mission : créer le parcours démo investisseur — seed d'un compte démo réaliste + script de démo minuté + checklist pré-démo.

Règles strictes :
- Regarde D'ABORD scripts/seed-data.ts et seed-users.ts (structures de tables, helpers) et les pages /demo et /try existantes — réutilise, ne duplique pas.
- Crée scripts/seed-demo-account.ts idempotent : user demo@freenzy.io (mot de passe via env DEMO_PASSWORD), wallet + ~30 transactions sur 60 jours, 8-10 agents actifs avec tâches/conversations/événements réalistes en français pour une PME fictive, stats 30 jours non vides. Ajoute le script npm db:seed-demo.
- Données 100% fictives (RGPD), AUCUN secret en dur, seed additif sur compte dédié uniquement.
- Crée docs/DEMO-SCRIPT.md : déroulé 10 min minuté (URL, quoi dire, quoi montrer, pièges) + checklist pré-démo 10 points.
- Respecte les règles crédits du CLAUDE.md (1 crédit = 1M micro-crédits, historique cohérent).
- Vérifie : npx tsc --noEmit + tests. Si une DB locale est dispo dans l'environnement, exécute le seed 2 fois pour prouver l'idempotence ; sinon relis-le soigneusement et dis-le dans le résumé.
- Commit : feat(demo): investor demo account seed + demo script
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis.
```
