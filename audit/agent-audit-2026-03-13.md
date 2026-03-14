# Audit des Prompts Agents Freenzy.io

**Date** : 13 mars 2026
**Auditeur** : Claude (automatisé)
**Périmètre** : 120 agents (34 core + 19 business1 + 19 business2 + 28 personal ext. + 16 tools + 4 non comptés dans extended-tools dupliqués)

---

## 1. Résumé exécutif

| Catégorie | Fichier | Agents | Qualité prompt | Token moyen estimé |
|-----------|---------|--------|----------------|-------------------|
| Core Business (22) | `agent-config.ts` (DEFAULT_AGENTS) | 22 | **Excellente** (10 premiers) / **Moyenne** (12 suivants) | ~800-1500 / ~150-300 |
| Core Personal (12) | `agent-config.ts` (PERSONAL_AGENTS) | 12 | **Excellente** | ~800-1500 |
| Extended Business 1 | `agents-extended-business1.ts` | 19 | **Faible** | ~30-50 |
| Extended Business 2 | `agents-extended-business2.ts` | 19 | **Faible** | ~30-50 |
| Extended Personal | `agents-extended-personal.ts` | 28 | **Faible** | ~30-50 |
| Extended Tools | `agents-extended-tools.ts` | 16 | **Faible** | ~30-50 |

**Verdict global** : Les 34 agents core sont de qualité professionnelle. Les 86 agents étendus ont des prompts de 1-2 phrases, très en dessous des standards établis par les agents core.

---

## 2. Analyse détaillée des prompts

### 2.1 Agents Core — Première vague (10 agents : fz-repondeur → fz-dg)

**Qualité : EXCELLENTE**

