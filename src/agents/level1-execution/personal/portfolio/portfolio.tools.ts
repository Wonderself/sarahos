import { logger } from '../../../../utils/logger';
import type { EditorialCalendar, EditorialCalendarEntry, LinkedInPost } from './portfolio.types';

/**
 * Formats a LinkedIn post from structured data into a ready-to-publish text.
 * Adds line breaks, hashtags, and proper formatting for maximum engagement.
 */
export function formatLinkedInPost(post: LinkedInPost): string {
  const lines: string[] = [];

  // Hook — first line is crucial for engagement
  lines.push(post.hook);
  lines.push('');

  // Body — structured with line breaks
  const bodyParagraphs = post.body.split('\n').filter((line) => line.trim());
  for (const paragraph of bodyParagraphs) {
    lines.push(paragraph);
    lines.push('');
  }

  // Call to action
  lines.push(post.callToAction);
  lines.push('');

  // Hashtags
  if (post.hashtags.length > 0) {
    lines.push(post.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' '));
  }

  logger.info('LinkedIn post formatted', {
    hookLength: post.hook.length,
    bodyLength: post.body.length,
    hashtagCount: post.hashtags.length,
  });

  return lines.join('\n');
}

/**
 * Generates a default editorial calendar structure for a given month.
 * Returns a skeleton calendar with weekly entries that can be enriched by the LLM.
 */
export function generateEditorialCalendar(
  month: string,
  theme: string,
  weeksCount: number = 4,
  postsPerWeek: number = 3
): EditorialCalendar {
  const entries: EditorialCalendarEntry[] = [];

  const formats: EditorialCalendarEntry['format'][] = ['post', 'carousel', 'article', 'video', 'poll', 'newsletter'];
  const platforms: EditorialCalendarEntry['platform'][] = ['linkedin', 'twitter', 'blog', 'medium'];

  for (let week = 1; week <= weeksCount; week++) {
    for (let post = 0; post < postsPerWeek; post++) {
      entries.push({
        week,
        date: `Semaine ${week} - Jour ${post + 1}`,
        topic: `[A definir] — ${theme}`,
        format: formats[(week + post) % formats.length]!,
        platform: platforms[post % platforms.length]!,
        status: 'draft',
        notes: '',
      });
    }
  }

  logger.info('Editorial calendar generated', {
    month,
    theme,
    totalEntries: entries.length,
  });

  return {
    month,
    theme,
    entries,
  };
}

/**
 * Validates a LinkedIn headline length (max 220 characters).
 */
export function validateHeadline(headline: string): { valid: boolean; length: number; message: string } {
  const maxLength = 220;
  const length = headline.length;
  const valid = length <= maxLength && length > 0;
  return {
    valid,
    length,
    message: valid
      ? `Headline valide (${length}/${maxLength} caracteres)`
      : length === 0
        ? 'Le headline ne peut pas etre vide'
        : `Headline trop long : ${length}/${maxLength} caracteres (${length - maxLength} en trop)`,
  };
}

/**
 * Estimates post engagement based on content characteristics.
 * This is a heuristic based on LinkedIn best practices.
 */
export function estimateEngagement(post: LinkedInPost): {
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 50; // baseline

  // Hook quality
  if (post.hook.length > 0 && post.hook.length <= 150) {
    score += 10;
    factors.push('Hook de bonne longueur');
  }

  // Body length (sweet spot: 800-1300 chars)
  if (post.body.length >= 800 && post.body.length <= 1300) {
    score += 15;
    factors.push('Corps dans la zone optimale (800-1300 car.)');
  } else if (post.body.length >= 500) {
    score += 5;
    factors.push('Corps de longueur acceptable');
  }

  // Call to action
  if (post.callToAction.length > 0) {
    score += 10;
    factors.push('Call-to-action present');
  }

  // Hashtags (3-5 is optimal)
  if (post.hashtags.length >= 3 && post.hashtags.length <= 5) {
    score += 10;
    factors.push('Nombre optimal de hashtags (3-5)');
  } else if (post.hashtags.length > 0) {
    score += 5;
    factors.push('Hashtags presents');
  }

  // Line breaks (improve readability)
  const lineBreaks = (post.body.match(/\n/g) ?? []).length;
  if (lineBreaks >= 3) {
    score += 5;
    factors.push('Bonne aeration du texte');
  }

  return { score: Math.min(score, 100), factors };
}
