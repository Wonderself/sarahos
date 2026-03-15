import { NextResponse } from 'next/server';

/**
 * Memory API routes — placeholder for future server-side storage.
 * Currently memory is stored client-side in localStorage (fz_user_memories).
 * When pgvector backend is ready, these routes will handle CRUD + semantic search.
 */

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    storage: 'localStorage',
    message: 'Memory is stored locally. Use the client-side MemoryService.',
  });
}

export async function POST() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Server-side memory coming soon',
    },
    { status: 200 }
  );
}
