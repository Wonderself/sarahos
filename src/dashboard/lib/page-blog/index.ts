/**
 * Page Blog Section — Barrel exports + data loader
 */

export type { PageArticle, PageBlogConfig } from './types';

// Lazy map: pageId → PageBlogConfig
// Articles data files are imported dynamically to avoid loading all articles at once.
// Each page's articles live in `./articles-data.ts` as a Record<string, PageBlogConfig>.

import type { PageBlogConfig } from './types';

let _cache: Record<string, PageBlogConfig> | null = null;

async function loadArticlesData(): Promise<Record<string, PageBlogConfig>> {
  if (_cache) return _cache;
  try {
    const mod = await import('./articles-data');
    _cache = mod.PAGE_BLOG_CONFIGS;
    return _cache;
  } catch {
    return {};
  }
}

/**
 * Get blog config for a specific page (async — use in useEffect or server component).
 * Returns null if no articles exist for that pageId.
 */
export async function getArticlesForPageAsync(pageId: string): Promise<PageBlogConfig | null> {
  const configs = await loadArticlesData();
  return configs[pageId] ?? null;
}

/**
 * Synchronous getter — requires articles-data to be statically imported.
 * Used by the PageBlogSection component which imports articles-data directly.
 */
export function getArticlesForPage(
  configs: Record<string, PageBlogConfig>,
  pageId: string,
): PageBlogConfig | null {
  return configs[pageId] ?? null;
}
