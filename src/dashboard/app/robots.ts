import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Main crawlers: allow public, block private
        userAgent: '*',
        allow: [
          '/',
          '/demo',
          '/plans',
          '/login',
          '/tarifs-api',
          '/legal/',
          '/claude',
          '/whatsapp',
          '/register',
          '/reset-password',
          '/blog/',
          '/fonctionnalites/',
          '/cas/',
          '/vs-alternatives',
          '/images/',
        ],
        disallow: [
          '/admin/',
          '/client/',
          '/system/',
          '/infra/',
          '/api/',
          '/avatars/',
          '/security/',
          '/_next/',
          '/static/',
        ],
      },
      // Block AI training scrapers
      { userAgent: 'GPTBot', disallow: ['/'] },
      { userAgent: 'ChatGPT-User', disallow: ['/'] },
      { userAgent: 'CCBot', disallow: ['/'] },
      { userAgent: 'anthropic-ai', disallow: ['/'] },
      { userAgent: 'Claude-Web', disallow: ['/'] },
      { userAgent: 'Omgilibot', disallow: ['/'] },
      { userAgent: 'FacebookBot', allow: ['/'] },
      { userAgent: 'Twitterbot', allow: ['/'] },
      { userAgent: 'LinkedInBot', allow: ['/'] },
    ],
    sitemap: 'https://freenzy.io/sitemap.xml',
    host: 'https://freenzy.io',
  };
}
