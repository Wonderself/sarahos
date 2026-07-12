# Session 14 — Migration `sarah-*` → `fz-*` (voice IDs legacy)

**Modèle conseillé** : Sonnet · **Coût** : 🟡 moyen · **Durée** : ~45 min
⚠️ Session délicate : le module avatar est UTILISÉ EN PRODUCTION (confirmé par le propriétaire le 12/07/2026). Zéro coupure tolérée.

## Contexte (vérifié le 12/07/2026)

Le CLAUDE.md interdit le préfixe `sarah-*` (legacy SARAH OS). Il reste des **voice IDs** legacy (pas des agent IDs) :

| Fichier | Ligne | Occurrence |
|---|---|---|
| `src/avatar/config/sarah.config.ts` | 35 | `voiceId: 'sarah-fr-female-01'` (+ le nom du fichier lui-même) |
| `src/avatar/services/tts/tts.service.ts` | 16 | `voiceId: 'sarah-fr-female-01'` (défaut) |
| `src/whatsapp/whatsapp-pipeline.service.ts` | 458 | ternaire `'emmanuel-fr-male-01' : 'sarah-fr-female-01'` |
| `src/security/routes/avatar.routes.ts` | 68 | `voiceId: 'sarah-fr-female-01'` (config par défaut renvoyée à l'API) |
| Tests associés | — | `tts.test.ts`, `persona.test.ts`, `conversation.test.ts` |

NE PAS TOUCHER : `src/dashboard/lib/formations/formation-niv3-droit-orchestration.ts` (contenu pédagogique qui RACONTE la migration sarah→fz — c'est du texte de formation, pas du code).

## Stratégie : renommer avec couche de compatibilité (Strangler Fig)

1. **Vérifier d'abord où le voiceId circule** : est-il stocké en DB (table de configs utilisateur ?), envoyé par le frontend, mappé vers un ID ElevenLabs/Telnyx réel ? `grep -rn "voiceId" src --include="*.ts" | grep -v test | head -30`. Le mapping voiceId interne → voix provider est le point clé.
2. Nouveau canonique : `fz-voice-fr-female-01` (et par cohérence `fz-voice-fr-male-01` pour emmanuel — même schéma).
3. **Couche de compat en ENTRÉE** : partout où un voiceId arrive de l'extérieur (API, DB, WhatsApp), normaliser via une petite fonction `normalizeVoiceId()` : `sarah-fr-female-01` → `fz-voice-fr-female-01`, `emmanuel-fr-male-01` → `fz-voice-fr-male-01`. Ainsi les configs stockées existantes continuent de marcher.
4. Remplacer les défauts/constantes par les nouveaux IDs.
5. Renommer `sarah.config.ts` → `fz-avatar.config.ts` (mettre à jour les imports : `grep -rn "sarah.config" src`).
6. Adapter les tests + ajouter un test de la fonction de normalisation (les 2 alias legacy).
7. Si un mapping DB existe (table voices/configs), écrire un script `scripts/migrate-voice-ids.sql` (UPDATE des valeurs) mais NE PAS l'exécuter — le livrer avec instructions dans le résumé.

## Critère de réussite

- `grep -rn "sarah-" src --include="*.ts" | grep -v formations | grep -v normalizeVoiceId` → uniquement les alias dans la fonction de compat (et ses tests).
- Typecheck + tests verts.
- Les anciens IDs restent acceptés en entrée (test le prouvant).

## 🚀 Megaprompt de lancement (copier-coller)

```
Lis AUDIT.md (tableau des sessions uniquement) puis audit/sessions/session-14.md et exécute la Session 14.

Mission : migrer les voice IDs legacy sarah-* vers fz-voice-* avec couche de compatibilité (aucune coupure — le module avatar est en production).

Règles strictes :
- La fiche liste les fichiers/lignes exacts. Commence par tracer la circulation du voiceId (grep "voiceId") pour comprendre le mapping vers les voix provider AVANT de renommer.
- Nouveau canonique : fz-voice-fr-female-01 / fz-voice-fr-male-01. Crée une fonction normalizeVoiceId() appliquée à toute entrée externe (API, DB, WhatsApp) qui accepte les anciens IDs sarah-fr-female-01 et emmanuel-fr-male-01.
- Renomme sarah.config.ts → fz-avatar.config.ts et mets à jour les imports.
- NE TOUCHE PAS au fichier de formation formation-niv3-droit-orchestration.ts (contenu pédagogique).
- Si des voiceIds sont stockés en DB : écris scripts/migrate-voice-ids.sql mais NE l'exécute PAS, donne les instructions dans ton résumé.
- Ajoute un test prouvant que les anciens IDs sont encore acceptés.
- Vérifie : npx tsc --noEmit + cp .env.example .env && npm test && rm .env.
- Commit : refactor(avatar): migrate sarah-* voice IDs to fz-voice-* with legacy aliases
- Fin de session : mets à jour AUDIT.md (statut + HISTORIQUE) et le CLAUDE.md si la règle sarah-* peut être marquée comme réglée.
- Réponds en français, concis, diffs uniquement.
```