Structure complète et cohérente :
- EXPERTISE (domaine détaillé)
- METHODOLOGIE (4 phases : Découverte → Cadrage → Production → Affinage)
- MODES (descriptions par mode avec questions de découverte)
- DECOUVERTE PAR DEFAUT (message d'accueil structuré)
- FORMAT (conventions de sortie)
- REGLES D'OR (garde-fous)
- Sections spécialisées additionnelles (ex: flux appel complet pour fz-repondeur, templates stratégiques pour fz-dg)

**Token budget estimé** : 800-1500 tokens → **Conforme aux cibles L2 (≤800) et L3 (≤1500)**

| Agent | Tokens estimés | Routing actuel | Routing cible | Statut |
|-------|---------------|----------------|---------------|--------|
| fz-repondeur | ~1200 | Sonnet (L2) | L2 | OK |
| fz-assistante | ~1100 | Sonnet (L2) | L2 | OK |
| fz-commercial | ~900 | Sonnet (L2) | L2 | OK |
| fz-marketing | ~1000 | Sonnet (L2) | L2 | OK |
| fz-rh | ~900 | Sonnet (L2) | L2 | OK |
| fz-communication | ~1300 | Sonnet (L2) | L2 | ATTENTION - dépasse L2 cible |
| fz-finance | ~800 | Sonnet (L2) | L2 | OK |
| fz-dev | ~900 | **Opus (L3)** | L3 | OK |
| fz-juridique | ~1200 | Sonnet (L2) | L2/L3 | ATTENTION - gros prompt pour L2 |
| fz-dg | ~1400 | **Opus (L3)** | L3 | OK |

### 2.2 Agents Core — Phase 11 (10 agents : fz-qualite → fz-international)

**Qualité : MOYENNE**

Prompts en un seul paragraphe dense. Contiennent l'expertise et les méthodologies mais manquent :
- Pas de MODES détaillés
- Pas de DECOUVERTE PAR DEFAUT
- Pas de FORMAT
- Pas de REGLES D'OR
- Pas de sections spécialisées

**Token budget estimé** : 150-300 tokens → **Sous-exploité pour L2**

| Agent | Tokens estimés | Manques |
|-------|---------------|---------|
| fz-qualite | ~250 | Modes, découverte, format, règles |
| fz-data | ~250 | Modes, découverte, format, règles |
| fz-product | ~250 | Modes, découverte, format, règles |
| fz-csm | ~250 | Modes, découverte, format, règles |
| fz-rse | ~280 | Modes, découverte, format, règles |
| fz-operations | ~280 | Modes, découverte, format, règles |
| fz-design | ~280 | Modes, découverte, format, règles |
| fz-formation | ~280 | Modes, découverte, format, règles |
| fz-innovation | ~280 | Modes, découverte, format, règles |
| fz-international | ~280 | Modes, découverte, format, règles |

### 2.3 Agents Core Personal (12 agents : fz-budget → fz-deconnexion)

**Qualité : EXCELLENTE**

Même structure complète que les 10 premiers business agents. Prompts riches avec toutes les sections.

| Agent | Tokens estimés | Routing | Statut |
|-------|---------------|---------|--------|
| fz-budget | ~1000 | Sonnet (L2) | OK |
| fz-negociateur | ~1000 | Sonnet (L2) | OK |
| fz-impots | ~900 | Sonnet (L2) | OK |
| fz-comptable | ~900 | Sonnet (L2) | OK |
| fz-chasseur | ~1000 | Sonnet (L2) | OK |
| fz-portfolio | ~1000 | Sonnet (L2) | OK |
| fz-cv | ~1100 | Sonnet (L2) | OK |
| fz-contradicteur | ~1000 | Sonnet (L2) | OK |
| fz-ecrivain | ~1000 | Sonnet (L2) | OK |
| fz-cineaste | ~1100 | Sonnet (L2) | OK |
| fz-coach | ~1000 | Sonnet (L2) | OK |
| fz-deconnexion | ~1000 | Sonnet (L2) | OK |

### 2.4 Extended Business 1 (19 agents)

**Qualité : FAIBLE**

Prompts de 1-2 phrases génériques. Exemple type :
```
"Tu es Élise, Recruteuse IA chez Freenzy. Tu identifies, évalues et recrutes
les meilleurs talents grâce à l'analyse prédictive et au sourcing intelligent."
```

**Manques systématiques** :
- Pas d'EXPERTISE détaillée
- Pas de METHODOLOGIE (4 phases)
- Pas de MODES avec questions de découverte
- Pas de DECOUVERTE PAR DEFAUT
- Pas de FORMAT
- Pas de REGLES D'OR
- Pas de sections spécialisées

**Token budget estimé** : ~30-50 tokens → **Très sous-exploité, même pour L1 (≤300)**

### 2.5 Extended Business 2 (19 agents)

**Qualité : FAIBLE** — Même constat que Business 1.

### 2.6 Extended Personal (28 agents)

**Qualité : FAIBLE** — Même constat. Prompts de 1-2 phrases.

### 2.7 Extended Tools (16 agents)

**Qualité : FAIBLE** — Même constat. Prompts de 1-2 phrases.

---

## 3. Problèmes identifiés

### 3.1 Prompts vides / génériques (CRITIQUE)

**86 agents sur 120 (72%)** ont des prompts de 1-2 phrases qui ne fournissent pas suffisamment de contexte pour guider le modèle. Ces agents produiront des réponses génériques et non-spécialisées.

### 3.2 Noms dupliqués (MOYEN)

Plusieurs noms d'agents sont utilisés plusieurs fois, ce qui crée de la confusion :

| Nom | Agents |
|-----|--------|
| **Jade** | fz-marketing (Dir. Marketing) ET fz-design (Dir. Artistique) |
| **Lina** | fz-communication, fz-innovation, ET fz-voyage |
| **Inès** | fz-assistante ET fz-rse |
| **Zoé** | fz-portfolio ET fz-animaux |
| **Nathan** | fz-data ET fz-growth |
| **Camille** | fz-repondeur ET fz-calendrier (tools) ET fz-deco |
| **Léna** | fz-photo ET fz-crm (prénoms proches) |

### 3.3 Routing modèle non exploité (MOYEN)

Selon CLAUDE.md : L1=Haiku (exécution rapide), L2=Sonnet (rédaction), L3=Opus (stratégie).

**Constat** :
- **0 agents** utilisent Haiku (L1) → Les agents tools (calendrier, email, QR code...) devraient être L1
- **Seulement 2 agents** utilisent Opus (L3) : fz-dev et fz-dg
- **Tous les autres** (118) utilisent Sonnet (L2)

**Recommandation** : Passer les 16 agents tools en L1 Haiku, et promouvoir 5-8 agents stratégiques en L3 Opus (fz-juridique, fz-strategie, fz-mentor, fz-architect, fz-finance).

### 3.4 Incohérence modes icons (FAIBLE)

Les 10 premiers core business utilisent des Material Icons pour les modes (ex: `'search'`, `'handshake'`). Les 10 agents Phase 11 utilisent des emojis (ex: `'🔍'`, `'📈'`). Incohérence de format.

### 3.5 ID dupliqué potentiel (MOYEN)

`fz-traducteur` existe dans business1 (Karim) ET dans tools (Tariq). Deux agents avec le même ID causeront un conflit.

---

## 4. Token Budget — Actuel vs Cible

### Cibles définies dans CLAUDE.md :
- **L1 (Haiku)** : ≤300 tokens — exécution rapide
- **L2 (Sonnet)** : ≤800 tokens — rédaction, analyse
- **L3 (Opus)** : ≤1500 tokens — stratégie, Extended Thinking

### État actuel :

| Catégorie | Agents | Tokens actuels | Cible | Écart |
|-----------|--------|---------------|-------|-------|
| Core Business vague 1 | 10 | 800-1500 | L2/L3 | **Conforme** |
| Core Personal | 12 | 800-1500 | L2 | **Conforme** (mais certains dépassent L2 → à passer en L3) |
| Core Business Phase 11 | 10 | 150-300 | L2 (≤800) | **Sous-exploité** : +500 tokens à ajouter |
| Extended Business 1 | 19 | 30-50 | L2 (≤800) | **Très sous-exploité** : +750 tokens à ajouter |
| Extended Business 2 | 19 | 30-50 | L2 (≤800) | **Très sous-exploité** : +750 tokens à ajouter |
| Extended Personal | 28 | 30-50 | L2 (≤800) | **Très sous-exploité** : +750 tokens à ajouter |
| Extended Tools | 16 | 30-50 | L1 (≤300) | **Sous-exploité** : +250 tokens à ajouter |

### Effort estimé :
- **86 agents** nécessitent un enrichissement de prompt
- **~60,000 tokens** de contenu à rédiger au total
- **Priorité** : Extended Business (38 agents) > Extended Personal (28) > Phase 11 Core (10) > Tools (16)

---

## 5. Copier-collés et contenus génériques détectés

### Pattern détecté dans les extended agents :

Tous les 86 agents étendus suivent exactement le même template :
```typescript
{
  id: 'fz-xxx', name: 'Prénom', gender: 'X', role: 'Rôle', emoji: '🔣',
  materialIcon: 'icon', color: '#hex', model: 'claude-sonnet-4-20250514',
  systemPrompt: 'Tu es [Prénom], [Rôle] chez Freenzy. [1-2 phrases génériques].',
  meetingPrompt: 'Apporte ton expertise en [domaine].',
  // ... rest identical structure
}
```

Ce n'est pas du "copier-collé" au sens strict (chaque agent a un contenu unique), mais le **niveau de détail est uniformément insuffisant**. Les descriptions, taglines et capabilities sont bien différenciées — seul le systemPrompt est trop court.

### Champs qui sont correctement remplis partout :
- `description` : Unique et pertinent
- `tagline` : Unique et accrocheur
- `hiringPitch` : Unique et engageant
- `capabilities` : 5 items pertinents par agent
- `domainOptions` : 20 options pertinentes par agent
- `modes` : 3 modes pertinents par agent
- `meetingPrompt` : Court mais adapté

### Seul champ problématique :
- `systemPrompt` : **1-2 phrases au lieu de la structure complète** (EXPERTISE + METHODOLOGIE + MODES + DECOUVERTE + FORMAT + REGLES D'OR)

---

## 6. Recommandations (par priorité)

### P0 — Critique
1. **Enrichir les 86 system prompts** des agents étendus au format des core agents
2. **Résoudre le conflit d'ID** fz-traducteur (business1 vs tools)

### P1 — Important
3. **Dédupliquer les noms** d'agents (7 noms en double/triple)
4. **Implémenter le routing L1/L2/L3** (passer tools en Haiku, agents stratégiques en Opus)
5. **Harmoniser les icons** des modes (Material Icons partout, pas d'emojis)

### P2 — Amélioration
6. **Ajouter les sections spécialisées** aux agents Phase 11 core (templates, flux, etc.)
7. **Revoir les priceCredits** en fonction du modèle utilisé (L3 > L2 > L1)
8. **Auditer les meetingPrompts** des agents étendus (trop courts pour les réunions)

---

## 7. Matrice de conformité

| Critère | Core V1 (10) | Core V2 (10) | Core Perso (12) | Ext. Biz (38) | Ext. Perso (28) | Tools (16) |
|---------|-------------|-------------|----------------|--------------|----------------|-----------|
| systemPrompt détaillé | OK | PARTIEL | OK | NON | NON | NON |
| Méthodologie 4 phases | OK | NON | OK | NON | NON | NON |
| Découverte par défaut | OK | NON | OK | NON | NON | NON |
| Format de sortie | OK | NON | OK | NON | NON | NON |
| Règles d'or | OK | NON | OK | NON | NON | NON |
| Noms uniques | NON | NON | NON | OK | OK | NON |
| Routing L1/L2/L3 | PARTIEL | NON | NON | NON | NON | NON |
| Icons modes cohérents | OK | NON | OK | OK | OK | OK |

---

*Rapport généré automatiquement le 13 mars 2026.*
*Aucune modification n'a été apportée au code — audit en lecture seule.*
