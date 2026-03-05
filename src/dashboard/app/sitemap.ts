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

    // ── Tier 2 — Auth & conversion
    {
      url: `${BASE}/login`,
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
