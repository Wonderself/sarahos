export interface CaseStudy {
  slug: string;
  sector: string;
  sectorIcon: string;
  persona: { name: string; role: string; city: string; age: number };
  heroTitle: string;
  heroSubtitle: string;
  painPoints: { icon: string; title: string; description: string }[];
  solutions: { agent: string; agentIcon: string; action: string; result: string }[];
  results: { metric: string; value: string; description: string }[];
  testimonial: { quote: string; note: string };
  ctaText: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'restaurant',
    sector: 'Restauration',
    sectorIcon: 'restaurant',
    persona: {
      name: 'Marie',
      role: 'Restauratrice',
      city: 'Lyon',
      age: 42,
    },
    heroTitle: 'Comment Marie a transformé la gestion de son restaurant avec Freenzy',
    heroSubtitle:
      'De 12h de travail administratif par semaine à une gestion fluide et automatisée grâce à 3 agents IA spécialisés.',
    painPoints: [
      {
        icon: 'phone_missed',
        title: 'Appels manqués pendant le service',
        description:
          'En plein coup de feu, impossible de décrocher le téléphone. Résultat : des dizaines de réservations perdues chaque semaine et des clients frustrés qui ne rappellent pas.',
      },
      {
        icon: 'edit_calendar',
        title: 'Posts sociaux irréguliers',
        description:
          'Entre la cuisine et la gestion, les réseaux sociaux passent toujours au second plan. Le compte Instagram du restaurant restait inactif des semaines entières.',
      },
      {
        icon: 'group_off',
        title: 'Planning RH chaotique',
        description:
          'Gérer les plannings de 8 employés avec des disponibilités changeantes, les congés et les remplacements de dernière minute devenait un casse-tête permanent.',
      },
    ],
    solutions: [
      {
        agent: 'Répondeur IA',
        agentIcon: 'call',
        action: 'Prend les réservations 24h/24 par téléphone avec une voix naturelle',
        result: 'Plus aucun appel manqué, même pendant le service du soir',
      },
      {
        agent: 'Marketing',
        agentIcon: 'campaign',
        action: 'Génère et publie des posts quotidiens adaptés au menu du jour',
        result: 'Présence constante sur les réseaux sans effort de la part de Marie',
      },
      {
        agent: 'RH',
        agentIcon: 'badge',
        action: 'Crée automatiquement les plannings en fonction des disponibilités',
        result: 'Fini les appels du dimanche soir pour trouver un remplaçant',
      },
    ],
    results: [
      {
        metric: 'Réservations',
        value: '+35%',
        description: 'Augmentation des réservations grâce au répondeur disponible jour et nuit',
      },
      {
        metric: 'Temps gagné',
        value: '2h/jour',
        description: 'Heures libérées chaque jour sur les tâches administratives et la communication',
      },
      {
        metric: 'Appels traités',
        value: '90%',
        description: 'Des appels entrants sont désormais traités sans intervention humaine',
      },
    ],
    testimonial: {
      quote:
        'Avant Freenzy, je passais mes matinées au téléphone et mes soirées sur les plannings. Maintenant, je peux enfin me concentrer sur ce que j\'aime : la cuisine et mes clients.',
      note: 'Scénario type basé sur des cas d\'usage réels',
    },
    ctaText: 'Explorer Freenzy pour mon restaurant',
  },
  {
    slug: 'immobilier',
    sector: 'Immobilier',
    sectorIcon: 'apartment',
    persona: {
      name: 'Thomas',
      role: 'Agent immobilier',
      city: 'Paris',
      age: 38,
    },
    heroTitle: 'Comment Thomas a doublé ses ventes immobilières avec Freenzy',
    heroSubtitle:
      'D\'un suivi client approximatif à un pipeline commercial entièrement automatisé grâce à 3 agents IA coordonnés.',
    painPoints: [
      {
        icon: 'person_search',
        title: 'Leads non qualifiés',
        description:
          'Des heures passées à rappeler des prospects qui n\'étaient pas sérieux ou dont le budget ne correspondait à aucun bien disponible. Un temps précieux gaspillé.',
      },
      {
        icon: 'description',
        title: 'Contrats manuels chronophages',
        description:
          'Rédiger chaque compromis de vente, mandat et bail prenait des heures. Les copier-coller entre documents généraient régulièrement des erreurs coûteuses.',
      },
      {
        icon: 'notifications_off',
        title: 'Suivi clients oublié',
        description:
          'Sans système de relance automatisé, certains clients tombaient dans l\'oubli. Des ventes se perdaient simplement parce qu\'un rappel n\'avait pas été fait à temps.',
      },
    ],
    solutions: [
      {
        agent: 'Commercial',
        agentIcon: 'storefront',
        action: 'Qualifie automatiquement les leads entrants selon le budget et les critères',
        result: 'Thomas ne parle qu\'aux prospects réellement intéressés et qualifiés',
      },
      {
        agent: 'Juridique',
        agentIcon: 'gavel',
        action: 'Génère les contrats, compromis et mandats en 2 minutes',
        result: 'Zéro erreur dans les documents, gain de temps considérable',
      },
      {
        agent: 'Assistante',
        agentIcon: 'support_agent',
        action: 'Planifie et exécute les relances clients automatiquement',
        result: 'Plus aucun prospect oublié dans le pipeline commercial',
      },
    ],
    results: [
      {
        metric: 'Leads qualifiés',
        value: '+50%',
        description: 'Augmentation du taux de leads qualifiés grâce au filtrage automatique intelligent',
      },
      {
        metric: 'Temps contrats',
        value: '-80%',
        description: 'Réduction du temps de rédaction des documents juridiques et contractuels',
      },
      {
        metric: 'Relances oubliées',
        value: '0',
        description: 'Plus aucune relance client oubliée grâce au suivi automatisé',
      },
    ],
    testimonial: {
      quote:
        'Freenzy a changé ma façon de travailler. Je me concentre sur les visites et la relation client, pendant que mes agents gèrent tout le reste. Mon chiffre d\'affaires a suivi.',
      note: 'Scénario type basé sur des cas d\'usage réels',
    },
    ctaText: 'Explorer Freenzy pour mon agence',
  },
  {
    slug: 'cabinet',
    sector: 'Expertise comptable',
    sectorIcon: 'account_balance',
    persona: {
      name: 'Sophie',
      role: 'Expert-comptable',
      city: 'Bordeaux',
      age: 45,
    },
    heroTitle: 'Comment Sophie a modernisé son cabinet comptable avec Freenzy',
    heroSubtitle:
      'D\'une surcharge administrative permanente à un cabinet efficace et toujours conforme grâce à 3 agents IA dédiés.',
    painPoints: [
      {
        icon: 'schedule',
        title: 'Déclarations urgentes accumulées',
        description:
          'Les échéances fiscales s\'empilaient, créant un stress permanent. Les périodes de clôture devenaient des marathons épuisants pour toute l\'équipe du cabinet.',
      },
      {
        icon: 'content_copy',
        title: 'Courriers types répétitifs',
        description:
          'Rédiger les mêmes lettres d\'accompagnement, attestations et courriers administratifs prenait un temps disproportionné par rapport à leur valeur ajoutée.',
      },
      {
        icon: 'visibility_off',
        title: 'Veille juridique manquée',
        description:
          'Suivre les évolutions réglementaires, les nouvelles lois de finances et les circulaires fiscales était devenu impossible à gérer manuellement.',
      },
    ],
    solutions: [
      {
        agent: 'Comptable',
        agentIcon: 'calculate',
        action: 'Assiste la préparation des déclarations avec vérifications automatiques',
        result: 'Les déclarations sont prêtes en deux fois moins de temps, sans erreur',
      },
      {
        agent: 'Juridique',
        agentIcon: 'gavel',
        action: 'Génère automatiquement les courriers et documents types personnalisés',
        result: 'Les modèles sont toujours à jour et adaptés au contexte du client',
      },
      {
        agent: 'DG',
        agentIcon: 'monitoring',
        action: 'Assure une veille réglementaire continue et alerte en temps réel',
        result: 'Sophie est toujours informée des changements qui impactent ses clients',
      },
    ],
    results: [
      {
        metric: 'Productivité',
        value: '+40%',
        description: 'Augmentation de la productivité globale du cabinet sur les tâches récurrentes',
      },
      {
        metric: 'Temps gagné',
        value: '3h/sem',
        description: 'Heures économisées chaque semaine sur la rédaction de documents et courriers',
      },
      {
        metric: 'Conformité',
        value: '100%',
        description: 'Taux de conformité réglementaire grâce à la veille juridique automatisée',
      },
    ],
    testimonial: {
      quote:
        'Avec Freenzy, j\'ai enfin l\'impression d\'avoir une équipe complète derrière moi. La veille juridique seule me fait gagner un temps fou. Mes clients sentent la différence.',
      note: 'Scénario type basé sur des cas d\'usage réels',
    },
    ctaText: 'Explorer Freenzy pour mon cabinet',
  },
];
