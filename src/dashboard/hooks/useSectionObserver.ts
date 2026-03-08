'use client';

import { useEffect, useRef } from 'react';
import {
  trackSectionViewed,
  trackScrollDepth,
  trackEnterpriseFormViewed,
  trackBonusMessageViewed,
} from '../lib/analytics';

/**
 * IntersectionObserver hook for tracking section visibility.
 * Fires fz_section_viewed and fz_scroll_depth once per section per page session.
 * Special sections: 'enterprise' also fires fz_enterprise_form_viewed,
 * 'bonus' fires fz_bonus_message_viewed.
 */
export function useSectionObserver(
  sectionRefs: Record<string, React.RefObject<HTMLElement | null>>,
): void {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = entry.target.getAttribute('data-section');
          if (!name || firedRef.current.has(name)) continue;

          firedRef.current.add(name);
          trackSectionViewed(name);
          trackScrollDepth(name);

          if (name === 'enterprise') trackEnterpriseFormViewed();
          if (name === 'bonus') trackBonusMessageViewed();
        }
      },
      { threshold: 0.3 },
    );

    // Observe all refs
    for (const [name, ref] of Object.entries(sectionRefs)) {
      if (ref.current) {
        ref.current.setAttribute('data-section', name);
        observer.observe(ref.current);
      }
    }

    return () => observer.disconnect();
  }, [sectionRefs]);
}
