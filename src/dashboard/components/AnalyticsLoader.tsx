'use client';

import { useEffect } from 'react';
import { isConsentGranted, loadGtag } from '../lib/analytics';

/**
 * Invisible component that auto-loads GA4 for returning users
 * who have already accepted cookies in a previous session.
 */
export default function AnalyticsLoader() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (id && isConsentGranted()) {
      loadGtag(id);
    }
  }, []);

  return null;
}
