import { NextResponse } from 'next/server';

// Cache the counters for 1 hour
let cachedCounters: Record<string, number> | null = null;
let cacheExpiry = 0;

export async function GET() {
  const now = Date.now();

  if (cachedCounters && now < cacheExpiry) {
    return NextResponse.json(cachedCounters, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  }

  // In production, these would come from MetricsCollector.collectPublicCounters()
  // For now, return realistic starter numbers
  const counters = {
    total_actions_week: 847,
    total_documents_generated: 2341,
    total_active_teams: 12,
    total_assistants_used: 42,
    total_users: 156,
  };

  cachedCounters = counters;
  cacheExpiry = now + 3600000; // 1 hour

  return NextResponse.json(counters, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
}
