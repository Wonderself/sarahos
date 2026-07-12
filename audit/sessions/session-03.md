# Session 3 — Logging : éliminer les `console.log` backend

**Modèle conseillé** : Sonnet · **Coût** : 🟢 léger · **Durée** : ~30 min

## Contexte (vérifié le 12/07/2026)

La règle CLAUDE.md impose Winston JSON structuré, format `{"level","service","action","userId","timestamp"}`. Or il reste **41 `console.log`** dans le backend (hors dashboard, hors tests), répartis dans **14 fichiers** :

- `src/cron/scheduler.ts`
- `src/telegram/index.ts`, `src/telegram/callbacks.ts`
- `src/telegram/commands/photo-command.ts`, `claude-command.ts`, `think-command.ts`, `chat-command.ts`
- `src/scripts/rgpd-purge.ts`
- `src/lib/code-quality/daily-audit-cron.ts`, `CodeAuditor.ts`
- `src/lib/email-sequence/EmailSequenceService.ts`
- `src/lib/approval-system/ApprovalNotifier.ts`
- `src/lib/email/WelcomeEmailService.ts`
- `src/lib/improvement-engine/ImprovementEngine.ts`

Un logger Winston existe déjà dans le projet (chercher `winston` dans `src/utils/` ou `src/core/` — probablement `src/utils/logger.ts`). L'utiliser, ne pas en créer un deuxième.

## Étapes

1. Localiser le logger existant : `grep -rn "createLogger\|winston" src/utils src/core --include="*.ts" -l | head -3`. Regarder son API (logger.info/warn/error, champs service/action).
2. Fichier par fichier : remplacer chaque `console.log(...)` par `logger.info({service:'<nom-du-module>', action:'<description>', ...})` — même logique pour `console.error` → `logger.error` et `console.warn` → `logger.warn`. Choisir le niveau selon le contenu du message (erreur/avertissement/info).
3. ⚠️ Attention aux `console.error` DANS `src/utils/config.ts` (validation env au boot) : ceux-là peuvent rester — le logger n'est peut-être pas encore initialisé à ce stade. Les exclure du scope si c'est le cas.
4. Masquer toute PII dans les messages migrés (règle RGPD : pas d'email/téléphone en clair dans les logs).
5. Vérifier : `grep -rn "console\.log" src --include="*.ts" | grep -v dashboard | grep -v test` doit être vide (ou justifié). `npx tsc --noEmit` + `cp .env.example .env && npm test && rm .env`.

## Critère de réussite

- 0 `console.log` backend hors dev/debug justifié.
- Tous les logs migrés portent `service` et `action`.
- Typecheck + tests verts.

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-03.md et exécute la Session 3.

Mission : remplacer les 41 console.log du backend par le logger Winston structuré existant.

Règles strictes :
- La liste des 14 fichiers est dans la fiche — ne scanne pas tout le repo.
- Utilise le logger Winston déjà présent dans le projet (cherche-le dans src/utils/), n'en crée pas un nouveau.
- Format des logs : service + action obligatoires, PAS de PII en clair (RGPD).
- console.error dans src/utils/config.ts (validation au boot) : à laisser si le logger n'est pas encore dispo à ce moment-là.
- Vérifie : npx tsc --noEmit + cp .env.example .env && npm test && rm .env.
- Commit sur feature branch : refactor(logging): replace console.log with structured winston logger
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE).
- Réponds en français, concis, diffs uniquement.
```
