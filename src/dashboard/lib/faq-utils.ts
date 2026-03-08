import { FaqCategory } from './faq-data';
import { AudienceType, FAQ_CATEGORY_ORDER } from './audience-data';

/**
 * Reorder FAQ categories based on selected audience.
 * All categories remain visible — just reordered by relevance.
 * If audience is null, returns original order unchanged.
 */
export function getOrderedFaqCategories(
  categories: FaqCategory[],
  audience: AudienceType | null,
): FaqCategory[] {
  if (!audience) return categories;

  const order = FAQ_CATEGORY_ORDER[audience];
  if (!order) return categories;

  const byId = new Map(categories.map(c => [c.id, c]));
  const ordered: FaqCategory[] = [];

  // Add categories in audience-specific order
  for (const id of order) {
    const cat = byId.get(id);
    if (cat) ordered.push(cat);
  }

  // Append any categories not in the order config (safety net)
  const orderedIds = new Set(order);
  for (const cat of categories) {
    if (!orderedIds.has(cat.id)) ordered.push(cat);
  }

  return ordered;
}
