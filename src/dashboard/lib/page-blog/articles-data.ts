/**
 * Page Blog — Articles data registry
 *
 * Combines all per-page article configs from separate data files.
 * Each key is a pageId matching the dashboard route.
 */

import type { PageBlogConfig } from './types';

// ─── Import article batches ────────────────────────────────
import { dashboardArticles, documentsArticles, chatArticles, agentsArticles, studioPhotoArticles } from './articles-data-1';
import { discussionsArticles, teamArticles, learnArticles } from './articles-data-2a';
import { prospectionArticles, memoryArticles } from './articles-data-2b';
import { socialArticles, repondeurArticles } from './articles-data-3';
import { emailArticles, campaignsArticles } from './articles-data-4';
import { crmArticles, kanbanArticles } from './articles-data-5';
import { financesArticles, seoArticles } from './articles-data-6';
import { skillsArticles, brandingArticles } from './articles-data-7';
import { personalArticles, gamesArticles } from './articles-data-8';
import { referralsArticles, rewardsArticles } from './articles-data-9';
import { marketplaceArticles, whatsappArticles } from './articles-data-10';

// ─── Combined registry ─────────────────────────────────────
export const PAGE_BLOG_CONFIGS: Record<string, PageBlogConfig> = {
  // Batch 1
  [dashboardArticles.pageId]: dashboardArticles,
  [documentsArticles.pageId]: documentsArticles,
  [chatArticles.pageId]: chatArticles,
  [agentsArticles.pageId]: agentsArticles,
  [studioPhotoArticles.pageId]: studioPhotoArticles,
  // Batch 2a
  [discussionsArticles.pageId]: discussionsArticles,
  [teamArticles.pageId]: teamArticles,
  [learnArticles.pageId]: learnArticles,
  // Batch 2b
  [prospectionArticles.pageId]: prospectionArticles,
  [memoryArticles.pageId]: memoryArticles,
  // Batch 3
  [socialArticles.pageId]: socialArticles,
  [repondeurArticles.pageId]: repondeurArticles,
  // Batch 4
  [emailArticles.pageId]: emailArticles,
  [campaignsArticles.pageId]: campaignsArticles,
  // Batch 5
  [crmArticles.pageId]: crmArticles,
  [kanbanArticles.pageId]: kanbanArticles,
  // Batch 6
  [financesArticles.pageId]: financesArticles,
  [seoArticles.pageId]: seoArticles,
  // Batch 7
  [skillsArticles.pageId]: skillsArticles,
  [brandingArticles.pageId]: brandingArticles,
  // Batch 8
  [personalArticles.pageId]: personalArticles,
  [gamesArticles.pageId]: gamesArticles,
  // Batch 9
  [referralsArticles.pageId]: referralsArticles,
  [rewardsArticles.pageId]: rewardsArticles,
  // Batch 10
  [marketplaceArticles.pageId]: marketplaceArticles,
  [whatsappArticles.pageId]: whatsappArticles,
};
