/**
 * Page Blog Section — Types
 * SEO-optimized article types for per-page blog sections.
 */

export interface PageArticle {
  id: string;
  slug: string;
  title: string;           // SEO optimized H2/H3
  metaDescription: string; // 155 chars max for SEO
  excerpt: string;         // 2 lines preview
  content: string;         // ~500 words, full article in markdown-like format
  imageUrl: string;        // Unsplash URL (use real Unsplash URLs with ?w=400&h=250&fit=crop)
  imageAlt: string;        // SEO alt text
  category: string;        // matches the page topic
  tags: string[];
  readTime: string;        // "3 min"
  date: string;            // "2026-03-15"
  author: string;          // "Freenzy.io"
}

export interface PageBlogConfig {
  pageId: string;          // e.g. 'dashboard', 'chat', 'agents'
  categoryTitle: string;   // e.g. "Productivite IA", "Chat IA", "Assistants IA"
  categoryEmoji: string;
  articles: PageArticle[];
}
