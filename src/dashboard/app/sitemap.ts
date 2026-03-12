import type { MetadataRoute } from 'next';

const BASE = 'https://freenzy.io';

// Static public routes with SEO priorities
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    // ── Tier 1 — Core pages (weekly refresh, max priority)
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      url: `${BASE}/plans`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.90,
    },
    {
      url: `${BASE}/tarifs-api`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },

    // ── Tier 1b — Blog (fresh content, high SEO value)
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${BASE}/blog/repondeur-ia-pme-guide-complet`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/blog/agents-ia-specialises-entreprise`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/blog/comparer-modeles-ia-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/blog/ia-restaurant-automatisation-complete`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/blog/whatsapp-business-ia-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/blog/rgpd-ia-conformite-pme`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/blog/immobilier-ia-gestion-locative`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/blog/premiers-pas-freenzy-tutoriel`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${BASE}/blog/ia-secretariat-telephonique-revolution`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/blog/communaute-freenzy-rejoindre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },

    // ── Tier 1c — Feature pages (missing from sitemap!)
    {
      url: `${BASE}/fonctionnalites/repondeur`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE}/fonctionnalites/agents`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${BASE}/fonctionnalites/discussions`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/social`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/documents`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/reveil`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/fonctionnalites/marketplace`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/fonctionnalites/arcade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.70,
    },

    // ── Tier 1d — Case studies
    {
      url: `${BASE}/cas/restaurant`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/cas/immobilier`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE}/cas/cabinet`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },

    // ── Tier 1e — Comparison page
    {
      url: `${BASE}/vs-alternatives`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80,
    },

    // ── Tier 2 — Auth & conversion
    {
      url: `${BASE}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.60,
    },
    {
      url: `${BASE}/register`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.60,
    },

    // ── Tier 3 — Tech pages (indexed but lower priority)
    {
      url: `${BASE}/claude`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.55,
    },
    {
      url: `${BASE}/whatsapp`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.50,
    },

    // ── Tier 4 — Legal (crawlable but not priority)
    {
      url: `${BASE}/legal/cgu`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.20,
    },
    {
      url: `${BASE}/legal/cgv`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.20,
    },
    {
      url: `${BASE}/legal/confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.20,
    },
    {
      url: `${BASE}/legal/mentions`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.20,
    },
    {
      url: `${BASE}/legal/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.20,
    },
  ];
}
