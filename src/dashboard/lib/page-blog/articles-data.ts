/**
 * Page Blog — Articles data registry
 *
 * Each key is a pageId matching the dashboard route.
 * Add new page articles by adding a new entry to PAGE_BLOG_CONFIGS.
 *
 * This file is intentionally kept as a placeholder.
 * Populate it with real articles per page as content is written.
 */

import type { PageBlogConfig } from './types';

export const PAGE_BLOG_CONFIGS: Record<string, PageBlogConfig> = {
  // Example (uncomment and adapt when adding real articles):
  //
  // dashboard: {
  //   pageId: 'dashboard',
  //   categoryTitle: 'Productivite IA',
  //   categoryEmoji: '🚀',
  //   articles: [
  //     {
  //       id: 'dash-001',
  //       slug: 'optimiser-productivite-ia-entreprise',
  //       title: 'Comment optimiser la productivite de votre entreprise avec l\'IA',
  //       metaDescription: 'Decouvrez les meilleures strategies pour integrer l\'IA dans votre workflow quotidien et multiplier votre productivite par 3.',
  //       excerpt: 'L\'IA transforme la facon dont les entreprises fonctionnent. Voici comment en tirer le meilleur parti des aujourd\'hui.',
  //       content: '## Introduction\n\nL\'intelligence artificielle...',
  //       imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
  //       imageAlt: 'Dashboard analytique montrant des metriques de productivite IA',
  //       category: 'Productivite IA',
  //       tags: ['productivite', 'ia', 'entreprise'],
  //       readTime: '4 min',
  //       date: '2026-03-15',
  //       author: 'Freenzy.io',
  //     },
  //   ],
  // },
};
