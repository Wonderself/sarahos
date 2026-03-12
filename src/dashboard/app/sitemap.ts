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

    // ── Tier 2 — Fonctionnalités (feature pages, high SEO value)
    {
      url: `${BASE}/fonctionnalites/repondeur`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/documents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/social`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${BASE}/fonctionnalites/reveil`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },

    // ── Tier 3 — Cas d'usage & comparaison
    {
      url: `${BASE}/cas/restaurant`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.70,
    },
    {
      url: `${BASE}/cas/immobilier`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.70,
    },
    {
      url: `${BASE}/cas/cabinet`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.70,
    },
    {
      url: `${BASE}/vs-alternatives`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.70,
    },

    // ── Tier 3b — Client dashboard pages (publicly accessible)
    {
      url: `${BASE}/client/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE}/client/agents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/client/marketplace`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/client/chat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/documents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/discussions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/social`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/repondeur`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/reveil`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/client/games`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE}/client/modules`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE}/client/formations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Tier 4 — Auth & conversion
    {
      url: `${BASE}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.50,
    },
    {
      url: `${BASE}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.50,
    },

    // ── Tier 5 — Tech pages
    {
      url: `${BASE}/claude`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.60,
    },
    {
      url: `${BASE}/whatsapp`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.60,
    },

    // ── Tier 6 — Legal (crawlable but not priority)
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
