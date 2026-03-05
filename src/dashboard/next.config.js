/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Disable webpack cache — prevents stale manifest with standalone on Windows
  webpack: (config) => {
    config.cache = false;
    return config;
  },

  // HTTP headers — security + SEO signals
  async headers() {
    return [
      {
        // Public pages: caching + security
        source: '/(|demo|plans|tarifs-api|claude|whatsapp|legal/:path*|login|reset-password)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Protected routes: no-index, no-cache
        source: '/(admin|client|system|infra)/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // API routes: no-index
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        // OG image — long cache
        source: '/opengraph-image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },

  // Redirects for SEO consistency
  async redirects() {
    return [
      { source: '/register', destination: '/login?mode=register', permanent: true },
    ];
  },
};

module.exports = nextConfig;
