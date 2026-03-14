import { NextResponse } from 'next/server';
import { intelligenceGather, getEmptyResult } from '@/lib/intelligence-gatherer';

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await intelligenceGather(input);
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, data: getEmptyResult() }, { status: 200 });
  }
}
