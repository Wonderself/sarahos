export interface AgentConfig {
  id: string
  name: string
  description: string
  profils_cibles: string[]
  icon: string
  model: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6'
  max_tokens: number
  system_prompt: string
  variables_requises: string[]
  examples: Array<{ input: string; output: string }>
  tags: string[]
  credit_cost: number
}

export const agent13IntelligenceGatherer: AgentConfig = {
  id: 'intelligence-gatherer',
  name: 'Intelligence Gatherer IA',
  description: 'Synthétise les données scraping brutes (Pappers, Google Places, site web, LinkedIn) en profil business structuré avec score de maturité digitale et opportunités actionnables.',
  profils_cibles: ['sante', 'artisan', 'pme', 'agence', 'ecommerce', 'coach', 'restaurant', 'liberal', 'immo', 'particulier'],
  icon: '🔍',
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system_prompt: `Tu es l'Intelligence Gatherer de Freenzy.io — l'agent qui transforme des données brutes en intelligence business actionnable.

TON RÔLE : Lors de l'onboarding d'un nouvel utilisateur, le système collecte des données depuis différentes sources (Pappers, Google Places, site web, LinkedIn, réseaux sociaux). Tu reçois ces données BRUTES et tu dois les synthétiser en un profil business structuré, exploitable par les autres agents Freenzy.

TU NE DOIS JAMAIS INVENTER DE DONNÉES. Si une information n'est pas dans les sources fournies, tu indiques "non disponible" avec un confidence level "low". C'est ta règle absolue.

—————————————————————————————————————
SOURCES DE DONNÉES EN ENTRÉE
—————————————————————————————————————

Tu reçois un ou plusieurs blocs de données brutes, identifiés par leur source :

1. PAPPERS (données légales entreprise)
- SIREN/SIRET, raison sociale, forme juridique, date création
- Capital social, code NAF/APE, effectif déclaré
- Dirigeants, bénéficiaires effectifs
- Chiffre d'affaires, résultat net (si disponible)
- Établissements secondaires
- Procédures collectives éventuelles

2. GOOGLE PLACES (présence locale)
- Note moyenne, nombre d'avis
- Catégorie Google, adresse, horaires
- Photos, attributs (accessibilité, paiement, etc.)
- Avis récents (texte + note)
- Position dans les résultats locaux

3. SITE WEB (analyse automatique)
- URL, technologies détectées (CMS, framework)
- Pages principales, structure de navigation
- Présence de : formulaire contact, chat, e-commerce, blog, mentions légales
- Performance (temps de chargement estimé)
- Mobile-friendly : oui/non
- HTTPS : oui/non
- Dernière mise à jour détectée

4. LINKEDIN (profil entreprise ou dirigeant)
- Nombre d'employés, croissance
- Description, secteur
- Publications récentes, engagement
- Offres d'emploi actives

5. RÉSEAUX SOCIAUX (Facebook, Instagram, etc.)
- Nombre d'abonnés, fréquence de publication
- Engagement moyen, type de contenu
- Dernière publication

—————————————————————————————————————
FORMAT DE SORTIE — JSON STRICT
—————————————————————————————————————

Ta réponse est TOUJOURS un JSON valide suivant ce schéma exact. Aucun texte avant ou après le JSON.

{
  "business_profile": {
    "nom_commercial": "string",
    "raison_sociale": "string | null",
    "siren": "string | null",
    "forme_juridique": "string | null",
    "date_creation": "string | null",
    "secteur_activite": "string",
    "sous_secteur": "string | null",
    "localisation": {
      "adresse": "string | null",
      "ville": "string",
      "departement": "string | null",
      "region": "string | null"
    },
    "effectif_estime": "string",
    "ca_estime": "string | null",
    "dirigeant_principal": "string | null"
  },
  "digital_maturity_score": {
    "score_global": 0-100,
    "details": {
      "site_web": { "score": 0-100, "observations": ["string"] },
      "referencement_local": { "score": 0-100, "observations": ["string"] },
      "reseaux_sociaux": { "score": 0-100, "observations": ["string"] },
      "e_reputation": { "score": 0-100, "observations": ["string"] },
      "outils_digitaux": { "score": 0-100, "observations": ["string"] }
    },
    "benchmark_secteur": "string"
  },
  "strengths": ["string (3 à 5 points forts identifiés)"],
  "weaknesses": ["string (3 à 5 points faibles identifiés)"],
  "opportunities": [
    {
      "titre": "string",
      "description": "string (2-3 phrases)",
      "impact_estime": "faible | moyen | fort",
      "effort_mise_en_oeuvre": "faible | moyen | fort",
      "agents_freenzy_recommandes": ["string (IDs des agents Freenzy pertinents)"],
      "priorite": 1-5
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["string (les 5 agents Freenzy les plus pertinents pour ce business, par ID)"],
    "justification": "string (pourquoi ces agents en priorité)"
  },
  "profil_cible_freenzy": "sante | artisan | pme | agence | ecommerce | coach | restaurant | liberal | immo | particulier",
  "confidence": {
    "global": "high | medium | low",
    "data_completeness": "0-100% (pourcentage de champs remplis à partir de données réelles)",
    "sources_utilisees": ["pappers", "google_places", "site_web", "linkedin", "reseaux_sociaux"],
    "avertissements": ["string (données manquantes ou incertaines)"]
  },
  "resume_executif": "string (5-8 phrases résumant le profil business, la maturité digitale et les recommandations clés)"
}

—————————————————————————————————————
CALCUL DU SCORE DE MATURITÉ DIGITALE
—————————————————————————————————————

Le score global est la moyenne pondérée des 5 sous-scores :

1. SITE WEB (poids 30%)
- 0 : pas de site web
- 20 : site vitrine basique, pas mobile-friendly
- 40 : site correct, mobile-friendly, pas à jour
- 60 : site bien structuré, mobile-friendly, à jour, formulaire contact
- 80 : site optimisé, rapide, SEO basique, blog actif
- 100 : site e-commerce ou riche, excellent SEO, CMS moderne, analytics

2. RÉFÉRENCEMENT LOCAL (poids 25%)
- 0 : pas de fiche Google
- 20 : fiche Google existante mais non optimisée (< 5 avis)
- 40 : fiche avec photos et horaires, 5-20 avis
- 60 : fiche complète, 20-50 avis, note > 4.0
- 80 : fiche optimisée, 50-200 avis, note > 4.3, réponses aux avis
- 100 : top local pack, 200+ avis, note > 4.5, toutes fonctionnalités utilisées

3. RÉSEAUX SOCIAUX (poids 20%)
- 0 : aucune présence
- 20 : profils existants mais inactifs (> 3 mois sans publication)
- 40 : 1 réseau actif, publication sporadique
- 60 : 2+ réseaux actifs, publication hebdomadaire
- 80 : stratégie visible, engagement régulier, contenu varié
- 100 : présence forte multi-canal, communauté engagée, publicité payante

4. E-RÉPUTATION (poids 15%)
- Basée sur : note Google, volume d'avis, avis négatifs récents, réponses du propriétaire
- Formule : note_google * 20, ajustée selon volume et tendance

5. OUTILS DIGITAUX (poids 10%)
- 0 : email uniquement
- 30 : email + téléphone + site basique
- 60 : CRM ou logiciel métier détecté, paiement en ligne
- 100 : stack complète (CRM, facturation, planning, marketing automation)

—————————————————————————————————————
MAPPING AGENTS FREENZY
—————————————————————————————————————

En fonction du profil détecté, recommande les agents Freenzy les plus pertinents parmi :

Agents cœur : fz-commercial, fz-marketing, fz-communication, fz-sav, fz-facturation, fz-repondeur, fz-secretaire, fz-rh, fz-juridique, fz-comptable, fz-logistique, fz-qualite, fz-formation, fz-veille, fz-dg
Agents sectoriels : fz-social-food, fz-reputation-avis, fz-content-linkedin, fz-devis-pro, fz-relances, fz-reporting, fz-paniers-abandonnes, fz-documents
Agents étendus : fz-seo, fz-crm, fz-email-marketing, fz-pricing, fz-sourcing, fz-recrutement

La recommandation doit être JUSTIFIÉE par les données. Exemple : si le business a peu d'avis Google → recommander fz-reputation-avis. Si pas de site web → recommander fz-marketing + fz-communication.

—————————————————————————————————————
RÈGLES ABSOLUES
—————————————————————————————————————

1. Ne JAMAIS inventer de données — si l'info n'est pas dans les sources, mettre null ou "non disponible"
2. TOUJOURS produire un JSON valide et parseable — pas de texte libre autour
3. Le confidence level doit être HONNÊTE : si tu n'as que Google Places, le global est "low" car tu manques de données financières et juridiques
4. Les opportunités doivent être CONCRÈTES et ACTIONNABLES — pas de "améliorez votre présence digitale" mais "créer une fiche Google Business optimisée avec 10 photos professionnelles"
5. Limiter à 3-5 opportunités, classées par priorité (rapport impact/effort)
6. Le résumé exécutif doit être compréhensible par un non-technicien
7. Ne JAMAIS inclure de données personnelles sensibles (numéro de téléphone personnel, adresse personnelle du dirigeant)
8. Le profil_cible_freenzy doit correspondre EXACTEMENT à l'un des 10 profils de la plateforme
9. Chaque observation dans digital_maturity_score doit être factuelle (basée sur les données) et non spéculative
10. Si des données Pappers indiquent une procédure collective, le mentionner dans les avertissements avec tact`,
  variables_requises: [
    'scraping.pappers',
    'scraping.google_places',
    'scraping.site_web',
    'scraping.linkedin',
    'scraping.reseaux_sociaux'
  ],
  examples: [
    {
      input: 'Source Google Places: "Dupont Plomberie", 4.2 étoiles, 23 avis, catégorie "Plombier", adresse: 15 rue des Lilas 69003 Lyon, horaires: Lun-Ven 8h-18h. Photos: 3 (profil, 2 chantiers). Dernière publication: il y a 6 mois. Source Pappers: SIREN 123456789, SARL, créée 2015, 1 salarié, CA 95 000€ (2024). Pas de site web détecté. Pas de LinkedIn. Pas de réseaux sociaux.',
      output: `{
  "business_profile": {
    "nom_commercial": "Dupont Plomberie",
    "raison_sociale": "DUPONT PLOMBERIE SARL",
    "siren": "123456789",
    "forme_juridique": "SARL",
    "date_creation": "2015",
    "secteur_activite": "Plomberie",
    "sous_secteur": "Plomberie générale - dépannage et installation",
    "localisation": {
      "adresse": "15 rue des Lilas",
      "ville": "Lyon",
      "departement": "69 - Rhône",
      "region": "Auvergne-Rhône-Alpes"
    },
    "effectif_estime": "1-2 personnes (dirigeant + 1 salarié)",
    "ca_estime": "95 000 € (2024)",
    "dirigeant_principal": null
  },
  "digital_maturity_score": {
    "score_global": 22,
    "details": {
      "site_web": { "score": 0, "observations": ["Aucun site web détecté", "Perte de crédibilité et de visibilité en ligne"] },
      "referencement_local": { "score": 52, "observations": ["Fiche Google existante avec 23 avis et 4.2 étoiles", "Seulement 3 photos — insuffisant pour un artisan", "Dernière publication il y a 6 mois — fiche perçue comme inactive"] },
      "reseaux_sociaux": { "score": 0, "observations": ["Aucune présence détectée sur les réseaux sociaux"] },
      "e_reputation": { "score": 68, "observations": ["Note 4.2/5 correcte mais améliorable", "23 avis = volume faible pour 9 ans d'activité", "Pas de données sur les réponses aux avis"] },
      "outils_digitaux": { "score": 0, "observations": ["Aucun outil digital détecté", "Probablement gestion par téléphone et papier"] }
    },
    "benchmark_secteur": "Score 22/100 — en dessous de la moyenne des plombiers en zone urbaine (estimée 35-45). La concurrence à Lyon est forte et les artisans avec un site web et 50+ avis captent la majorité des demandes en ligne."
  },
  "strengths": [
    "9 ans d'existence — stabilité et expérience prouvée",
    "Note Google 4.2/5 — bonne qualité de service perçue",
    "CA de 95 000 € pour un solo/duo — bonne productivité"
  ],
  "weaknesses": [
    "Aucun site web — invisible pour les recherches Google hors Maps",
    "Seulement 23 avis en 9 ans — rythme de collecte très faible",
    "Zéro présence réseaux sociaux — aucun canal de communication moderne",
    "Fiche Google peu enrichie (3 photos, pas de publications récentes)",
    "Aucun outil digital apparent — risque d'inefficacité administrative"
  ],
  "opportunities": [
    {
      "titre": "Créer un site web vitrine optimisé SEO local",
      "description": "Un site vitrine avec les pages essentielles (accueil, services, réalisations, contact, devis) permettrait de capter les recherches Google au-delà de Maps. Avec un bon SEO local, potentiel de +30% de demandes entrantes.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-marketing", "fz-communication"],
      "priorite": 1
    },
    {
      "titre": "Campagne de collecte d'avis Google",
      "description": "Passer de 23 à 80+ avis en 3 mois avec un SMS/WhatsApp automatique après chaque intervention. Objectif : note > 4.5 et top 3 du local pack Lyon.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-reputation-avis", "fz-sav"],
      "priorite": 2
    },
    {
      "titre": "Automatiser les devis et la facturation",
      "description": "Remplacer la gestion papier par des devis en ligne et une facturation automatisée. Gain de temps estimé : 3-5h/semaine. Amélioration du délai de paiement.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-devis-pro", "fz-facturation", "fz-relances"],
      "priorite": 3
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["fz-devis-pro", "fz-reputation-avis", "fz-repondeur", "fz-facturation", "fz-relances"],
    "justification": "Artisan solo sans outils digitaux : priorité à l'automatisation des tâches admin (devis, factures, relances) et à la visibilité locale (avis Google). Le répondeur IA couvrira les appels manqués pendant les chantiers."
  },
  "profil_cible_freenzy": "artisan",
  "confidence": {
    "global": "medium",
    "data_completeness": "45%",
    "sources_utilisees": ["pappers", "google_places"],
    "avertissements": ["Pas de site web à analyser", "Pas de LinkedIn — données dirigeant incomplètes", "Pas de réseaux sociaux à analyser", "CA Pappers peut être décalé d'un exercice"]
  },
  "resume_executif": "Dupont Plomberie est un artisan plombier lyonnais établi depuis 2015, avec un CA de 95 000 € et une bonne réputation locale (4.2/5 sur Google). Cependant, sa maturité digitale est très faible (22/100) : aucun site web, aucune présence sur les réseaux sociaux, et une fiche Google sous-exploitée. Le potentiel de croissance est significatif — en zone urbaine à Lyon, les plombiers avec une forte présence en ligne captent 2 à 3 fois plus de demandes. Les priorités sont : créer un site vitrine, intensifier la collecte d'avis, et automatiser la gestion administrative pour libérer du temps chantier."
}`
    },
    {
      input: 'Source Google Places: "Cabinet Médical Dr Martin", 3.8 étoiles, 67 avis, catégorie "Médecin généraliste", adresse: 8 place de la Mairie 33000 Bordeaux. Horaires: Lun-Ven 8h30-19h, Sam 9h-12h. Photos: 8. Source site web: www.dr-martin-bordeaux.fr, WordPress, HTTPS, mobile-friendly, 5 pages (accueil, équipe, spécialités, infos pratiques, contact), formulaire de contact, pas de prise de RDV en ligne, dernière mise à jour > 1 an. Source Pappers: SCI exercice libéral, créée 2008, 4 salariés.',
      output: `{
  "business_profile": {
    "nom_commercial": "Cabinet Médical Dr Martin",
    "raison_sociale": null,
    "siren": null,
    "forme_juridique": "SCI exercice libéral",
    "date_creation": "2008",
    "secteur_activite": "Santé",
    "sous_secteur": "Médecine générale",
    "localisation": {
      "adresse": "8 place de la Mairie",
      "ville": "Bordeaux",
      "departement": "33 - Gironde",
      "region": "Nouvelle-Aquitaine"
    },
    "effectif_estime": "4 salariés + praticien(s)",
    "ca_estime": null,
    "dirigeant_principal": "Dr Martin"
  },
  "digital_maturity_score": {
    "score_global": 48,
    "details": {
      "site_web": { "score": 50, "observations": ["Site WordPress existant, HTTPS, mobile-friendly — bonnes bases", "Seulement 5 pages — contenu limité", "Pas de prise de RDV en ligne — frein majeur en 2026", "Dernière mise à jour > 1 an — perception d'abandon"] },
      "referencement_local": { "score": 65, "observations": ["67 avis — bon volume pour un cabinet médical", "Note 3.8/5 — en dessous du seuil de confiance (4.0)", "8 photos — correct", "Horaires bien renseignés, samedi matin inclus"] },
      "reseaux_sociaux": { "score": 0, "observations": ["Aucune présence détectée"] },
      "e_reputation": { "score": 56, "observations": ["Note 3.8 préoccupante — indique des points de friction récurrents", "67 avis = bon volume mais tendance à vérifier", "Pas d'information sur les réponses aux avis négatifs"] },
      "outils_digitaux": { "score": 35, "observations": ["Site web avec formulaire de contact", "Pas de prise de RDV en ligne (Doctolib, etc.)", "Logiciel métier non détecté depuis les sources disponibles"] }
    },
    "benchmark_secteur": "Score 48/100 — légèrement en dessous de la moyenne des cabinets médicaux urbains (estimée 55). L'absence de prise de RDV en ligne est le principal écart avec les cabinets concurrents à Bordeaux."
  },
  "strengths": [
    "Cabinet établi depuis 2008 — ancienneté et patientèle fidèle",
    "Localisation centre-ville Bordeaux — fort potentiel de passage",
    "Site web existant avec bonnes bases techniques (HTTPS, mobile-friendly)",
    "4 salariés — structure permettant une organisation professionnelle",
    "Horaires étendus incluant le samedi matin"
  ],
  "weaknesses": [
    "Note Google 3.8/5 — sous le seuil de confiance de 4.0, dissuasif pour les nouveaux patients",
    "Pas de prise de RDV en ligne — perte de patients qui cherchent la facilité",
    "Site web non mis à jour depuis plus d'un an",
    "Aucune présence sur les réseaux sociaux",
    "Pas de système de communication patient automatisé détecté"
  ],
  "opportunities": [
    {
      "titre": "Mettre en place la prise de RDV en ligne",
      "description": "En 2026, 72% des patients choisissent leur médecin en fonction de la possibilité de prendre RDV en ligne. Intégrer un module de prise de RDV sur le site existant ou rejoindre une plateforme comme Doctolib.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-secretaire", "fz-repondeur"],
      "priorite": 1
    },
    {
      "titre": "Améliorer la note Google de 3.8 à 4.2+",
      "description": "Identifier les causes des avis négatifs et mettre en place un système de collecte d'avis auprès des patients satisfaits. Répondre systématiquement à tous les avis, positifs et négatifs.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-reputation-avis", "fz-sav"],
      "priorite": 2
    },
    {
      "titre": "Automatiser la communication patient (rappels RDV, résultats, suivi)",
      "description": "Réduire les no-shows avec des rappels SMS automatiques et faciliter la transmission d'informations pratiques. Gain de temps estimé pour le secrétariat : 1-2h/jour.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-secretaire", "fz-repondeur", "fz-documents"],
      "priorite": 3
    },
    {
      "titre": "Remettre à jour et enrichir le site web",
      "description": "Ajouter des pages spécialités détaillées, un blog santé mensuel, et les informations de téléconsultation. Améliorer le référencement local pour capter les recherches 'médecin généraliste Bordeaux'.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-communication", "fz-marketing"],
      "priorite": 4
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["fz-secretaire", "fz-repondeur", "fz-reputation-avis", "fz-communication", "fz-documents"],
    "justification": "Cabinet médical avec secrétariat existant mais surcharge probable (4 salariés, note 3.8 suggérant des problèmes d'accueil). Priorité à l'automatisation du secrétariat (répondeur, rappels, documents) et à la remontée de la réputation en ligne."
  },
  "profil_cible_freenzy": "sante",
  "confidence": {
    "global": "medium",
    "data_completeness": "55%",
    "sources_utilisees": ["pappers", "google_places", "site_web"],
    "avertissements": ["SIREN non fourni dans les données Pappers", "CA non disponible — estimation impossible", "Pas de LinkedIn — pas de données sur le réseau professionnel", "Les avis Google négatifs n'ont pas été analysés en détail"]
  },
  "resume_executif": "Le Cabinet Médical Dr Martin est un cabinet de médecine générale bien établi à Bordeaux depuis 2008, avec une équipe de 4+ personnes et une localisation centrale. Sa maturité digitale (48/100) est correcte mais présente deux faiblesses critiques : l'absence de prise de RDV en ligne et une note Google de 3.8 qui freine l'acquisition de nouveaux patients. Le site web existant offre de bonnes bases mais nécessite une mise à jour. Les priorités sont l'automatisation du secrétariat, la mise en place de la prise de RDV en ligne, et une stratégie de remontée de la note Google vers 4.2+."
}`
    },
    {
      input: 'Source Google Places: "PixelWave Agency", 4.9 étoiles, 12 avis, catégorie "Agence de marketing", Paris 11e. Source site web: www.pixelwave.agency, Next.js, HTTPS, blog actif (2 articles/mois), portfolio 25 projets, page tarifs, formulaire + chat widget. Source LinkedIn: 8 employés, croissance +60% en 1 an, 3 offres d\'emploi ouvertes, 2 publications/semaine. Source Instagram: 1 200 abonnés, 3 posts/semaine, engagement 4.2%.',
      output: `{
  "business_profile": {
    "nom_commercial": "PixelWave Agency",
    "raison_sociale": null,
    "siren": null,
    "forme_juridique": null,
    "date_creation": null,
    "secteur_activite": "Marketing & Communication digitale",
    "sous_secteur": "Agence de marketing digital",
    "localisation": {
      "adresse": null,
      "ville": "Paris 11e",
      "departement": "75 - Paris",
      "region": "Île-de-France"
    },
    "effectif_estime": "8 employés (croissance +60% sur 1 an)",
    "ca_estime": null,
    "dirigeant_principal": null
  },
  "digital_maturity_score": {
    "score_global": 82,
    "details": {
      "site_web": { "score": 90, "observations": ["Site Next.js moderne et performant", "Blog actif avec 2 articles/mois — bon SEO content", "Portfolio de 25 projets — preuve sociale solide", "Page tarifs transparente + formulaire + chat — tunnel de conversion complet"] },
      "referencement_local": { "score": 60, "observations": ["Note exceptionnelle 4.9/5 mais seulement 12 avis", "Volume d'avis faible pour une agence parisienne", "Marge de progression significative sur le volume"] },
      "reseaux_sociaux": { "score": 85, "observations": ["Instagram actif : 3 posts/semaine, engagement 4.2% — excellent", "1 200 abonnés — cohérent pour une agence de 8 personnes", "LinkedIn très actif : 2 publications/semaine"] },
      "e_reputation": { "score": 90, "observations": ["Note 4.9/5 — quasi parfaite", "Faible volume compense partiellement la note élevée", "Engagement LinkedIn et Instagram confirme une bonne perception"] },
      "outils_digitaux": { "score": 85, "observations": ["Stack technique moderne (Next.js)", "Chat widget intégré", "3 offres d'emploi = outils RH probablement en place", "Blog CMS opérationnel"] }
    },
    "benchmark_secteur": "Score 82/100 — nettement au-dessus de la moyenne des agences digitales parisiennes (estimée 65). PixelWave est digitalement mature, cohérent avec son positionnement d'agence de marketing. Les axes d'amélioration portent sur le volume d'avis et l'expansion multi-canal."
  },
  "strengths": [
    "Stack technique de pointe (Next.js) — crédibilité technique auprès des clients",
    "Croissance +60% en 1 an avec 3 recrutements en cours — dynamique forte",
    "Engagement Instagram 4.2% — très au-dessus de la moyenne sectorielle (1-2%)",
    "Note Google 4.9/5 — qualité de service exceptionnelle",
    "Blog actif + portfolio 25 projets — excellent content marketing"
  ],
  "weaknesses": [
    "Seulement 12 avis Google — vulnérable à un seul avis négatif",
    "Données financières non disponibles — impossible d'évaluer la rentabilité",
    "Pas de données Pappers — structure juridique et ancienneté inconnues",
    "Croissance rapide (+60%) sans données de rétention — risque de sous-staffing"
  ],
  "opportunities": [
    {
      "titre": "Accélérer la collecte d'avis Google (12 → 50+)",
      "description": "Avec une note de 4.9, chaque nouvel avis renforce la position dans le local pack parisien. Mettre en place une demande systématique à la livraison de chaque projet. Objectif : 50 avis en 6 mois.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-reputation-avis"],
      "priorite": 1
    },
    {
      "titre": "Structurer le processus commercial avec CRM + reporting",
      "description": "Avec une croissance de +60%, le processus commercial doit être structuré pour ne pas perdre de leads. CRM + pipeline + reporting automatisé permettraient de scaler sans perte.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-commercial", "fz-reporting", "fz-relances"],
      "priorite": 2
    },
    {
      "titre": "Automatiser le recrutement en cours (3 postes ouverts)",
      "description": "3 offres d'emploi ouvertes simultanément avec 8 employés = forte pression RH. Automatiser le tri des candidatures et le suivi des entretiens libérerait du temps management.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-rh"],
      "priorite": 3
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["fz-commercial", "fz-reporting", "fz-reputation-avis", "fz-rh", "fz-content-linkedin"],
    "justification": "Agence en forte croissance qui a besoin de structurer ses processus internes (commercial, RH, reporting) plutôt que d'améliorer sa présence digitale (déjà excellente). Le content LinkedIn renforcera le positionnement thought leader."
  },
  "profil_cible_freenzy": "agence",
  "confidence": {
    "global": "medium",
    "data_completeness": "50%",
    "sources_utilisees": ["google_places", "site_web", "linkedin"],
    "avertissements": ["Pas de données Pappers — SIREN, CA, forme juridique inconnus", "Pas de données Facebook/TikTok", "Date de création inconnue", "Instagram analysé superficiellement (pas d'accès aux analytics complets)"]
  },
  "resume_executif": "PixelWave Agency est une agence de marketing digital parisienne en forte croissance (+60% en effectif sur 1 an), avec une excellente maturité digitale (82/100). Son site Next.js, son blog actif, son engagement Instagram élevé (4.2%) et sa note Google de 4.9/5 témoignent d'une maîtrise digitale cohérente avec son métier. Le principal enjeu n'est pas la visibilité mais la structuration interne : avec 3 recrutements en cours et une croissance rapide, les processus commerciaux, RH et de reporting doivent être automatisés pour soutenir le scaling."
}`
    },
    {
      input: 'Source Google Places: "Chez Mamma Rosa", 4.4 étoiles, 189 avis, catégorie "Restaurant italien", 22 rue des Carmes 31000 Toulouse. Horaires: Mar-Sam 12h-14h30, 19h-22h30. Photos: 42. Source site web: aucun. Source Facebook: 850 abonnés, dernière publication il y a 2 mois. Source Instagram: non trouvé.',
      output: `{
  "business_profile": {
    "nom_commercial": "Chez Mamma Rosa",
    "raison_sociale": null,
    "siren": null,
    "forme_juridique": null,
    "date_creation": null,
    "secteur_activite": "Restauration",
    "sous_secteur": "Restaurant italien — cuisine traditionnelle",
    "localisation": {
      "adresse": "22 rue des Carmes",
      "ville": "Toulouse",
      "departement": "31 - Haute-Garonne",
      "region": "Occitanie"
    },
    "effectif_estime": "non disponible",
    "ca_estime": null,
    "dirigeant_principal": null
  },
  "digital_maturity_score": {
    "score_global": 35,
    "details": {
      "site_web": { "score": 0, "observations": ["Aucun site web détecté", "Perte de visibilité sur les recherches Google hors Maps", "Pas de menu en ligne consultable facilement"] },
      "referencement_local": { "score": 78, "observations": ["189 avis avec 4.4/5 — très bon volume et bonne note", "42 photos — excellent, très au-dessus de la moyenne des restaurants", "Horaires bien renseignés", "Catégorie correctement définie"] },
      "reseaux_sociaux": { "score": 18, "observations": ["Facebook existant mais quasi inactif (dernière publication > 2 mois)", "850 abonnés Facebook — audience dormante à réactiver", "Pas de compte Instagram — manque critique pour la restauration en 2026"] },
      "e_reputation": { "score": 72, "observations": ["4.4/5 sur 189 avis — solide", "Le volume d'avis est bon pour Toulouse", "Tendance des avis récents non analysable sans données détaillées"] },
      "outils_digitaux": { "score": 5, "observations": ["Aucun outil digital détecté depuis les sources disponibles", "Pas de système de réservation en ligne visible", "Pas de menu digital", "Probablement gestion téléphone + papier"] }
    },
    "benchmark_secteur": "Score 35/100 — en dessous de la moyenne des restaurants urbains à Toulouse (estimée 42). Le restaurant bénéficie d'une excellente e-réputation organique mais ne l'exploite pas en ligne. Le principal écart est l'absence totale de site web et d'Instagram."
  },
  "strengths": [
    "189 avis Google à 4.4/5 — e-réputation solide et organique",
    "42 photos Google — le restaurant est visuellement attractif en ligne",
    "Localisation rue des Carmes (centre historique Toulouse) — fort passage piéton",
    "Cuisine italienne = créneau porteur et pérenne"
  ],
  "weaknesses": [
    "Aucun site web — menu, horaires et réservation dépendent uniquement de Google Maps",
    "Facebook inactif depuis 2 mois — audience dormante de 850 abonnés",
    "Aucun compte Instagram — absence critique pour un restaurant (90% des 18-35 ans cherchent les restaurants sur Instagram)",
    "Pas de système de réservation en ligne détecté",
    "Aucun outil digital apparent — gestion probablement manuelle"
  ],
  "opportunities": [
    {
      "titre": "Créer un compte Instagram et publier 3x/semaine",
      "description": "La restauration est le secteur n°1 sur Instagram. Avec des plats italiens photogéniques et 42 photos Google prouvant le potentiel visuel, un compte Instagram pourrait atteindre 2 000 abonnés locaux en 3 mois. Publier : plats du jour, coulisses cuisine, avis clients.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-social-food", "fz-communication"],
      "priorite": 1
    },
    {
      "titre": "Mettre en place la réservation en ligne",
      "description": "Proposer la réservation via Google Reserve, TheFork ou un widget sur un futur site. Réduire les appels téléphoniques pendant le service et augmenter le taux de remplissage.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-repondeur"],
      "priorite": 2
    },
    {
      "titre": "Réactiver la page Facebook et publier le menu de la semaine",
      "description": "850 abonnés en sommeil = audience prête à être réactivée gratuitement. Publier le menu du jour chaque matin prend 5 minutes et génère du trafic direct.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-social-food", "fz-marketing"],
      "priorite": 3
    },
    {
      "titre": "Créer un site vitrine avec menu en ligne",
      "description": "Un site simple avec menu, photos, horaires et lien de réservation. Améliore le SEO et offre une alternative à Google Maps pour les clients qui cherchent le menu avant de réserver.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-marketing", "fz-communication"],
      "priorite": 4
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["fz-social-food", "fz-reputation-avis", "fz-repondeur", "fz-communication", "fz-marketing"],
    "justification": "Restaurant familial avec excellente base organique (avis, photos) mais zéro stratégie digitale. Priorité absolue à la création de contenu social (Instagram/Facebook) et à l'automatisation des réservations. Le Social Food agent est conçu exactement pour ce cas."
  },
  "profil_cible_freenzy": "restaurant",
  "confidence": {
    "global": "low",
    "data_completeness": "30%",
    "sources_utilisees": ["google_places"],
    "avertissements": ["Pas de données Pappers — aucune information financière ou juridique", "Pas de site web à analyser", "Pas de LinkedIn", "Facebook analysé superficiellement (pas d'accès aux analytics)", "Instagram non trouvé — confirmer absence ou compte sous un autre nom", "Effectif inconnu — hypothèse restaurant familial basée sur le nom"]
  },
  "resume_executif": "Chez Mamma Rosa est un restaurant italien bien établi dans le centre historique de Toulouse, avec une e-réputation organique solide (4.4/5, 189 avis). Cependant, sa maturité digitale est faible (35/100) : aucun site web, aucun Instagram, un Facebook dormant, et pas de réservation en ligne. Le potentiel est important car le restaurant dispose d'atouts visuels forts (42 photos Google) et d'une cuisine photogénique parfaite pour Instagram. Les priorités sont la création d'un Instagram actif, la mise en place de la réservation en ligne, et la réactivation du Facebook."
}`
    },
    {
      input: 'Source Google Places: non trouvé. Source LinkedIn: "Julie Moreau - Coach de vie & développement personnel", 450 connexions, 1 publication/mois, certifiée ICF PCC. Basée à Nantes. Source site web: www.julie-moreau-coaching.fr, WordPress, HTTPS, 8 pages (accueil, à propos, accompagnements, témoignages, blog avec 5 articles, tarifs, contact, FAQ). Formulaire de contact. Pas de prise de RDV en ligne.',
      output: `{
  "business_profile": {
    "nom_commercial": "Julie Moreau - Coach de vie",
    "raison_sociale": null,
    "siren": null,
    "forme_juridique": null,
    "date_creation": null,
    "secteur_activite": "Coaching & Développement personnel",
    "sous_secteur": "Coach de vie certifié ICF PCC",
    "localisation": {
      "adresse": null,
      "ville": "Nantes",
      "departement": "44 - Loire-Atlantique",
      "region": "Pays de la Loire"
    },
    "effectif_estime": "1 personne (indépendante)",
    "ca_estime": null,
    "dirigeant_principal": "Julie Moreau"
  },
  "digital_maturity_score": {
    "score_global": 42,
    "details": {
      "site_web": { "score": 58, "observations": ["Site WordPress complet avec 8 pages — bonne structure", "HTTPS OK, blog existant (5 articles) mais rythme faible", "Page témoignages et tarifs — transparence appréciable", "Pas de prise de RDV en ligne — frein à la conversion", "FAQ présente — bon signal de maturité"] },
      "referencement_local": { "score": 0, "observations": ["Aucune fiche Google Business détectée", "Invisible sur Google Maps — perte de trafic local significative"] },
      "reseaux_sociaux": { "score": 30, "observations": ["LinkedIn présent avec 450 connexions", "Fréquence de publication faible : 1/mois", "Pas de Facebook, Instagram ou autres réseaux détectés"] },
      "e_reputation": { "score": 40, "observations": ["Certification ICF PCC = gage de crédibilité forte", "Page témoignages sur le site mais pas de preuve sociale externe (Google, Trustpilot)", "Pas d'avis vérifiables en dehors du site"] },
      "outils_digitaux": { "score": 30, "observations": ["WordPress avec formulaire de contact", "Pas de système de prise de RDV en ligne (Calendly, etc.)", "Pas de newsletter détectée", "Pas de visioconférence intégrée visible"] }
    },
    "benchmark_secteur": "Score 42/100 — dans la moyenne basse des coachs indépendants (estimée 40-50). Le site web est un bon atout mais l'absence de fiche Google et de prise de RDV en ligne limite fortement l'acquisition de nouveaux clients."
  },
  "strengths": [
    "Certification ICF PCC — positionnement premium et crédible",
    "Site web structuré avec 8 pages pertinentes (témoignages, tarifs, FAQ)",
    "Présence LinkedIn existante — réseau à activer",
    "Page tarifs transparente — réduit les frictions dans le parcours client"
  ],
  "weaknesses": [
    "Aucune fiche Google Business — invisible localement",
    "Pas de prise de RDV en ligne — chaque prospect doit passer par un formulaire",
    "Blog très peu actif (5 articles total) — impact SEO minimal",
    "LinkedIn sous-exploité : 1 publication/mois avec 450 connexions",
    "Aucun autre réseau social détecté — dépendance au bouche-à-oreille"
  ],
  "opportunities": [
    {
      "titre": "Créer une fiche Google Business immédiatement",
      "description": "En tant que coach à Nantes, l'absence de fiche Google est une perte sèche. Les recherches 'coach de vie Nantes' affichent les concurrents avec fiches Google en priorité. Création gratuite, impact immédiat sur la visibilité locale.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-reputation-avis", "fz-marketing"],
      "priorite": 1
    },
    {
      "titre": "Intégrer la prise de RDV en ligne (Calendly / Cal.com)",
      "description": "Chaque étape de friction entre l'intention du prospect et la prise de RDV fait perdre 20-30% de conversion. Un lien Calendly sur le site et LinkedIn transformerait le formulaire de contact en réservation directe.",
      "impact_estime": "fort",
      "effort_mise_en_oeuvre": "faible",
      "agents_freenzy_recommandes": ["fz-repondeur", "fz-commercial"],
      "priorite": 2
    },
    {
      "titre": "Passer à 1 publication LinkedIn/semaine + 1 article blog/mois",
      "description": "La certification ICF PCC est un avantage compétitif fort mais invisible si Julie ne publie pas. 1 post LinkedIn/semaine (réflexion coaching, témoignage anonymisé, outil pratique) positionnerait Julie comme experte locale. 1 article blog/mois améliorerait le SEO.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-content-linkedin", "fz-communication"],
      "priorite": 3
    },
    {
      "titre": "Lancer une newsletter mensuelle pour fidéliser et convertir",
      "description": "Capturer les emails des visiteurs du site avec un lead magnet (guide gratuit, mini-évaluation) et envoyer une newsletter mensuelle. Le coaching a un cycle de décision long — rester en contact est crucial.",
      "impact_estime": "moyen",
      "effort_mise_en_oeuvre": "moyen",
      "agents_freenzy_recommandes": ["fz-marketing", "fz-communication"],
      "priorite": 4
    }
  ],
  "agent_mapping": {
    "agents_prioritaires": ["fz-content-linkedin", "fz-reputation-avis", "fz-repondeur", "fz-communication", "fz-commercial"],
    "justification": "Coach indépendante avec crédibilité forte (ICF PCC) mais visibilité faible. Priorité au content LinkedIn (canal n°1 pour les coachs B2C/B2B), à la création de la fiche Google, et à l'automatisation de la prise de RDV. L'agent commercial aidera à structurer le tunnel de conversion."
  },
  "profil_cible_freenzy": "coach",
  "confidence": {
    "global": "low",
    "data_completeness": "35%",
    "sources_utilisees": ["site_web", "linkedin"],
    "avertissements": ["Pas de données Pappers — statut juridique et ancienneté inconnus", "Pas de fiche Google Places — impossible d'évaluer le référencement local réel", "Pas de données réseaux sociaux hors LinkedIn", "CA et tarif horaire non analysables", "Nombre de clients actifs inconnu"]
  },
  "resume_executif": "Julie Moreau est une coach de vie certifiée ICF PCC basée à Nantes, avec un site web professionnel bien structuré. Sa maturité digitale (42/100) est freinée par deux absences critiques : pas de fiche Google Business et pas de prise de RDV en ligne. Sa certification ICF PCC est un atout compétitif majeur mais sous-exploité en ligne (1 post LinkedIn/mois). Les priorités sont la création de la fiche Google, l'intégration d'un outil de prise de RDV, et l'activation du contenu LinkedIn pour asseoir son positionnement d'experte."
}`
    }
  ],
  tags: ['onboarding', 'scraping', 'intelligence', 'profil', 'maturité digitale', 'opportunités', 'agents', 'scoring'],
  credit_cost: 5
}
