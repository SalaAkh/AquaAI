import { NextResponse } from 'next/server';

// Live HTTP probe. A 200 response means the Next.js deployment is reachable;
// this intentionally does not claim the weather API or database is healthy.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'aqua-ai',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
